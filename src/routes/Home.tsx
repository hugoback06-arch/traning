import { Link } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../components/common/Card'
import { ActivityIcon } from '../components/training/ActivityIcon'
import { TrainingCalorieBadge } from '../components/overview/TrainingCalorieBadge'
import { useProfile } from '../hooks/useProfile'
import { useTodayMealLogs } from '../hooks/useTodayMealLogs'
import { useCalorieAdjustmentsForDate } from '../hooks/useCalorieAdjustmentsForDate'
import { useTodayTraining } from '../hooks/useTodayTraining'
import { sumMealTotals } from '../lib/dailyTotals'
import { sumExtraKcal } from '../lib/calorieAdjustments'
import { ACTIVITY_LABELS } from '../lib/activityTypes'
import { formatDistance, formatDuration } from '../lib/formatWorkout'

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function Home() {
  const { data: profile } = useProfile()
  const { data: mealLogs } = useTodayMealLogs()
  const { data: adjustments } = useCalorieAdjustmentsForDate(new Date())
  const { session, matchedWorkout, isRestDay, isDone } = useTodayTraining()

  const totals = sumMealTotals(mealLogs ?? [])
  const extraKcal = sumExtraKcal(adjustments ?? [])
  const goalKcal = (profile?.daily_calorie_goal ?? 0) + extraKcal
  const remainingKcal = Math.max(0, Math.round(goalKcal - totals.kcal))
  const fraction = goalKcal > 0 ? Math.min(totals.kcal / goalKcal, 1) : 0

  const trainingActivityType = session?.activity_type ?? matchedWorkout?.activity_type ?? 'rest'
  const doneResultText = matchedWorkout
    ? [formatDistance(matchedWorkout.distance_meters), formatDuration(matchedWorkout.duration_seconds)]
        .filter(Boolean)
        .join(' · ')
    : ''

  let trainingStatusText: string
  if (isRestDay) {
    trainingStatusText = 'Vilodag'
  } else if (isDone && matchedWorkout) {
    const title = matchedWorkout.title ?? ACTIVITY_LABELS[matchedWorkout.activity_type]
    trainingStatusText = doneResultText ? `✓ ${title} · ${doneResultText}` : `✓ ${title}`
  } else if (session) {
    trainingStatusText = session.title
  } else {
    trainingStatusText = 'Inget planerat idag'
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-secondary">{capitalize(format(new Date(), 'EEEE d MMMM', { locale: sv }))}</p>

      <Link to="/nutrition" className="block">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-primary">Kost</span>
            {extraKcal > 0 && <TrainingCalorieBadge extraKcal={extraKcal} />}
          </div>
          <p className="text-2xl font-semibold text-ink-primary">
            {remainingKcal} <span className="text-sm font-normal text-ink-secondary">kcal kvar</span>
          </p>
          {profile?.protein_goal_g ? (
            <p className="text-xs text-ink-secondary">
              Protein {Math.round(totals.proteinG)}/{Math.round(profile.protein_goal_g)}g
            </p>
          ) : null}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: `${fraction * 100}%` }} />
          </div>
        </Card>
      </Link>

      <Link to="/training" className="block">
        <Card>
          <div className="flex items-center gap-3">
            <ActivityIcon type={trainingActivityType} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-primary">Träning</p>
              <p className="truncate text-sm text-ink-secondary">{trainingStatusText}</p>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}
