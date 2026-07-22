import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { ActivityType } from '../types/domain'

export interface CreateManualWorkoutInput {
  sessionId: string
  activityType: ActivityType
  title: string
  scheduledDate: string
}

// For when a session can't be synced from Strava (e.g. a gym session Strava
// doesn't track) — creates a bare `source: 'manual'` workout and links it back
// to the session, same as upsertWorkoutFromStravaActivity does for Strava rows.
export function useCreateManualWorkout() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sessionId, activityType, title, scheduledDate }: CreateManualWorkoutInput) => {
      if (!userId) throw new Error('Inte inloggad')

      const { data: workout, error } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          source: 'manual',
          activity_type: activityType,
          title,
          started_at: new Date(scheduledDate).toISOString(),
          training_plan_session_id: sessionId,
        })
        .select()
        .single()
      if (error) throw error

      const { error: sessionError } = await supabase
        .from('training_plan_sessions')
        .update({ completed_workout_id: workout.id })
        .eq('id', sessionId)
      if (sessionError) throw sessionError

      return workout
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutsPrefix })
      queryClient.invalidateQueries({ queryKey: queryKeys.planSessionsPrefix })
    },
  })
}
