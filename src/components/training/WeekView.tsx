import { useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import { Card } from '../common/Card'
import { DayCard } from './DayCard'
import { IntensityControl } from './IntensityControl'
import { useTrainingPlanSessionsInRange } from '../../hooks/useTrainingPlanSessionsInRange'
import { useWorkoutsInRange } from '../../hooks/useWorkoutsInRange'
import { useActiveTrainingPlan } from '../../hooks/useActiveTrainingPlan'
import { nextWeek, prevWeek, weekDays, weekRangeLabel } from '../../lib/weekGrid'
import { weekComplianceLabel, weekSummaryLabel } from '../../lib/workoutTotals'
import type { DetailTarget } from './WorkoutDetailSheet'

interface WeekViewProps {
  onSelectDay: (target: DetailTarget) => void
}

export function WeekView({ onSelectDay }: WeekViewProps) {
  const [referenceDate, setReferenceDate] = useState(() => new Date())

  const days = useMemo(() => weekDays(referenceDate), [referenceDate])
  const startDateKey = format(days[0], 'yyyy-MM-dd')
  const endDateKey = format(days[6], 'yyyy-MM-dd')
  const startIso = days[0].toISOString()
  const endIsoExclusive = addDays(days[6], 1).toISOString()

  const { data: sessions } = useTrainingPlanSessionsInRange(startDateKey, endDateKey)
  const { data: workouts } = useWorkoutsInRange(startIso, endIsoExclusive)
  const { data: activePlan } = useActiveTrainingPlan()

  const complianceLabel = weekComplianceLabel(sessions ?? [])

  const sessionsByDate = new Map((sessions ?? []).map((s) => [s.scheduled_date, s]))
  const workoutsByDate = new Map<string, typeof workouts>()
  for (const workout of workouts ?? []) {
    const key = format(new Date(workout.started_at), 'yyyy-MM-dd')
    workoutsByDate.set(key, [...(workoutsByDate.get(key) ?? []), workout])
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setReferenceDate((d) => prevWeek(d))}
          className="press rounded-lg px-2 py-1 text-sm text-ink-secondary"
          aria-label="Föregående vecka"
        >
          ←
        </button>
        <span className="text-sm font-medium text-ink-primary">{weekRangeLabel(referenceDate)}</span>
        <button
          onClick={() => setReferenceDate((d) => nextWeek(d))}
          className="press rounded-lg px-2 py-1 text-sm text-ink-secondary"
          aria-label="Nästa vecka"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const session = sessionsByDate.get(dateKey) ?? null
          const dayWorkouts = workoutsByDate.get(dateKey) ?? []
          return (
            <DayCard
              key={dateKey}
              date={day}
              session={session}
              workouts={dayWorkouts}
              onClick={() => {
                const matchedWorkout = dayWorkouts.find((w) => w.training_plan_session_id === session?.id) ?? dayWorkouts[0]
                if (matchedWorkout) onSelectDay({ type: 'workout', workoutId: matchedWorkout.id })
                else if (session) onSelectDay({ type: 'session', session })
              }}
            />
          )
        })}
      </div>

      <p className="text-xs text-ink-secondary">
        {complianceLabel ? `${complianceLabel} · ` : ''}
        {weekSummaryLabel(workouts ?? [])}
      </p>

      {activePlan && <IntensityControl trainingPlanId={activePlan.id} current={activePlan.intensity_preference} />}
    </Card>
  )
}
