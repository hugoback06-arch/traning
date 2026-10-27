import { useState } from 'react'
import { subDays } from 'date-fns'
import { CopyPlus } from 'lucide-react'
import { useMealLogsForDate } from '../../hooks/useMealLogsForDate'
import { useCopyMealLogs } from '../../hooks/useCopyMealLogs'
import { MEAL_TYPE_LABELS } from '../../lib/mealTypeLabels'
import type { MealType } from '../../types/domain'

interface CopyYesterdayMealProps {
  mealType: MealType
  onSaved: () => void
}

// One tap to log exactly what was logged for this meal yesterday — the most
// common repeat in practice (same breakfast, leftovers for lunch).
export function CopyYesterdayMeal({ mealType, onSaved }: CopyYesterdayMealProps) {
  const [yesterday] = useState(() => subDays(new Date(), 1))
  const { data: logs } = useMealLogsForDate(yesterday)
  const copyMealLogs = useCopyMealLogs()

  const yesterdayLogs = (logs ?? []).filter((log) => log.meal_type === mealType)
  if (yesterdayLogs.length === 0) return null

  const kcal = Math.round(
    yesterdayLogs.reduce((total, log) => total + (log.food_item.calories_per_100g * log.amount_g) / 100, 0),
  )
  const names = yesterdayLogs.map((log) => log.food_item.name)
  const summary = names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ')

  async function handleCopy() {
    await copyMealLogs.mutateAsync({ logs: yesterdayLogs, mealType })
    onSaved()
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleCopy}
        disabled={copyMealLogs.isPending}
        className="press flex w-full items-center gap-3 rounded-xl border border-accent bg-accent-light px-3 py-2.5 text-left"
      >
        <CopyPlus size={18} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-accent">
            {copyMealLogs.isPending ? 'Loggar…' : `Samma ${MEAL_TYPE_LABELS[mealType].toLowerCase()} som igår`}
          </span>
          <span className="block truncate text-xs text-ink-secondary">{summary}</span>
        </span>
        <span className="shrink-0 text-sm font-medium text-ink-primary">{kcal} kcal</span>
      </button>
      {copyMealLogs.isError && <p className="text-xs text-warning">Något gick fel, försök igen.</p>}
    </div>
  )
}
