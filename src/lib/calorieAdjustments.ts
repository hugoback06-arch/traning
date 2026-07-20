import type { CalorieAdjustment } from '../types/domain'

export function sumExtraKcal(adjustments: CalorieAdjustment[]): number {
  return adjustments.reduce((sum, a) => sum + a.extra_kcal, 0)
}
