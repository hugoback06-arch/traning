import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Card } from '../components/common/Card'
import { BackButton } from '../components/common/BackButton'
import { Spinner } from '../components/common/Spinner'
import { useSavedMeals } from '../hooks/useSavedMeals'
import { useRenameSavedMeal } from '../hooks/useRenameSavedMeal'
import { useDeleteSavedMeal } from '../hooks/useDeleteSavedMeal'
import { sumSavedMealKcal } from '../lib/savedMeals'
import type { SavedMealWithItems } from '../types/domain'

function SavedMealRow({ savedMeal }: { savedMeal: SavedMealWithItems }) {
  const [expanded, setExpanded] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const renameSavedMeal = useRenameSavedMeal()
  const deleteSavedMeal = useDeleteSavedMeal()

  const kcal = Math.round(sumSavedMealKcal(savedMeal.items))

  async function handleRename() {
    if (editingName === null) return
    const trimmed = editingName.trim()
    if (trimmed && trimmed !== savedMeal.name) {
      await renameSavedMeal.mutateAsync({ id: savedMeal.id, name: trimmed })
    }
    setEditingName(null)
  }

  async function handleDelete() {
    if (!confirm(`Ta bort "${savedMeal.name}"?`)) return
    await deleteSavedMeal.mutateAsync(savedMeal.id)
  }

  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {editingName !== null ? (
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={handleRename}
            autoFocus
            className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1 text-sm outline-none focus:border-accent"
          />
        ) : (
          <button onClick={() => setExpanded((v) => !v)} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-ink-primary">{savedMeal.name}</p>
            <p className="text-xs text-ink-secondary">
              {kcal} kcal · {savedMeal.items.length} livsmedel
            </p>
          </button>
        )}
        <button
          aria-label="Byt namn"
          onClick={() => setEditingName(savedMeal.name)}
          className="shrink-0 text-ink-secondary"
        >
          <Pencil size={15} />
        </button>
        <button
          aria-label="Ta bort"
          disabled={deleteSavedMeal.isPending}
          onClick={handleDelete}
          className="shrink-0 text-sm text-warning"
        >
          Ta bort
        </button>
      </div>
      {expanded && (
        <ul className="space-y-1 border-t border-border pt-2">
          {savedMeal.items.map((item) => (
            <li key={item.id} className="text-sm text-ink-secondary">
              {item.food_item.name} · {item.amount_g} g
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function SavedMealsPage() {
  const { data: savedMeals, isLoading } = useSavedMeals()

  return (
    <div className="space-y-4">
      <div>
        <BackButton to="/nutrition" label="Kost" />
        <h1 className="font-display text-lg font-semibold">Sparade måltider</h1>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !savedMeals || savedMeals.length === 0 ? (
        <p className="text-sm text-ink-secondary">
          Inga sparade måltider än. Bygg en från grunden eller spara en redan loggad måltid från dagsvyn.
        </p>
      ) : (
        <div className="space-y-2">
          {savedMeals.map((savedMeal) => (
            <SavedMealRow key={savedMeal.id} savedMeal={savedMeal} />
          ))}
        </div>
      )}
    </div>
  )
}
