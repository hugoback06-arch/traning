import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { Workout, WorkoutEvaluation } from '../types/domain'

export interface WorkoutHistoryItem extends Workout {
  workout_evaluations: WorkoutEvaluation[]
}

export function useWorkoutHistory() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.workoutHistory(userId),
    queryFn: async (): Promise<WorkoutHistoryItem[]> => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_evaluations(*)')
        .eq('user_id', userId as string)
        .order('started_at', { ascending: false })

      if (error) throw error
      return data as unknown as WorkoutHistoryItem[]
    },
    enabled: !!userId,
  })
}
