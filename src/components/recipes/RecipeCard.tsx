import { BookmarkCheck, Clock } from 'lucide-react'
import type { Recipe } from '../../hooks/useRecipes'

interface RecipeCardProps {
  recipe: Recipe
  saved?: boolean
  onOpen: () => void
}

export function RecipeCard({ recipe, saved = false, onOpen }: RecipeCardProps) {
  return (
    <button
      onClick={onOpen}
      className="press block w-full rounded-2xl border border-border bg-surface p-4 text-left shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-base font-semibold text-ink-primary">{recipe.title}</p>
        {saved && <BookmarkCheck size={18} className="shrink-0 text-accent" aria-label="Sparat" />}
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">{recipe.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
        <span className="flex items-center gap-1">
          <Clock size={13} /> {recipe.time_minutes} min
        </span>
        <span>{Math.round(recipe.per_serving.calories)} kcal</span>
        <span className="flex items-center gap-1 font-medium text-ink-primary">
          <span className="h-2 w-2 rounded-full bg-macro-protein" />
          {Math.round(recipe.per_serving.protein_g)} g protein
        </span>
        <span>per portion</span>
      </div>
    </button>
  )
}
