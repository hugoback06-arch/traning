import { MealListItem } from './MealListItem'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../../lib/mealTypeLabels'
import type { MealLogWithFood } from '../../types/domain'

interface MealListProps {
  logs: MealLogWithFood[]
}

export function MealList({ logs }: MealListProps) {
  if (logs.length === 0) {
    return <p className="py-4 text-center text-sm text-ink-secondary">Inga måltider loggade idag än.</p>
  }

  return (
    <div className="space-y-4">
      {MEAL_TYPE_ORDER.map((type) => {
        const logsForType = logs.filter((log) => log.meal_type === type)
        if (logsForType.length === 0) return null
        return (
          <div key={type} className="space-y-2">
            <h2 className="text-sm font-medium text-ink-secondary">{MEAL_TYPE_LABELS[type]}</h2>
            <div className="space-y-2">
              {logsForType.map((log) => (
                <MealListItem key={log.id} log={log} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
