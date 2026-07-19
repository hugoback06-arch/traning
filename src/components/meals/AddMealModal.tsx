import { useState } from 'react'
import { Card } from '../common/Card'
import { AddMealSearchStep } from './AddMealSearchStep'
import { AddMealScanStep } from './AddMealScanStep'
import { AddMealPhotoStep } from './AddMealPhotoStep'
import { MEAL_TYPE_LABELS } from '../../lib/mealTypeLabels'
import type { MealType } from '../../types/domain'

type Mode = 'choose' | 'search' | 'scan' | 'photo'

interface AddMealModalProps {
  mealType: MealType
  onClose: () => void
}

export function AddMealModal({ mealType, onClose }: AddMealModalProps) {
  const [mode, setMode] = useState<Mode>('choose')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Stäng" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-primary">
            Lägg till i {MEAL_TYPE_LABELS[mealType].toLowerCase()}
          </h2>
          <button onClick={onClose} aria-label="Stäng" className="text-lg leading-none text-ink-secondary">
            ✕
          </button>
        </div>

        {mode === 'choose' && (
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setMode('search')}>
              <Card className="flex flex-col items-center gap-1 py-4 text-center">
                <span className="text-sm font-medium">Sök</span>
              </Card>
            </button>
            <button onClick={() => setMode('scan')}>
              <Card className="flex flex-col items-center gap-1 py-4 text-center">
                <span className="text-sm font-medium">Skanna</span>
              </Card>
            </button>
            <button onClick={() => setMode('photo')}>
              <Card className="flex flex-col items-center gap-1 py-4 text-center">
                <span className="text-sm font-medium">Foto</span>
              </Card>
            </button>
          </div>
        )}

        {mode === 'search' && (
          <AddMealSearchStep initialMealType={mealType} onBack={() => setMode('choose')} onSaved={onClose} />
        )}
        {mode === 'scan' && (
          <AddMealScanStep initialMealType={mealType} onBack={() => setMode('choose')} onSaved={onClose} />
        )}
        {mode === 'photo' && (
          <AddMealPhotoStep initialMealType={mealType} onBack={() => setMode('choose')} onSaved={onClose} />
        )}
      </div>
    </div>
  )
}
