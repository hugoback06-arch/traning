import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from '../common/Card'
import { BackButton } from '../common/BackButton'
import { Button } from '../common/Button'
import { FoodSearchList } from './FoodSearchList'
import { AmountInput } from './AmountInput'
import { useSaveMealFromSearchResults } from '../../hooks/useSaveMealFromSearchResults'
import type { FoodSearchResult } from '../../types/domain'

interface SavedMealBuilderProps {
  onBack: () => void
  onSaved: () => void
}

interface CartItem {
  foodResult: FoodSearchResult
  amountG: number
}

export function SavedMealBuilder({ onBack, onSaved }: SavedMealBuilderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [query, setQuery] = useState('')
  const [pendingResult, setPendingResult] = useState<FoodSearchResult | null>(null)
  const [pendingAmount, setPendingAmount] = useState(100)
  const [name, setName] = useState('')
  const saveMeal = useSaveMealFromSearchResults()

  const totalKcal = items.reduce((sum, item) => sum + (item.foodResult.caloriesPer100g * item.amountG) / 100, 0)

  function handlePickResult(result: FoodSearchResult) {
    setPendingResult(result)
    setPendingAmount(result.portionG ?? 100)
  }

  function handleAddToCart() {
    if (!pendingResult) return
    setItems((prev) => [...prev, { foodResult: pendingResult, amountG: pendingAmount }])
    setPendingResult(null)
    setQuery('')
  }

  function handleRemove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    await saveMeal.mutateAsync({ name: name.trim(), items })
    onSaved()
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />

      {pendingResult ? (
        <Card className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink-primary">{pendingResult.name}</h2>
            {pendingResult.brand && <p className="text-sm text-ink-secondary">{pendingResult.brand}</p>}
          </div>
          <AmountInput
            value={pendingAmount}
            onChange={setPendingAmount}
            portionG={pendingResult.portionG}
            portionUnit={pendingResult.portionUnit}
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPendingResult(null)}>
              Avbryt
            </Button>
            <Button className="flex-1" onClick={handleAddToCart}>
              Lägg till
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <input
            type="text"
            placeholder="Sök på namn…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <FoodSearchList query={query} onSelect={handlePickResult} />
        </>
      )}

      {items.length > 0 && (
        <Card className="space-y-2">
          <p className="text-xs font-medium text-ink-secondary">Måltiden hittills</p>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate text-ink-primary">
                  {item.foodResult.name} · {item.amountG} g
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-ink-secondary">
                    {Math.round((item.foodResult.caloriesPer100g * item.amountG) / 100)} kcal
                  </span>
                  <button aria-label="Ta bort" onClick={() => handleRemove(index)} className="text-ink-secondary">
                    <X size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium text-ink-primary">≈ {Math.round(totalKcal)} kcal totalt</p>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="space-y-3">
          <div>
            <label className="block text-sm text-ink-secondary">Namn på måltiden</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="T.ex. Min vanliga frukost"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          {saveMeal.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
          <Button className="w-full" disabled={!name.trim() || saveMeal.isPending} onClick={handleSave}>
            {saveMeal.isPending ? 'Sparar…' : 'Spara måltid'}
          </Button>
        </Card>
      )}
    </div>
  )
}
