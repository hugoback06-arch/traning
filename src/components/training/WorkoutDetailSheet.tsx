import { useState } from 'react'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Button } from '../common/Button'
import { Spinner } from '../common/Spinner'
import { ActivityIcon } from './ActivityIcon'
import { useWorkoutDetail } from '../../hooks/useWorkoutDetail'
import { useUpdateWorkout } from '../../hooks/useUpdateWorkout'
import { useEvaluateWorkout } from '../../hooks/useEvaluateWorkout'
import { useCreateManualWorkout } from '../../hooks/useCreateManualWorkout'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDistance, formatDuration, formatPace } from '../../lib/formatWorkout'
import type { PlanActivityType, TrainingPlanSession, WorkoutDetail, WorkoutSetWithExercise } from '../../types/domain'

export type DetailTarget =
  | { type: 'workout'; workoutId: string }
  | { type: 'session'; session: TrainingPlanSession }

interface WorkoutDetailSheetProps {
  target: DetailTarget
  onClose: () => void
}

function isStrength(type: PlanActivityType): boolean {
  return type === 'strength'
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

export function WorkoutDetailSheet({ target, onClose }: WorkoutDetailSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Stäng" onClick={onClose} className="backdrop-in absolute inset-0 bg-black/40" />
      <div className="sheet-up relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-8">
        <div className="mb-4 flex items-center justify-end">
          <button onClick={onClose} aria-label="Stäng" className="press text-lg leading-none text-ink-secondary">
            ✕
          </button>
        </div>
        {target.type === 'session' ? (
          <SessionOnlyDetail session={target.session} onClose={onClose} />
        ) : (
          <WorkoutDetailContent workoutId={target.workoutId} />
        )}
      </div>
    </div>
  )
}

function SessionOnlyDetail({ session, onClose }: { session: TrainingPlanSession; onClose: () => void }) {
  const createManualWorkout = useCreateManualWorkout()
  // Narrowed to a local const: TS control-flow narrowing on session.activity_type
  // doesn't survive into the onClick closure below otherwise.
  const loggableActivityType = session.activity_type !== 'rest' ? session.activity_type : null
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
            {createManualWorkout.isPending ? 'Sparar…' : '✓ Markera som klart'}
          </Button>
          {createManualWorkout.isError && (
            <p className="mt-1 text-sm text-warning">Något gick fel, försök igen.</p>
          )}
        </div>
      )}
    </div>
  )
}

function WorkoutDetailContent({ workoutId }: { workoutId: string }) {
  const { data: workout, isLoading } = useWorkoutDetail(workoutId)
  const [editing, setEditing] = useState(false)

  if (isLoading || !workout) return <Spinner />

  const stats = buildStatEntries(workout)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ActivityIcon type={workout.activity_type} />
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            {workout.title ?? ACTIVITY_LABELS[workout.activity_type]}
          </h2>
          <p className="text-xs text-ink-secondary">
            {format(new Date(workout.started_at), 'EEEE d MMMM, HH:mm', { locale: sv })}
          </p>
        </div>
      </div>

      {workout.session && <PlanVsActual session={workout.session} workout={workout} />}

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-surface-muted p-2.5">
              <p className="text-xs text-ink-secondary">{label}</p>
              <p className="text-sm font-medium text-ink-primary">{value}</p>
            </div>
          ))}
        </div>
      )}

      {isStrength(workout.activity_type) && workout.sets.length > 0 && <SetsTable sets={workout.sets} />}

      {workout.evaluation ? (
        <div className="rounded-xl border border-border bg-surface-muted p-3">
          <p className="text-xs font-medium text-ink-secondary">AI-utvärdering</p>
          <p className="mt-1 text-sm text-ink-primary">{workout.evaluation.summary}</p>
          {workout.evaluation.feedback && (
            <p className="mt-1 text-sm text-ink-secondary">{workout.evaluation.feedback}</p>
          )}
        </div>
      ) : (
        <EvaluateWorkoutButton workoutId={workout.id} />
      )}

      {editing ? (
        <EditWorkoutForm workout={workout} onDone={() => setEditing(false)} />
      ) : (
        <button onClick={() => setEditing(true)} className="text-sm text-ink-secondary underline">
          Korrigera passet
        </button>
      )}
    </div>
  )
}

// Treat as "as planned" (no need to show both) unless the activity type
// changed or the actual distance is off by more than 15% from the target —
// small variance (route was a bit longer/shorter) isn't worth calling out.
const DISTANCE_TOLERANCE = 0.15

function PlanVsActual({ session, workout }: { session: TrainingPlanSession; workout: WorkoutDetail }) {
  const targetData = (session.target_data ?? {}) as Record<string, unknown>
  const targetDistanceKm = typeof targetData.distance_km === 'number' ? targetData.distance_km : null
  const actualDistanceKm = workout.distance_meters ? workout.distance_meters / 1000 : null

  const activityDiffers = session.activity_type !== workout.activity_type
  const distanceDiffers =
    targetDistanceKm !== null &&
    actualDistanceKm !== null &&
    Math.abs(actualDistanceKm - targetDistanceKm) / targetDistanceKm > DISTANCE_TOLERANCE

  if (!activityDiffers && !distanceDiffers) {
    return <p className="text-xs text-ink-secondary">✓ Genomfört enligt plan: {session.title}</p>
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg border border-border p-2.5">
        <p className="text-xs font-medium text-ink-secondary">Planerat</p>
        <div className="mt-1 flex items-center gap-1.5">
          <ActivityIcon type={session.activity_type} size="sm" />
          <p className="min-w-0 truncate text-sm font-medium text-ink-primary">{session.title}</p>
        </div>
        {targetDistanceKm !== null && <p className="mt-1 text-xs text-ink-secondary">{targetDistanceKm} km</p>}
      </div>
      <div className="rounded-lg border border-accent p-2.5">
        <p className="text-xs font-medium text-ink-secondary">Genomfört</p>
        <div className="mt-1 flex items-center gap-1.5">
          <ActivityIcon type={workout.activity_type} size="sm" />
          <p className="min-w-0 truncate text-sm font-medium text-ink-primary">
            {workout.title ?? ACTIVITY_LABELS[workout.activity_type]}
          </p>
        </div>
        {actualDistanceKm !== null && (
          <p className="mt-1 text-xs text-ink-secondary">{actualDistanceKm.toFixed(1)} km</p>
        )}
      </div>
    </div>
  )
}

function EvaluateWorkoutButton({ workoutId }: { workoutId: string }) {
  const evaluateWorkout = useEvaluateWorkout()

  return (
    <div>
      <button
        onClick={() => evaluateWorkout.mutate(workoutId)}
        disabled={evaluateWorkout.isPending}
        className="text-sm text-accent underline"
      >
        {evaluateWorkout.isPending ? 'Utvärderar…' : 'Utvärdera med AI'}
      </button>
      {evaluateWorkout.isError && <p className="mt-1 text-sm text-warning">Något gick fel, försök igen.</p>}
    </div>
  )
}

function buildStatEntries(workout: WorkoutDetail): [string, string][] {
  if (isStrength(workout.activity_type)) {
    const exerciseCount = new Set(workout.sets.map((s) => s.exercise_id)).size
    const totalVolume = workout.sets.reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0)
    const entries: [string, string][] = []
    if (exerciseCount > 0) entries.push(['Övningar', String(exerciseCount)])
    if (workout.sets.length > 0) entries.push(['Set', String(workout.sets.length)])
    if (totalVolume > 0) entries.push(['Volym', `${Math.round(totalVolume)} kg`])
    const duration = formatDuration(workout.duration_seconds)
    if (duration) entries.push(['Tid', duration])
    return entries
  }

  const entries: [string, string][] = []
  const distance = formatDistance(workout.distance_meters)
  if (distance) entries.push(['Distans', distance])
  const duration = formatDuration(workout.duration_seconds)
  if (duration) entries.push(['Tid', duration])
  const pace = formatPace(workout.distance_meters, workout.duration_seconds)
  if (pace) entries.push(['Snittempo', pace])
  if (workout.avg_heart_rate) entries.push(['Snittpuls', `${workout.avg_heart_rate} bpm`])
  if (workout.calories_burned) entries.push(['Kalorier', `${workout.calories_burned} kcal`])
  if (workout.elevation_gain_meters) entries.push(['Höjdmeter', `${Math.round(workout.elevation_gain_meters)} m`])
  return entries
}

function SetsTable({ sets }: { sets: WorkoutSetWithExercise[] }) {
  const byExercise = new Map<string, { name: string; sets: WorkoutSetWithExercise[] }>()
  for (const set of sets) {
    const key = set.exercise_id
    if (!byExercise.has(key)) byExercise.set(key, { name: set.exercise.name, sets: [] })
    byExercise.get(key)!.sets.push(set)
  }

  return (
    <div className="space-y-3">
      {Array.from(byExercise.values()).map((group) => (
        <div key={group.name}>
          <p className="text-sm font-medium text-ink-primary">{group.name}</p>
          <div className="mt-1 space-y-1">
            {group.sets.map((set) => (
              <div key={set.id} className="flex justify-between text-xs text-ink-secondary">
                <span>Set {set.set_number}</span>
                <span>
                  {set.weight_kg ? `${set.weight_kg} kg` : '—'} × {set.reps ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EditWorkoutForm({ workout, onDone }: { workout: WorkoutDetail; onDone: () => void }) {
  const updateWorkout = useUpdateWorkout()
  const [title, setTitle] = useState(workout.title ?? '')
  const [distanceKm, setDistanceKm] = useState(workout.distance_meters ? workout.distance_meters / 1000 : 0)
  const [durationMin, setDurationMin] = useState(workout.duration_seconds ? workout.duration_seconds / 60 : 0)
  const [caloriesBurned, setCaloriesBurned] = useState(workout.calories_burned ?? 0)

  async function handleSave() {
    await updateWorkout.mutateAsync({
      id: workout.id,
      title: title || null,
      distance_meters: distanceKm > 0 ? distanceKm * 1000 : null,
      duration_seconds: durationMin > 0 ? Math.round(durationMin * 60) : null,
      calories_burned: caloriesBurned > 0 ? caloriesBurned : null,
    })
    onDone()
  }

  return (
    <div className="space-y-3 rounded-xl border border-accent p-3">
      <div>
        <label className="block text-xs text-ink-secondary">Titel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-ink-secondary">Distans (km)</label>
          <input
            type="number"
            inputMode="decimal"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-secondary">Tid (min)</label>
          <input
            type="number"
            inputMode="decimal"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-secondary">Kcal</label>
          <input
            type="number"
            inputMode="decimal"
            value={caloriesBurned}
            onChange={(e) => setCaloriesBurned(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
      {updateWorkout.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onDone}>
          Avbryt
        </Button>
        <Button className="flex-1" disabled={updateWorkout.isPending} onClick={handleSave}>
          {updateWorkout.isPending ? 'Sparar…' : 'Spara'}
        </Button>
      </div>
    </div>
  )
}
