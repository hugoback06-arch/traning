import { Check } from 'lucide-react'
import { Card } from '../common/Card'
import { ActivityIcon } from './ActivityIcon'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDistance, formatDuration } from '../../lib/formatWorkout'
import type { Workout } from '../../types/domain'

interface WorkoutSummaryCardProps {
  workout: Workout
  onClick?: () => void
}

// Shared rendering for "a completed workout" — used both for today's
// primary pass (TrainingStatusCard) and any extra/unplanned pass on the
// training screen, so they look like the same kind of thing, not a special
// "Extra:" list item styled differently from a normal pass.
export function WorkoutSummaryCard({ workout, onClick }: WorkoutSummaryCardProps) {
  const card = (
    <Card className="bg-surface-muted">
      <div className="flex items-center gap-3">
        <ActivityIcon type={workout.activity_type} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-base font-semibold text-ink-primary">
            <Check size={16} className="shrink-0 text-accent" />
            <span className="truncate">{workout.title ?? ACTIVITY_LABELS[workout.activity_type]}</span>
          </p>
          <p className="text-xs text-ink-secondary">
            {[formatDistance(workout.distance_meters), formatDuration(workout.duration_seconds)]
              .filter(Boolean)
              .join(' · ') || 'Genomfört'}
          </p>
        </div>
      </div>
    </Card>
  )

  if (!onClick) return card

  return (
    <button onClick={onClick} className="press block w-full text-left">
      {card}
    </button>
  )
}
