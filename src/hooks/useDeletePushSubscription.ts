import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDeletePushSubscription() {
  return useMutation({
    mutationFn: async (endpoint: string) => {
      const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
      if (error) throw error
    },
  })
}
