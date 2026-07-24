import { useMealLogDates } from './useMealLogDates'
import { calculateStreak } from '../lib/streaks'

export function useStreak(): number {
  const { data: mealDates } = useMealLogDates()
  return calculateStreak(mealDates ?? [])
}
