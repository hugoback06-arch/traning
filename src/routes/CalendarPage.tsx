import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { addDays, format, startOfMonth } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../components/common/Card'
import { MonthCalendar } from '../components/calendar/MonthCalendar'
import { MealList } from '../components/meals/MealList'
import { Spinner } from '../components/common/Spinner'
import { ActivityIcon } from '../components/training/ActivityIcon'
import { WorkoutDetailSheet } from '../components/training/WorkoutDetailSheet'
import { useMealLogDatesInRange } from '../hooks/useMealLogDatesInRange'
import { useMealLogsForDate } from '../hooks/useMealLogsForDate'
import { useTrainingPlanSessionsInRange } from '../hooks/useTrainingPlanSessionsInRange'
import { useWorkoutsInRange } from '../hooks/useWorkoutsInRange'
import { useTrainingForDate } from '../hooks/useTrainingForDate'
import { sumMealTotals } from '../lib/dailyTotals'
import { monthGridDays, nextMonth, prevMonth } from '../lib/monthGrid'
import { ACTIVITY_LABELS } from '../lib/activityTypes'
import { formatDistance, formatDuration } from '../lib/formatWorkout'
import type { PlanActivityType, TrainingPlanSession } from '../types/domain'

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function CalendarPage() {
  const navigate = useNavigate()
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<TrainingPlanSession | null>(null)

  const gridDays = useMemo(() => monthGridDays(visibleMonth), [visibleMonth])
  const rangeStartIso = gridDays[0].toISOString()
  const rangeEndIsoExclusive = addDays(gridDays[gridDays.length - 1], 1).toISOString()
  const rangeStartDateKey = format(gridDays[0], 'yyyy-MM-dd')
  const rangeEndDateKey = format(gridDays[gridDays.length - 1], 'yyyy-MM-dd')

  const { data: loggedDates } = useMealLogDatesInRange(rangeStartIso, rangeEndIsoExclusive)
  const { data: dayLogs, isLoading: dayLoading } = useMealLogsForDate(selectedDate)
  const { data: monthSessions } = useTrainingPlanSessionsInRange(rangeStartDateKey, rangeEndDateKey)
  const { data: monthWorkouts } = useWorkoutsInRange(rangeStartIso, rangeEndIsoExclusive)

  const totals = sumMealTotals(dayLogs ?? [])

  const trainingByDate = useMemo(() => {
    const map = new Map<string, PlanActivityType>()
    for (const session of monthSessions ?? []) {
      if (session.activity_type !== 'rest') map.set(session.scheduled_date, session.activity_type)
    }
    for (const workout of monthWorkouts ?? []) {
      map.set(format(new Date(workout.started_at), 'yyyy-MM-dd'), workout.activity_type)
    }
    return map
  }, [monthSessions, monthWorkouts])

  const {
    session: selectedSession,
    matchedWorkout: selectedWorkout,
    isRestDay: selectedIsRestDay,
    isDone: selectedIsDone,
  } = useTrainingForDate(selectedDate)

  return (
    <div className="space-y-4">
      <div>
        <Link to="/nutrition" className="text-sm text-ink-secondary">
          ← Kost
        </Link>
        <h1 className="font-display text-lg font-semibold">📅 Kalender</h1>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setVisibleMonth((m) => prevMonth(m))}
            className="rounded-lg px-2 py-1 text-sm text-ink-secondary"
            aria-label="Föregående månad"
          >
            ←
          </button>
          <span className="text-sm font-medium text-ink-primary">
            {capitalize(format(visibleMonth, 'MMMM yyyy', { locale: sv }))}
          </span>
          <button
            onClick={() => setVisibleMonth((m) => nextMonth(m))}
            className="rounded-lg px-2 py-1 text-sm text-ink-secondary"
            aria-label="Nästa månad"
          >
            →
          </button>
        </div>
        <MonthCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          loggedDates={loggedDates ?? []}
          trainingByDate={trainingByDate}
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

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-ink-primary">Träning</h2>
        {selectedSession && !selectedIsRestDay ? (
          <button
            onClick={() =>
              selectedWorkout
                ? navigate(`/training/workout/${selectedWorkout.id}`)
                : setSelectedSessionForDetail(selectedSession)
            }
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
          >
            <ActivityIcon type={selectedSession.activity_type} size="sm" />
            <span className="text-sm text-ink-primary">
              {selectedIsDone && '✓ '}
              {selectedSession.title}
            </span>
          </button>
        ) : selectedWorkout ? (
          <button
            onClick={() => navigate(`/training/workout/${selectedWorkout.id}`)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
          >
            <ActivityIcon type={selectedWorkout.activity_type} size="sm" />
            <span className="text-sm text-ink-primary">
              ✓ {selectedWorkout.title ?? ACTIVITY_LABELS[selectedWorkout.activity_type]}
              {[formatDistance(selectedWorkout.distance_meters), formatDuration(selectedWorkout.duration_seconds)]
                .filter(Boolean)
                .length > 0
                ? ` · ${[formatDistance(selectedWorkout.distance_meters), formatDuration(selectedWorkout.duration_seconds)].filter(Boolean).join(' · ')}`
                : ''}
            </span>
          </button>
        ) : (
          <p className="text-sm text-ink-secondary">{selectedIsRestDay ? 'Vilodag.' : 'Inget träningspass denna dag.'}</p>
        )}
      </div>

      {selectedSessionForDetail && (
        <WorkoutDetailSheet session={selectedSessionForDetail} onClose={() => setSelectedSessionForDetail(null)} />
      )}
    </div>
  )
}
