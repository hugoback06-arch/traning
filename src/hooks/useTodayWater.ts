import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { dayRangeIso } from '../lib/dateRange'
import { useAuth } from './useAuth'

export function useTodayWater() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.todayWater(userId),
    queryFn: async (): Promise<number> => {
      const { startIso, endIsoExclusive } = dayRangeIso(new Date())
      const { data, error } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', userId as string)
        .gte('logged_at', startIso)
        .lt('logged_at', endIsoExclusive)

      if (error) throw error
      return data.reduce((sum, row) => sum + row.amount_ml, 0)
    },
    enabled: !!userId,
  })
}
