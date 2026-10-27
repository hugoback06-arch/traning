// Supabase Edge Function (Deno). Proxies a free-text meal description to Claude
// so the ANTHROPIC_API_KEY never reaches the browser. Auth is enforced by the
// platform (verify_jwt = true in supabase/config.toml) before this code runs.
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

  const quotaError = await consumeAiQuota(supabase, 'meal_text')
  if (quotaError) {
    return jsonResponse({ error: quotaError, code: 'QUOTA_EXCEEDED' }, 429)
  }

  try {
    const correctionsSection = await buildFoodCorrectionsPromptSection(supabase, user.id)
    const catalog = await loadCatalog(supabase)
    const estimate = await estimateMeal({
      anthropic,
      catalog,
      userContent: [
        { type: 'text', text: `Måltiden, beskriven av användaren: "${description.trim()}"${correctionsSection}` },
      ],
    })
    return jsonResponse(estimate)
  } catch (error) {
    const isRateLimit = error instanceof Anthropic.RateLimitError
    const message = error instanceof Error ? error.message : 'Okänt fel'
    const status = isRateLimit ? 429 : error instanceof MealEstimateError ? 422 : 502
    await logFunctionError(supabase, 'analyze-meal-text', error, { description: description.trim().slice(0, 300) })
    return jsonResponse({ error: message, code: isRateLimit ? 'RATE_LIMITED' : 'TEXT_API_ERROR' }, status)
  }
})
