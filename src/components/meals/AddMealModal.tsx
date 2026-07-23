import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Card } from '../common/Card'
import { AddMealSearchStep } from './AddMealSearchStep'
import { AddMealScanStep } from './AddMealScanStep'
import { AddMealPhotoStep } from './AddMealPhotoStep'
import { AddMealTextStep } from './AddMealTextStep'
import { LogMealForm } from './LogMealForm'
import { QuickFoodPicks } from './QuickFoodPicks'
import { SavedMealPicks } from './SavedMealPicks'
import { SavedMealBuilder } from './SavedMealBuilder'
import { SavedMealConfirmStep } from './SavedMealConfirmStep'
import { MEAL_TYPE_LABELS } from '../../lib/mealTypeLabels'
import type { FoodSearchResult, MealType, SavedMealWithItems } from '../../types/domain'

type Mode = 'choose' | 'search' | 'scan' | 'photo' | 'text' | 'quick' | 'savedMealBuilder' | 'savedMealConfirm'

interface AddMealModalProps {
  mealType: MealType
  onClose: () => void
}

export function AddMealModal({ mealType, onClose }: AddMealModalProps) {
  const [mode, setMode] = useState<Mode>('choose')
  const [quickResult, setQuickResult] = useState<FoodSearchResult | null>(null)
  const [confirmingSavedMeal, setConfirmingSavedMeal] = useState<SavedMealWithItems | null>(null)

  function openQuick(result: FoodSearchResult) {
    setQuickResult(result)
    setMode('quick')
  }

  function openSavedMeal(savedMeal: SavedMealWithItems) {
    setConfirmingSavedMeal(savedMeal)
    setMode('savedMealConfirm')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Stäng" onClick={onClose} className="backdrop-in absolute inset-0 bg-black/40" />
      <div className="sheet-up relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-primary">
            Lägg till i {MEAL_TYPE_LABELS[mealType].toLowerCase()}
          </h2>
          <button onClick={onClose} aria-label="Stäng" className="press text-ink-secondary">
            <X size={20} />
          </button>
        </div>

        {mode === 'choose' && (
          <div className="space-y-4">
            <QuickFoodPicks onSelect={openQuick} />
            <SavedMealPicks onSelect={openSavedMeal} />
            <button
              className="press flex w-full items-center gap-1 text-left text-sm text-accent"
              onClick={() => setMode('savedMealBuilder')}
            >
              <Plus size={16} /> Ny sparad måltid
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="press" onClick={() => setMode('search')}>
                <Card className="flex flex-col items-center gap-1 py-4 text-center">
                  <span className="text-sm font-medium">Sök</span>
                </Card>
              </button>
              <button className="press" onClick={() => setMode('scan')}>
                <Card className="flex flex-col items-center gap-1 py-4 text-center">
                  <span className="text-sm font-medium">Skanna</span>
                </Card>
              </button>
              <button className="press" onClick={() => setMode('photo')}>
                <Card className="flex flex-col items-center gap-1 py-4 text-center">
                  <span className="text-sm font-medium">Foto</span>
                </Card>
              </button>
              <button className="press" onClick={() => setMode('text')}>
                <Card className="flex flex-col items-center gap-1 py-4 text-center">
                  <span className="text-sm font-medium">Beskriv</span>
                </Card>
              </button>
            </div>
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
        {mode === 'text' && (
          <AddMealTextStep initialMealType={mealType} onBack={() => setMode('choose')} onSaved={onClose} />
        )}
        {mode === 'quick' && quickResult && (
          <LogMealForm
            foodResult={quickResult}
            initialMealType={mealType}
            onBack={() => setMode('choose')}
            onSaved={onClose}
          />
        )}
        {mode === 'savedMealBuilder' && (
          <SavedMealBuilder onBack={() => setMode('choose')} onSaved={onClose} />
        )}
        {mode === 'savedMealConfirm' && confirmingSavedMeal && (
          <SavedMealConfirmStep
            savedMeal={confirmingSavedMeal}
            initialMealType={mealType}
            onBack={() => setMode('choose')}
            onSaved={onClose}
          />
        )}
      </div>
    </div>
  )
}
