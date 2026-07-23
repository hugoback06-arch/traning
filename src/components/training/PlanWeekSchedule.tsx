import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, differenceInCalendarDays, format, isToday, parseISO } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../common/Card'
import { ActivityIcon } from './ActivityIcon'
import { useActiveTrainingPlan } from '../../hooks/useActiveTrainingPlan'
import { useTrainingPlanSessionsInRange } from '../../hooks/useTrainingPlanSessionsInRange'
import type { DetailTarget } from './WorkoutDetailSheet'

interface PlanWeekScheduleProps {
  onSelect: (target: DetailTarget) => void
}

export function PlanWeekSchedule({ onSelect }: PlanWeekScheduleProps) {
  const { data: plan, isLoading: planLoading } = useActiveTrainingPlan()
  const startDate = plan?.start_date
  const endDate = plan?.end_date ?? plan?.start_date
  const { data: sessions } = useTrainingPlanSessionsInRange(startDate ?? '', endDate ?? '')
  const [manualWeekIndex, setManualWeekIndex] = useState<number | null>(null)

  if (planLoading) return null
  if (!plan || !startDate) {
    return <p className="text-center text-sm text-ink-secondary">Inget aktivt schema ännu — generera ett ovan.</p>
  }

  const totalWeeks = Math.max(
    1,
    Math.ceil((differenceInCalendarDays(parseISO(endDate as string), parseISO(startDate)) + 1) / 7),
  )
  const defaultWeekIndex = Math.min(
    Math.max(0, Math.floor(differenceInCalendarDays(new Date(), parseISO(startDate)) / 7)),
    totalWeeks - 1,
  )
  const weekIndex = manualWeekIndex ?? defaultWeekIndex

  const sessionsByDate = new Map((sessions ?? []).map((s) => [s.scheduled_date, s]))
  const weekStart = addDays(parseISO(startDate), weekIndex * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          className="press rounded-lg px-2 py-1 text-sm text-ink-secondary disabled:opacity-30"
          onClick={() => setManualWeekIndex(Math.max(0, weekIndex - 1))}
          disabled={weekIndex === 0}
          aria-label="Föregående vecka"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-ink-primary">
            Vecka {weekIndex + 1} av {totalWeeks}
          </p>
          <p className="text-xs text-ink-secondary">{plan.name}</p>
        </div>
        <button
          className="press rounded-lg px-2 py-1 text-sm text-ink-secondary disabled:opacity-30"
          onClick={() => setManualWeekIndex(Math.min(totalWeeks - 1, weekIndex + 1))}
          disabled={weekIndex >= totalWeeks - 1}
          aria-label="Nästa vecka"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="space-y-1.5">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const session = sessionsByDate.get(dateKey)
          const today = isToday(day)

          return (
            <button
              key={dateKey}
              disabled={!session}
              onClick={() =>
                session &&
                onSelect(
                  session.completed_workout_id
                    ? { type: 'workout', workoutId: session.completed_workout_id }
                    : { type: 'session', session },
                )
              }
              className={`press flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left disabled:opacity-50 ${
                today ? 'border-accent' : 'border-border'
              } ${session?.completed_workout_id ? 'bg-surface-muted' : 'bg-surface'}`}
            >
              <div className="w-9 shrink-0 text-center">
                <p className="text-[11px] font-medium text-ink-secondary">{format(day, 'EEE', { locale: sv })}</p>
                <p className="text-xs text-ink-secondary">{format(day, 'd/M')}</p>
              </div>
              <ActivityIcon type={session?.activity_type ?? 'rest'} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-medium text-ink-primary">
                  {session?.completed_workout_id && <Check size={13} className="shrink-0 text-accent" />}
                  <span className="truncate">{session?.title ?? '—'}</span>
                </p>
                {session?.description && <p className="truncate text-xs text-ink-secondary">{session.description}</p>}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
