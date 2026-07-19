import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { GLASS_ML } from '../../lib/constants'

interface WaterCounterProps {
  currentMl: number
  goalMl: number
  onAdd?: () => void
  onRemove?: () => void
}

export function WaterCounter({ currentMl, goalMl, onAdd, onRemove }: WaterCounterProps) {
  const totalGlasses = Math.max(1, Math.round(goalMl / GLASS_ML))
  const filledGlasses = Math.min(totalGlasses, Math.round(currentMl / GLASS_ML))

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-primary">Vatten</p>
          <p className="text-xs text-ink-secondary">
            {currentMl} / {goalMl} ml
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="h-8 w-8 px-0 text-base leading-none"
            onClick={onRemove}
            disabled={currentMl <= 0}
            aria-label="Ta bort ett glas"
          >
            −
          </Button>
          <Button className="px-4" onClick={onAdd}>
            + Glas
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: totalGlasses }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border ${
              i < filledGlasses ? 'border-accent bg-accent' : 'border-border bg-surface'
            }`}
          />
        ))}
      </div>
    </Card>
  )
}
