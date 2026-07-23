import { ACTIVITY_BG_LIGHT_CLASS, ACTIVITY_ICONS, ACTIVITY_TEXT_CLASS } from '../../lib/activityTypes'
import type { PlanActivityType } from '../../types/domain'

interface ActivityIconProps {
  type: PlanActivityType
  size?: 'sm' | 'md'
}

const SIZE_CLASS: Record<NonNullable<ActivityIconProps['size']>, string> = {
  sm: 'h-7 w-7',
  md: 'h-10 w-10',
}

const ICON_SIZE_PX: Record<NonNullable<ActivityIconProps['size']>, number> = {
  sm: 15,
  md: 20,
}

export function ActivityIcon({ type, size = 'md' }: ActivityIconProps) {
  const Icon = ACTIVITY_ICONS[type]
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${SIZE_CLASS[size]} ${ACTIVITY_BG_LIGHT_CLASS[type]} ${ACTIVITY_TEXT_CLASS[type]}`}
    >
      <Icon size={ICON_SIZE_PX[size]} strokeWidth={2} />
    </span>
  )
}
