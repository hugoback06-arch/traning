import { useState } from 'react'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../../components/common/Card'
import { ActivityIcon } from '../../components/training/ActivityIcon'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'
import { useTrainingForDate } from '../../hooks/useTrainingForDate'
import { useFitnessConnection } from '../../hooks/useFitnessConnection'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDistance, formatDuration } from '../../lib/formatWorkout'

export function Today() {
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)
  const { session, matchedWorkout, secondaryWorkouts, isRestDay, isDone } = useTrainingForDate()
  const { data: stravaConnection } = useFitnessConnection('strava')

  const onOpenMainCard = matchedWorkout
    ? () => setDetailTarget({ type: 'workout', workoutId: matchedWorkout.id })
    : session && !isRestDay
      ? () => setDetailTarget({ type: 'session', session })
      : null

  const mainCard = (
    <Card className={isDone ? 'bg-surface-muted' : ''}>
      {session && !isRestDay ? (
        <div className="flex items-center gap-3">
          <ActivityIcon type={session.activity_type} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-ink-primary">
              {isDone && '✓ '}
              {session.title}
            </p>
            {isDone && matchedWorkout ? (
              <p className="text-xs text-ink-secondary">
                {[formatDistance(matchedWorkout.distance_meters), formatDuration(matchedWorkout.duration_seconds)]
                  .filter(Boolean)
                  .join(' · ') || 'Genomfört'}
              </p>
            ) : (
              session.description && <p className="text-xs text-ink-secondary">{session.description}</p>
            )}
          </div>
        </div>
      ) : matchedWorkout ? (
        <div className="flex items-center gap-3">
          <ActivityIcon type={matchedWorkout.activity_type} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-ink-primary">
              ✓ {matchedWorkout.title ?? ACTIVITY_LABELS[matchedWorkout.activity_type]}
            </p>
            <p className="text-xs text-ink-secondary">
              {[formatDistance(matchedWorkout.distance_meters), formatDuration(matchedWorkout.duration_seconds)]
                .filter(Boolean)
                .join(' · ') || 'Genomfört'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-2">
          <ActivityIcon type="rest" />
          <p className="text-sm font-medium text-ink-primary">{isRestDay ? 'Vilodag' : 'Inget planerat idag'}</p>
        </div>
      )}
    </Card>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Idag</h1>

      {onOpenMainCard ? (
        <button onClick={onOpenMainCard} className="block w-full text-left">
          {mainCard}
        </button>
      ) : (
        mainCard
      )}

      {secondaryWorkouts.map((workout) => (
        <button
          key={workout.id}
          onClick={() => setDetailTarget({ type: 'workout', workoutId: workout.id })}
          className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
        >
          <ActivityIcon type={workout.activity_type} size="sm" />
          <span className="text-sm text-ink-primary">
            Extra: {workout.title ?? ACTIVITY_LABELS[workout.activity_type]}
            {formatDuration(workout.duration_seconds) ? `, ${formatDuration(workout.duration_seconds)}` : ''}
          </span>
        </button>
      ))}

      <p className="text-center text-xs text-ink-secondary">
        {stravaConnection?.last_synced_at
          ? `Senaste synk från Strava: ${format(new Date(stravaConnection.last_synced_at), 'HH:mm', { locale: sv })}`
          : 'Ingen Strava-anslutning ännu'}
      </p>

      {detailTarget && <WorkoutDetailSheet target={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}
