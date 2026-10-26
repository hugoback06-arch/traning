import { useState } from 'react'
import { Card } from '../common/Card'
import { BackButton } from '../common/BackButton'
import { Button } from '../common/Button'
import { MealTypeSelect } from './MealTypeSelect'
import { useLogMeal } from '../../hooks/useLogMeal'
import { useAuth } from '../../hooks/useAuth'
import { defaultMealTypeForNow } from '../../lib/mealTypeDefault'
import { upsertFoodCorrection } from '../../lib/foodCorrections'
import type { MealEstimateIngredient, MealPhotoEstimate } from '../../hooks/useAnalyzeMealPhoto'
import type { FoodSearchResult, FoodSource, MealType } from '../../types/domain'

const AI_SOURCES: FoodSource[] = ['ai_estimate', 'ai_text_estimate']

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

interface EditableIngredient {
  name: string
  grams: number
  matchedFood: string | null
  per100: { calories: number; proteinG: number; carbsG: number; fatG: number }
}

// Older estimates only carry per-component totals, so per-100 g values are
// derived from them when the grounded estimator's fields are missing.
function toEditable(ingredient: MealEstimateIngredient): EditableIngredient {
  const grams = ingredient.estimated_weight_g
  const derive = (total: number) => (grams > 0 ? (total / grams) * 100 : 0)
  return {
    name: ingredient.name,
    grams: Math.round(grams),
    matchedFood: ingredient.matched_food ?? null,
    per100: {
      calories: ingredient.calories_per_100g ?? derive(ingredient.calories),
      proteinG: ingredient.protein_per_100g ?? derive(ingredient.protein_g),
      carbsG: ingredient.carbs_per_100g ?? derive(ingredient.carbs_g),
      fatG: ingredient.fat_per_100g ?? derive(ingredient.fat_g),
    },
  }
}

function sumIngredients(ingredients: EditableIngredient[]) {
  const sum = (pick: (ingredient: EditableIngredient) => number) =>
    Math.round(ingredients.reduce((total, ingredient) => total + pick(ingredient), 0))
  return {
    weightG: sum((i) => i.grams),
    calories: sum((i) => (i.grams * i.per100.calories) / 100),
    proteinG: sum((i) => (i.grams * i.per100.proteinG) / 100),
    carbsG: sum((i) => (i.grams * i.per100.carbsG) / 100),
    fatG: sum((i) => (i.grams * i.per100.fatG) / 100),
  }
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
  const { session } = useAuth()
  const [name, setName] = useState(estimate.food_name)
  const [weightG, setWeightG] = useState(estimate.estimated_weight_g)
  const [calories, setCalories] = useState(estimate.calories)
  const [proteinG, setProteinG] = useState(estimate.protein_g)
  const [carbsG, setCarbsG] = useState(estimate.carbs_g)
  const [fatG, setFatG] = useState(estimate.fat_g)
  const [mealType, setMealType] = useState<MealType>(initialMealType ?? defaultMealTypeForNow())
  const [ingredients, setIngredients] = useState<EditableIngredient[]>(() => (estimate.ingredients ?? []).map(toEditable))

  // Per-gram rates from the original AI estimate, used to rescale
  // calories/macros when the user adjusts the weight.
  const initialWeight = estimate.estimated_weight_g > 0 ? estimate.estimated_weight_g : 1
  const ratesPerGram = {
    calories: estimate.calories / initialWeight,
    proteinG: estimate.protein_g / initialWeight,
    carbsG: estimate.carbs_g / initialWeight,
    fatG: estimate.fat_g / initialWeight,
  }

  function applyIngredients(next: EditableIngredient[], displayWeightG?: number) {
    const totals = sumIngredients(next)
    setIngredients(next)
    setWeightG(displayWeightG ?? totals.weightG)
    setCalories(totals.calories)
    setProteinG(totals.proteinG)
    setCarbsG(totals.carbsG)
    setFatG(totals.fatG)
  }

  function handleIngredientGramsChange(index: number, grams: number) {
    applyIngredients(ingredients.map((ingredient, i) => (i === index ? { ...ingredient, grams } : ingredient)))
  }

  function handleWeightChange(newWeightG: number) {
    const currentWeightG = sumIngredients(ingredients).weightG
    if (ingredients.length > 0 && currentWeightG > 0) {
      // Scale every component so the breakdown stays consistent with the total.
      const scale = newWeightG / currentWeightG
      applyIngredients(
        ingredients.map((ingredient) => ({ ...ingredient, grams: Math.round(ingredient.grams * scale) })),
        newWeightG,
      )
      return
    }
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

    if (AI_SOURCES.includes(source) && session?.user.id) {
      void upsertFoodCorrection(session.user.id, name, {
        calories: foodResult.caloriesPer100g,
        protein: foodResult.proteinPer100g,
        carbs: foodResult.carbsPer100g,
        fat: foodResult.fatPer100g,
      }).catch(() => {
        // Best-effort — never block saving the meal because this failed.
      })
    }

    onSaved()
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} label={backLabel} />
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
        {ingredients.length > 0 && (
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-medium text-ink-primary">Ingredienser</h3>
              <p className="text-xs text-ink-secondary">Justera mängderna så räknas totalen om.</p>
            </div>
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-primary">{ingredient.name}</p>
                    {ingredient.matchedFood && (
                      <p className="truncate text-xs text-ink-secondary">{ingredient.matchedFood}</p>
                    )}
                  </div>
                  <label className="flex shrink-0 items-center gap-1 text-xs text-ink-secondary">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={ingredient.grams}
                      onChange={(e) => handleIngredientGramsChange(index, Number(e.target.value))}
                      aria-label={`Mängd ${ingredient.name} i gram`}
                      className="w-16 rounded-lg border border-border px-2 py-1 text-right text-sm text-ink-primary outline-none focus:border-accent"
                    />
                    g
                  </label>
                  <span className="w-16 shrink-0 text-right text-xs text-ink-secondary">
                    {Math.round((ingredient.grams * ingredient.per100.calories) / 100)} kcal
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <MealTypeSelect value={mealType} onChange={setMealType} />
        {logMeal.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
        <Button className="w-full" disabled={logMeal.isPending} onClick={handleSave}>
          {logMeal.isPending ? 'Sparar…' : 'Logga måltid'}
        </Button>
      </Card>
    </div>
  )
}
