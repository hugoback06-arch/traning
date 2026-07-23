import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Bot } from 'lucide-react'
import { AiPlanGenerator } from '../../components/training/AiPlanGenerator'
import { BackButton } from '../../components/common/BackButton'
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
      <BackButton to="/training" label="Träning" />
      <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Bot size={20} /> Schemabyggare
      </h1>
      <AiPlanGenerator />
      <PlanWeekSchedule onSelect={handleSelect} />
      {selectedSession && <WorkoutDetailSheet session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  )
}
