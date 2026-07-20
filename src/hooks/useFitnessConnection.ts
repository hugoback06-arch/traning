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
      // Only ever select non-secret columns from the client — access_token /
      // refresh_token must stay server-side (Edge Functions), even though RLS
      // technically permits the owning user to read their own row.
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
