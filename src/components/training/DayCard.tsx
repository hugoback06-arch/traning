import { format, isToday } from 'date-fns'
import { sv } from 'date-fns/locale'
import { ActivityIcon } from './ActivityIcon'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import type { PlanActivityType, TrainingPlanSession, Workout } from '../../types/domain'

interface DayCardProps {
  date: Date
  session: TrainingPlanSession | null
  workouts: Workout[]
  onClick: () => void
}

export function DayCard({ date, session, workouts, onClick }: DayCardProps) {
  const primaryWorkout = workouts.find((w) => w.training_plan_session_id === session?.id) ?? workouts[0] ?? null
  const activityType: PlanActivityType = session?.activity_type ?? primaryWorkout?.activity_type ?? 'rest'
  const isDone = !!primaryWorkout
  const today = isToday(date)

  return (
    <button
      onClick={onClick}
      className={`press flex w-full min-w-0 flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5 text-center ${
        today ? 'border-accent' : 'border-border'
      } ${isDone ? 'bg-surface-muted' : 'bg-surface'}`}
    >
      <span className="text-[11px] font-medium text-ink-secondary">{format(date, 'EEE', { locale: sv })}</span>
      <span className="text-xs text-ink-secondary">{format(date, 'd/M')}</span>
      <ActivityIcon type={activityType} size="sm" />
      <span className="line-clamp-1 w-full truncate text-[11px] leading-tight text-ink-primary">
        {isDone ? '✓ ' : ''}
        {ACTIVITY_LABELS[activityType]}
      </span>
    </button>
  )
}
