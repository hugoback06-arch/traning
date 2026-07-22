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
      className={`press flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${
        today ? 'border-accent' : 'border-border'
      } ${isDone ? 'bg-surface-muted' : 'bg-surface'}`}
    >
      <div className="flex w-11 shrink-0 flex-col items-center">
        <span className="text-[11px] font-medium text-ink-secondary">{format(date, 'EEE', { locale: sv })}</span>
        <span className="text-xs text-ink-secondary">{format(date, 'd/M')}</span>
      </div>
      <ActivityIcon type={activityType} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-primary">
        {ACTIVITY_LABELS[activityType]}
      </span>
      {isDone && <span className="shrink-0 text-lg text-accent">✓</span>}
    </button>
  )
}
