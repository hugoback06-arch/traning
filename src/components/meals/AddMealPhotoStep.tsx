import { useState } from 'react'
import { PhotoCapture } from './PhotoCapture'
import { AiEstimateReviewForm } from './AiEstimateReviewForm'
import { BackButton } from '../common/BackButton'
import { Button } from '../common/Button'
import { Spinner } from '../common/Spinner'
import { useAnalyzeMealPhoto } from '../../hooks/useAnalyzeMealPhoto'
import type { MealType } from '../../types/domain'

interface AddMealPhotoStepProps {
  initialMealType: MealType
  onBack: () => void
  onSaved: () => void
}

export function AddMealPhotoStep({ initialMealType, onBack, onSaved }: AddMealPhotoStepProps) {
  const analyze = useAnalyzeMealPhoto()
  const [showError, setShowError] = useState(false)

  async function handleCapture(file: File, description?: string) {
    setShowError(false)
    try {
      await analyze.mutateAsync({ file, description })
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
      <AiEstimateReviewForm estimate={analyze.data} initialMealType={initialMealType} onBack={reset} onSaved={onSaved} />
    )
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />

      {analyze.isPending && <Spinner />}
      {!analyze.isPending && <PhotoCapture onCapture={handleCapture} />}

      {showError && (
        <div className="space-y-2 text-center">
          <p className="text-sm text-warning">
            Kunde inte analysera bilden. Försök igen, eller använd sök/skanna istället.
          </p>
          <Button variant="secondary" onClick={reset}>
            Försök igen
          </Button>
        </div>
      )}
    </div>
  )
}
