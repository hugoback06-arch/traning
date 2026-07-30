import { useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { Spinner } from '../common/Spinner'
import { useSuggestMeals } from '../../hooks/useSuggestMeals'
import { useProfile } from '../../hooks/useProfile'

interface MealSuggestionsModalProps {
  remainingKcal: number
  remainingProteinG: number
  remainingCarbsG: number
  remainingFatG: number
  onClose: () => void
}

export function MealSuggestionsModal({
  remainingKcal,
  remainingProteinG,
  remainingCarbsG,
  remainingFatG,
  onClose,
}: MealSuggestionsModalProps) {
  const suggestMeals = useSuggestMeals()
  const { data: profile } = useProfile()

  useEffect(() => {
    if (!profile) return
    suggestMeals.mutate({
      remainingKcal,
      remainingProteinG,
      remainingCarbsG,
      remainingFatG,
      dietaryPreference: profile.dietary_preference,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Stäng" onClick={onClose} className="backdrop-in absolute inset-0 bg-black/40" />
      <div className="sheet-up relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-primary">Förslag på måltid</h2>
          <button onClick={onClose} aria-label="Stäng" className="press text-ink-secondary">
            <X size={20} />
          </button>
        </div>

        {(!profile || suggestMeals.isPending) && (
          <div className="py-8">
            <Spinner />
          </div>
        )}

        {suggestMeals.isError && (
          <p className="text-sm text-warning">Kunde inte ta fram förslag, försök igen.</p>
        )}

        {suggestMeals.data && (
          <div className="space-y-3">
            {suggestMeals.data.map((suggestion) => (
              <div key={suggestion.name} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink-primary">{suggestion.name}</p>
                  <span className="shrink-0 text-xs text-ink-secondary">
                    {Math.round(suggestion.kcal)} kcal · {Math.round(suggestion.protein_g)}g protein
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">{suggestion.description}</p>
                <a
                  href={suggestion.recipe_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-accent"
                >
                  Se recept <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
