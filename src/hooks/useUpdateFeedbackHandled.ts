import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'

interface UpdateFeedbackHandledInput {
  id: string
  handled: boolean
}

export function useUpdateFeedbackHandled() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, handled }: UpdateFeedbackHandledInput) => {
      const { error } = await supabase.from('feedback_suggestions').update({ handled }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allFeedbackSuggestions })
    },
  })
}
