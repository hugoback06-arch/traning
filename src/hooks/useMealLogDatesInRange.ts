import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'

export function useMealLogDatesInRange(startIso: string, endIsoExclusive: string) {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.mealLogDatesInRange(userId, startIso, endIsoExclusive),
    queryFn: async (): Promise<Date[]> => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('logged_at')
        .eq('user_id', userId as string)
        .gte('logged_at', startIso)
        .lt('logged_at', endIsoExclusive)

      if (error) throw error
      return data.map((row) => new Date(row.logged_at))
    },
    enabled: !!userId,
  })
}
