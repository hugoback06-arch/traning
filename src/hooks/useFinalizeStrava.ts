import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface FinalizeStravaErrorBody {
  error: string
  code?: string
}

export function useFinalizeStrava() {
  return useMutation({
    mutationFn: async (state: string): Promise<void> => {
      const { data, error } = await supabase.functions.invoke<{ connected: true } | FinalizeStravaErrorBody>(
        'strava-oauth-finalize',
        { body: { state } },
      )

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte slutföra Strava-anslutningen')
    },
  })
}
