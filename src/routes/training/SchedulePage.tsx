import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AiPlanGenerator } from '../../components/training/AiPlanGenerator'
import { PlanWeekSchedule } from '../../components/training/PlanWeekSchedule'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'
import type { TrainingPlanSession } from '../../types/domain'

export function SchedulePage() {
  const navigate = useNavigate()
  const [selectedSession, setSelectedSession] = useState<TrainingPlanSession | null>(null)

  function handleSelect(target: DetailTarget) {
    if (target.type === 'workout') navigate(`/training/workout/${target.workoutId}`)
    else setSelectedSession(target.session)
  }

  return (
    <div className="space-y-4">
      <Link to="/training" className="text-sm text-ink-secondary">
        ← Träning
      </Link>
      <h1 className="font-display text-lg font-semibold">🤖 Schemabyggare</h1>
      <AiPlanGenerator />
      <PlanWeekSchedule onSelect={handleSelect} />
      {selectedSession && <WorkoutDetailSheet session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  )
}
