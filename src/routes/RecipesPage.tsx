import { useState } from 'react'
import { Link } from 'react-router'
import { ChefHat, RefreshCw, ShoppingCart, Sparkles } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Spinner } from '../components/common/Spinner'
import { Switch } from '../components/common/Switch'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { RecipeDetailSheet } from '../components/recipes/RecipeDetailSheet'
import { useProfile } from '../hooks/useProfile'
import { useTodayMealLogs } from '../hooks/useTodayMealLogs'
import { useShoppingList } from '../hooks/useShoppingList'
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

const RECIPE_NOUNS: Record<RecipeMealType, string> = {
  breakfast: 'frukostrecept',
  lunch: 'lunchrecept',
  dinner: 'middagsrecept',
}

const QUICK_WISHES = ['Snabbt, max 15 min', 'Matlåda', 'Ugnsrätt', 'Få ingredienser', 'Budget', 'Kyckling', 'Fisk', 'Vegetariskt']

const PANTRY_STORAGE_KEY = 'strikt.recipePantry'

function initialMealType(): RecipeMealType {
  const active = getActiveMealType()
  if (active !== 'snack') return active
  return new Date().getHours() < 14 ? 'lunch' : 'dinner'
}

function readPantry(): string {
  try {
    return localStorage.getItem(PANTRY_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function writePantry(value: string) {
  try {
    localStorage.setItem(PANTRY_STORAGE_KEY, value)
  } catch {
    // Remembering the pantry is only a convenience.
  }
}

export function RecipesPage() {
  const [mealType, setMealType] = useState<RecipeMealType>(initialMealType)
  const [wishText, setWishText] = useState('')
  const [quickWishes, setQuickWishes] = useState<string[]>([])
  const [pantry, setPantry] = useState(readPantry)
  const [fitToday, setFitToday] = useState(false)
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null)
  // Ids of the batch on screen when generation started, so the old batch can
  // be hidden until the first new recipe streams in.
  const [replacedIds, setReplacedIds] = useState<Set<string>>(new Set())

  const { data: profile } = useProfile()
  const { data: mealLogs } = useTodayMealLogs()
  const { data: recipes } = useGeneratedRecipes(mealType)
  const { data: savedRecipes } = useSavedRecipes()
  const { data: shoppingList } = useShoppingList()
  const generate = useGenerateRecipes()

  const totals = sumMealTotals(mealLogs ?? [])
  const remainingKcal = Math.max(0, Math.round((profile?.daily_calorie_goal ?? 0) - totals.kcal))
  const remainingProteinG = Math.max(0, Math.round((profile?.protein_goal_g ?? 0) - totals.proteinG))
  const savedIdByRecipeId = new Map((savedRecipes ?? []).map((saved) => [saved.recipe.id, saved.id]))
  const savedForMealType = (savedRecipes ?? []).filter((saved) => saved.recipe.meal_type === mealType)
  const recipeNoun = RECIPE_NOUNS[mealType]
  const uncheckedShoppingCount = (shoppingList ?? []).filter((item) => !item.checked).length

  const isGeneratingThis = generate.isPending && generate.variables?.mealType === mealType
  const visibleRecipes = (recipes ?? []).filter((recipe) => !(isGeneratingThis && replacedIds.has(recipe.id)))
  const hasRecipes = (recipes?.length ?? 0) > 0

  function toggleQuickWish(wish: string) {
    setQuickWishes((current) => (current.includes(wish) ? current.filter((w) => w !== wish) : [...current, wish]))
  }

  function handlePantryChange(value: string) {
    setPantry(value)
    writePantry(value)
  }

  function handleGenerate() {
    if (!profile) return
    const wish = [wishText.trim(), ...quickWishes].filter(Boolean).join(', ')
    setReplacedIds(new Set((recipes ?? []).map((recipe) => recipe.id)))
    generate.mutate({
      mealType,
      dietaryPreference: profile.dietary_preference,
      wish: wish || undefined,
      pantry: pantry.trim() || undefined,
      remaining: fitToday ? { kcal: remainingKcal, proteinG: remainingProteinG } : undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
            <ChefHat size={20} /> Recept
          </h1>
          <p className="text-sm text-ink-secondary">Proteinrika och enkla recept för inspiration till nästa måltid.</p>
        </div>
        <Link
          to="/recipes/shopping"
          aria-label="Inköpslista"
          className="press relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-primary"
        >
          <ShoppingCart size={18} />
          {uncheckedShoppingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
              {uncheckedShoppingCount}
            </span>
          )}
        </Link>
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

        <label className="block text-sm text-ink-secondary">
          Det här har jag hemma (valfritt)
          <textarea
            value={pantry}
            onChange={(e) => handlePantryChange(e.target.value)}
            rows={2}
            placeholder="t.ex. kycklingfilé, ris, broccoli, ägg, kvarg"
            className="mt-1 w-full resize-none rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
          />
          {pantry.trim() && (
            <span className="mt-1 flex items-center justify-between text-xs">
              <span>Recepten byggs på det du har hemma.</span>
              <button onClick={() => handlePantryChange('')} className="text-accent">
                Rensa
              </button>
            </span>
          )}
        </label>

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

      {generate.isError && generate.variables?.mealType === mealType && (
        <div className="space-y-1 text-center">
          <p className="text-sm text-warning">Kunde inte ta fram recept, försök igen.</p>
          <p className="text-xs text-ink-secondary">{generate.error.message}</p>
        </div>
      )}

      {visibleRecipes.length > 0 && (
        <div className="space-y-3">
          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              saved={savedIdByRecipeId.has(recipe.id)}
              onOpen={() => setOpenRecipe(recipe)}
            />
          ))}
        </div>
      )}

      {isGeneratingThis && (
        <div className="space-y-2 py-4 text-center">
          <Spinner />
          <p className="text-sm text-ink-secondary">
            {visibleRecipes.length === 0 ? 'Kocken skriver recept…' : 'Fler recept på väg…'}
          </p>
        </div>
      )}

      <section className="space-y-3 pt-2">
        <h2 className="font-display text-base font-semibold text-ink-primary">Sparade {recipeNoun}</h2>
        {savedForMealType.length > 0 ? (
          savedForMealType.map((saved) => (
            <RecipeCard key={saved.id} recipe={saved.recipe} saved onOpen={() => setOpenRecipe(saved.recipe)} />
          ))
        ) : (
          <p className="text-sm text-ink-secondary">Spara {recipeNoun} du gillar så hittar du dem här.</p>
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
