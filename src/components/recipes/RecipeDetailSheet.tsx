import { useState } from 'react'
import { Bookmark, BookmarkCheck, Clock, Lightbulb, Plus, Users, X } from 'lucide-react'
import { Button } from '../common/Button'
import { AiEstimateReviewForm } from '../meals/AiEstimateReviewForm'
import { useDeleteSavedRecipe, useSaveRecipe, type Recipe } from '../../hooks/useRecipes'
import type { MealPhotoEstimate } from '../../hooks/useAnalyzeMealPhoto'

const MACROS = [
  { key: 'protein_g', label: 'Protein', dot: 'bg-macro-protein' },
  { key: 'carbs_g', label: 'Kolhydrater', dot: 'bg-macro-carbs' },
  { key: 'fat_g', label: 'Fett', dot: 'bg-macro-fat' },
] as const

// One serving as an editable estimate, so logging reuses the same review
// form (and per-ingredient gram editing) as text/photo estimates.
function toServingEstimate(recipe: Recipe): MealPhotoEstimate {
  return {
    food_name: recipe.title,
    estimated_weight_g: recipe.per_serving.weight_g,
    calories: recipe.per_serving.calories,
    protein_g: recipe.per_serving.protein_g,
    carbs_g: recipe.per_serving.carbs_g,
    fat_g: recipe.per_serving.fat_g,
    confidence: 'high',
    ingredients: recipe.ingredients.filter((ingredient) => ingredient.estimated_weight_g > 0),
  }
}

interface RecipeDetailSheetProps {
  recipe: Recipe
  savedRecipeId: string | null
  onClose: () => void
}

export function RecipeDetailSheet({ recipe, savedRecipeId, onClose }: RecipeDetailSheetProps) {
  const [logging, setLogging] = useState(false)
  const saveRecipe = useSaveRecipe()
  const deleteSavedRecipe = useDeleteSavedRecipe()
  const savePending = saveRecipe.isPending || deleteSavedRecipe.isPending

  function toggleSaved() {
    if (savedRecipeId) deleteSavedRecipe.mutate(savedRecipeId)
    else saveRecipe.mutate(recipe)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Stäng" onClick={onClose} className="backdrop-in absolute inset-0 bg-black/40" />
      <div className="sheet-up relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-8">
        {logging ? (
          <AiEstimateReviewForm
            estimate={toServingEstimate(recipe)}
            source="ai_text_estimate"
            backLabel="Tillbaka till receptet"
            initialMealType={recipe.meal_type}
            onBack={() => setLogging(false)}
            onSaved={onClose}
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink-primary">{recipe.title}</h2>
              <button onClick={onClose} aria-label="Stäng" className="press shrink-0 text-ink-secondary">
                <X size={22} />
              </button>
            </div>

            <div className="-mt-3 space-y-3">
              <p className="text-sm text-ink-secondary">{recipe.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-ink-secondary">
                <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1">
                  <Clock size={13} /> {recipe.time_minutes} min
                </span>
                <span className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1">
                  <Users size={13} /> {recipe.servings} {recipe.servings === 1 ? 'portion' : 'portioner'}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-muted p-3">
              <p className="text-xs text-ink-secondary">Per portion</p>
              <p className="font-display text-2xl font-semibold text-ink-primary">
                {Math.round(recipe.per_serving.calories)} <span className="text-sm font-normal text-ink-secondary">kcal</span>
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                {MACROS.map(({ key, label, dot }) => (
                  <div key={key}>
                    <span className={`mb-1 block h-2 w-2 rounded-full ${dot}`} />
                    <p className="font-display font-semibold text-ink-primary">{Math.round(recipe.per_serving[key])} g</p>
                    <p className="text-ink-secondary">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex flex-1 items-center justify-center gap-1.5" onClick={() => setLogging(true)}>
                <Plus size={16} /> Logga en portion
              </Button>
              <Button
                variant="secondary"
                disabled={savePending}
                onClick={toggleSaved}
                className="flex items-center gap-1.5"
                aria-pressed={!!savedRecipeId}
              >
                {savedRecipeId ? <BookmarkCheck size={16} className="text-accent" /> : <Bookmark size={16} />}
                {savedRecipeId ? 'Sparat' : 'Spara'}
              </Button>
            </div>

            <section className="space-y-2">
              <h3 className="font-display text-base font-semibold text-ink-primary">Ingredienser</h3>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-baseline gap-3 px-3 py-2 text-sm">
                    <span className="w-20 shrink-0 text-ink-secondary">{ingredient.amount}</span>
                    <span className="text-ink-primary">{ingredient.name}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-display text-base font-semibold text-ink-primary">Gör så här</h3>
              <ol className="space-y-3">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm text-ink-primary">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {recipe.tip && (
              <p className="flex gap-2 rounded-xl bg-accent-light p-3 text-sm text-accent">
                <Lightbulb size={16} className="mt-0.5 shrink-0" /> {recipe.tip}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
