import { useState } from 'react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../components/common/Card'
import { StreakBadge } from '../components/overview/StreakBadge'
import { TrainingCalorieBadge } from '../components/overview/TrainingCalorieBadge'
import { TrainingStatusCard } from '../components/training/TrainingStatusCard'
import { AddMealModal } from '../components/meals/AddMealModal'
import { useProfile } from '../hooks/useProfile'
import { useTodayMealLogs } from '../hooks/useTodayMealLogs'
import { useCalorieAdjustmentsForDate } from '../hooks/useCalorieAdjustmentsForDate'
import { useMealLogDates } from '../hooks/useMealLogDates'
import { sumMealTotals } from '../lib/dailyTotals'
import { sumExtraKcal } from '../lib/calorieAdjustments'
import { calculateStreak } from '../lib/streaks'
import { getActiveMealType } from '../lib/activeMealType'
import { MEAL_TYPE_LABELS } from '../lib/mealTypeLabels'

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function Home() {
  const [addingMeal, setAddingMeal] = useState(false)
  const { data: profile } = useProfile()
  const { data: mealLogs } = useTodayMealLogs()
  const { data: adjustments } = useCalorieAdjustmentsForDate(new Date())
  const { data: mealDates } = useMealLogDates()

  const totals = sumMealTotals(mealLogs ?? [])
  const extraKcal = sumExtraKcal(adjustments ?? [])
  const goalKcal = (profile?.daily_calorie_goal ?? 0) + extraKcal
  const remainingKcal = Math.max(0, Math.round(goalKcal - totals.kcal))
  const fraction = goalKcal > 0 ? Math.min(totals.kcal / goalKcal, 1) : 0
  const streakDays = calculateStreak(mealDates ?? [])
  const activeMealType = getActiveMealType()

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-secondary">{capitalize(format(new Date(), 'EEEE d MMMM', { locale: sv }))}</p>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <Link to="/nutrition" className="font-display text-base font-semibold text-ink-primary">
            🍽️ Kost
          </Link>
          <div className="flex items-center gap-2">
            {extraKcal > 0 && <TrainingCalorieBadge extraKcal={extraKcal} />}
            {streakDays > 0 && <StreakBadge days={streakDays} />}
            <Link to="/nutrition/calendar" className="text-xs text-ink-secondary underline">
              Kalender
            </Link>
          </div>
        </div>

        <Link to="/nutrition" className="press block space-y-2">
          <p className="font-display text-4xl font-semibold text-ink-primary">
            {remainingKcal} <span className="text-sm font-normal text-ink-secondary">kcal kvar</span>
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${fraction * 100}%` }}
            />
          </div>
        </Link>

        {profile && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-protein" />
              <p className="font-display font-semibold text-ink-primary">{Math.round(totals.proteinG)}g</p>
              <p className="text-ink-secondary">av {Math.round(profile.protein_goal_g ?? 0)}g</p>
            </div>
            <div>
              <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-carbs" />
              <p className="font-display font-semibold text-ink-primary">{Math.round(totals.carbsG)}g</p>
              <p className="text-ink-secondary">av {Math.round(profile.carbs_goal_g ?? 0)}g</p>
            </div>
            <div>
              <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-fat" />
              <p className="font-display font-semibold text-ink-primary">{Math.round(totals.fatG)}g</p>
              <p className="text-ink-secondary">av {Math.round(profile.fat_goal_g ?? 0)}g</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2">
          <span className="text-sm text-ink-primary">{MEAL_TYPE_LABELS[activeMealType]}</span>
          <button
            onClick={() => setAddingMeal(true)}
            className="press rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
          >
            + Lägg till
          </button>
        </div>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Link to="/training" className="font-display text-base font-semibold text-ink-primary">
            🏋️ Träning
          </Link>
          <Link to="/training/schedule" className="text-xs text-ink-secondary underline">
            Schema
          </Link>
        </div>
        <Link to="/training" className="press block">
          <TrainingStatusCard />
        </Link>
      </div>

      {addingMeal && <AddMealModal mealType={activeMealType} onClose={() => setAddingMeal(false)} />}
    </div>
  )
}
