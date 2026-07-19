import { useQuery } from '@tanstack/react-query'
import { startOfDay, subDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'

const STREAK_LOOKBACK_DAYS = 60

export function useMealLogDates() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.mealLogDates(userId),
    queryFn: async (): Promise<Date[]> => {
      const since = subDays(startOfDay(new Date()), STREAK_LOOKBACK_DAYS).toISOString()
      const { data, error } = await supabase
        .from('meal_logs')
        .select('logged_at')
        .eq('user_id', userId as string)
        .gte('logged_at', since)

      if (error) throw error
      return data.map((row) => new Date(row.logged_at))
    },
    enabled: !!userId,
  })
}
