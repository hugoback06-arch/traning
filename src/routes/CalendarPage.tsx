import { useMemo, useState } from 'react'
import { addDays, format, startOfMonth } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '../components/common/Card'
import { BackButton } from '../components/common/BackButton'
import { MonthCalendar } from '../components/calendar/MonthCalendar'
import { MealList } from '../components/meals/MealList'
import { Spinner } from '../components/common/Spinner'
import { useMealLogDatesInRange } from '../hooks/useMealLogDatesInRange'
import { useMealLogsForDate } from '../hooks/useMealLogsForDate'
import { sumMealTotals } from '../lib/dailyTotals'
import { monthGridDays, nextMonth, prevMonth } from '../lib/monthGrid'

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function CalendarPage() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  const gridDays = useMemo(() => monthGridDays(visibleMonth), [visibleMonth])
  const rangeStartIso = gridDays[0].toISOString()
  const rangeEndIsoExclusive = addDays(gridDays[gridDays.length - 1], 1).toISOString()

  const { data: loggedDates } = useMealLogDatesInRange(rangeStartIso, rangeEndIsoExclusive)
  const { data: dayLogs, isLoading: dayLoading } = useMealLogsForDate(selectedDate)

  const totals = sumMealTotals(dayLogs ?? [])

  return (
    <div className="space-y-4">
      <div>
        <BackButton to="/nutrition" label="Kost" />
        <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Calendar size={20} /> Kalender
        </h1>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setVisibleMonth((m) => prevMonth(m))}
            className="rounded-lg px-2 py-1 text-sm text-ink-secondary"
            aria-label="Föregående månad"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-ink-primary">
            {capitalize(format(visibleMonth, 'MMMM yyyy', { locale: sv }))}
          </span>
          <button
            onClick={() => setVisibleMonth((m) => nextMonth(m))}
            className="rounded-lg px-2 py-1 text-sm text-ink-secondary"
            aria-label="Nästa månad"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <MonthCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          loggedDates={loggedDates ?? []}
          onSelectDate={setSelectedDate}
        />
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-primary">
            {capitalize(format(selectedDate, 'EEEE d MMMM', { locale: sv }))}
          </h2>
          <span className="text-xs text-ink-secondary">{Math.round(totals.kcal)} kcal</span>
        </div>
        {dayLoading ? <Spinner /> : <MealList logs={dayLogs ?? []} />}
      </div>
    </div>
  )
}
