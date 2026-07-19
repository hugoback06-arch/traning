import { useQuery } from '@tanstack/react-query'
import { searchFoodItems } from '../../lib/openFoodFacts'
import { searchGenericFoods } from '../../lib/genericFoods'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { Spinner } from '../common/Spinner'
import type { FoodSearchResult } from '../../types/domain'

interface FoodSearchListProps {
  query: string
  onSelect: (result: FoodSearchResult) => void
}

function ResultRow({ result, onSelect }: { result: FoodSearchResult; onSelect: (r: FoodSearchResult) => void }) {
  return (
    <li>
      <button
        onClick={() => onSelect(result)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink-primary">{result.name}</span>
          {result.brand && <span className="block truncate text-xs text-ink-secondary">{result.brand}</span>}
        </span>
        <span className="shrink-0 pl-2 text-xs text-ink-secondary">
          {Math.round(result.caloriesPer100g)} kcal/100g
        </span>
      </button>
    </li>
  )
}

export function FoodSearchList({ query, onSelect }: FoodSearchListProps) {
  const debouncedQuery = useDebouncedValue(query.trim(), 400)
  const genericResults = searchGenericFoods(debouncedQuery)

  const {
    data: offResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['off-search', debouncedQuery],
    queryFn: () => searchFoodItems(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  if (debouncedQuery.length < 2) return null

  const hasOffResults = !!offResults && offResults.length > 0
  const hasAnyResults = genericResults.length > 0 || hasOffResults

  return (
    <div className="space-y-4">
      {genericResults.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-secondary">Vanliga livsmedel</p>
          <ul className="space-y-2">
            {genericResults.map((result) => (
              <ResultRow key={result.externalId} result={result} onSelect={onSelect} />
            ))}
          </ul>
        </div>
      )}

      <div>
        {genericResults.length > 0 && (isLoading || hasOffResults) && (
          <p className="mb-1.5 text-xs font-medium text-ink-secondary">Sökresultat</p>
        )}
        {isLoading && <Spinner />}
        {isError && <p className="text-sm text-warning">Sökningen misslyckades, försök igen.</p>}
        {!isLoading && !isError && hasOffResults && (
          <ul className="space-y-2">
            {(offResults ?? []).map((result) => (
              <ResultRow key={result.externalId} result={result} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </div>

      {!isLoading && !hasAnyResults && <p className="text-sm text-ink-secondary">Inga träffar.</p>}
    </div>
  )
}
