import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { TrainingPlan } from '../types/domain'

export function useActiveTrainingPlan() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.activeTrainingPlan(userId),
    queryFn: async (): Promise<TrainingPlan | null> => {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', userId as string)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
