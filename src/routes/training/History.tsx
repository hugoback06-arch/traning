import { useState } from 'react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { History as HistoryIcon } from 'lucide-react'
import { Spinner } from '../../components/common/Spinner'
import { BackButton } from '../../components/common/BackButton'
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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const selectedGroup = groups.find(([monthKey]) => monthKey === selectedMonth)

  return (
    <div className="space-y-4">
      {selectedGroup ? (
        <BackButton onClick={() => setSelectedMonth(null)} label="Historik" />
      ) : (
        <BackButton to="/training" label="Träning" />
      )}
      <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
        <HistoryIcon size={19} />
        {selectedGroup
          ? capitalize(format(new Date(selectedGroup[1][0].started_at), 'MMMM yyyy', { locale: sv }))
          : 'Historik'}
      </h1>

      {isLoading ? (
        <Spinner />
      ) : !workouts || workouts.length === 0 ? (
        <p className="text-sm text-ink-secondary">Inga träningspass ännu.</p>
      ) : selectedGroup ? (
        <div className="space-y-2">
          {selectedGroup[1].map((workout) => {
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
      ) : (
        <div className="space-y-2">
          {groups.map(([monthKey, monthWorkouts]) => (
            <button
              key={monthKey}
              onClick={() => setSelectedMonth(monthKey)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-3 text-left"
            >
              <span className="text-sm font-medium text-ink-primary">
                {capitalize(format(new Date(monthWorkouts[0].started_at), 'MMMM yyyy', { locale: sv }))}
              </span>
              <span className="text-xs text-ink-secondary">{monthWorkouts.length} pass</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
