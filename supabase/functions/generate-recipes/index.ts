// Supabase Edge Function (Deno). Generates protein-rich, easy recipes for the
// Recept tab. Claude writes the recipes (structured output); nutrition per
// serving is then computed here from each ingredient's grams and the curated
// food database — the same grounding as _shared/mealEstimate.ts — so the kcal
// and protein shown on a recipe can be trusted and logged.
// The response is streamed as NDJSON, one line per finished recipe
// ({"type":"recipe"}, then {"type":"done"} or {"type":"error"}), so the first
// recipe shows up while Claude is still writing the others.
// Auth is enforced by the platform (verify_jwt = true in supabase/config.toml).
import Anthropic from 'npm:@anthropic-ai/sdk@0.137.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { loadCatalog, searchCatalog, type CatalogFood } from '../_shared/mealEstimate.ts'
import { consumeAiQuota } from '../_shared/aiQuota.ts'
import { logFunctionError } from '../_shared/errorLog.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const MODEL = Deno.env.get('CLAUDE_RECIPE_MODEL') ?? 'claude-sonnet-5-5'
// Haiku has no server-side fallback (the parameter would 400 or do nothing),
// so it's only sent for Sonnet/Opus.
const FALLBACK_PARAMS = MODEL.includes('haiku') ? {} : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RecipeMealType = 'breakfast' | 'lunch' | 'dinner'
const MEAL_TYPE_LABELS: Record<RecipeMealType, string> = { breakfast: 'frukost', lunch: 'lunch', dinner: 'middag' }
const MIN_PROTEIN_G: Record<RecipeMealType, number> = { breakfast: 20, lunch: 30, dinner: 30 }

type DietaryPreference = 'any' | 'meat_fish_poultry' | 'vegetarian' | 'vegan'
const DIETARY_INSTRUCTIONS: Record<DietaryPreference, string> = {
  any: '',
  meat_fish_poultry: 'Basera recepten på kött, fisk eller kyckling.',
  vegetarian: 'Enbart vegetariska recept (mjölk, ägg och ost är ok, inget kött eller fisk).',
  vegan: 'Enbart veganska recept (inga animaliska produkter alls).',
}

const NUMBER = { type: 'number' }
const RECIPES_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['recipes'],
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'description', 'time_minutes', 'servings', 'ingredients', 'steps', 'tip'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          time_minutes: { type: 'integer' },
          servings: { type: 'integer' },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'amount', 'grams_per_serving', 'food_query', 'kcal_per_100g', 'protein_per_100g', 'carbs_per_100g', 'fat_per_100g'],
              properties: {
                name: { type: 'string' },
                amount: { type: 'string' },
                grams_per_serving: NUMBER,
                food_query: { type: 'string' },
                kcal_per_100g: NUMBER,
                protein_per_100g: NUMBER,
                carbs_per_100g: NUMBER,
                fat_per_100g: NUMBER,
              },
            },
          },
          steps: { type: 'array', items: { type: 'string' } },
          tip: { type: 'string' },
        },
      },
    },
  },
}

const SYSTEM_PROMPT = `Du är kock och kostrådgivare i den svenska kostappen Strikt och skriver recept som inspirerar till att laga god, proteinrik vardagsmat.

Krav på varje recept:
- Proteinrikt, med en tydlig proteinkälla.
- Enkelt: vanliga råvaror från en svensk mataffär, få moment, helst högst 30 minuter.
- Gott och vardagsnära, inte "dietmat". Variera proteinkällor, kök och tillagning mellan recepten.
- 4–8 korta steg i ordning, skrivna så att en ovan kock klarar dem.
- tip: ett kort tips om variation, förvaring eller matlåda.

Ingredienser:
- amount: mängd för hela receptet i vardagliga mått ("2 dl", "1 st", "400 g", "1 msk").
- grams_per_serving: vikt i gram per portion, som den äts (kokt ris, tillagad kyckling).
- food_query: kort svenskt sökord för råvaran i det skick den äts, t.ex. "kokt ris", "kycklingbröst", "olivolja", "krossade tomater". Salt, peppar och torra kryddor: food_query "krydda" och grams_per_serving 0–2.
- kcal_per_100g och makron per 100 g: din egen försiktiga uppskattning för råvaran.

Skriv på svenska.`

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

// Trusts the database over Claude's own per-100 g guess, unless the best
// unbranded match is so far off (more than 2x either way) that it's likely
// the wrong food — e.g. "ris" matching something unrelated.
function groundIngredient(raw: Record<string, unknown>, catalog: CatalogFood[]) {
  const grams = toNumber(raw.grams_per_serving)
  const own = {
    kcal: toNumber(raw.kcal_per_100g),
    protein: toNumber(raw.protein_per_100g),
    carbs: toNumber(raw.carbs_per_100g),
    fat: toNumber(raw.fat_per_100g),
  }
  const match = searchCatalog(catalog, String(raw.food_query ?? raw.name ?? ''), 4).find((food) => !food.brand)
  const ratio = match && own.kcal > 0 ? match.caloriesPer100g / own.kcal : 1
  const useMatch = match && ratio > 0.5 && ratio < 2
  const per100 = useMatch
    ? { kcal: match.caloriesPer100g, protein: match.proteinPer100g, carbs: match.carbsPer100g, fat: match.fatPer100g }
    : own
  const factor = grams / 100
  return {
    name: String(raw.name ?? ''),
    amount: String(raw.amount ?? ''),
    estimated_weight_g: round1(grams),
    calories: round1(per100.kcal * factor),
    protein_g: round1(per100.protein * factor),
    carbs_g: round1(per100.carbs * factor),
    fat_g: round1(per100.fat * factor),
    calories_per_100g: per100.kcal,
    protein_per_100g: per100.protein,
    carbs_per_100g: per100.carbs,
    fat_per_100g: per100.fat,
    matched_food: useMatch ? match.name : null,
  }
}

function buildRecipe(raw: Record<string, unknown>, mealType: RecipeMealType, catalog: CatalogFood[]) {
  const ingredients = (Array.isArray(raw.ingredients) ? (raw.ingredients as Record<string, unknown>[]) : []).map(
    (ingredient) => groundIngredient(ingredient, catalog),
  )
  const sum = (key: 'estimated_weight_g' | 'calories' | 'protein_g' | 'carbs_g' | 'fat_g') =>
    round1(ingredients.reduce((total, ingredient) => total + ingredient[key], 0))
  return {
    id: crypto.randomUUID(),
    meal_type: mealType,
    title: String(raw.title ?? 'Recept'),
    description: String(raw.description ?? ''),
    time_minutes: Math.round(toNumber(raw.time_minutes)),
    servings: Math.max(1, Math.round(toNumber(raw.servings))),
    ingredients,
    steps: Array.isArray(raw.steps) ? raw.steps.map(String) : [],
    tip: String(raw.tip ?? ''),
    per_serving: {
      weight_g: sum('estimated_weight_g'),
      calories: sum('calories'),
      protein_g: sum('protein_g'),
      carbs_g: sum('carbs_g'),
      fat_g: sum('fat_g'),
    },
  }
}

// Pulls each complete recipe object out of the streamed JSON
// ({"recipes":[{...},{...}]}) as soon as its closing brace arrives. Tracks
// nesting depth outside strings; recipe objects sit at depth 3
// (outer object → recipes array → recipe).
class RecipeObjectScanner {
  private buffer = ''
  private pos = 0
  private depth = 0
  private inString = false
  private escaped = false
  private start = -1

  push(chunk: string): Record<string, unknown>[] {
    this.buffer += chunk
    const found: Record<string, unknown>[] = []
    for (; this.pos < this.buffer.length; this.pos++) {
      const ch = this.buffer[this.pos]
      if (this.inString) {
        if (this.escaped) this.escaped = false
        else if (ch === '\\') this.escaped = true
        else if (ch === '"') this.inString = false
        continue
      }
      if (ch === '"') {
        this.inString = true
      } else if (ch === '{' || ch === '[') {
        this.depth++
        if (ch === '{' && this.depth === 3) this.start = this.pos
      } else if (ch === '}' || ch === ']') {
        if (ch === '}' && this.depth === 3 && this.start >= 0) {
          try {
            found.push(JSON.parse(this.buffer.slice(this.start, this.pos + 1)))
          } catch {
            // Malformed object — skip it rather than fail the whole batch.
          }
          this.start = -1
        }
        this.depth--
      }
    }
    return found
  }
}

interface GenerateRecipesRequest {
  mealType: RecipeMealType
  dietaryPreference?: DietaryPreference
  wish?: string
  pantry?: string
  exclude?: string[]
  remaining?: { kcal: number; proteinG: number }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let body: Partial<GenerateRecipesRequest>
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_INPUT' }, 400)
  }

  const mealType = body.mealType
  if (mealType !== 'breakfast' && mealType !== 'lunch' && mealType !== 'dinner') {
    return jsonResponse({ error: 'mealType måste vara breakfast, lunch eller dinner', code: 'INVALID_INPUT' }, 400)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Saknar autentisering', code: 'UNAUTHORIZED' }, 401)
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return jsonResponse({ error: 'Saknar autentisering', code: 'UNAUTHORIZED' }, 401)
  }

  const quotaError = await consumeAiQuota(supabase, 'recipes')
  if (quotaError) {
    return jsonResponse({ error: quotaError, code: 'QUOTA_EXCEEDED' }, 429)
  }

  const wish = typeof body.wish === 'string' ? body.wish.trim().slice(0, 200) : ''
  const pantry = typeof body.pantry === 'string' ? body.pantry.trim().slice(0, 400) : ''
  const exclude = Array.isArray(body.exclude) ? body.exclude.filter((t) => typeof t === 'string').slice(0, 30) : []
  const remaining = body.remaining
  const prompt = [
    `Skriv 3 olika recept för ${MEAL_TYPE_LABELS[mealType]}, med minst ${MIN_PROTEIN_G[mealType]} g protein per portion.`,
    DIETARY_INSTRUCTIONS[body.dietaryPreference ?? 'any'] ?? '',
    wish ? `Användarens önskemål: "${wish}".` : '',
    pantry
      ? `Användaren har hemma: "${pantry}". Bygg recepten främst på det, och lägg bara till ett fåtal vanliga baslivsmedel utöver (t.ex. olja, kryddor, lök, buljong).`
      : '',
    remaining && typeof remaining.kcal === 'number'
      ? `En portion ska rymmas inom ungefär ${Math.max(150, Math.round(remaining.kcal))} kcal, och ge gärna närmare ${Math.max(0, Math.round(remaining.proteinG))} g protein.`
      : '',
    exclude.length > 0 ? `Föreslå inte dessa igen: ${exclude.join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (line: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`))
      const sentTitles = new Set<string>()
      try {
        const catalog = await loadCatalog(supabase)
        const messageStream = anthropic.beta.messages.stream({
          model: MODEL,
          max_tokens: 12000,
          ...FALLBACK_PARAMS,
          output_config: { effort: 'low', format: { type: 'json_schema', schema: RECIPES_SCHEMA } },
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        } as unknown as Parameters<typeof anthropic.beta.messages.stream>[0])

        // One scanner per text block: if a refusal hands the request to a
        // fallback model, its output starts in a new block.
        let scanner = new RecipeObjectScanner()
        for await (const event of messageStream) {
          if (event.type === 'content_block_start' && event.content_block.type === 'text') {
            scanner = new RecipeObjectScanner()
          } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            for (const raw of scanner.push(event.delta.text)) {
              const recipe = buildRecipe(raw, mealType, catalog)
              const key = recipe.title.toLowerCase()
              if (sentTitles.has(key)) continue
              sentTitles.add(key)
              send({ type: 'recipe', recipe })
            }
          }
        }

        const final = await messageStream.finalMessage()
        if (sentTitles.size === 0) {
          const error =
            final.stop_reason === 'refusal' ? 'Kunde inte skapa recept för den önskan' : 'Inga recept kom tillbaka, försök igen'
          send({ type: 'error', error })
        } else {
          send({ type: 'done' })
        }
      } catch (error) {
        const isRateLimit = error instanceof Anthropic.RateLimitError
        const message = error instanceof Error ? error.message : 'Okänt fel'
        await logFunctionError(supabase, 'generate-recipes', error, { mealType, model: MODEL })
        send({ type: 'error', error: isRateLimit ? 'AI-tjänsten är överbelastad just nu, försök igen om en stund' : message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
  })
})
