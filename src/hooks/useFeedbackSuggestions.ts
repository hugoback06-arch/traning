import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface FeedbackSuggestion {
  id: string
  message: string
  created_at: string
}

export function useFeedbackSuggestions() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: ['feedback-suggestions', userId],
    queryFn: async (): Promise<FeedbackSuggestion[]> => {
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .select('id, message, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useSubmitFeedbackSuggestion() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const userId = session?.user.id

  return useMutation({
    mutationFn: async (message: string) => {
      if (!userId) throw new Error('Ingen inloggad användare')
      const { error } = await supabase.from('feedback_suggestions').insert({ user_id: userId, message })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-suggestions', userId] })
    },
  })
}
