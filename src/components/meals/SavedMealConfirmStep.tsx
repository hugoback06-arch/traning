import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { MealTypeSelect } from './MealTypeSelect'
import { useLogSavedMeal } from '../../hooks/useLogSavedMeal'
import { sumSavedMealKcal } from '../../lib/savedMeals'
import { defaultMealTypeForNow } from '../../lib/mealTypeDefault'
import type { MealType, SavedMealWithItems } from '../../types/domain'

interface SavedMealConfirmStepProps {
  savedMeal: SavedMealWithItems
  initialMealType?: MealType
  onBack: () => void
  onSaved: () => void
}

export function SavedMealConfirmStep({ savedMeal, initialMealType, onBack, onSaved }: SavedMealConfirmStepProps) {
  const logSavedMeal = useLogSavedMeal()
  const [mealType, setMealType] = useState<MealType>(initialMealType ?? defaultMealTypeForNow())

  const kcal = Math.round(sumSavedMealKcal(savedMeal.items))

  async function handleSave() {
    await logSavedMeal.mutateAsync({ savedMeal, mealType })
    onSaved()
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-ink-secondary">
        ← Tillbaka
      </button>
      <Card className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">{savedMeal.name}</h1>
          <ul className="mt-2 space-y-1">
            {savedMeal.items.map((item) => (
              <li key={item.id} className="text-sm text-ink-secondary">
                {item.food_item.name} · {item.amount_g} g
              </li>
            ))}
          </ul>
        </div>
        <MealTypeSelect value={mealType} onChange={setMealType} />
        <p className="text-sm text-ink-secondary">≈ {kcal} kcal</p>
        {logSavedMeal.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
        <Button className="w-full" disabled={logSavedMeal.isPending} onClick={handleSave}>
          {logSavedMeal.isPending ? 'Sparar…' : 'Logga måltid'}
        </Button>
      </Card>
    </div>
  )
}
