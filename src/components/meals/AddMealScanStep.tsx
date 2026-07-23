import { useState } from 'react'
import { BarcodeScanner } from './BarcodeScanner'
import { LogMealForm } from './LogMealForm'
import { BackButton } from '../common/BackButton'
import { Button } from '../common/Button'
import { Spinner } from '../common/Spinner'
import { lookupBarcode } from '../../lib/openFoodFacts'
import type { FoodSearchResult, MealType } from '../../types/domain'

type LookupState = 'idle' | 'loading' | 'not-found' | 'error'

interface AddMealScanStepProps {
  initialMealType: MealType
  onBack: () => void
  onSaved: () => void
}

export function AddMealScanStep({ initialMealType, onBack, onSaved }: AddMealScanStepProps) {
  const [scanning, setScanning] = useState(true)
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [selected, setSelected] = useState<FoodSearchResult | null>(null)

  async function handleDetected(code: string) {
    setScanning(false)
    setLookupState('loading')
    try {
      const product = await lookupBarcode(code)
      if (!product) {
        setLookupState('not-found')
        return
      }
      setSelected(product)
      setLookupState('idle')
    } catch {
      setLookupState('error')
    }
  }

  function reset() {
    setSelected(null)
    setLookupState('idle')
    setScanning(true)
  }

  if (selected) {
    return (
      <LogMealForm foodResult={selected} initialMealType={initialMealType} onBack={reset} onSaved={onSaved} />
    )
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />

      {scanning && (
        <>
          <BarcodeScanner active={scanning} onDetected={handleDetected} />
          <p className="text-center text-xs text-ink-secondary">Rikta kameran mot streckkoden på förpackningen.</p>
        </>
      )}

      {lookupState === 'loading' && <Spinner />}

      {lookupState === 'not-found' && (
        <div className="space-y-2 text-center">
          <p className="text-sm text-ink-secondary">Hittade ingen produkt med den streckkoden.</p>
          <Button variant="secondary" onClick={reset}>
            Försök igen
          </Button>
        </div>
      )}

      {lookupState === 'error' && (
        <div className="space-y-2 text-center">
          <p className="text-sm text-warning">Något gick fel vid uppslagningen.</p>
          <Button variant="secondary" onClick={reset}>
            Försök igen
          </Button>
        </div>
      )}
    </div>
  )
}
