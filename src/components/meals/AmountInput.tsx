const GRAM_PRESETS = [50, 100, 150, 200]

const PORTION_MULTIPLIERS: Record<'portion' | 'st', number[]> = {
  portion: [0.5, 1, 1.5, 2],
  st: [1, 2, 3],
}

function portionLabel(multiplier: number, unit: 'portion' | 'st'): string {
  if (unit === 'st') return `${multiplier} st`
  if (multiplier === 0.5) return '½ portion'
  if (multiplier === 1) return '1 portion'
  return `${multiplier} portioner`
}

interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  portionG?: number | null
  portionUnit?: 'portion' | 'st'
}

export function AmountInput({ value, onChange, portionG, portionUnit = 'portion' }: AmountInputProps) {
  return (
    <div className="space-y-3">
      {portionG && (
        <div>
          <label className="block text-sm text-ink-secondary">Portion</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {PORTION_MULTIPLIERS[portionUnit].map((multiplier) => {
              const grams = Math.round(portionG * multiplier)
              return (
                <button
                  key={multiplier}
                  onClick={() => onChange(grams)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    value === grams ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-secondary'
                  }`}
                >
                  {portionLabel(multiplier, portionUnit)}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm text-ink-secondary">Mängd (gram)</label>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="mt-2 flex gap-2">
          {GRAM_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`rounded-full border px-3 py-1 text-xs ${
                value === preset ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-secondary'
              }`}
            >
              {preset}g
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
