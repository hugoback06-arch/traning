import { useState } from 'react'
import { FoodSearchList } from './FoodSearchList'
import { LogMealForm } from './LogMealForm'
import type { FoodSearchResult, MealType } from '../../types/domain'

interface AddMealSearchStepProps {
  initialMealType: MealType
  onBack: () => void
  onSaved: () => void
}

export function AddMealSearchStep({ initialMealType, onBack, onSaved }: AddMealSearchStepProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FoodSearchResult | null>(null)

  if (selected) {
    return (
      <LogMealForm
        foodResult={selected}
        initialMealType={initialMealType}
        onBack={() => setSelected(null)}
        onSaved={onSaved}
      />
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-ink-secondary">
        ← Tillbaka
      </button>
      <input
        type="text"
        placeholder="Sök på namn…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <FoodSearchList query={query} onSelect={setSelected} />
    </div>
  )
}
