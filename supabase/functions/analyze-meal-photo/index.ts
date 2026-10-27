// Supabase Edge Function (Deno). Proxies a food photo to Claude vision so the
// ANTHROPIC_API_KEY never reaches the browser. Auth is enforced by the platform
// (verify_jwt = true in supabase/config.toml) before this code even runs.
// The estimate itself is grounded in the food database — see _shared/mealEstimate.ts.
import Anthropic from 'npm:@anthropic-ai/sdk@0.137.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildFoodCorrectionsPromptSection } from '../_shared/foodCorrections.ts'
import { estimateMeal, loadCatalog, MealEstimateError } from '../_shared/mealEstimate.ts'
import { consumeAiQuota } from '../_shared/aiQuota.ts'
import { logFunctionError } from '../_shared/errorLog.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  const quotaError = await consumeAiQuota(supabase, 'meal_photo')
  if (quotaError) {
    return jsonResponse({ error: quotaError, code: 'QUOTA_EXCEEDED' }, 429)
  }
  const correctionsSection = await buildFoodCorrectionsPromptSection(supabase, user.id)

  const promptText =
    'Måltiden visas på bilden. Titta noga på vad som faktiskt syns (form, färg, textur, sås, garnering, ' +
    'tillagningssätt) innan du bestämmer vad det är, och uppskatta varje dels vikt utifrån dess synliga ' +
    'portionsstorlek jämfört med tallrik, bestick eller förpackning. Ta bara med tillagningsfett om det syns ' +
    '(glansig yta, synlig olja/smör, friteringsskorpa). Om bilden inte tydligt visar mat, gör en bästa gissning ' +
    'med confidence "low".' +
    (description ? ` Användarens egen beskrivning (använd som hjälp, bilden väger tyngst): "${description}"` : '') +
    correctionsSection

  try {
    const catalog = await loadCatalog(supabase)
    const estimate = await estimateMeal({
      anthropic,
      catalog,
      userContent: [
        { type: 'image', source: { type: 'base64', media_type: mime_type as 'image/jpeg', data: image_base64 } },
        { type: 'text', text: promptText },
      ],
    })
    return jsonResponse(estimate)
  } catch (error) {
    const isRateLimit = error instanceof Anthropic.RateLimitError
    const message = error instanceof Error ? error.message : 'Okänt fel'
    const status = isRateLimit ? 429 : error instanceof MealEstimateError ? 422 : 502
    await logFunctionError(supabase, 'analyze-meal-photo', error, { mime_type })
    return jsonResponse({ error: message, code: isRateLimit ? 'RATE_LIMITED' : 'VISION_API_ERROR' }, status)
  }
})
