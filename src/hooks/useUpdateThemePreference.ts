import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { ThemePreference } from '../types/domain'

export function useUpdateThemePreference() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (theme_preference: ThemePreference) => {
      const { error } = await supabase.from('profiles').update({ theme_preference }).eq('id', userId as string)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
    },
  })
}
