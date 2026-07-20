// Supabase Edge Function (Deno). Thin, user-authenticated wrapper around the
// shared evaluateWorkout() core (see _shared/evaluateWorkout.ts) — triggered
// on-demand from the workout detail sheet. strava-webhook calls the same core
// automatically after a new activity syncs in.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { evaluateWorkout } from '../_shared/evaluateWorkout.ts'

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

  let workoutId: unknown
  try {
    ;({ workout_id: workoutId } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_REQUEST' }, 400)
  }

  if (typeof workoutId !== 'string' || !workoutId) {
    return jsonResponse({ error: 'workout_id krävs', code: 'INVALID_REQUEST' }, 400)
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

  const result = await evaluateWorkout(supabase, workoutId, user.id)
  if (result.error) return jsonResponse({ error: result.error, code: 'EVALUATION_ERROR' }, 502)
  return jsonResponse(result.data)
})
