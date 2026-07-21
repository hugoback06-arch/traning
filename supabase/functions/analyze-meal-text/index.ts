// Supabase Edge Function (Deno). Proxies a free-text meal description to Claude
// so the ANTHROPIC_API_KEY never reaches the browser. Auth is enforced by the
// platform (verify_jwt = true in supabase/config.toml) before this code runs.
// Mirrors analyze-meal-photo/index.ts, swapping the image content block for text.
import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const MODEL = Deno.env.get('CLAUDE_TEXT_MODEL') ?? 'claude-opus-4-8'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ESTIMATE_TOOL = {
  name: 'record_meal_estimate',
  description: 'Record a nutritional estimate for the meal described in the text.',
  input_schema: {
    type: 'object' as const,
    properties: {
      food_name: { type: 'string', description: 'Short name for the dish/food, in Swedish.' },
      estimated_weight_g: { type: 'number', description: 'Estimated total weight of the described portion, in grams.' },
      calories: { type: 'number', description: 'Estimated total calories (kcal) for the whole portion described.' },
      protein_g: { type: 'number', description: 'Estimated total protein in grams for the whole portion.' },
      carbs_g: { type: 'number', description: 'Estimated total carbohydrates in grams for the whole portion.' },
      fat_g: { type: 'number', description: 'Estimated total fat in grams for the whole portion.' },
      confidence: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Confidence in this estimate given how specific/vague the description is.',
      },
    },
    required: ['food_name', 'estimated_weight_g', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'confidence'],
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

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      tools: [ESTIMATE_TOOL],
      tool_choice: { type: 'tool', name: 'record_meal_estimate' },
      messages: [
        {
          role: 'user',
          content: `Uppskatta kalorier och makronutrienter (protein, kolhydrater, fett) för följande måltid, beskriven av användaren: "${description.trim()}". Svara på svenska. Om beskrivningen är vag, gör en bästa gissning ändå men sätt confidence till "low".`,
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
