import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { AmountInput } from './AmountInput'
import { MealTypeSelect } from './MealTypeSelect'
import { useLogMeal } from '../../hooks/useLogMeal'
import { defaultMealTypeForNow } from '../../lib/mealTypeDefault'
import type { FoodSearchResult, MealType } from '../../types/domain'

interface LogMealFormProps {
  foodResult: FoodSearchResult
  initialMealType?: MealType
  onBack: () => void
  onSaved: () => void
}

export function LogMealForm({ foodResult, initialMealType, onBack, onSaved }: LogMealFormProps) {
  const logMeal = useLogMeal()
  const [amountG, setAmountG] = useState(foodResult.portionG ?? 100)
  const [mealType, setMealType] = useState<MealType>(initialMealType ?? defaultMealTypeForNow())

  const kcal = Math.round((foodResult.caloriesPer100g * amountG) / 100)

  async function handleSave() {
    await logMeal.mutateAsync({ foodResult, amountG, mealType })
    onSaved()
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-ink-secondary">
        ← Tillbaka
      </button>
      <Card className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">{foodResult.name}</h1>
          {foodResult.brand && <p className="text-sm text-ink-secondary">{foodResult.brand}</p>}
        </div>
        <AmountInput
          value={amountG}
          onChange={setAmountG}
          portionG={foodResult.portionG}
          portionUnit={foodResult.portionUnit}
        />
        <MealTypeSelect value={mealType} onChange={setMealType} />
        <p className="text-sm text-ink-secondary">≈ {kcal} kcal</p>
        {logMeal.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
        <Button className="w-full" disabled={logMeal.isPending} onClick={handleSave}>
          {logMeal.isPending ? 'Sparar…' : 'Logga måltid'}
        </Button>
      </Card>
    </div>
  )
}
