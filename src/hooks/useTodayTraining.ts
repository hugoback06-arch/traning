import { format } from 'date-fns'
import { useTrainingPlanSessionsInRange } from './useTrainingPlanSessionsInRange'
import { useWorkoutsInRange } from './useWorkoutsInRange'
import { dayRangeIso } from '../lib/dateRange'

export function useTodayTraining() {
  const today = new Date()
  const todayKey = format(today, 'yyyy-MM-dd')
  const { startIso, endIsoExclusive } = dayRangeIso(today)

  const { data: sessions, isLoading: sessionsLoading } = useTrainingPlanSessionsInRange(todayKey, todayKey)
  const { data: workouts, isLoading: workoutsLoading } = useWorkoutsInRange(startIso, endIsoExclusive)

  const session = sessions?.[0] ?? null
  const allWorkouts = workouts ?? []
  const matchedWorkout =
    allWorkouts.find((w) => w.training_plan_session_id === session?.id) ?? (session ? undefined : allWorkouts[0])
  const secondaryWorkouts = allWorkouts.filter((w) => w.id !== matchedWorkout?.id)

  const isRestDay = session?.activity_type === 'rest'
  const isDone = !!matchedWorkout

  return {
    session,
    matchedWorkout,
    secondaryWorkouts,
    isRestDay,
    isDone,
    isLoading: sessionsLoading || workoutsLoading,
  }
}
