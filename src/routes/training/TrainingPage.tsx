import { useState } from 'react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../../components/common/Card'
import { TrainingStatusCard } from '../../components/training/TrainingStatusCard'
import { WorkoutSummaryCard } from '../../components/training/WorkoutSummaryCard'
import { WeekView } from '../../components/training/WeekView'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'
import { useTrainingForDate } from '../../hooks/useTrainingForDate'
import { useFitnessConnection } from '../../hooks/useFitnessConnection'

export function TrainingPage() {
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)
  const { secondaryWorkouts } = useTrainingForDate()
  const { data: stravaConnection } = useFitnessConnection('strava')

  return (
    <div className="space-y-4">
      <h1 className="font-display text-lg font-semibold">🏋️ Träning</h1>

      <TrainingStatusCard onSelect={setDetailTarget} />

      {secondaryWorkouts.map((workout) => (
        <WorkoutSummaryCard
          key={workout.id}
          workout={workout}
          onClick={() => setDetailTarget({ type: 'workout', workoutId: workout.id })}
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
              <p className="text-sm font-medium text-ink-primary">🤖 Schemabyggare</p>
              <p className="mt-0.5 text-xs text-ink-secondary">Generera/uppdatera schema</p>
            </div>
            <span className="text-ink-secondary">→</span>
          </Card>
        </Link>
        <Link to="/training/history" className="press block">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary">📜 Historik</p>
              <p className="mt-0.5 text-xs text-ink-secondary">Tidigare pass</p>
            </div>
            <span className="text-ink-secondary">→</span>
          </Card>
        </Link>
      </div>

      <WeekView onSelectDay={setDetailTarget} />

      {detailTarget && <WorkoutDetailSheet target={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}
