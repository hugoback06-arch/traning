import { startOfDay, subDays } from 'date-fns'

/**
 * A streak stays "alive" for the current day until it ends without a log —
 * so if today has no entry yet but yesterday does, we still count backward
 * from yesterday rather than resetting to 0.
 */
export function calculateStreak(loggedDates: Date[]): number {
  const uniqueDays = new Set(loggedDates.map((d) => startOfDay(d).getTime()))
  const today = startOfDay(new Date())
  let cursor = uniqueDays.has(today.getTime()) ? today : subDays(today, 1)
  let streak = 0

  while (uniqueDays.has(cursor.getTime())) {
    streak++
    cursor = subDays(cursor, 1)
  }

  return streak
}
