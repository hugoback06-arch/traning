// Supabase Edge Function (Deno). Given remaining kcal/macros for today, asks
// Claude for a few healthy, protein-rich, simple meal ideas — using the
// web_search server tool (scoped to Swedish recipe sites) so the recipe link
// is real instead of a model-guessed URL. Auth is enforced by the platform
// (verify_jwt = true in supabase/config.toml).
import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const MODEL = Deno.env.get('CLAUDE_TEXT_MODEL') ?? 'claude-opus-4-8'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RECIPE_DOMAINS = ['ica.se', 'coop.se', 'koket.se', 'arla.se', 'recept.se', 'tasteline.com']

const WEB_SEARCH_TOOL = {
  type: 'web_search_20260209' as const,
  name: 'web_search' as const,
  max_uses: 3,
  allowed_domains: RECIPE_DOMAINS,
  // CLAUDE_TEXT_MODEL is shared with cost-sensitive text functions and may be
  // set to a model (e.g. Haiku) without programmatic tool calling support.
  // Force direct calling so web_search still works on any such model.
  allowed_callers: ['direct'] as const,
}

const SUBMIT_TOOL = {
  name: 'submit_suggestions',
  description: 'Submit the final meal suggestions to the user.',
  input_schema: {
    type: 'object' as const,
    properties: {
      suggestions: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Kort namn på måltiden, på svenska.' },
            description: { type: 'string', description: 'En mening som beskriver måltiden.' },
            kcal: { type: 'number', description: 'Ungefärligt antal kalorier för måltiden.' },
            protein_g: { type: 'number', description: 'Ungefärligt antal gram protein för måltiden.' },
            recipe_url: { type: 'string', description: 'Länk till ett riktigt recept, hittat via web_search.' },
          },
          required: ['name', 'description', 'kcal', 'protein_g', 'recipe_url'],
        },
        minItems: 2,
        maxItems: 3,
      },
    },
    required: ['suggestions'],
  },
}

interface RawSuggestion {
  name?: unknown
  description?: unknown
  kcal?: unknown
  protein_g?: unknown
  recipe_url?: unknown
}

// Web search results occasionally leak <cite>-style citation markup into the
// model's tool-call text even when told not to — strip any HTML/XML tags
// server-side rather than trusting the prompt instruction alone, since
// name/description render as plain text in the app.
function stripTags(value: unknown): unknown {
  return typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value
}

function sanitizeSuggestions(input: unknown): unknown {
  if (!input || typeof input !== 'object' || !Array.isArray((input as { suggestions?: unknown }).suggestions)) {
    return input
  }
  const suggestions = (input as { suggestions: RawSuggestion[] }).suggestions.map((s) => ({
    ...s,
    name: stripTags(s.name),
    description: stripTags(s.description),
  }))
  return { ...(input as object), suggestions }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

type DietaryPreference = 'any' | 'meat_fish_poultry' | 'vegetarian' | 'vegan'

const DIETARY_PREFERENCE_INSTRUCTIONS: Record<DietaryPreference, string> = {
  any: '',
  meat_fish_poultry:
    'Jag föredrar måltider baserade på kött, fisk eller kyckling – undvik vegetariska/veganska förslag om det inte är omöjligt att nå proteinmålet på annat sätt. ',
  vegetarian: 'Föreslå enbart vegetariska måltider (inget kött eller fisk, mjölk/ägg/ost är ok). ',
  vegan: 'Föreslå enbart veganska måltider (inga animaliska produkter alls). ',
}

interface SuggestMealsRequest {
  remainingKcal: number
  remainingProteinG: number
  remainingCarbsG: number
  remainingFatG: number
  dietaryPreference?: DietaryPreference
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let body: Partial<SuggestMealsRequest>
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_INPUT' }, 400)
  }

  const { remainingKcal, remainingProteinG, remainingCarbsG, remainingFatG, dietaryPreference } = body
  if (
    typeof remainingKcal !== 'number' ||
    typeof remainingProteinG !== 'number' ||
    typeof remainingCarbsG !== 'number' ||
    typeof remainingFatG !== 'number'
  ) {
    return jsonResponse({ error: 'Kvarvarande kcal/makron krävs', code: 'INVALID_INPUT' }, 400)
  }

  const dietaryInstruction = DIETARY_PREFERENCE_INSTRUCTIONS[dietaryPreference ?? 'any'] ?? ''

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      tools: [WEB_SEARCH_TOOL, SUBMIT_TOOL],
      tool_choice: { type: 'auto' },
      messages: [
        {
          role: 'user',
          content:
            `Föreslå 2-3 hälsosamma, proteinrika och enkla måltider som får plats i det jag har kvar att äta idag: ` +
            `${Math.round(remainingKcal)} kcal, ${Math.round(remainingProteinG)}g protein, ` +
            `${Math.round(remainingCarbsG)}g kolhydrater, ${Math.round(remainingFatG)}g fett. ` +
            dietaryInstruction +
            `Sök alltid upp en riktig receptlänk med web_search innan du svarar (från en svensk receptsajt). ` +
            `Om det är väldigt lite kvar, föreslå något lätt/litet istället för att hoppa över förslag. ` +
            `Skriv name och description med egna ord – aldrig <cite>-taggar, källhänvisningar eller annan HTML/markup från sökresultaten. ` +
            `Svara alltid till sist med submit_suggestions-verktyget, på svenska.`,
        },
      ],
    })

    const toolUse = message.content.find(
      (block) => block.type === 'tool_use' && block.name === 'submit_suggestions',
    )
    if (!toolUse || toolUse.type !== 'tool_use') {
      return jsonResponse({ error: 'Kunde inte ta fram förslag, försök igen', code: 'SUGGEST_API_ERROR' }, 502)
    }

    return jsonResponse(sanitizeSuggestions(toolUse.input))
  } catch (error) {
    const isRateLimit = error instanceof Anthropic.RateLimitError
    const message = error instanceof Error ? error.message : 'Okänt fel'
    return jsonResponse(
      { error: message, code: isRateLimit ? 'RATE_LIMITED' : 'SUGGEST_API_ERROR' },
      isRateLimit ? 429 : 502,
    )
  }
})
