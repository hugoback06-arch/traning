import { format, isToday } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Check } from 'lucide-react'
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
  // Callers (WeekView) only pass a workout here when it's confirmed to match
  // the session's activity_type (or there's no session at all) — a mismatched
  // Strava sync always renders as its own separate DayCard instead, so there's
  // no mixed planned/actual state to reconcile here.
  const primaryWorkout = workouts[0] ?? null
  const plannedType: PlanActivityType | null = session?.activity_type ?? null
  const actualType: PlanActivityType | null = primaryWorkout?.activity_type ?? null
  const isDone = !!primaryWorkout
  const displayType: PlanActivityType = actualType ?? plannedType ?? 'rest'
  const label = session?.title ?? primaryWorkout?.title ?? ACTIVITY_LABELS[displayType]
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
      <ActivityIcon type={displayType} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-primary">{label}</span>
      {isDone && <Check size={18} className="shrink-0 text-accent" />}
    </button>
  )
}
