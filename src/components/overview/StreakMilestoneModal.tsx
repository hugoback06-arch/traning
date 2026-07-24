import { Flame, X } from 'lucide-react'
import { Button } from '../common/Button'

interface StreakMilestoneModalProps {
  days: number
  onClose: () => void
}

export function StreakMilestoneModal({ days, onClose }: StreakMilestoneModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Stäng" onClick={onClose} className="backdrop-in absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-full max-w-xs space-y-3 rounded-2xl bg-surface p-6 text-center">
        <button onClick={onClose} aria-label="Stäng" className="press absolute right-3 top-3 text-ink-secondary">
          <X size={18} />
        </button>
        <Flame size={40} className="mx-auto text-accent" />
        <h2 className="font-display text-2xl font-semibold text-ink-primary">{days} dagar i rad!</h2>
        <p className="text-sm text-ink-secondary">Grym konsekvens — fortsätt så.</p>
        <Button className="w-full" onClick={onClose}>
          Nice!
        </Button>
      </div>
    </div>
  )
}
