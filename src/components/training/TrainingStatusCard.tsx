import { Card } from '../common/Card'
import { ActivityIcon } from './ActivityIcon'
import { useTrainingForDate } from '../../hooks/useTrainingForDate'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDistance, formatDuration } from '../../lib/formatWorkout'
import type { DetailTarget } from './WorkoutDetailSheet'

interface TrainingStatusCardProps {
  onSelect?: (target: DetailTarget) => void
}

export function TrainingStatusCard({ onSelect }: TrainingStatusCardProps) {
  const { session, matchedWorkout, isRestDay, isDone } = useTrainingForDate()

  const onOpenCard = !onSelect
    ? undefined
    : matchedWorkout
      ? () => onSelect({ type: 'workout', workoutId: matchedWorkout.id })
      : session && !isRestDay
        ? () => onSelect({ type: 'session', session })
        : undefined

  const card = (
    <Card className={isDone ? 'bg-surface-muted' : ''}>
      {session && !isRestDay ? (
        <div className="flex items-center gap-3">
          <ActivityIcon type={session.activity_type} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-ink-primary">
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
            <p className="font-display text-base font-semibold text-ink-primary">
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

  if (!onOpenCard) return card

  return (
    <button onClick={onOpenCard} className="block w-full text-left">
      {card}
    </button>
  )
}
