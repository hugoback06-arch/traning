import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'

export interface FeedbackSuggestion {
  id: string
  user_id: string
  message: string
  handled: boolean
  created_at: string
}

export function useAllFeedbackSuggestions() {
  return useQuery({
    queryKey: queryKeys.allFeedbackSuggestions,
    queryFn: async (): Promise<FeedbackSuggestion[]> => {
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .select('id, user_id, message, handled, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}
