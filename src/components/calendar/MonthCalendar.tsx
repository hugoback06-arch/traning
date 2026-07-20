import { format, isSameDay, isSameMonth, isToday } from 'date-fns'
import { monthGridDays, WEEKDAY_LABELS } from '../../lib/monthGrid'
import { ACTIVITY_BG_CLASS } from '../../lib/activityTypes'
import type { PlanActivityType } from '../../types/domain'

interface MonthCalendarProps {
  visibleMonth: Date
  selectedDate: Date
  loggedDates: Date[]
  trainingByDate?: Map<string, PlanActivityType>
  onSelectDate: (date: Date) => void
}

export function MonthCalendar({
  visibleMonth,
  selectedDate,
  loggedDates,
  trainingByDate,
  onSelectDate,
}: MonthCalendarProps) {
  const days = monthGridDays(visibleMonth)
  const loggedDayKeys = new Set(loggedDates.map((d) => format(d, 'yyyy-MM-dd')))

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-secondary">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, visibleMonth)
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day)
          const hasLog = loggedDayKeys.has(dayKey)
          const trainingType = trainingByDate?.get(dayKey)

          return (
            <button
              key={dayKey}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-sm ${
                selected
                  ? 'bg-accent text-accent-foreground'
                  : today
                    ? 'border border-accent text-ink-primary'
                    : inMonth
                      ? 'text-ink-primary'
                      : 'text-ink-secondary opacity-40'
              }`}
            >
              <span>{format(day, 'd')}</span>
              <span className="flex h-1 items-center gap-0.5">
                <span
                  className={`h-1 w-1 rounded-full ${
                    hasLog ? (selected ? 'bg-accent-foreground' : 'bg-accent') : 'bg-transparent'
                  }`}
                />
                <span
                  className={`h-1 w-1 rounded-full ${
                    trainingType ? (selected ? 'bg-accent-foreground' : ACTIVITY_BG_CLASS[trainingType]) : 'bg-transparent'
                  }`}
                />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
