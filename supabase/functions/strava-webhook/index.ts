// Supabase Edge Function (Deno). Strava's push_subscriptions endpoint — see
// app-spec-training-addendum.md punkt 1. Two jobs in one function, as Strava
// requires:
//  1. GET: subscription verification handshake (echo hub.challenge back).
//  2. POST: activity create/update/delete events. Strava expects a 200 within
//     a couple of seconds or it treats the delivery as failed and retries —
//     so we ack immediately and do the real work (token refresh, fetching the
//     activity, upserting, triggering the AI evaluation) via
//     EdgeRuntime.waitUntil() in the background.
// No Supabase JWT is ever attached to these requests (Strava calls this
// directly), so verify_jwt is OFF (see config.toml) and all DB access here
// uses the service-role key.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ensureValidStravaToken, fetchStravaActivity, upsertWorkoutFromStravaActivity } from '../_shared/stravaActivity.ts'
import { evaluateWorkout } from '../_shared/evaluateWorkout.ts'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

interface StravaEvent {
  aspect_type: 'create' | 'update' | 'delete'
  object_type: 'activity' | 'athlete'
  object_id: number
  owner_id: number
}

async function processStravaEvent(event: StravaEvent) {
  if (event.object_type !== 'activity') return

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: connection } = await supabase
    .from('fitness_connections')
    .select('*')
    .eq('provider', 'strava')
    .eq('external_athlete_id', String(event.owner_id))
    .maybeSingle()

  if (!connection) return

  if (event.aspect_type === 'delete') {
    // POST bodies here are unauthenticated (no signature/HMAC — only the GET
    // hub.challenge handshake is protected), and owner_id/object_id are plain,
    // publicly-discoverable integers. Without this check, anyone could forge a
    // delete event for any athlete and wipe a specific victim's workout row
    // (cascading to calorie_adjustments, per the FK in 0005_training_schema.sql).
    // Re-verify against Strava's own API with the connection's real token —
    // only delete locally if Strava confirms the activity is actually gone.
    try {
      const accessToken = await ensureValidStravaToken(supabase, connection)
      const verifyRes = await fetch(`https://www.strava.com/api/v3/activities/${event.object_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (verifyRes.status !== 404) {
        console.warn('strava-webhook: ignoring delete event, activity still reachable', {
          objectId: event.object_id,
          status: verifyRes.status,
        })
        return
      }
    } catch (error) {
      console.error('strava-webhook: could not verify delete event, skipping', error)
      return
    }

    await supabase
      .from('workouts')
      .delete()
      .eq('user_id', connection.user_id)
      .eq('source', 'strava')
      .eq('external_id', String(event.object_id))
    return
  }

  try {
    const accessToken = await ensureValidStravaToken(supabase, connection)
    const activity = await fetchStravaActivity(accessToken, event.object_id)
    const result = await upsertWorkoutFromStravaActivity(supabase, connection.user_id, activity)

    await supabase.from('fitness_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', connection.id)

    if (result.data) {
      await evaluateWorkout(supabase, result.data.id, connection.user_id)
    }
  } catch (error) {
    console.error('strava-webhook processing failed', error)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === Deno.env.get('STRAVA_WEBHOOK_VERIFY_TOKEN') && challenge) {
      return jsonResponse({ 'hub.challenge': challenge })
    }
    return jsonResponse({ error: 'Verification failed' }, 403)
  }

  if (req.method === 'POST') {
    let event: StravaEvent | null = null
    try {
      event = await req.json()
    } catch {
      // Malformed body — nothing to process, but still ack so Strava doesn't retry.
    }

    if (event) {
      const processing = processStravaEvent(event)
      const edgeRuntime = (globalThis as unknown as { EdgeRuntime?: { waitUntil: (p: Promise<unknown>) => void } })
        .EdgeRuntime
      if (edgeRuntime) {
        edgeRuntime.waitUntil(processing)
      } else {
        await processing
      }
    }

    return new Response('EVENT_RECEIVED', { status: 200 })
  }

  return new Response('Method not allowed', { status: 405 })
})
