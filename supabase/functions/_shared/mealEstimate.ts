// Shared "grounded" meal estimator used by analyze-meal-text and
// analyze-meal-photo. Claude only splits the meal into components and
// estimates grams; nutrition per 100 g comes from the curated generic foods in
// public.food_items (src/data/genericFoods.ts) via a search_foods tool, and
// the totals are summed here in code. LLM-guessed calorie density was the main
// source of overestimates, so the model's own per-100 g values are only used
// for components with no catalog match.
import type Anthropic from 'npm:@anthropic-ai/sdk@0.137.0'
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export const MEAL_MODEL = Deno.env.get('CLAUDE_MEAL_MODEL') ?? 'claude-haiku-5-5'

const MAX_TURNS = 6
const SEARCH_LIMIT = 6
const CATALOG_TTL_MS = 10 * 60 * 1000

export interface CatalogFood {
  id: string
  name: string
  brand: string | null
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  normalizedName: string
  words: string[]
  brandWords: string[]
}

export interface EstimatedIngredient {
  name: string
  estimated_weight_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  matched_food: string | null
}

export interface MealEstimate {
  food_name: string
  estimated_weight_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: 'low' | 'medium' | 'high'
  ingredients: EstimatedIngredient[]
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function splitWords(text: string): string[] {
  return normalize(text).split(/[^a-z0-9]+/).filter(Boolean)
}

// Nicknames people actually type for the chains, matched like brand words.
const BRAND_ALIASES: Record<string, string[]> = {
  mcdonalds: ['mcd', 'donken', 'mcdonalds'],
  burgerking: ['bk', 'burgerking'],
  espressohouse: ['eh', 'espressohouse'],
  max: ['maxburgers'],
}

function brandWordsFor(brand: string): string[] {
  const compact = normalize(brand).replace(/[^a-z0-9]/g, '')
  return [...new Set([...splitWords(brand), compact, ...(BRAND_ALIASES[compact] ?? [])])]
}

let catalogCache: { foods: CatalogFood[]; loadedAt: number } | null = null

export async function loadCatalog(supabase: SupabaseClient): Promise<CatalogFood[]> {
  if (catalogCache && Date.now() - catalogCache.loadedAt < CATALOG_TTL_MS) return catalogCache.foods

  const rows: Record<string, unknown>[] = []
  // PostgREST caps responses at 1000 rows, so page through the generic foods.
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('food_items')
      .select('external_id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
      .eq('source', 'generic')
      .order('external_id')
      .range(from, from + 999)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }

  const foods = rows.map((row) => {
    const name = String(row.name)
    const brand = row.brand ? String(row.brand) : null
    return {
      id: String(row.external_id),
      name,
      brand,
      caloriesPer100g: Number(row.calories_per_100g),
      proteinPer100g: Number(row.protein_per_100g),
      carbsPer100g: Number(row.carbs_per_100g),
      fatPer100g: Number(row.fat_per_100g),
      normalizedName: normalize(name),
      words: splitWords(name),
      brandWords: brand ? brandWordsFor(brand) : [],
    }
  })
  catalogCache = { foods, loadedAt: Date.now() }
  return foods
}

// Word-prefix matching with a preference for plain staples: a chain's
// "Hamburgare" shouldn't win a search for "hamburgare" unless the chain is
// named in the query.
export function searchCatalog(catalog: CatalogFood[], query: string, limit = SEARCH_LIMIT): CatalogFood[] {
  const normalizedQuery = normalize(query.trim())
  const tokens = splitWords(query)
  if (tokens.length === 0) return []

  const scored = catalog.map((food) => {
    const allWords = [...food.words, ...food.brandWords]
    let score = 0
    let matched = 0
    for (const token of tokens) {
      if (allWords.some((word) => word === token)) {
        score += 3
        matched++
      } else if (allWords.some((word) => word.startsWith(token) || (token.length >= 3 && word.endsWith(token)))) {
        // endsWith catches Swedish compounds: "ost" -> "hushållsost", "mjölk" -> "mellanmjölk".
        score += 2
        matched++
      } else if (token.length >= 4 && allWords.some((word) => word.includes(token))) {
        score += 1
        matched++
      }
    }
    if (matched === 0) return { food, score: 0 }
    if (food.words.length === 1) score += 1
    if (food.normalizedName === normalizedQuery) score += 5
    else if (food.normalizedName.startsWith(normalizedQuery)) score += 2
    const brandNamed = food.brandWords.some((word) => tokens.includes(word))
    if (food.brand && !brandNamed) score -= 6
    score -= (tokens.length - matched) * 1.5
    return { food, score }
  })

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length)
    .slice(0, limit)
    .map((entry) => entry.food)
}

function formatSearchResults(results: CatalogFood[]): string {
  if (results.length === 0) return 'Inga träffar. Prova ett annat eller enklare sökord, eller ange egna värden med food_id null.'
  return results
    .map(
      (food) =>
        `food_id: ${food.id} | ${food.name}${food.brand ? ` (${food.brand})` : ''} | per 100 g: ` +
        `${food.caloriesPer100g} kcal, ${food.proteinPer100g} g protein, ${food.carbsPer100g} g kolhydrater, ${food.fatPer100g} g fett`,
    )
    .join('\n')
}

const SEARCH_TOOL = {
  name: 'search_foods',
  description:
    'Search the app\'s food database (Swedish staples, dishes and restaurant/brand products) for one meal ' +
    'component. Returns matching foods with nutrition per 100 g. Use short Swedish queries naming the food ' +
    'as eaten, e.g. "kokt ris", "kycklingbröst", "smör", "big mac mcdonalds". Search every component; ' +
    'several searches can be made in parallel.',
  input_schema: {
    type: 'object' as const,
    properties: { query: { type: 'string', description: 'Short Swedish search query for one food.' } },
    required: ['query'],
  },
}

const RECORD_TOOL = {
  name: 'record_meal_estimate',
  description:
    'Record the final estimate once every component has been searched. Call exactly once. Totals are ' +
    'computed by the app from the components, so only components are reported.',
  input_schema: {
    type: 'object' as const,
    properties: {
      food_name: { type: 'string', description: 'Short Swedish name for the whole meal.' },
      confidence: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Confidence in the estimate, mainly in the portion sizes.',
      },
      ingredients: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Swedish name of this component.' },
            estimated_weight_g: { type: 'number', description: 'Estimated weight of this component as eaten, in grams.' },
            food_id: {
              type: ['string', 'null'],
              description: 'food_id of the best matching search result, or null if no result fits.',
            },
            calories_per_100g: { type: 'number', description: 'kcal per 100 g (copied from the match, or your own estimate if food_id is null).' },
            protein_per_100g: { type: 'number' },
            carbs_per_100g: { type: 'number' },
            fat_per_100g: { type: 'number' },
          },
          required: ['name', 'estimated_weight_g', 'food_id', 'calories_per_100g', 'protein_per_100g', 'carbs_per_100g', 'fat_per_100g'],
        },
      },
    },
    required: ['food_name', 'confidence', 'ingredients'],
  },
}

const SYSTEM_PROMPT = `Du uppskattar näringsinnehållet i måltider åt en svensk kostapp. Arbetsgång:

1. Dela upp måltiden i beståndsdelar (bas, protein, tillbehör, sås, pålägg, tillagningsfett, dryck). Om användaren bara anger en vanlig rätt utan detaljer (t.ex. "lasagne", "en Big Mac") är rätten själv en enda beståndsdel.
2. Sök varje beståndsdel med search_foods och välj den träff som bäst motsvarar den i det skick den äts (kokt, stekt, tillagad). Nämns en restaurang eller ett märke, sök med det namnet (t.ex. "big mac mcdonalds", "whopper burger king"). Använd food_id null bara när ingen träff passar, och ange då egna försiktiga värden per 100 g.
3. Uppskatta vikten i gram. Följ mängdangivelser i texten (dl, msk, st, skivor, "stor"/"liten"). Utan angivelse, anta en NORMAL vuxenportion, inte en generös:
   kokt ris/pasta 150–200 g · potatis 150–200 g · kött/fisk/kyckling 100–150 g · köttfärssås/gryta 200–250 g · sås 50 g · grönsaker/sallad 50–100 g · brödskiva 35 g · knäckebröd 12 g · ägg 60 g · smör på macka 5 g · ostskiva 10 g · pålägg 15 g · 1 msk olja 10 g · 1 tsk 5 g · 1 dl mjölk/fil 100 g · 1 dl havregryn 35 g · frukt 120–150 g.
4. Ta bara med tillagningsfett om det nämns eller tydligt antyds (stekt, friterad, "i smör"), och då en måttlig mängd (1 tsk–1 msk).
5. Anropa record_meal_estimate exakt en gång med alla beståndsdelar. Sätt confidence till "low" när portionsstorleken är oklar.

Överskattning är ett känt problem — välj hellre den lägre av två rimliga gissningar. Svara på svenska.`

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function buildEstimate(input: Record<string, unknown>, catalog: CatalogFood[]): MealEstimate {
  const byId = new Map(catalog.map((food) => [food.id, food]))
  const rawIngredients = Array.isArray(input.ingredients) ? (input.ingredients as Record<string, unknown>[]) : []

  const ingredients = rawIngredients.map((raw) => {
    const grams = toNumber(raw.estimated_weight_g)
    const match = typeof raw.food_id === 'string' ? byId.get(raw.food_id) : undefined
    const per100 = match
      ? { kcal: match.caloriesPer100g, protein: match.proteinPer100g, carbs: match.carbsPer100g, fat: match.fatPer100g }
      : {
          kcal: toNumber(raw.calories_per_100g),
          protein: toNumber(raw.protein_per_100g),
          carbs: toNumber(raw.carbs_per_100g),
          fat: toNumber(raw.fat_per_100g),
        }
    const factor = grams / 100
    return {
      name: String(raw.name ?? match?.name ?? 'Okänd'),
      estimated_weight_g: round1(grams),
      calories: round1(per100.kcal * factor),
      protein_g: round1(per100.protein * factor),
      carbs_g: round1(per100.carbs * factor),
      fat_g: round1(per100.fat * factor),
      calories_per_100g: per100.kcal,
      protein_per_100g: per100.protein,
      carbs_per_100g: per100.carbs,
      fat_per_100g: per100.fat,
      matched_food: match ? `${match.name}${match.brand ? ` (${match.brand})` : ''}` : null,
    }
  })

  const sum = (key: 'estimated_weight_g' | 'calories' | 'protein_g' | 'carbs_g' | 'fat_g') =>
    round1(ingredients.reduce((total, ingredient) => total + ingredient[key], 0))
  const confidence = input.confidence === 'high' || input.confidence === 'medium' ? input.confidence : 'low'

  return {
    food_name: String(input.food_name ?? 'Måltid'),
    estimated_weight_g: sum('estimated_weight_g'),
    calories: sum('calories'),
    protein_g: sum('protein_g'),
    carbs_g: sum('carbs_g'),
    fat_g: sum('fat_g'),
    confidence,
    ingredients,
  }
}

export class MealEstimateError extends Error {}

export async function estimateMeal(options: {
  anthropic: Anthropic
  catalog: CatalogFood[]
  userContent: Anthropic.ContentBlockParam[]
  model?: string
}): Promise<MealEstimate> {
  const { anthropic, catalog, userContent, model = MEAL_MODEL } = options
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userContent }]

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [SEARCH_TOOL, RECORD_TOOL],
      tool_choice: { type: 'auto' },
      output_config: { effort: 'low' },
      messages,
    } as Anthropic.MessageCreateParamsNonStreaming)

    if (response.stop_reason === 'refusal') throw new MealEstimateError('Modellen avböjde att uppskatta måltiden')

    // Thinking blocks must go back unmodified alongside the tool results.
    messages.push({ role: 'assistant', content: response.content })
    const toolUses = response.content.filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')

    const record = toolUses.find((block) => block.name === 'record_meal_estimate')
    if (record) return buildEstimate(record.input as Record<string, unknown>, catalog)

    if (toolUses.length === 0) {
      messages.push({ role: 'user', content: 'Anropa record_meal_estimate nu med din uppskattning.' })
      continue
    }

    messages.push({
      role: 'user',
      content: toolUses.map((block) => ({
        type: 'tool_result' as const,
        tool_use_id: block.id,
        content:
          block.name === 'search_foods'
            ? formatSearchResults(searchCatalog(catalog, String((block.input as { query?: unknown }).query ?? '')))
            : 'Okänt verktyg.',
      })),
    })
  }

  throw new MealEstimateError('Uppskattningen tog för många steg')
}
