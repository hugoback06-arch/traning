import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { dayRangeIso } from '../lib/dateRange'
import { useAuth } from './useAuth'
import type { MealLogWithFood } from '../types/domain'

export function useMealLogsForDate(date: Date) {
  const { session } = useAuth()
  const userId = session?.user.id
  const dateKey = format(date, 'yyyy-MM-dd')

  return useQuery({
    queryKey: queryKeys.mealLogsForDate(userId, dateKey),
    queryFn: async (): Promise<MealLogWithFood[]> => {
      const { startIso, endIsoExclusive } = dayRangeIso(date)
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
