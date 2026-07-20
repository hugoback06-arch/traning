// Shared Strava helpers: token refresh, activity → workouts mapping, and the
// upsert (incl. auto-linking to a scheduled training_plan_session + writing
// the calorie_adjustments row) — used by both strava-webhook (automatic) and
// strava-manual-sync (fallback button, see app-spec-training-addendum.md punkt 1).
// deno-lint-ignore no-explicit-any
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const STRAVA_TYPE_MAP: Record<string, string> = {
  Run: 'running',
  TrailRun: 'running',
  Ride: 'cycling',
  VirtualRide: 'cycling',
  MountainBikeRide: 'cycling',
  GravelRide: 'cycling',
  Swim: 'swimming',
  WeightTraining: 'strength',
  Workout: 'strength',
  Crossfit: 'strength',
  Walk: 'walking',
  Hike: 'walking',
}

export function mapStravaActivityType(stravaType: string): string {
  return STRAVA_TYPE_MAP[stravaType] ?? 'other'
}

interface FitnessConnectionRow {
  id: string
  user_id: string
  access_token: string
  refresh_token: string | null
  expires_at: string | null
}

// Returns a valid access_token, refreshing (and persisting) it first if expired.
// deno-lint-ignore no-explicit-any
export async function ensureValidStravaToken(supabase: SupabaseClient<any>, connection: FitnessConnectionRow): Promise<string> {
  const expiresAt = connection.expires_at ? Date.parse(connection.expires_at) : 0
  if (expiresAt > Date.now() + 60_000) {
    return connection.access_token
  }

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: Deno.env.get('STRAVA_CLIENT_ID'),
      client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
    }),
  })

  if (!res.ok) throw new Error(`Kunde inte förnya Strava-token (${res.status})`)
  const refreshed = await res.json()

  await supabase
    .from('fitness_connections')
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: new Date(refreshed.expires_at * 1000).toISOString(),
    })
    .eq('id', connection.id)

  return refreshed.access_token
}

export async function fetchStravaActivity(accessToken: string, activityId: string | number) {
  const res = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Kunde inte hämta Strava-aktivitet ${activityId} (${res.status})`)
  return res.json()
}

// Paginates through all activities since afterEpochSeconds — a first-time
// historical sync can easily exceed a single page (Strava caps per_page at 200).
// deno-lint-ignore no-explicit-any
export async function fetchStravaActivities(accessToken: string, afterEpochSeconds: number): Promise<any[]> {
  const all: unknown[] = []
  let page = 1
  while (true) {
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${afterEpochSeconds}&per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) throw new Error(`Kunde inte hämta Strava-aktiviteter (${res.status})`)
    const batch = (await res.json()) as unknown[]
    all.push(...batch)
    if (batch.length < 200) break
    page += 1
  }
  return all
}

// deno-lint-ignore no-explicit-any
export async function upsertWorkoutFromStravaActivity(supabase: SupabaseClient<any>, userId: string, activity: any) {
  const activityType = mapStravaActivityType(activity.sport_type ?? activity.type)
  const startedAt = activity.start_date as string
  const scheduledDate = startedAt.slice(0, 10)

  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .upsert(
      {
        user_id: userId,
        source: 'strava',
        external_id: String(activity.id),
        activity_type: activityType,
        title: activity.name ?? null,
        started_at: startedAt,
        duration_seconds: activity.moving_time ?? null,
        distance_meters: activity.distance ?? null,
        calories_burned: activity.calories ?? null,
        avg_heart_rate: activity.average_heartrate ? Math.round(activity.average_heartrate) : null,
        max_heart_rate: activity.max_heartrate ? Math.round(activity.max_heartrate) : null,
        elevation_gain_meters: activity.total_elevation_gain ?? null,
      },
      { onConflict: 'user_id,source,external_id' },
    )
    .select('*')
    .single()

  if (workoutError || !workout) return { error: workoutError?.message ?? 'Kunde inte spara passet' }

  // Auto-link to a scheduled-but-not-yet-completed session on the same date, if one exists.
  if (!workout.training_plan_session_id) {
    const { data: candidateSession } = await supabase
      .from('training_plan_sessions')
      .select('id, training_plan_id, training_plans!inner(user_id, status)')
      .eq('training_plans.user_id', userId)
      .eq('training_plans.status', 'active')
      .eq('scheduled_date', scheduledDate)
      .is('completed_workout_id', null)
      .neq('activity_type', 'rest')
      .limit(1)
      .maybeSingle()

    if (candidateSession) {
      await supabase.from('training_plan_sessions').update({ completed_workout_id: workout.id }).eq('id', candidateSession.id)
      await supabase.from('workouts').update({ training_plan_session_id: candidateSession.id }).eq('id', workout.id)
      workout.training_plan_session_id = candidateSession.id
    }
  }

  if (activity.calories) {
    await supabase.from('calorie_adjustments').upsert(
      {
        user_id: userId,
        workout_id: workout.id,
        adjustment_date: scheduledDate,
        extra_kcal: Math.round(activity.calories),
        reason: `${activity.name ?? 'Träningspass'}, ${Math.round(activity.calories)} kcal förbrända`,
      },
      { onConflict: 'workout_id' },
    )
  }

  return { data: workout }
}
