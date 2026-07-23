import { Link } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Spinner } from '../../components/common/Spinner'
import { ActivityIcon } from '../../components/training/ActivityIcon'
import { useWorkoutHistory, type WorkoutHistoryItem } from '../../hooks/useWorkoutHistory'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDistance } from '../../lib/formatWorkout'

function keyFigure(workout: WorkoutHistoryItem): string {
  if (workout.activity_type === 'strength') return 'Styrkepass'
  return formatDistance(workout.distance_meters) ?? ACTIVITY_LABELS[workout.activity_type]
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function groupByMonth(workouts: WorkoutHistoryItem[]): [string, WorkoutHistoryItem[]][] {
  const groups = new Map<string, WorkoutHistoryItem[]>()
  for (const workout of workouts) {
    const key = format(new Date(workout.started_at), 'yyyy-MM')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(workout)
  }
  return Array.from(groups.entries())
}

export function History() {
  const { data: workouts, isLoading } = useWorkoutHistory()
  const groups = workouts ? groupByMonth(workouts) : []

  return (
    <div className="space-y-4">
      <Link to="/training" className="text-sm text-ink-secondary">
        ← Träning
      </Link>
      <h1 className="font-display text-lg font-semibold">📜 Historik</h1>

      {isLoading ? (
        <Spinner />
      ) : !workouts || workouts.length === 0 ? (
        <p className="text-sm text-ink-secondary">Inga träningspass ännu.</p>
      ) : (
        <div className="space-y-5">
          {groups.map(([monthKey, monthWorkouts]) => (
            <div key={monthKey} className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-ink-secondary uppercase">
                {capitalize(format(new Date(monthWorkouts[0].started_at), 'MMMM yyyy', { locale: sv }))}
              </p>
              <div className="space-y-2">
                {monthWorkouts.map((workout) => {
                  const latestEvaluation = workout.workout_evaluations[0]
                  return (
                    <Link
                      key={workout.id}
                      to={`/training/workout/${workout.id}`}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
                    >
                      <ActivityIcon type={workout.activity_type} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-primary">
                          {workout.title ?? ACTIVITY_LABELS[workout.activity_type]}
                        </p>
                        <p className="text-xs text-ink-secondary">
                          {format(new Date(workout.started_at), 'd MMM', { locale: sv })} · {keyFigure(workout)}
                        </p>
                      </div>
                      {latestEvaluation && (
                        <span className="shrink-0 rounded-full bg-accent-light px-2 py-0.5 text-xs text-accent">
                          {latestEvaluation.summary}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
