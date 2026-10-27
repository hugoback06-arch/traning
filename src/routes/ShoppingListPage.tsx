import { Check, ShoppingCart } from 'lucide-react'
import { Card } from '../components/common/Card'
import { BackButton } from '../components/common/BackButton'
import { Button } from '../components/common/Button'
import { Spinner } from '../components/common/Spinner'
import {
  useDeleteShoppingItems,
  useSetShoppingItemsChecked,
  useShoppingList,
  type ShoppingListItem,
} from '../hooks/useShoppingList'

interface ShoppingGroup {
  key: string
  name: string
  amounts: string[]
  recipes: string[]
  ids: string[]
  checked: boolean
}

// The same ingredient from several recipes becomes one row ("Kycklingbröst ·
// 400 g + 300 g"). Amounts are free text, so they're listed rather than summed.
function groupItems(items: ShoppingListItem[]): ShoppingGroup[] {
  const groups = new Map<string, ShoppingGroup>()
  for (const item of items) {
    const key = item.name.trim().toLowerCase()
    const group = groups.get(key) ?? { key, name: item.name.trim(), amounts: [], recipes: [], ids: [], checked: true }
    if (item.amount.trim()) group.amounts.push(item.amount.trim())
    if (item.recipe_title && !group.recipes.includes(item.recipe_title)) group.recipes.push(item.recipe_title)
    group.ids.push(item.id)
    group.checked = group.checked && item.checked
    groups.set(key, group)
  }
  // Unchecked first, otherwise in the order they were added.
  return Array.from(groups.values()).sort((a, b) => Number(a.checked) - Number(b.checked))
}

export function ShoppingListPage() {
  const { data: items, isLoading } = useShoppingList()
  const setChecked = useSetShoppingItemsChecked()
  const deleteItems = useDeleteShoppingItems()

  const groups = groupItems(items ?? [])
  const checkedIds = (items ?? []).filter((item) => item.checked).map((item) => item.id)

  function clearAll() {
    if (!items || !confirm('Töm hela inköpslistan?')) return
    deleteItems.mutate(items.map((item) => item.id))
  }

  return (
    <div className="space-y-4">
      <div>
        <BackButton to="/recipes" label="Recept" />
        <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
          <ShoppingCart size={20} /> Inköpslista
        </h1>
      </div>

      {isLoading ? (
        <Spinner />
      ) : groups.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-secondary">
            Listan är tom. Öppna ett recept och tryck på "Lägg i inköpslistan" så hamnar ingredienserna här.
          </p>
        </Card>
      ) : (
        <>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {groups.map((group) => (
              <li key={group.key}>
                <button
                  onClick={() => setChecked.mutate({ ids: group.ids, checked: !group.checked })}
                  aria-pressed={group.checked}
                  className="press flex w-full items-start gap-3 px-3 py-2.5 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      group.checked ? 'border-accent bg-accent text-white' : 'border-border'
                    }`}
                  >
                    {group.checked && <Check size={14} />}
                  </span>
                  <span className={`min-w-0 flex-1 ${group.checked ? 'text-ink-secondary line-through' : ''}`}>
                    <span className="block text-sm text-ink-primary">
                      {group.name}
                      {group.amounts.length > 0 && (
                        <span className="text-ink-secondary"> · {group.amounts.join(' + ')}</span>
                      )}
                    </span>
                    {group.recipes.length > 0 && (
                      <span className="block truncate text-xs text-ink-secondary">{group.recipes.join(', ')}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={checkedIds.length === 0 || deleteItems.isPending}
              onClick={() => deleteItems.mutate(checkedIds)}
            >
              Ta bort avbockade
            </Button>
            <Button variant="secondary" className="text-warning" disabled={deleteItems.isPending} onClick={clearAll}>
              Töm listan
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
