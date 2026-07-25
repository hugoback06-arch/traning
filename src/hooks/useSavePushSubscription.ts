import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSavePushSubscription() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      const json = subscription.toJSON()
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId as string,
          endpoint: json.endpoint as string,
          p256dh: json.keys?.p256dh as string,
          auth: json.keys?.auth as string,
        },
        { onConflict: 'endpoint' },
      )
      if (error) throw error
    },
  })
}
