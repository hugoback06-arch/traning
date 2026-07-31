import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type FitnessConnectionStatus = Pick<
  import('../types/domain').FitnessConnection,
  'id' | 'provider' | 'connected_at' | 'last_synced_at'
>

export function useFitnessConnection(provider: 'strava' | 'garmin') {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: ['fitness-connection', provider, userId] as const,
    queryFn: async (): Promise<FitnessConnectionStatus | null> => {
      // Tokens live in a separate server-only table, so this public row is
      // safe to read from the browser.
      const { data, error } = await supabase
        .from('fitness_connections')
        .select('id, provider, connected_at, last_synced_at')
        .eq('user_id', userId as string)
        .eq('provider', provider)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
