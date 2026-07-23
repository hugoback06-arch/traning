import { Check, X } from 'lucide-react'
import { Button } from '../common/Button'
import { ActivityIcon } from './ActivityIcon'
import { useCreateManualWorkout } from '../../hooks/useCreateManualWorkout'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { PlanActivityType, TrainingPlanSession } from '../../types/domain'

export type DetailTarget = { type: 'workout'; workoutId: string } | { type: 'session'; session: TrainingPlanSession }

interface WorkoutDetailSheetProps {
  session: TrainingPlanSession
  onClose: () => void
}

interface SessionExercise {
  name: string
  sets: number
  reps: string | number
  rest_seconds?: number
  notes?: string
}

interface SessionSegment {
  label: string
  detail: string
}

const TARGET_DATA_LABELS: Record<string, string> = {
  distance_km: 'Distans',
  pace: 'Tempo',
}

function formatTargetValue(key: string, value: unknown): string {
  if (key === 'distance_km' && typeof value === 'number') return `${value} km`
  return String(value)
}

export function WorkoutDetailSheet({ session, onClose }: WorkoutDetailSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Stäng" onClick={onClose} className="backdrop-in absolute inset-0 bg-black/40" />
      <div className="sheet-up relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-8">
        <div className="mb-4 flex items-center justify-end">
          <button onClick={onClose} aria-label="Stäng" className="press text-ink-secondary">
            <X size={20} />
          </button>
        </div>
        <SessionOnlyDetail session={session} onClose={onClose} />
      </div>
    </div>
  )
}

function SessionOnlyDetail({ session, onClose }: { session: TrainingPlanSession; onClose: () => void }) {
  const createManualWorkout = useCreateManualWorkout()
  // Narrowed to a local const: TS control-flow narrowing on session.activity_type
  // doesn't survive into the onClick closure below otherwise.
  const loggableActivityType: PlanActivityType | null = session.activity_type !== 'rest' ? session.activity_type : null
  const targetData = (session.target_data ?? {}) as Record<string, unknown>
  const exercises = Array.isArray(targetData.exercises) ? (targetData.exercises as SessionExercise[]) : null
  const segments = Array.isArray(targetData.segments) ? (targetData.segments as SessionSegment[]) : null
  const otherEntries = Object.entries(targetData).filter(([key]) => key !== 'exercises' && key !== 'segments')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ActivityIcon type={session.activity_type} />
        <div>
          <h2 className="text-base font-semibold text-ink-primary">{session.title}</h2>
          <p className="text-xs text-ink-secondary">
            {format(new Date(session.scheduled_date), 'EEEE d MMMM', { locale: sv })} · Schemalagt
          </p>
        </div>
      </div>

      {session.description && <p className="text-sm text-ink-primary">{session.description}</p>}

      {otherEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {otherEntries.map(([key, value]) => (
            <div key={key} className="rounded-lg bg-surface-muted p-2.5">
              <p className="text-xs text-ink-secondary">{TARGET_DATA_LABELS[key] ?? key}</p>
              <p className="text-sm font-medium text-ink-primary">{formatTargetValue(key, value)}</p>
            </div>
          ))}
        </div>
      )}

      {segments && segments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-secondary">Så kör du passet</p>
          {segments.map((segment, i) => (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <p className="text-xs font-medium text-accent">{segment.label}</p>
              <p className="mt-0.5 text-sm text-ink-primary">{segment.detail}</p>
            </div>
          ))}
        </div>
      )}

      {exercises && exercises.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-secondary">Övningar</p>
          {exercises.map((exercise, i) => (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink-primary">{exercise.name}</p>
                <p className="shrink-0 text-xs text-ink-secondary">
                  {exercise.sets} × {exercise.reps}
                </p>
              </div>
              {(exercise.rest_seconds || exercise.notes) && (
                <p className="mt-0.5 text-xs text-ink-secondary">
                  {[exercise.rest_seconds ? `${exercise.rest_seconds}s vila` : null, exercise.notes]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {loggableActivityType && (
        <div>
          <Button
            className="w-full"
            disabled={createManualWorkout.isPending}
            onClick={() =>
              createManualWorkout.mutate(
                {
                  sessionId: session.id,
                  activityType: loggableActivityType,
                  title: session.title,
                  scheduledDate: session.scheduled_date,
                },
                { onSuccess: onClose },
              )
            }
          >
            {createManualWorkout.isPending ? (
              'Sparar…'
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Check size={16} /> Markera som klart
              </span>
            )}
          </Button>
          {createManualWorkout.isError && (
            <p className="mt-1 text-sm text-warning">Något gick fel, försök igen.</p>
          )}
        </div>
      )}
    </div>
  )
}
