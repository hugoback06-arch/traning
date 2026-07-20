import { ACTIVITY_BG_LIGHT_CLASS, ACTIVITY_ICONS } from '../../lib/activityTypes'
import type { PlanActivityType } from '../../types/domain'

interface ActivityIconProps {
  type: PlanActivityType
  size?: 'sm' | 'md'
}

const SIZE_CLASS: Record<NonNullable<ActivityIconProps['size']>, string> = {
  sm: 'h-7 w-7 text-sm',
  md: 'h-10 w-10 text-lg',
}

export function ActivityIcon({ type, size = 'md' }: ActivityIconProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${SIZE_CLASS[size]} ${ACTIVITY_BG_LIGHT_CLASS[type]}`}
    >
      {ACTIVITY_ICONS[type]}
    </span>
  )
}
