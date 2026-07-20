import { useAdjustTrainingPlan } from '../../hooks/useAdjustTrainingPlan'
import type { IntensityPreference } from '../../types/domain'

const OPTIONS: { value: IntensityPreference; label: string }[] = [
  { value: 'lower', label: 'För intensivt' },
  { value: 'as_planned', label: 'Lagom' },
  { value: 'higher', label: 'Vill ha mer' },
]

interface IntensityControlProps {
  trainingPlanId: string
  current: IntensityPreference
}

export function IntensityControl({ trainingPlanId, current }: IntensityControlProps) {
  const adjustPlan = useAdjustTrainingPlan()

  return (
    <div className="space-y-1">
      <div className="flex gap-1.5">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            disabled={adjustPlan.isPending}
            onClick={() => adjustPlan.mutate({ trainingPlanId, preference: option.value })}
            className={`flex-1 rounded-full border px-2 py-1 text-[11px] ${
              current === option.value
                ? 'border-accent bg-accent-light text-accent'
                : 'border-border text-ink-secondary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {adjustPlan.data && <p className="text-[11px] text-ink-secondary">{adjustPlan.data.note}</p>}
      {adjustPlan.isError && <p className="text-[11px] text-warning">Kunde inte justera schemat.</p>}
    </div>
  )
}
