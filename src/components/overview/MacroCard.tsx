import { Card } from '../common/Card'

type MacroKind = 'protein' | 'carbs' | 'fat'

const DOT_CLASS: Record<MacroKind, string> = {
  protein: 'bg-macro-protein',
  carbs: 'bg-macro-carbs',
  fat: 'bg-macro-fat',
}

const BAR_CLASS: Record<MacroKind, string> = {
  protein: 'bg-macro-protein',
  carbs: 'bg-macro-carbs',
  fat: 'bg-macro-fat',
}

interface MacroCardProps {
  kind: MacroKind
  label: string
  eatenG: number
  goalG: number
}

export function MacroCard({ kind, label, eatenG, goalG }: MacroCardProps) {
  const fraction = goalG > 0 ? Math.min(eatenG / goalG, 1) : 0

  return (
    <Card className="flex-1">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${DOT_CLASS[kind]}`} />
        <span className="text-xs text-ink-secondary">{label}</span>
      </div>
      <p className="font-display mt-1 text-xl font-semibold text-ink-primary">
        {Math.round(eatenG)}
        <span className="text-sm font-normal text-ink-secondary">g</span>
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full ${BAR_CLASS[kind]}`} style={{ width: `${fraction * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-ink-secondary">av {Math.round(goalG)}g</p>
    </Card>
  )
}
