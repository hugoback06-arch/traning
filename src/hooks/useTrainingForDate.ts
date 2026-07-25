import { format } from 'date-fns'
import { useTrainingPlanSessionsInRange } from './useTrainingPlanSessionsInRange'
import { useWorkoutsInRange } from './useWorkoutsInRange'
import { dayRangeIso } from '../lib/dateRange'

export function useTrainingForDate(date: Date = new Date()) {
  const dateKey = format(date, 'yyyy-MM-dd')
  const { startIso, endIsoExclusive } = dayRangeIso(date)

  const { data: sessions, isLoading: sessionsLoading } = useTrainingPlanSessionsInRange(dateKey, dateKey)
  const { data: workouts, isLoading: workoutsLoading } = useWorkoutsInRange(startIso, endIsoExclusive)

  const session = sessions?.[0] ?? null
  const allWorkouts = workouts ?? []
  // A Strava activity can auto-link to a same-day session of a different type
  // (e.g. a bike ride linked to a planned run). Only treat it as "the
  // session's workout" when the type actually matches — otherwise the plan
  // stays unfulfilled and the actual workout shows as its own separate item
  // via secondaryWorkouts, instead of silently replacing the planned pass.
  const matchedWorkout =
    allWorkouts.find((w) => w.training_plan_session_id === session?.id && w.activity_type === session?.activity_type) ??
    (session ? undefined : allWorkouts[0])
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
