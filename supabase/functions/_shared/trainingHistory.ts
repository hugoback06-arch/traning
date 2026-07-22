// Shared workout-history summarization — used by both generate-training-plan
// (to ground the actual plan) and training-plan-questions (to ground which
// clarifying questions are even worth asking, e.g. don't ask weekly frequency
// if history already shows a clear pattern).
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export const ACTIVITY_TYPES = ['running', 'cycling', 'swimming', 'strength', 'walking', 'rest', 'other'] as const

export interface WorkoutRow {
  activity_type: (typeof ACTIVITY_TYPES)[number]
  started_at: string
  duration_seconds: number | null
  distance_meters: number | null
}

// Effectively "all" logged history — a cost/safety ceiling, not a meaningful
// business limit. A summarized (not raw-dumped) history is cheap on tokens
// even at this size, and more history means better-grounded paces and volume
// trends than a small recent-only window would give.
const HISTORY_LIMIT = 1000

const PACEABLE_TYPES = new Set(['running', 'walking', 'cycling'])

function formatPace(secondsPerKm: number): string {
  const min = Math.floor(secondsPerKm / 60)
  const sec = Math.round(secondsPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

// Per activity type: count/avg distance+duration, plus (for distance-based
// endurance types) an average pace and the fastest sustained pace among
// longer efforts — a rough threshold-pace proxy to calibrate against.
function summarizeByType(workouts: WorkoutRow[]): string[] {
  const byType = new Map<string, WorkoutRow[]>()
  for (const w of workouts) {
    byType.set(w.activity_type, [...(byType.get(w.activity_type) ?? []), w])
  }

  return Array.from(byType.entries()).map(([type, rows]) => {
    const totalDistanceKm = rows.reduce((sum, w) => sum + (w.distance_meters ?? 0), 0) / 1000
    const totalDurationMin = rows.reduce((sum, w) => sum + (w.duration_seconds ?? 0), 0) / 60

    const parts = [`${rows.length} pass`]
    if (totalDistanceKm > 0) parts.push(`snitt ${(totalDistanceKm / rows.length).toFixed(1)} km/pass`)
    if (totalDurationMin > 0) parts.push(`snitt ${Math.round(totalDurationMin / rows.length)} min/pass`)

    if (PACEABLE_TYPES.has(type) && totalDistanceKm > 0 && totalDurationMin > 0) {
      parts.push(`snittempo ${formatPace((totalDurationMin * 60) / totalDistanceKm)}`)

      const sustainedEfforts = rows.filter((w) => (w.distance_meters ?? 0) >= 2000 && (w.duration_seconds ?? 0) > 0)
      if (sustainedEfforts.length > 0) {
        const bestPaceSecPerKm = Math.min(
          ...sustainedEfforts.map((w) => w.duration_seconds! / (w.distance_meters! / 1000)),
        )
        parts.push(`snabbaste hållbara tempo ~${formatPace(bestPaceSecPerKm)}`)
      }
    }

    return `${type}: ${parts.join(', ')}`
  })
}

// Recent-vs-prior 4-week volume comparison — tells the model whether the
// user is ramping up, steady, or coming off a break, so a new plan doesn't
// restart too easy for someone already fit or too hard after time off.
function summarizeTrend(workouts: WorkoutRow[]): string | null {
  const now = Date.now()
  const FOUR_WEEKS_MS = 28 * 86_400_000

  const recent = workouts.filter((w) => now - Date.parse(w.started_at) <= FOUR_WEEKS_MS)
  const prior = workouts.filter((w) => {
    const age = now - Date.parse(w.started_at)
    return age > FOUR_WEEKS_MS && age <= FOUR_WEEKS_MS * 2
  })
  if (recent.length === 0) return null

  const recentKm = recent.reduce((s, w) => s + (w.distance_meters ?? 0), 0) / 1000
  const priorKm = prior.reduce((s, w) => s + (w.distance_meters ?? 0), 0) / 1000

  let trendNote = ''
  if (priorKm > 0) {
    const diffPct = Math.round(((recentKm - priorKm) / priorKm) * 100)
    if (diffPct > 15) trendNote = ' (ökande trend jämfört med perioden innan)'
    else if (diffPct < -15) trendNote = ' (minskande trend jämfört med perioden innan, ev. paus/vila — bygg försiktigt upp igen)'
    else trendNote = ' (stabil volym)'
  } else if (recent.length > 0) {
    trendNote = ' (ingen träning loggad perioden innan — nystart eller ny användare av synken)'
  }

  return `Senaste 4 veckorna: ${recent.length} pass, ${recentKm.toFixed(0)} km${trendNote}.`
}

// Compact, human-readable summary instead of raw rows — cheaper on tokens and
// more reliable for Claude to reason about than a long JSON dump.
export function summarizeHistory(workouts: WorkoutRow[]): string {
  if (workouts.length === 0) {
    return 'Ingen tidigare träningshistorik finns än — utgå från att användaren är nybörjare/okänd nivå och bygg försiktigt.'
  }

  const oldestIso = workouts[workouts.length - 1].started_at
  const newestIso = workouts[0].started_at
  const spanDays = Math.max(1, Math.round((Date.parse(newestIso) - Date.parse(oldestIso)) / 86_400_000))

  return [
    `All loggad träningshistorik (${workouts.length} pass över ${spanDays} dagar): ${summarizeByType(workouts).join('; ')}.`,
    summarizeTrend(workouts),
  ]
    .filter(Boolean)
    .join(' ')
}

export async function fetchHistorySummary(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data } = await supabase
    .from('workouts')
    .select('activity_type, started_at, duration_seconds, distance_meters')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  return summarizeHistory((data ?? []) as WorkoutRow[])
}
