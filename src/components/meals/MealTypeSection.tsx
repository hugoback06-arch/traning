import { useState } from 'react'
import { MealListItem } from './MealListItem'
import { AddMealModal } from './AddMealModal'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../../lib/mealTypeLabels'
import { sumMealTotals } from '../../lib/dailyTotals'
import type { MealLogWithFood, MealType } from '../../types/domain'

interface MealTypeSectionProps {
  logs: MealLogWithFood[]
}

export function MealTypeSection({ logs }: MealTypeSectionProps) {
  const [expandedType, setExpandedType] = useState<MealType | null>(null)
  const [addingType, setAddingType] = useState<MealType | null>(null)

  return (
    <div className="space-y-2">
      {MEAL_TYPE_ORDER.map((type) => {
        const logsForType = logs.filter((log) => log.meal_type === type)
        const kcal = Math.round(sumMealTotals(logsForType).kcal)
        const isExpanded = expandedType === type

        return (
          <div key={type} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                onClick={() => setExpandedType(isExpanded ? null : type)}
                className="flex flex-1 items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-ink-primary">{MEAL_TYPE_LABELS[type]}</span>
                <span className="text-xs text-ink-secondary">
                  {logsForType.length > 0 ? `${kcal} kcal · ${logsForType.length} st` : 'Inget loggat'}
                </span>
              </button>
              <button
                aria-label={`Lägg till i ${MEAL_TYPE_LABELS[type]}`}
                onClick={() => setAddingType(type)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light text-lg leading-none text-accent"
              >
                +
              </button>
            </div>
            {isExpanded && (
              <div className="space-y-2 border-t border-border px-3 py-2.5">
                {logsForType.length === 0 ? (
                  <p className="text-sm text-ink-secondary">Inget tillagt än.</p>
                ) : (
                  logsForType.map((log) => <MealListItem key={log.id} log={log} />)
                )}
              </div>
            )}
          </div>
        )
      })}
      {addingType && <AddMealModal mealType={addingType} onClose={() => setAddingType(null)} />}
    </div>
  )
}
