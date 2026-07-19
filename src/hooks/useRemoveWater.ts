import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { dayRangeIso } from '../lib/dateRange'
import { useAuth } from './useAuth'

export function useRemoveWater() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { startIso, endIsoExclusive } = dayRangeIso(new Date())
      const { data: last, error: selectError } = await supabase
        .from('water_logs')
        .select('id')
        .eq('user_id', userId as string)
        .gte('logged_at', startIso)
        .lt('logged_at', endIsoExclusive)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (selectError) throw selectError
      if (!last) return

      const { error: deleteError } = await supabase.from('water_logs').delete().eq('id', last.id)
      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayWater(userId) })
    },
  })
}
