import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import type { ActivityType } from '../types/domain'

export interface UpdateWorkoutInput {
  id: string
  title?: string | null
  activity_type?: ActivityType
  started_at?: string
  duration_seconds?: number | null
  distance_meters?: number | null
  calories_burned?: number | null
  avg_heart_rate?: number | null
  elevation_gain_meters?: number | null
  perceived_exertion?: number | null
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...changes }: UpdateWorkoutInput) => {
      const { error } = await supabase.from('workouts').update(changes).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutsPrefix })
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutDetail(variables.id) })
    },
  })
}
