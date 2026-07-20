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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-semibold text-ink-primary">{Math.round(eatenKcal)}</span>
        <span className="mt-1 text-sm text-ink-secondary">
          {overGoal ? `${Math.round(eatenKcal - goalKcal)} kcal över mål` : `av ${Math.round(goalKcal)} kcal`}
        </span>
      </div>
    </div>
  )
}
