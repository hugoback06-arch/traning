import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import type { WorkoutEvaluation } from '../types/domain'

interface EvaluateWorkoutErrorBody {
  error: string
  code?: string
}

export function useEvaluateWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workoutId: string): Promise<WorkoutEvaluation> => {
      const { data, error } = await supabase.functions.invoke<WorkoutEvaluation | EvaluateWorkoutErrorBody>(
        'evaluate-workout',
        { body: { workout_id: workoutId } },
      )

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte utvärdera passet')
      return data
    },
    onSuccess: (_data, workoutId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutDetail(workoutId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutsPrefix })
    },
  })
}
