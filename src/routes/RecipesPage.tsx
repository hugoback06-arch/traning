import { useState } from 'react'
import { ChefHat, RefreshCw, Sparkles } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Spinner } from '../components/common/Spinner'
import { Switch } from '../components/common/Switch'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { RecipeDetailSheet } from '../components/recipes/RecipeDetailSheet'
import { useProfile } from '../hooks/useProfile'
import { useTodayMealLogs } from '../hooks/useTodayMealLogs'
import {
  useGenerateRecipes,
  useGeneratedRecipes,
  useSavedRecipes,
  type Recipe,
  type RecipeMealType,
} from '../hooks/useRecipes'
import { getActiveMealType } from '../lib/activeMealType'
import { sumMealTotals } from '../lib/dailyTotals'

const MEAL_TYPE_OPTIONS: { value: RecipeMealType; label: string }[] = [
  { value: 'breakfast', label: 'Frukost' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Middag' },
]

const QUICK_WISHES = ['Snabbt, max 15 min', 'Matlåda', 'Ugnsrätt', 'Få ingredienser', 'Budget', 'Kyckling', 'Fisk', 'Vegetariskt']

function initialMealType(): RecipeMealType {
  const active = getActiveMealType()
  if (active !== 'snack') return active
  return new Date().getHours() < 14 ? 'lunch' : 'dinner'
}

export function RecipesPage() {
  const [mealType, setMealType] = useState<RecipeMealType>(initialMealType)
  const [wishText, setWishText] = useState('')
  const [quickWishes, setQuickWishes] = useState<string[]>([])
  const [fitToday, setFitToday] = useState(false)
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null)

  const { data: profile } = useProfile()
  const { data: mealLogs } = useTodayMealLogs()
  const { data: recipes } = useGeneratedRecipes(mealType)
  const { data: savedRecipes } = useSavedRecipes()
  const generate = useGenerateRecipes()

  const totals = sumMealTotals(mealLogs ?? [])
  const remainingKcal = Math.max(0, Math.round((profile?.daily_calorie_goal ?? 0) - totals.kcal))
  const remainingProteinG = Math.max(0, Math.round((profile?.protein_goal_g ?? 0) - totals.proteinG))
  const savedIdByRecipeId = new Map((savedRecipes ?? []).map((saved) => [saved.recipe.id, saved.id]))
  const isGeneratingThis = generate.isPending && generate.variables?.mealType === mealType
  const hasRecipes = (recipes?.length ?? 0) > 0

  function toggleQuickWish(wish: string) {
    setQuickWishes((current) => (current.includes(wish) ? current.filter((w) => w !== wish) : [...current, wish]))
  }

  function handleGenerate() {
    if (!profile) return
    const wish = [wishText.trim(), ...quickWishes].filter(Boolean).join(', ')
    generate.mutate({
      mealType,
      dietaryPreference: profile.dietary_preference,
      wish: wish || undefined,
      remaining: fitToday ? { kcal: remainingKcal, proteinG: remainingProteinG } : undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
          <ChefHat size={20} /> Recept
        </h1>
        <p className="text-sm text-ink-secondary">Proteinrika och enkla recept för inspiration till nästa måltid.</p>
      </div>

      <SegmentedControl options={MEAL_TYPE_OPTIONS} value={mealType} onChange={setMealType} />

      <Card className="space-y-4">
        <label className="block text-sm text-ink-secondary">
          Önskemål (valfritt)
          <input
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            placeholder="t.ex. lax, något krämigt, utan mjölk"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {QUICK_WISHES.map((wish) => {
            const active = quickWishes.includes(wish)
            return (
              <button
                key={wish}
                onClick={() => toggleQuickWish(wish)}
                aria-pressed={active}
                className={`press rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-secondary'
                }`}
              >
                {wish}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink-primary">Anpassa efter dagens mål</p>
            <p className="text-xs text-ink-secondary">
              {remainingKcal} kcal och {remainingProteinG} g protein kvar idag
            </p>
          </div>
          <Switch checked={fitToday} onChange={setFitToday} label="Anpassa efter dagens mål" />
        </div>

        <Button className="flex w-full items-center justify-center gap-1.5" disabled={!profile || generate.isPending} onClick={handleGenerate}>
          {hasRecipes ? <RefreshCw size={16} /> : <Sparkles size={16} />}
          {hasRecipes ? 'Nya förslag' : 'Ge mig recept'}
        </Button>
      </Card>

      {isGeneratingThis && (
        <div className="space-y-2 py-6 text-center">
          <Spinner />
          <p className="text-sm text-ink-secondary">Kocken skriver recept… det tar en halv minut.</p>
        </div>
      )}

      {generate.isError && generate.variables?.mealType === mealType && (
        <div className="space-y-1 text-center">
          <p className="text-sm text-warning">Kunde inte ta fram recept, försök igen.</p>
          <p className="text-xs text-ink-secondary">{generate.error.message}</p>
        </div>
      )}

      {hasRecipes && !isGeneratingThis && (
        <div className="space-y-3">
          {recipes!.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              saved={savedIdByRecipeId.has(recipe.id)}
              onOpen={() => setOpenRecipe(recipe)}
            />
          ))}
        </div>
      )}

      <section className="space-y-3 pt-2">
        <h2 className="font-display text-base font-semibold text-ink-primary">Sparade recept</h2>
        {savedRecipes && savedRecipes.length > 0 ? (
          savedRecipes.map((saved) => (
            <RecipeCard key={saved.id} recipe={saved.recipe} saved onOpen={() => setOpenRecipe(saved.recipe)} />
          ))
        ) : (
          <p className="text-sm text-ink-secondary">Spara recept du gillar så hittar du dem här.</p>
        )}
      </section>

      {openRecipe && (
        <RecipeDetailSheet
          recipe={openRecipe}
          savedRecipeId={savedIdByRecipeId.get(openRecipe.id) ?? null}
          onClose={() => setOpenRecipe(null)}
        />
      )}
    </div>
  )
}
