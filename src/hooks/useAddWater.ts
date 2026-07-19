import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { GLASS_ML } from '../lib/constants'
import { useAuth } from './useAuth'

export function useAddWater() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('water_logs').insert({ user_id: userId, amount_ml: GLASS_ML })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayWater(userId) })
    },
  })
}
