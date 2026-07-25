import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Calendar, CalendarDays, Dumbbell, Plus, Sparkles, UtensilsCrossed } from 'lucide-react'
import { Card } from '../components/common/Card'
import { StreakBadge } from '../components/overview/StreakBadge'
import { StreakMilestoneModal } from '../components/overview/StreakMilestoneModal'
import { MealSuggestionsModal } from '../components/overview/MealSuggestionsModal'
import { TrainingStatusCard } from '../components/training/TrainingStatusCard'
import { AddMealModal } from '../components/meals/AddMealModal'
import { useProfile } from '../hooks/useProfile'
import { useTodayMealLogs } from '../hooks/useTodayMealLogs'
import { useStreak } from '../hooks/useStreak'
import { useActiveTrainingPlan } from '../hooks/useActiveTrainingPlan'
import { sumMealTotals } from '../lib/dailyTotals'
import { getStreakMilestone } from '../lib/streaks'
import { getActiveMealType } from '../lib/activeMealType'
import { MEAL_TYPE_LABELS } from '../lib/mealTypeLabels'

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const MILESTONE_STORAGE_KEY = 'strikt:streak-milestone-celebrated'

export function Home() {
  const [addingMeal, setAddingMeal] = useState(false)
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null)
  const [suggestingMeals, setSuggestingMeals] = useState(false)
  const { data: profile } = useProfile()
  const { data: mealLogs } = useTodayMealLogs()
  const streakDays = useStreak()
  const { data: activePlan } = useActiveTrainingPlan()

  const totals = sumMealTotals(mealLogs ?? [])
  const goalKcal = profile?.daily_calorie_goal ?? 0
  const remainingKcal = Math.max(0, Math.round(goalKcal - totals.kcal))
  const remainingProteinG = Math.max(0, Math.round((profile?.protein_goal_g ?? 0) - totals.proteinG))
  const remainingCarbsG = Math.max(0, Math.round((profile?.carbs_goal_g ?? 0) - totals.carbsG))
  const remainingFatG = Math.max(0, Math.round((profile?.fat_goal_g ?? 0) - totals.fatG))
  const fraction = goalKcal > 0 ? Math.min(totals.kcal / goalKcal, 1) : 0
  const activeMealType = getActiveMealType()

  useEffect(() => {
    const milestone = getStreakMilestone(streakDays)
    if (!milestone) return
    const lastCelebrated = Number(localStorage.getItem(MILESTONE_STORAGE_KEY) ?? 0)
    if (milestone > lastCelebrated) {
      setCelebratingMilestone(milestone)
      localStorage.setItem(MILESTONE_STORAGE_KEY, String(milestone))
    }
  }, [streakDays])

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-secondary">{capitalize(format(new Date(), 'EEEE d MMMM', { locale: sv }))}</p>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <Link to="/nutrition" className="flex items-center gap-1.5 font-display text-base font-semibold text-ink-primary">
            <UtensilsCrossed size={17} /> Kost
          </Link>
          <div className="flex items-center gap-2">
            {streakDays > 0 && <StreakBadge days={streakDays} />}
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
            className="press flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
          >
            <Plus size={13} /> Lägg till
          </button>
        </div>

        <button
          onClick={() => setSuggestingMeals(true)}
          className="press flex w-full items-center justify-center gap-1.5 text-sm font-medium text-accent"
        >
          <Sparkles size={15} /> Förslag på måltid
        </button>
      </Card>

      <div className="space-y-2">
        <div className="px-1">
          <Link to="/training" className="flex items-center gap-1.5 font-display text-base font-semibold text-ink-primary">
            <Dumbbell size={17} /> Träning
          </Link>
        </div>
        <Link to="/training" className="press block">
          <TrainingStatusCard />
        </Link>
      </div>

      <div className="space-y-2">
        <div className="px-1">
          <Link
            to="/training/schedule"
            className="flex items-center gap-1.5 font-display text-base font-semibold text-ink-primary"
          >
            <Calendar size={17} /> Schema
          </Link>
        </div>
        <Link to="/training/schedule" className="press block">
          <Card>
            {activePlan ? (
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-ink-primary">{activePlan.name}</p>
                <p className="text-xs text-ink-secondary">{activePlan.goal ?? 'Se hela ditt träningsschema'}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2 text-center">
                <p className="text-sm font-medium text-ink-primary">Inget schema ännu</p>
                <p className="text-xs text-ink-secondary">Skapa ett AI-genererat träningsschema</p>
              </div>
            )}
          </Card>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="px-1">
          <Link
            to="/nutrition/calendar"
            className="flex items-center gap-1.5 font-display text-base font-semibold text-ink-primary"
          >
            <CalendarDays size={17} /> Kalender
          </Link>
        </div>
        <Link to="/nutrition/calendar" className="press block">
          <Card>
            <div className="flex flex-col items-center gap-1 py-2 text-center">
              <p className="text-sm font-medium text-ink-primary">Kost & träning i en vy</p>
              <p className="text-xs text-ink-secondary">Bläddra bland tidigare dagar</p>
            </div>
          </Card>
        </Link>
      </div>

      {addingMeal && <AddMealModal mealType={activeMealType} onClose={() => setAddingMeal(false)} />}
      {celebratingMilestone && (
        <StreakMilestoneModal days={celebratingMilestone} onClose={() => setCelebratingMilestone(null)} />
      )}
      {suggestingMeals && (
        <MealSuggestionsModal
          remainingKcal={remainingKcal}
          remainingProteinG={remainingProteinG}
          remainingCarbsG={remainingCarbsG}
          remainingFatG={remainingFatG}
          onClose={() => setSuggestingMeals(false)}
        />
      )}
    </div>
  )
}
