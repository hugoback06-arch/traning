import { History } from 'lucide-react'
import { useRecentFoodItems } from '../../hooks/useRecentFoodItems'
import { foodItemToSearchResult } from '../../lib/foodItems'
import type { FoodSearchResult } from '../../types/domain'

interface RecentFoodListProps {
  onSelect: (result: FoodSearchResult) => void
}

// Shown in the search step before the user types, so re-logging something
// from the last few days is one tap instead of a search.
export function RecentFoodList({ onSelect }: RecentFoodListProps) {
  const { data: items } = useRecentFoodItems()

  if (!items || items.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1 text-xs font-medium text-ink-secondary">
        <History size={13} /> Senast loggat
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(foodItemToSearchResult(item))}
              className="press flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink-primary">{item.name}</span>
                {item.brand && <span className="block truncate text-xs text-ink-secondary">{item.brand}</span>}
              </span>
              <span className="shrink-0 pl-2 text-xs text-ink-secondary">
                {Math.round(item.calories_per_100g)} kcal/100g
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
