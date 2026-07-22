import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import type { WorkoutDetail } from '../types/domain'

export function useWorkoutDetail(workoutId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workoutDetail(workoutId),
    queryFn: async (): Promise<WorkoutDetail> => {
      const id = workoutId as string

      const [workoutRes, setsRes, evaluationRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('id', id).single(),
        supabase
          .from('workout_sets')
          .select('*, exercise:exercises(*)')
          .eq('workout_id', id)
          .order('set_number', { ascending: true }),
        supabase
          .from('workout_evaluations')
          .select('*')
          .eq('workout_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (workoutRes.error) throw workoutRes.error
      if (setsRes.error) throw setsRes.error
      if (evaluationRes.error) throw evaluationRes.error

      const workout = workoutRes.data
      let session = null
      if (workout.training_plan_session_id) {
        const sessionRes = await supabase
          .from('training_plan_sessions')
          .select('*')
          .eq('id', workout.training_plan_session_id)
          .maybeSingle()
        if (sessionRes.error) throw sessionRes.error
        session = sessionRes.data
      }

      return {
        ...workout,
        sets: setsRes.data as unknown as WorkoutDetail['sets'],
        evaluation: evaluationRes.data,
        session,
      }
    },
    enabled: !!workoutId,
  })
}
