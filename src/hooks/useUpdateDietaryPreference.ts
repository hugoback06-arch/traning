import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { DietaryPreference } from '../types/domain'

export function useUpdateDietaryPreference() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dietary_preference: DietaryPreference) => {
      const { error } = await supabase.from('profiles').update({ dietary_preference }).eq('id', userId as string)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
    },
  })
}
