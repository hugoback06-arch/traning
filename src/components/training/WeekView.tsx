import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { Card } from '../common/Card'
import { DayCard } from './DayCard'
import { WeekProgressRing } from './WeekProgressRing'
import { useTrainingPlanSessionsInRange } from '../../hooks/useTrainingPlanSessionsInRange'
import { useWorkoutsInRange } from '../../hooks/useWorkoutsInRange'
import { nextWeek, prevWeek, weekDays, weekRangeLabel } from '../../lib/weekGrid'
import { weekComplianceStats, weekSummaryLabel } from '../../lib/workoutTotals'
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

  const complianceStats = weekComplianceStats(sessions ?? [])

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
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-ink-primary">{weekRangeLabel(referenceDate)}</span>
        <button
          onClick={() => setReferenceDate((d) => nextWeek(d))}
          className="press rounded-lg px-2 py-1 text-sm text-ink-secondary"
          aria-label="Nästa vecka"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {complianceStats && (
        <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
          <WeekProgressRing completed={complianceStats.completed} total={complianceStats.total} />
          <p className="text-sm text-ink-primary">
            <span className="font-medium">
              {complianceStats.completed}/{complianceStats.total} pass genomförda
            </span>{' '}
            denna vecka
          </p>
        </div>
      )}

      <div className="space-y-2">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const session = sessionsByDate.get(dateKey) ?? null
          const dayWorkouts = workoutsByDate.get(dateKey) ?? []
          // Only count a linked workout as "the session's pass" when the type
          // matches — a mismatched Strava sync (e.g. a bike ride auto-linked to
          // a planned run) should always render as two separate rows: the plan
          // stays unfulfilled, and the actual activity shows on its own.
          const primaryWorkout =
            dayWorkouts.find((w) => w.training_plan_session_id === session?.id && w.activity_type === session?.activity_type) ??
            (session ? null : (dayWorkouts[0] ?? null))
          const extraWorkouts = dayWorkouts.filter((w) => w.id !== primaryWorkout?.id)
          return (
            <div key={dateKey} className="space-y-2">
              <DayCard
                date={day}
                session={session}
                workouts={primaryWorkout ? [primaryWorkout] : []}
                onClick={() => {
                  if (primaryWorkout) onSelectDay({ type: 'workout', workoutId: primaryWorkout.id })
                  else if (session) onSelectDay({ type: 'session', session })
                }}
              />
              {extraWorkouts.map((workout) => (
                <DayCard
                  key={workout.id}
                  date={day}
                  session={null}
                  workouts={[workout]}
                  onClick={() => onSelectDay({ type: 'workout', workoutId: workout.id })}
                />
              ))}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-ink-secondary">{weekSummaryLabel(workouts ?? [])}</p>
    </Card>
  )
}
