import { Link } from 'react-router'

interface TrainingCalorieBadgeProps {
  extraKcal: number
}

export function TrainingCalorieBadge({ extraKcal }: TrainingCalorieBadgeProps) {
  return (
    <Link
      to="/training"
      className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium whitespace-nowrap text-accent"
    >
      +{extraKcal} kcal (träning)
    </Link>
  )
}
