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
  const plannedType: PlanActivityType | null = session?.activity_type ?? null
  const actualType: PlanActivityType | null = primaryWorkout?.activity_type ?? null
  const isDone = !!primaryWorkout
  // A Strava activity can auto-link to a same-day session of a different type
  // (e.g. a bike ride linked to a planned run) — surface that mismatch here
  // instead of silently showing the planned type with a checkmark.
  const differs = isDone && plannedType !== null && actualType !== null && plannedType !== actualType
  const displayType: PlanActivityType = actualType ?? plannedType ?? 'rest'
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
      {differs ? (
        <div className="flex shrink-0 items-center gap-1">
          <ActivityIcon type={plannedType} size="sm" />
          <span className="text-xs text-ink-secondary">→</span>
          <ActivityIcon type={actualType} />
        </div>
      ) : (
        <ActivityIcon type={displayType} />
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-primary">
        {differs ? `${ACTIVITY_LABELS[actualType]} (planerat: ${ACTIVITY_LABELS[plannedType]})` : ACTIVITY_LABELS[displayType]}
      </span>
      {isDone && <span className="shrink-0 text-lg text-accent">✓</span>}
    </button>
  )
}
