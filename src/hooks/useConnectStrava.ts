import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface ConnectStravaErrorBody {
  error: string
  code?: string
}

export function useConnectStrava() {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { data, error } = await supabase.functions.invoke<{ authorize_url: string } | ConnectStravaErrorBody>(
        'strava-oauth-start',
        { body: { return_origin: window.location.origin } },
      )

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte starta Strava-anslutning')
      window.location.href = data.authorize_url
    },
  })
}
