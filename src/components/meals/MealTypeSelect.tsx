import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../../lib/mealTypeLabels'
import type { MealType } from '../../types/domain'

interface MealTypeSelectProps {
  value: MealType
  onChange: (value: MealType) => void
}

export function MealTypeSelect({ value, onChange }: MealTypeSelectProps) {
  return (
    <div>
      <label className="block text-sm text-ink-secondary">Måltid</label>
      <div className="mt-1 grid grid-cols-4 gap-1.5">
        {MEAL_TYPE_ORDER.map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`rounded-lg border px-2 py-1.5 text-xs font-medium ${
              value === type ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-secondary'
            }`}
          >
            {MEAL_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
