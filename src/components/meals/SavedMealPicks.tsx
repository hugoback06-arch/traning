import { useSavedMeals } from '../../hooks/useSavedMeals'
import { sumSavedMealKcal } from '../../lib/savedMeals'
import type { SavedMealWithItems } from '../../types/domain'

interface SavedMealPicksProps {
  onSelect: (savedMeal: SavedMealWithItems) => void
}

export function SavedMealPicks({ onSelect }: SavedMealPicksProps) {
  const { data: savedMeals } = useSavedMeals()

  if (!savedMeals || savedMeals.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-ink-secondary">Sparade måltider</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {savedMeals.map((meal) => (
          <button
            key={meal.id}
            onClick={() => onSelect(meal)}
            className="press flex shrink-0 flex-col items-start gap-0.5 rounded-xl border border-border bg-surface px-3 py-2 text-left"
          >
            <span className="max-w-36 truncate text-sm font-medium text-ink-primary">{meal.name}</span>
            <span className="text-xs text-ink-secondary">{Math.round(sumSavedMealKcal(meal.items))} kcal</span>
          </button>
        ))}
      </div>
    </div>
  )
}
