// Supabase Edge Function (Deno). Proxies a food photo to Claude vision so the
// ANTHROPIC_API_KEY never reaches the browser. Auth is enforced by the platform
// (verify_jwt = true in supabase/config.toml) before this code even runs.
import Anthropic from 'npm:@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

// Configurable so a cheaper vision-capable model can be swapped in without a
// redeploy of application logic — see CLAUDE.md for the tradeoff.
const MODEL = Deno.env.get('CLAUDE_VISION_MODEL') ?? 'claude-opus-5'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ESTIMATE_TOOL = {
  name: 'record_meal_estimate',
  description:
    'Record a nutritional estimate for the meal shown in the photo. First describe what is visually ' +
    'identifiable in the image, then break the meal into its individual components and estimate each one, ' +
    'then report the sum as the total — this grounds the identification in what is actually visible and ' +
    'produces far more accurate totals than guessing a single aggregate number.',
  input_schema: {
    type: 'object' as const,
    properties: {
      visible_evidence: {
        type: 'string',
        description:
          'What is actually visible in the photo that identifies this dish — colors, textures, shapes, ' +
          'garnishes, sauces, visible ingredients, container/plate type. Base the food_name and ingredients ' +
          'strictly on this. If something is ambiguous or partially obscured, say so here, in Swedish.',
      },
      food_name: { type: 'string', description: 'Short name for the dish/food, in Swedish.' },
      ingredients: {
        type: 'array',
        description:
          'The meal broken down into its distinct visible components (e.g. "ris", "kycklingfilé", "tzatziki"). ' +
          'Estimate each one individually based on its visible portion size before totalling.',
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
        description: 'Confidence in this estimate given what is visible in the photo, especially the dish identification.',
      },
    },
    required: [
      'visible_evidence',
      'food_name',
      'ingredients',
      'estimated_weight_g',
      'calories',
      'protein_g',
      'carbs_g',
      'fat_g',
      'confidence',
    ],
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

  let image_base64: unknown
  let mime_type: unknown
  let description: unknown
  try {
    ;({ image_base64, mime_type, description } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_IMAGE' }, 400)
  }

  if (typeof image_base64 !== 'string' || typeof mime_type !== 'string' || !image_base64) {
    return jsonResponse({ error: 'image_base64 och mime_type krävs', code: 'INVALID_IMAGE' }, 400)
  }
  if (description !== undefined && typeof description !== 'string') {
    return jsonResponse({ error: 'Ogiltig beskrivning', code: 'INVALID_IMAGE' }, 400)
  }

  const promptText =
    'Uppskatta kalorier och makronutrienter (protein, kolhydrater, fett) för maten på bilden. ' +
    'Titta noga på bilden först och beskriv vad som faktiskt syns (form, färg, textur, sås, garnering, tillagningsmetod) innan du namnger rätten — gissa inte på en rätt som inte stöds av det du ser. ' +
    'Dela sedan upp maten i sina synliga beståndsdelar och uppskatta varje del för sig utifrån dess synliga portionsstorlek, inklusive synligt tillagningsfett (t.ex. olja/smör om maten ser stekt/friterad ut). Summera delarna till totalen. ' +
    'Svara på svenska. Om bilden inte tydligt visar mat, eller om identifieringen är osäker, gör en rimlig bästa gissning ändå men sätt confidence till "low".' +
    (description ? ` Användarens egen beskrivning av rätten (använd som hjälp, bilden väger tyngst): "${description}"` : '')

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1536,
      thinking: { type: 'disabled' },
      tools: [ESTIMATE_TOOL],
      tool_choice: { type: 'tool', name: 'record_meal_estimate' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mime_type, data: image_base64 } },
            { type: 'text', text: promptText },
          ],
        },
      ],
    })

    const toolUse = message.content.find((block) => block.type === 'tool_use')
    if (!toolUse || toolUse.name !== 'record_meal_estimate') {
      return jsonResponse({ error: 'Kunde inte tolka bilden', code: 'VISION_API_ERROR' }, 502)
    }

    return jsonResponse(toolUse.input)
  } catch (error) {
    const isRateLimit = error instanceof Anthropic.RateLimitError
    const message = error instanceof Error ? error.message : 'Okänt fel'
    return jsonResponse(
      { error: message, code: isRateLimit ? 'RATE_LIMITED' : 'VISION_API_ERROR' },
      isRateLimit ? 429 : 502,
    )
  }
})
