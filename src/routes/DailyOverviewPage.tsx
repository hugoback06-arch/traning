import { Link } from 'react-router'
import { CalorieRing } from '../components/overview/CalorieRing'
import { MacroCard } from '../components/overview/MacroCard'
import { StreakBadge } from '../components/overview/StreakBadge'
import { WaterCounter } from '../components/overview/WaterCounter'
import { MealTypeSection } from '../components/meals/MealTypeSection'
import { Spinner } from '../components/common/Spinner'
import { useProfile } from '../hooks/useProfile'
import { useTodayMealLogs } from '../hooks/useTodayMealLogs'
import { useTodayWater } from '../hooks/useTodayWater'
import { useMealLogDates } from '../hooks/useMealLogDates'
import { useAddWater } from '../hooks/useAddWater'
import { useRemoveWater } from '../hooks/useRemoveWater'
import { sumMealTotals } from '../lib/dailyTotals'
import { calculateStreak } from '../lib/streaks'

export function DailyOverviewPage() {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: mealLogs, isLoading: mealsLoading } = useTodayMealLogs()
  const { data: waterMl, isLoading: waterLoading } = useTodayWater()
  const { data: mealDates } = useMealLogDates()
  const addWater = useAddWater()
  const removeWater = useRemoveWater()

  if (profileLoading || mealsLoading || waterLoading || !profile) {
    return <Spinner />
  }

  const totals = sumMealTotals(mealLogs ?? [])
  const streakDays = calculateStreak(mealDates ?? [])
  const goalKcal = profile.daily_calorie_goal ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold">🍽️ Kost</h1>
        <div className="flex items-center gap-2">
          <StreakBadge days={streakDays} />
          <Link to="/nutrition/saved-meals" className="text-sm text-ink-secondary underline">
            Sparade
          </Link>
          <Link to="/nutrition/calendar" className="text-sm text-ink-secondary underline">
            Kalender
          </Link>
        </div>
      </div>

      <CalorieRing eatenKcal={totals.kcal} goalKcal={goalKcal} />

      <div className="flex gap-3">
        <MacroCard kind="protein" label="Protein" eatenG={totals.proteinG} goalG={profile.protein_goal_g ?? 0} />
        <MacroCard kind="carbs" label="Kolhydrater" eatenG={totals.carbsG} goalG={profile.carbs_goal_g ?? 0} />
        <MacroCard kind="fat" label="Fett" eatenG={totals.fatG} goalG={profile.fat_goal_g ?? 0} />
      </div>

      <MealTypeSection logs={mealLogs ?? []} />

      <WaterCounter
        currentMl={waterMl ?? 0}
        goalMl={profile.water_goal_ml}
        onAdd={() => addWater.mutate()}
        onRemove={() => removeWater.mutate()}
      />
    </div>
  )
}
