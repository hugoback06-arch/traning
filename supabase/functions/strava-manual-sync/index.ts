// Supabase Edge Function (Deno). The addendum's required fallback for when
// the webhook delivery misses (network blip, Strava outage): a discreet
// manual "sync now" button — reservlösning, not the primary flow. Pulls
// recent activities since the last sync (or the last year on first run, so
// connecting Strava for the first time brings in real history rather than
// starting from an empty slate) and upserts them the same way strava-webhook
// does. Does NOT auto-trigger AI evaluation (kept fast/synchronous for the
// button press) — evaluation is still available on-demand from the workout
// detail sheet.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ensureValidStravaToken, fetchStravaActivities, upsertWorkoutFromStravaActivity } from '../_shared/stravaActivity.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FIRST_SYNC_LOOKBACK_DAYS = 365

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

  const { data: connection, error: connectionError } = await supabase
    .from('fitness_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'strava')
    .maybeSingle()

  if (connectionError) return jsonResponse({ error: connectionError.message, code: 'DB_ERROR' }, 500)
  if (!connection) return jsonResponse({ error: 'Ingen Strava-anslutning', code: 'NOT_CONNECTED' }, 400)

  try {
    const accessToken = await ensureValidStravaToken(supabase, connection)
    const afterEpoch = connection.last_synced_at
      ? Math.floor(Date.parse(connection.last_synced_at) / 1000)
      : Math.floor(Date.now() / 1000) - FIRST_SYNC_LOOKBACK_DAYS * 86_400

    const activities = await fetchStravaActivities(accessToken, afterEpoch)

    let syncedCount = 0
    for (const activity of activities) {
      const result = await upsertWorkoutFromStravaActivity(supabase, user.id, activity)
      if (result.data) syncedCount += 1
    }

    await supabase.from('fitness_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', connection.id)

    return jsonResponse({ synced_count: syncedCount })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel'
    return jsonResponse({ error: message, code: 'SYNC_ERROR' }, 502)
  }
})
