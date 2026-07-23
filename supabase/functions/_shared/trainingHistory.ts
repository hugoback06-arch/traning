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
  avg_heart_rate: number | null
  elevation_gain_meters: number | null
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

    const hrRows = rows.filter((w) => (w.avg_heart_rate ?? 0) > 0)
    if (hrRows.length > 0) {
      const avgHr = hrRows.reduce((sum, w) => sum + w.avg_heart_rate!, 0) / hrRows.length
      parts.push(`snittpuls ~${Math.round(avgHr)} bpm`)
    }

    const elevRows = rows.filter((w) => (w.elevation_gain_meters ?? 0) > 0)
    if (elevRows.length > 0) {
      const totalElev = elevRows.reduce((sum, w) => sum + w.elevation_gain_meters!, 0)
      parts.push(`snitt ${Math.round(totalElev / rows.length)} höjdmeter/pass`)
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
    .select('activity_type, started_at, duration_seconds, distance_meters, avg_heart_rate, elevation_gain_meters')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  return summarizeHistory((data ?? []) as WorkoutRow[])
}

// Age/kön/vikt/aktivitetsnivå från onboarding — används idag bara i kost-delen,
// men ger bättre kalibrerad belastning/volym än att gissa utifrån historik ensamt.
export interface ProfileRow {
  birth_date: string | null
  sex: 'male' | 'female' | 'other' | null
  height_cm: number | null
  weight_kg: number | null
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
}

const ACTIVITY_LEVEL_LABELS: Record<NonNullable<ProfileRow['activity_level']>, string> = {
  sedentary: 'stillasittande vardag',
  light: 'lätt aktiv vardag',
  moderate: 'måttligt aktiv vardag',
  active: 'aktiv vardag',
  very_active: 'mycket aktiv vardag',
}

const SEX_LABELS: Record<NonNullable<ProfileRow['sex']>, string> = {
  male: 'man',
  female: 'kvinna',
  other: 'annat',
}

function calculateAge(birthDateIso: string): number {
  const birth = new Date(birthDateIso)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate())
  if (!hasHadBirthdayThisYear) age--
  return age
}

export function summarizeProfile(profile: ProfileRow | null): string {
  if (!profile) return ''
  const parts: string[] = []
  if (profile.birth_date) parts.push(`${calculateAge(profile.birth_date)} år`)
  if (profile.sex) parts.push(SEX_LABELS[profile.sex])
  if (profile.weight_kg) parts.push(`${profile.weight_kg} kg`)
  if (profile.height_cm) parts.push(`${profile.height_cm} cm`)
  if (profile.activity_level) parts.push(ACTIVITY_LEVEL_LABELS[profile.activity_level])
  if (parts.length === 0) return ''
  return `Användarens profil: ${parts.join(', ')}. `
}

export async function fetchProfileSummary(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('birth_date, sex, height_cm, weight_kg, activity_level')
    .eq('id', userId)
    .maybeSingle()

  return summarizeProfile((data ?? null) as ProfileRow | null)
}

interface HeartRateZoneRow {
  min: number
  max: number
}

const ZONE_NAMES = ['Zon 1 (återhämtning)', 'Zon 2 (lugnt)', 'Zon 3 (tempo)', 'Zon 4 (tröskel)', 'Zon 5 (max)']

export function summarizeHeartRateZones(zones: HeartRateZoneRow[] | null): string {
  if (!zones || zones.length === 0) return ''
  const parts = zones.map((zone, i) => {
    const label = ZONE_NAMES[i] ?? `Zon ${i + 1}`
    const max = zone.max > 0 ? zone.max : '∞'
    return `${label}: ${zone.min}-${max} bpm`
  })
  return `Användarens pulszoner från Strava: ${parts.join(', ')}. Använd dessa EXAKTA zoner istället för att gissa pulsintervall när passen ska ha en pulsangivelse. `
}

export async function fetchHeartRateZonesSummary(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data } = await supabase
    .from('fitness_connections')
    .select('heart_rate_zones')
    .eq('user_id', userId)
    .eq('provider', 'strava')
    .maybeSingle()

  return summarizeHeartRateZones((data?.heart_rate_zones ?? null) as HeartRateZoneRow[] | null)
}
