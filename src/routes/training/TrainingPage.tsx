import { useState } from 'react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../../components/common/Card'
import { ActivityIcon } from '../../components/training/ActivityIcon'
import { TrainingStatusCard } from '../../components/training/TrainingStatusCard'
import { WeekView } from '../../components/training/WeekView'
import { WorkoutDetailSheet } from '../../components/training/WorkoutDetailSheet'
import type { DetailTarget } from '../../components/training/WorkoutDetailSheet'
import { useTrainingForDate } from '../../hooks/useTrainingForDate'
import { useFitnessConnection } from '../../hooks/useFitnessConnection'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDuration } from '../../lib/formatWorkout'

export function TrainingPage() {
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)
  const { secondaryWorkouts } = useTrainingForDate()
  const { data: stravaConnection } = useFitnessConnection('strava')

  return (
    <div className="space-y-4">
      <h1 className="font-display text-lg font-semibold">🏋️ Träning</h1>

      <TrainingStatusCard onSelect={setDetailTarget} />

      {secondaryWorkouts.map((workout) => (
        <button
          key={workout.id}
          onClick={() => setDetailTarget({ type: 'workout', workoutId: workout.id })}
          className="press flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
        >
          <ActivityIcon type={workout.activity_type} size="sm" />
          <span className="text-sm text-ink-primary">
            Extra: {workout.title ?? ACTIVITY_LABELS[workout.activity_type]}
            {formatDuration(workout.duration_seconds) ? `, ${formatDuration(workout.duration_seconds)}` : ''}
          </span>
        </button>
      ))}

      <p className="text-center text-xs text-ink-secondary">
        {stravaConnection?.last_synced_at
          ? `Senaste synk från Strava: ${format(new Date(stravaConnection.last_synced_at), 'HH:mm', { locale: sv })}`
          : 'Ingen Strava-anslutning ännu'}
      </p>

      <WeekView onSelectDay={setDetailTarget} />

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

      {detailTarget && <WorkoutDetailSheet target={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}
