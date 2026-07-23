import { useState } from 'react'
import { AiEstimateReviewForm } from './AiEstimateReviewForm'
import { BackButton } from '../common/BackButton'
import { Button } from '../common/Button'
import { Spinner } from '../common/Spinner'
import { useAnalyzeMealText } from '../../hooks/useAnalyzeMealText'
import type { MealType } from '../../types/domain'

interface AddMealTextStepProps {
  initialMealType: MealType
  onBack: () => void
  onSaved: () => void
}

export function AddMealTextStep({ initialMealType, onBack, onSaved }: AddMealTextStepProps) {
  const analyze = useAnalyzeMealText()
  const [description, setDescription] = useState('')
  const [showError, setShowError] = useState(false)

  async function handleSubmit() {
    if (!description.trim()) return
    setShowError(false)
    try {
      await analyze.mutateAsync(description.trim())
    } catch {
      setShowError(true)
    }
  }

  function reset() {
    analyze.reset()
    setShowError(false)
  }

  if (analyze.data) {
    return (
      <AiEstimateReviewForm
        estimate={analyze.data}
        source="ai_text_estimate"
        backLabel="Skriv ny beskrivning"
        initialMealType={initialMealType}
        onBack={reset}
        onSaved={onSaved}
      />
    )
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />

      <label className="block text-sm text-ink-secondary">
        Vad åt du?
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="T.ex. en skål havregrynsgröt med banan och honung"
          rows={3}
          disabled={analyze.isPending}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
        />
      </label>

      {analyze.isPending && <Spinner />}
      {!analyze.isPending && (
        <Button className="w-full" disabled={!description.trim()} onClick={handleSubmit}>
          Uppskatta kalorier
        </Button>
      )}

      {showError && (
        <div className="space-y-2 text-center">
          <p className="text-sm text-warning">
            Kunde inte tolka beskrivningen. Försök igen, eller använd sök/skanna/foto istället.
          </p>
          <Button variant="secondary" onClick={reset}>
            Försök igen
          </Button>
        </div>
      )}
    </div>
  )
}
