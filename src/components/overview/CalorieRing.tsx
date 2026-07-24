const SIZE = 200
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface CalorieRingProps {
  eatenKcal: number
  goalKcal: number
}

export function CalorieRing({ eatenKcal, goalKcal }: CalorieRingProps) {
  const overGoal = goalKcal > 0 && eatenKcal > goalKcal
  const fraction = goalKcal > 0 ? Math.min(eatenKcal / goalKcal, 1) : 0
  const remaining = Math.max(Math.round(goalKcal - eatenKcal), 0)
  const fillColor = overGoal ? 'var(--color-warning)' : 'var(--color-accent)'
  const trackColor = overGoal ? 'var(--color-warning-light)' : 'var(--color-accent-light)'

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={trackColor} strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={fillColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - (overGoal ? 1 : fraction))}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <span className="text-xs text-ink-secondary">{Math.round(eatenKcal)} kcal ätit</span>
        {overGoal ? (
          <span className="font-display text-4xl font-semibold text-warning">
            +{Math.round(eatenKcal - goalKcal)}
          </span>
        ) : (
          <span className="font-display text-5xl font-semibold text-ink-primary">{remaining}</span>
        )}
        <span className="text-xs text-ink-secondary">{overGoal ? 'kcal över mål' : 'kcal kvar'}</span>
      </div>
    </div>
  )
}
