// Supabase Edge Function (Deno). Proxies a free-text meal description to Claude
// so the ANTHROPIC_API_KEY never reaches the browser. Auth is enforced by the
// platform (verify_jwt = true in supabase/config.toml) before this code runs.
// Mirrors analyze-meal-photo/index.ts, swapping the image content block for text.
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildFoodCorrectionsPromptSection } from '../_shared/foodCorrections.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const MODEL = Deno.env.get('CLAUDE_TEXT_MODEL') ?? 'claude-opus-4-8'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ESTIMATE_TOOL = {
  name: 'record_meal_estimate',
  description:
    'Record a nutritional estimate for the meal described in the text. Break the meal into its individual ' +
    'components first, estimate each one, then report the sum as the total — this produces far more accurate ' +
    'totals than guessing a single aggregate number.',
  input_schema: {
    type: 'object' as const,
    properties: {
      food_name: { type: 'string', description: 'Short name for the dish/food, in Swedish.' },
      ingredients: {
        type: 'array',
        description:
          'The meal broken down into its distinct components (e.g. "havregryn", "banan", "honung"). Estimate ' +
          'each one individually based on typical portion sizes and any quantity cues in the description ' +
          '(dl, msk, antal, "stor"/"liten", etc.) before totalling.',
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Name of this component, in Swedish.' },
            estimated_weight_g: { type: 'number', description: 'Estimated weight of this component, in grams.' },
            calories: { type: 'number', description: 'Estimated calories (kcal) for this component.' },
            protein_g: { type: 'number', description: 'Estimated protein in grams for this component.' },
            carbs_g: { type: 'number', description: 'Estimated carbohydrates in grams for this component.' },
            fat_g: { type: 'number', description: 'Estimated fat in grams for this component.' },
          },
          required: ['name', 'estimated_weight_g', 'calories', 'protein_g', 'carbs_g', 'fat_g'],
        },
        minItems: 1,
      },
      estimated_weight_g: { type: 'number', description: 'Total weight — the sum of all ingredients\' estimated_weight_g.' },
      calories: { type: 'number', description: 'Total calories (kcal) — the sum of all ingredients\' calories.' },
      protein_g: { type: 'number', description: 'Total protein in grams — the sum of all ingredients\' protein_g.' },
      carbs_g: { type: 'number', description: 'Total carbohydrates in grams — the sum of all ingredients\' carbs_g.' },
      fat_g: { type: 'number', description: 'Total fat in grams — the sum of all ingredients\' fat_g.' },
      confidence: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Confidence in this estimate given how specific/vague the description is, especially around portion size.',
      },
    },
    required: ['food_name', 'ingredients', 'estimated_weight_g', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'confidence'],
  },
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let description: unknown
  try {
    ;({ description } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_TEXT' }, 400)
  }

  if (typeof description !== 'string' || !description.trim()) {
    return jsonResponse({ error: 'En beskrivning av måltiden krävs', code: 'INVALID_TEXT' }, 400)
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
  const correctionsSection = await buildFoodCorrectionsPromptSection(supabase, user.id)

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1536,
      tools: [ESTIMATE_TOOL],
      tool_choice: { type: 'tool', name: 'record_meal_estimate' },
      messages: [
        {
          role: 'user',
          content: `Uppskatta kalorier och makronutrienter (protein, kolhydrater, fett) för följande måltid, beskriven av användaren: "${description.trim()}".

Dela först upp måltiden i sina beståndsdelar (t.ex. bas, pålägg, tillbehör, tillagningsfett) och uppskatta varje del för sig baserat på typiska portionsstorlekar och eventuella mängdledtrådar i texten (dl, msk, antal, "stor"/"liten" etc).

Använd dessa som ankare för rimliga värden per 100 g istället för att gissa fritt: kokt ris/pasta/potatis ~110-160 kcal, gröt/havregryn (kokt) ~60-90 kcal, magert kött/fisk/kyckling (tillagat, utan tillsatt fett) ~120-200 kcal, fet fisk/rött kött ~200-280 kcal, grönsaker ~20-60 kcal, bröd ~230-280 kcal, hushållsost/ost ~250-350 kcal, matlagningsolja/smör ~700-900 kcal. Använd dessa för att sanity-checka totalen — om din uppskattning avviker kraftigt uppåt från vad ingredienserna borde ge, räkna om.

Lägg bara till tillagningsfett (olja/smör) i uppskattningen om det uttryckligen nämns eller tydligt antyds av tillagningssättet (t.ex. "stekt", "wokad", "i smör"). Anta INTE tillsatt fett som standard bara för att det är en varm rätt — många rätter tillagas utan, eller med minimal mängd. Om fett nämns men mängden är oklar, räkna med en måttlig mängd (ca 1 tsk-1 msk), inte en generös mängd.

Summera sedan delarna till totalen — totalen ska vara summan av ingredienserna, inte en separat gissning.

Svara på svenska. Om beskrivningen är vag på portionsstorlek, gör en rimlig bästa gissning för en NORMAL portion (inte en stor/generös portion) men sätt confidence till "low". Vid osäkerhet, luta åt en försiktig/konservativ uppskattning snarare än en hög — överskattning är ett känt problem, så gissa inte i överkant "för säkerhets skull".${correctionsSection}`,
        },
      ],
    })

    const toolUse = message.content.find((block) => block.type === 'tool_use')
    if (!toolUse || toolUse.name !== 'record_meal_estimate') {
      return jsonResponse({ error: 'Kunde inte tolka beskrivningen', code: 'TEXT_API_ERROR' }, 502)
    }

    return jsonResponse(toolUse.input)
  } catch (error) {
    const isRateLimit = error instanceof Anthropic.RateLimitError
    const message = error instanceof Error ? error.message : 'Okänt fel'
    return jsonResponse(
      { error: message, code: isRateLimit ? 'RATE_LIMITED' : 'TEXT_API_ERROR' },
      isRateLimit ? 429 : 502,
    )
  }
})
