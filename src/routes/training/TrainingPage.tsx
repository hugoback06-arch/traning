import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Bot, ChevronRight, Dumbbell, History as HistoryIcon } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { TrainingStatusCard } from '../../components/training/TrainingStatusCard'
import { WorkoutSummaryCard } from '../../components/training/WorkoutSummaryCard'
import { WeekView } from '../../components/training/WeekView'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'
import { useTrainingForDate } from '../../hooks/useTrainingForDate'
import { useFitnessConnection } from '../../hooks/useFitnessConnection'
import type { TrainingPlanSession } from '../../types/domain'

export function TrainingPage() {
  const navigate = useNavigate()
  const [selectedSession, setSelectedSession] = useState<TrainingPlanSession | null>(null)
  const { secondaryWorkouts } = useTrainingForDate()
  const { data: stravaConnection } = useFitnessConnection('strava')

  function handleSelect(target: DetailTarget) {
    if (target.type === 'workout') navigate(`/training/workout/${target.workoutId}`)
    else setSelectedSession(target.session)
  }

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Dumbbell size={20} /> Träning
      </h1>

      <TrainingStatusCard onSelect={handleSelect} />

      {secondaryWorkouts.map((workout) => (
        <WorkoutSummaryCard
          key={workout.id}
          workout={workout}
          onClick={() => navigate(`/training/workout/${workout.id}`)}
        />
      ))}

      <p className="text-center text-xs text-ink-secondary">
        {stravaConnection?.last_synced_at
          ? `Senaste synk från Strava: ${format(new Date(stravaConnection.last_synced_at), 'HH:mm', { locale: sv })}`
          : 'Ingen Strava-anslutning ännu'}
      </p>

      <div className="space-y-2">
        <Link to="/training/schedule" className="press block">
          <Card className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                <Bot size={16} /> Schemabyggare
              </p>
              <p className="mt-0.5 text-xs text-ink-secondary">Generera/uppdatera schema</p>
            </div>
            <ChevronRight size={16} className="text-ink-secondary" />
          </Card>
        </Link>
        <Link to="/training/history" className="press block">
          <Card className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                <HistoryIcon size={16} /> Historik
              </p>
              <p className="mt-0.5 text-xs text-ink-secondary">Tidigare pass</p>
            </div>
            <ChevronRight size={16} className="text-ink-secondary" />
          </Card>
        </Link>
      </div>

      <WeekView onSelectDay={handleSelect} />

      {selectedSession && <WorkoutDetailSheet session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  )
}
