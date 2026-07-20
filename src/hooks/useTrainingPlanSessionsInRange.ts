import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { TrainingPlanSession } from '../types/domain'

export function useTrainingPlanSessionsInRange(startDate: string, endDate: string) {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.planSessionsInRange(userId, startDate, endDate),
    queryFn: async (): Promise<TrainingPlanSession[]> => {
      const { data, error } = await supabase
        .from('training_plan_sessions')
        .select('*, training_plans!inner(user_id, status)')
        .eq('training_plans.user_id', userId as string)
        .eq('training_plans.status', 'active')
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      return data as unknown as TrainingPlanSession[]
    },
    enabled: !!userId,
  })
}
