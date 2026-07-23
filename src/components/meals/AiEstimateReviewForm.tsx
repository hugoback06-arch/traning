import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { MealTypeSelect } from './MealTypeSelect'
import { useLogMeal } from '../../hooks/useLogMeal'
import { defaultMealTypeForNow } from '../../lib/mealTypeDefault'
import type { MealPhotoEstimate } from '../../hooks/useAnalyzeMealPhoto'
import type { FoodSearchResult, FoodSource, MealType } from '../../types/domain'

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block text-sm text-ink-secondary">
      {label}
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
      />
    </label>
  )
}

interface AiEstimateReviewFormProps {
  estimate: MealPhotoEstimate
  source?: FoodSource
  backLabel?: string
  initialMealType?: MealType
  onBack: () => void
  onSaved: () => void
}

export function AiEstimateReviewForm({
  estimate,
  source = 'ai_estimate',
  backLabel = 'Ta nytt foto',
  initialMealType,
  onBack,
  onSaved,
}: AiEstimateReviewFormProps) {
  const logMeal = useLogMeal()
  const [name, setName] = useState(estimate.food_name)
  const [weightG, setWeightG] = useState(estimate.estimated_weight_g)
  const [calories, setCalories] = useState(estimate.calories)
  const [proteinG, setProteinG] = useState(estimate.protein_g)
  const [carbsG, setCarbsG] = useState(estimate.carbs_g)
  const [fatG, setFatG] = useState(estimate.fat_g)
  const [mealType, setMealType] = useState<MealType>(initialMealType ?? defaultMealTypeForNow())

  // Per-gram rates from the original AI estimate, used to rescale
  // calories/macros when the user adjusts the weight.
  const initialWeight = estimate.estimated_weight_g > 0 ? estimate.estimated_weight_g : 1
  const ratesPerGram = {
    calories: estimate.calories / initialWeight,
    proteinG: estimate.protein_g / initialWeight,
    carbsG: estimate.carbs_g / initialWeight,
    fatG: estimate.fat_g / initialWeight,
  }

  function handleWeightChange(newWeightG: number) {
    setWeightG(newWeightG)
    setCalories(Math.round(ratesPerGram.calories * newWeightG))
    setProteinG(Math.round(ratesPerGram.proteinG * newWeightG))
    setCarbsG(Math.round(ratesPerGram.carbsG * newWeightG))
    setFatG(Math.round(ratesPerGram.fatG * newWeightG))
  }

  async function handleSave() {
    const safeWeight = weightG > 0 ? weightG : 1
    const foodResult: FoodSearchResult = {
      source,
      externalId: crypto.randomUUID(),
      name,
      brand: null,
      caloriesPer100g: (calories / safeWeight) * 100,
      proteinPer100g: (proteinG / safeWeight) * 100,
      carbsPer100g: (carbsG / safeWeight) * 100,
      fatPer100g: (fatG / safeWeight) * 100,
      imageUrl: null,
    }
    await logMeal.mutateAsync({ foodResult, amountG: weightG, mealType })
    onSaved()
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-ink-secondary">
        ← {backLabel}
      </button>
      <Card className="space-y-4">
        {estimate.confidence === 'low' && (
          <p className="rounded-lg bg-warning-light px-3 py-2 text-xs text-warning">
            Osäker uppskattning — kolla gärna igenom värdena extra noga innan du sparar.
          </p>
        )}
        <label className="block text-sm text-ink-secondary">
          Namn
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Vikt (g)" value={weightG} onChange={handleWeightChange} />
          <NumberField label="Kalorier (kcal)" value={calories} onChange={setCalories} />
          <NumberField label="Protein (g)" value={proteinG} onChange={setProteinG} />
          <NumberField label="Kolhydrater (g)" value={carbsG} onChange={setCarbsG} />
          <NumberField label="Fett (g)" value={fatG} onChange={setFatG} />
        </div>
        <MealTypeSelect value={mealType} onChange={setMealType} />
        {logMeal.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
        <Button className="w-full" disabled={logMeal.isPending} onClick={handleSave}>
          {logMeal.isPending ? 'Sparar…' : 'Logga måltid'}
        </Button>
      </Card>
    </div>
  )
}
