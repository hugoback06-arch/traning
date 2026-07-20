import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { Workout } from '../types/domain'

export function useWorkoutsInRange(startIso: string, endIsoExclusive: string) {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.workoutsInRange(userId, startIso, endIsoExclusive),
    queryFn: async (): Promise<Workout[]> => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId as string)
        .gte('started_at', startIso)
        .lt('started_at', endIsoExclusive)
        .order('started_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
