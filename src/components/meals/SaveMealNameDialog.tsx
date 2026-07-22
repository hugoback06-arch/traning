import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useSaveMeal } from '../../hooks/useSaveMeal'

interface SaveMealNameDialogProps {
  items: { foodItemId: string; amountG: number }[]
  totalKcal: number
  onClose: () => void
  onSaved: () => void
}

export function SaveMealNameDialog({ items, totalKcal, onClose, onSaved }: SaveMealNameDialogProps) {
  const [name, setName] = useState('')
  const saveMeal = useSaveMeal()

  async function handleSave() {
    await saveMeal.mutateAsync({ name: name.trim(), items })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Stäng" onClick={onClose} className="backdrop-in absolute inset-0 bg-black/40" />
      <div className="sheet-up relative z-10 w-full max-w-md rounded-t-2xl bg-surface p-4 pb-8">
        <Card className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink-primary">Spara som måltid</h2>
            <p className="text-sm text-ink-secondary">
              {items.length} livsmedel · {Math.round(totalKcal)} kcal
            </p>
          </div>
          <div>
            <label className="block text-sm text-ink-secondary">Namn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="T.ex. Min vanliga frukost"
              autoFocus
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          {saveMeal.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Avbryt
            </Button>
            <Button className="flex-1" disabled={!name.trim() || saveMeal.isPending} onClick={handleSave}>
              {saveMeal.isPending ? 'Sparar…' : 'Spara'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
