import { useState } from 'react'
import { Link } from 'react-router'
import { AiPlanGenerator } from '../../components/training/AiPlanGenerator'
import { PlanWeekSchedule } from '../../components/training/PlanWeekSchedule'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'

export function SchedulePage() {
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)

  return (
    <div className="space-y-4">
      <Link to="/training" className="text-sm text-ink-secondary">
        ← Träning
      </Link>
      <h1 className="font-display text-lg font-semibold">🤖 Schemabyggare</h1>
      <AiPlanGenerator />
      <PlanWeekSchedule onSelect={setDetailTarget} />
      {detailTarget && <WorkoutDetailSheet target={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}
