import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { dayRangeIso } from '../lib/dateRange'
import { useAuth } from './useAuth'
import type { MealLogWithFood } from '../types/domain'

export function useTodayMealLogs() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.todayMealLogs(userId),
    queryFn: async (): Promise<MealLogWithFood[]> => {
      const { startIso, endIsoExclusive } = dayRangeIso(new Date())
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*, food_item:food_items(*)')
        .eq('user_id', userId as string)
        .gte('logged_at', startIso)
        .lt('logged_at', endIsoExclusive)
        .order('logged_at', { ascending: true })

      if (error) throw error
      return data as unknown as MealLogWithFood[]
    },
    enabled: !!userId,
  })
}
