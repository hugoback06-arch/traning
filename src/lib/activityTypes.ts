import { Activity, Bike, Dumbbell, Footprints, Moon, Waves, Zap, type LucideIcon } from 'lucide-react'
import type { PlanActivityType } from '../types/domain'

export const ACTIVITY_LABELS: Record<PlanActivityType, string> = {
  running: 'Löpning',
  cycling: 'Cykling',
  swimming: 'Simning',
  strength: 'Styrka',
  walking: 'Promenad',
  rest: 'Vila',
  other: 'Träning',
}

export const ACTIVITY_ICONS: Record<PlanActivityType, LucideIcon> = {
  running: Activity,
  cycling: Bike,
  swimming: Waves,
  strength: Dumbbell,
  walking: Footprints,
  rest: Moon,
  other: Zap,
}

// Full literal class names (not composed at runtime) so Tailwind's JIT scanner
// picks them up from this file's source text.
export const ACTIVITY_BG_CLASS: Record<PlanActivityType, string> = {
  running: 'bg-activity-running',
  cycling: 'bg-activity-cycling',
  swimming: 'bg-activity-swimming',
  strength: 'bg-activity-strength',
  walking: 'bg-activity-walking',
  rest: 'bg-activity-rest',
  other: 'bg-activity-other',
}

export const ACTIVITY_BG_LIGHT_CLASS: Record<PlanActivityType, string> = {
  running: 'bg-activity-running/15',
  cycling: 'bg-activity-cycling/15',
  swimming: 'bg-activity-swimming/15',
  strength: 'bg-activity-strength/15',
  walking: 'bg-activity-walking/15',
  rest: 'bg-activity-rest/15',
  other: 'bg-activity-other/15',
}

export const ACTIVITY_TEXT_CLASS: Record<PlanActivityType, string> = {
  running: 'text-activity-running',
  cycling: 'text-activity-cycling',
  swimming: 'text-activity-swimming',
  strength: 'text-activity-strength',
  walking: 'text-activity-walking',
  rest: 'text-activity-rest',
  other: 'text-activity-other',
}
