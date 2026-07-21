import { useFrequentFoodItems } from '../../hooks/useFrequentFoodItems'
import { foodItemToSearchResult } from '../../lib/foodItems'
import type { FoodSearchResult } from '../../types/domain'

interface QuickFoodPicksProps {
  onSelect: (result: FoodSearchResult) => void
}

export function QuickFoodPicks({ onSelect }: QuickFoodPicksProps) {
  const { data: items } = useFrequentFoodItems()

  if (!items || items.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-ink-secondary">Snabbval</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(foodItemToSearchResult(item))}
            className="press flex shrink-0 flex-col items-start gap-0.5 rounded-xl border border-border bg-surface px-3 py-2 text-left"
          >
            <span className="max-w-36 truncate text-sm font-medium text-ink-primary">{item.name}</span>
            <span className="text-xs text-ink-secondary">{Math.round(item.calories_per_100g)} kcal/100g</span>
          </button>
        ))}
      </div>
    </div>
  )
}
