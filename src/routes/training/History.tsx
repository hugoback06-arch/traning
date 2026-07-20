import { useState } from 'react'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Spinner } from '../../components/common/Spinner'
import { ActivityIcon } from '../../components/training/ActivityIcon'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'
import { useWorkoutHistory, type WorkoutHistoryItem } from '../../hooks/useWorkoutHistory'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDistance } from '../../lib/formatWorkout'

function keyFigure(workout: WorkoutHistoryItem): string {
  if (workout.activity_type === 'strength') return 'Styrkepass'
  return formatDistance(workout.distance_meters) ?? ACTIVITY_LABELS[workout.activity_type]
}

export function History() {
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)
  const { data: workouts, isLoading } = useWorkoutHistory()

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Historik</h1>

      {isLoading ? (
        <Spinner />
      ) : !workouts || workouts.length === 0 ? (
        <p className="text-sm text-ink-secondary">Inga träningspass ännu.</p>
      ) : (
        <div className="space-y-2">
          {workouts.map((workout) => {
            const latestEvaluation = workout.workout_evaluations[0]
            return (
              <button
                key={workout.id}
                onClick={() => setDetailTarget({ type: 'workout', workoutId: workout.id })}
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
              </button>
            )
          })}
        </div>
      )}

      {detailTarget && <WorkoutDetailSheet target={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}
