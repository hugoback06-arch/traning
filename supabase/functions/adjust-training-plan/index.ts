// Supabase Edge Function (Deno). Handles the low-friction "För intensivt /
// Lagom / Vill ha mer" check-in from the Schema week view
// (app-spec-training-addendum.md punkt 2). Deterministic rule-based
// adjustment — no LLM call needed here, this is a fixed business rule, not
// free text. Scales the numeric targets of upcoming, not-yet-completed
// sessions and logs why in training_plan_adjustments so it's visible later.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Within the addendum's ~10–15%/week progression guideline.
const LOWER_FACTOR = 0.8
const HIGHER_FACTOR = 1.12
const ADJUSTMENT_WINDOW_DAYS = 7

const PREFERENCE_LABELS: Record<string, string> = {
  lower: 'För intensivt',
  as_planned: 'Lagom',
  higher: 'Vill ha mer',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function scaleTargetData(targetData: Record<string, unknown> | null, factor: number): Record<string, unknown> {
  if (!targetData) return {}
  const scaled: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(targetData)) {
    scaled[key] = typeof value === 'number' ? Math.round(value * factor * 10) / 10 : value
  }
  return scaled
}

function scaleTitle(title: string, factor: number): string {
  return title.replace(/(\d+(\.\d+)?)(\s*km)/i, (_match, num, _decimals, unit) => {
    const scaled = Math.round(Number(num) * factor * 10) / 10
    return `${scaled}${unit}`
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let trainingPlanId: unknown
  let preference: unknown
  try {
    ;({ training_plan_id: trainingPlanId, preference } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_REQUEST' }, 400)
  }

  if (
    typeof trainingPlanId !== 'string' ||
    typeof preference !== 'string' ||
    !['lower', 'as_planned', 'higher'].includes(preference)
  ) {
    return jsonResponse({ error: 'training_plan_id och giltig preference krävs', code: 'INVALID_REQUEST' }, 400)
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

  const { data: plan, error: planError } = await supabase
    .from('training_plans')
    .select('id')
    .eq('id', trainingPlanId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (planError) return jsonResponse({ error: planError.message, code: 'DB_ERROR' }, 500)
  if (!plan) return jsonResponse({ error: 'Schemat hittades inte', code: 'NOT_FOUND' }, 404)

  const { error: updatePlanError } = await supabase
    .from('training_plans')
    .update({ intensity_preference: preference })
    .eq('id', trainingPlanId)

  if (updatePlanError) return jsonResponse({ error: updatePlanError.message, code: 'DB_ERROR' }, 500)

  if (preference === 'as_planned') {
    const note = "Användaren markerade 'Lagom' — inga kommande pass ändrades."
    await supabase.from('training_plan_adjustments').insert({ training_plan_id: trainingPlanId, user_id: user.id, note })
    return jsonResponse({ adjusted: false, note })
  }

  const factor = preference === 'lower' ? LOWER_FACTOR : HIGHER_FACTOR
  const today = new Date().toISOString().slice(0, 10)
  const windowEnd = new Date()
  windowEnd.setUTCDate(windowEnd.getUTCDate() + ADJUSTMENT_WINDOW_DAYS)
  const windowEndIso = windowEnd.toISOString().slice(0, 10)

  const { data: upcomingSessions, error: sessionsError } = await supabase
    .from('training_plan_sessions')
    .select('id, title, target_data')
    .eq('training_plan_id', trainingPlanId)
    .is('completed_workout_id', null)
    .neq('activity_type', 'rest')
    .gte('scheduled_date', today)
    .lte('scheduled_date', windowEndIso)

  if (sessionsError) return jsonResponse({ error: sessionsError.message, code: 'DB_ERROR' }, 500)

  const sessions = upcomingSessions ?? []
  for (const session of sessions) {
    await supabase
      .from('training_plan_sessions')
      .update({
        target_data: scaleTargetData(session.target_data as Record<string, unknown> | null, factor),
        title: scaleTitle(session.title, factor),
      })
      .eq('id', session.id)
  }

  const percent = Math.round(Math.abs(factor - 1) * 100)
  const direction = preference === 'lower' ? 'sänktes' : 'höjdes'
  const note = sessions.length
    ? `Användaren markerade '${PREFERENCE_LABELS[preference]}' — ${sessions.length} kommande pass ${direction} ~${percent}%.`
    : `Användaren markerade '${PREFERENCE_LABELS[preference]}' — inga opåbörjade pass hittades att justera denna vecka.`

  await supabase.from('training_plan_adjustments').insert({ training_plan_id: trainingPlanId, user_id: user.id, note })

  return jsonResponse({ adjusted: sessions.length > 0, note })
})
