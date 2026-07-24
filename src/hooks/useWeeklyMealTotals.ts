import { useQuery } from '@tanstack/react-query'
import { addDays, startOfDay } from 'date-fns'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { lastNDaysRangeIso } from '../lib/dateRange'
import { sumMealTotals } from '../lib/dailyTotals'
import { useAuth } from './useAuth'
import type { MealLogWithFood } from '../types/domain'

const DAYS = 7

export interface DayKcal {
  date: Date
  kcal: number
}

export function useWeeklyMealTotals() {
  const { session } = useAuth()
  const userId = session?.user.id
  const { startIso, endIsoExclusive } = lastNDaysRangeIso(new Date(), DAYS)

  return useQuery({
    queryKey: queryKeys.weeklyMealLogs(userId, startIso, endIsoExclusive),
    queryFn: async (): Promise<DayKcal[]> => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*, food_item:food_items(*)')
        .eq('user_id', userId as string)
        .gte('logged_at', startIso)
        .lt('logged_at', endIsoExclusive)

      if (error) throw error
      const logs = data as unknown as MealLogWithFood[]

      const todayStart = startOfDay(new Date())
      const days: DayKcal[] = Array.from({ length: DAYS }, (_, i) => ({
        date: addDays(todayStart, -(DAYS - 1 - i)),
        kcal: 0,
      }))

      for (const log of logs) {
        const logDay = startOfDay(new Date(log.logged_at)).getTime()
        const bucket = days.find((d) => d.date.getTime() === logDay)
        if (bucket) bucket.kcal += sumMealTotals([log]).kcal
      }

      return days
    },
    enabled: !!userId,
  })
}
