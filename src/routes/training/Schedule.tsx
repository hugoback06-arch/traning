import { useState } from 'react'
import { AiPlanGenerator } from '../../components/training/AiPlanGenerator'
import { WeekView } from '../../components/training/WeekView'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'

export function Schedule() {
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Schema</h1>
      <AiPlanGenerator />
      <WeekView onSelectDay={setDetailTarget} />
      {detailTarget && <WorkoutDetailSheet target={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}
