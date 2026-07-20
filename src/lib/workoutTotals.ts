import { ACTIVITY_LABELS } from './activityTypes'
import type { ActivityType, TrainingPlanSession, Workout } from '../types/domain'

const PASS_LABEL_OVERRIDE: Partial<Record<ActivityType, string>> = {
  running: 'löppass',
  cycling: 'cykelpass',
  swimming: 'simpass',
  strength: 'styrkepass',
  walking: 'promenader',
  other: 'pass',
}

export function weekSummaryLabel(workouts: Workout[]): string {
  if (workouts.length === 0) return 'Ingen träning inplanerad denna vecka.'

  const countByType = new Map<ActivityType, number>()
  let totalDistanceMeters = 0

  for (const workout of workouts) {
    countByType.set(workout.activity_type, (countByType.get(workout.activity_type) ?? 0) + 1)
    totalDistanceMeters += workout.distance_meters ?? 0
  }

  const parts = Array.from(countByType.entries()).map(
    ([type, count]) => `${count} ${PASS_LABEL_OVERRIDE[type] ?? ACTIVITY_LABELS[type].toLowerCase()}`,
  )

  if (totalDistanceMeters > 0) {
    parts.push(`${Math.round(totalDistanceMeters / 1000)} km totalt`)
  }

  return `Denna vecka: ${parts.join(', ')}.`
}

// "X/Y pass genomförda" — app-spec-training-addendum.md punkt 3. Räknar bara
// planerade (icke-vila) pass, mot hur många av dem som har ett genomfört pass kopplat.
export function weekComplianceLabel(sessions: TrainingPlanSession[]): string | null {
  const plannedSessions = sessions.filter((s) => s.activity_type !== 'rest')
  if (plannedSessions.length === 0) return null

  const completed = plannedSessions.filter((s) => s.completed_workout_id != null).length
  return `${completed}/${plannedSessions.length} pass genomförda denna vecka`
}
