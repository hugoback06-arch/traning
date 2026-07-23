import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../common/Button'
import { AmountInput } from './AmountInput'
import { MealTypeSelect } from './MealTypeSelect'
import { SaveMealNameDialog } from './SaveMealNameDialog'
import { useUpdateMealLog } from '../../hooks/useUpdateMealLog'
import { useDeleteMealLog } from '../../hooks/useDeleteMealLog'
import { MEAL_TYPE_LABELS } from '../../lib/mealTypeLabels'
import type { MealLogWithFood, MealType } from '../../types/domain'

interface MealListItemProps {
  log: MealLogWithFood
}

export function MealListItem({ log }: MealListItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [amountG, setAmountG] = useState(log.amount_g)
  const [mealType, setMealType] = useState<MealType>(log.meal_type)
  const [saving, setSaving] = useState(false)
  const updateMealLog = useUpdateMealLog()
  const deleteMealLog = useDeleteMealLog()

  const kcal = Math.round((log.food_item.calories_per_100g * log.amount_g) / 100)

  function openEdit() {
    setAmountG(log.amount_g)
    setMealType(log.meal_type)
    setExpanded(true)
  }

  async function handleSave() {
    await updateMealLog.mutateAsync({ id: log.id, amountG, mealType })
    setExpanded(false)
  }

  async function handleDelete() {
    if (!confirm(`Ta bort "${log.food_item.name}"?`)) return
    await deleteMealLog.mutateAsync(log.id)
  }

  if (!expanded) {
    return (
      <button
        onClick={openEdit}
        className="press flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-primary">{log.food_item.name}</p>
          <p className="text-xs text-ink-secondary">
            {MEAL_TYPE_LABELS[log.meal_type]} · {log.amount_g} g
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium text-ink-primary">{kcal} kcal</span>
      </button>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-accent bg-surface p-3">
      <p className="text-sm font-medium text-ink-primary">{log.food_item.name}</p>
      <AmountInput value={amountG} onChange={setAmountG} />
      <MealTypeSelect value={mealType} onChange={setMealType} />
      {(updateMealLog.isError || deleteMealLog.isError) && (
        <p className="text-sm text-warning">Något gick fel, försök igen.</p>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => setExpanded(false)}>
          Avbryt
        </Button>
        <Button
          variant="secondary"
          className="text-warning"
          disabled={deleteMealLog.isPending}
          onClick={handleDelete}
        >
          {deleteMealLog.isPending ? 'Tar bort…' : 'Ta bort'}
        </Button>
        <Button className="flex-1" disabled={updateMealLog.isPending} onClick={handleSave}>
          {updateMealLog.isPending ? 'Sparar…' : 'Spara'}
        </Button>
      </div>
      <button
        onClick={() => setSaving(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-muted py-2 text-sm text-ink-secondary"
      >
        <Save size={15} /> Spara som måltid
      </button>
      {saving && (
        <SaveMealNameDialog
          items={[{ foodItemId: log.food_item_id, amountG }]}
          totalKcal={kcal}
          defaultName={log.food_item.name}
          onClose={() => setSaving(false)}
          onSaved={() => setSaving(false)}
        />
      )}
    </div>
  )
}
