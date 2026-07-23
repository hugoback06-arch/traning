import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { ActivityIcon } from '../../components/training/ActivityIcon'
import { WorkoutMap } from '../../components/training/WorkoutMap'
import { StreamChart } from '../../components/training/StreamChart'
import { useWorkoutDetail } from '../../hooks/useWorkoutDetail'
import { useUpdateWorkout } from '../../hooks/useUpdateWorkout'
import { useEvaluateWorkout } from '../../hooks/useEvaluateWorkout'
import { ACTIVITY_LABELS } from '../../lib/activityTypes'
import { formatDistance, formatDuration, formatPace } from '../../lib/formatWorkout'
import type {
  PlanActivityType,
  TrainingPlanSession,
  WorkoutDetail,
  WorkoutSetWithExercise,
  WorkoutSplit,
  WorkoutStreams,
} from '../../types/domain'

function isStrength(type: PlanActivityType): boolean {
  return type === 'strength'
}

function formatElapsed(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = Math.round(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function formatSpeedAsPace(metersPerSecond: number): string {
  if (metersPerSecond <= 0) return '—'
  const secPerKm = 1000 / metersPerSecond
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}

function StreamCharts({ streams }: { streams: WorkoutStreams }) {
  const hasHeartrate = streams.heartrate && streams.heartrate.some((v) => v > 0)
  const hasPace = streams.velocity_smooth && streams.velocity_smooth.some((v) => v > 0)

  if (!hasHeartrate && !hasPace) return null

  return (
    <div className="space-y-2">
      {hasHeartrate && (
        <StreamChart
          label="Puls"
          colorVar="var(--color-chart-heartrate)"
          timeSeconds={streams.time}
          values={streams.heartrate!}
          formatValue={(v) => `${Math.round(v)} bpm`}
          formatTime={formatElapsed}
        />
      )}
      {hasPace && (
        <StreamChart
          label="Tempo"
          colorVar="var(--color-chart-pace)"
          timeSeconds={streams.time}
          values={streams.velocity_smooth!}
          formatValue={formatSpeedAsPace}
          formatTime={formatElapsed}
        />
      )}
    </div>
  )
}

export function WorkoutDetailPage() {
  const { workoutId } = useParams<{ workoutId: string }>()
  const { data: workout, isLoading } = useWorkoutDetail(workoutId ?? '')
  const [editing, setEditing] = useState(false)

  return (
    <div className="space-y-4">
      <Link to="/training" className="text-sm text-ink-secondary">
        ← Träning
      </Link>

      {isLoading || !workout ? (
        <Spinner />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <ActivityIcon type={workout.activity_type} />
            <div>
              <h1 className="font-display text-lg font-semibold text-ink-primary">
                {workout.title ?? ACTIVITY_LABELS[workout.activity_type]}
              </h1>
              <p className="text-xs text-ink-secondary">
                {format(new Date(workout.started_at), 'EEEE d MMMM, HH:mm', { locale: sv })}
              </p>
            </div>
          </div>

          {workout.map_polyline && <WorkoutMap polyline={workout.map_polyline} />}

          {workout.streams && <StreamCharts streams={workout.streams} />}

          {workout.session && <PlanVsActual session={workout.session} workout={workout} />}

          <StatsGrid workout={workout} />

          {workout.splits && workout.splits.length > 1 && <SplitsTable splits={workout.splits} />}

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
        </>
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
  if (workout.max_heart_rate) entries.push(['Maxpuls', `${workout.max_heart_rate} bpm`])
  if (workout.calories_burned) entries.push(['Kalorier', `${workout.calories_burned} kcal`])
  if (workout.elevation_gain_meters) entries.push(['Höjdmeter', `${Math.round(workout.elevation_gain_meters)} m`])
  if (workout.perceived_exertion) entries.push(['Ansträngning', `${workout.perceived_exertion}/10`])
  return entries
}

function StatsGrid({ workout }: { workout: WorkoutDetail }) {
  const stats = buildStatEntries(workout)
  if (stats.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-surface-muted p-2.5">
          <p className="text-xs text-ink-secondary">{label}</p>
          <p className="text-sm font-medium text-ink-primary">{value}</p>
        </div>
      ))}
    </div>
  )
}

function SplitsTable({ splits }: { splits: WorkoutSplit[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [tabOpen, setTabOpen] = useState(false)

  return (
    <div className="space-y-1">
      <button
        onClick={() => setTabOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-lg border border-border px-2.5 py-2 text-left"
      >
        <span className="text-xs font-medium text-ink-secondary">Splits</span>
        <span className="text-xs text-ink-secondary">{tabOpen ? '▲' : '▼'}</span>
      </button>
      {tabOpen && (
      <div className="rounded-lg border border-border">
        {splits.map((split) => {
          const isOpen = expanded === split.split
          const pausedSeconds = split.elapsed_time - split.moving_time
          const speedKmh = split.average_speed != null ? split.average_speed * 3.6 : null

          return (
            <button
              key={split.split}
              onClick={() => setExpanded(isOpen ? null : split.split)}
              className="block w-full border-b border-border px-2.5 py-1.5 text-left last:border-b-0"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-ink-secondary">{split.split} km</span>
                <span className="font-medium text-ink-primary">
                  {formatPace(split.distance, split.moving_time) ?? '—'}
                </span>
                {split.average_heartrate != null && (
                  <span className="text-ink-secondary">{Math.round(split.average_heartrate)} bpm</span>
                )}
                {split.elevation_difference != null && (
                  <span className="text-ink-secondary">
                    {split.elevation_difference > 0 ? '+' : ''}
                    {Math.round(split.elevation_difference)} m
                  </span>
                )}
                <span className="text-ink-secondary">{isOpen ? '▲' : '▼'}</span>
              </div>
              {isOpen && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {speedKmh != null && (
                    <div className="rounded-lg bg-surface-muted p-2">
                      <p className="text-[10px] text-ink-secondary">Snittfart</p>
                      <p className="text-xs font-medium text-ink-primary">{speedKmh.toFixed(1)} km/h</p>
                    </div>
                  )}
                  <div className="rounded-lg bg-surface-muted p-2">
                    <p className="text-[10px] text-ink-secondary">Total tid</p>
                    <p className="text-xs font-medium text-ink-primary">{formatDuration(split.elapsed_time)}</p>
                  </div>
                  {pausedSeconds > 0 && (
                    <div className="rounded-lg bg-surface-muted p-2">
                      <p className="text-[10px] text-ink-secondary">Stillastående</p>
                      <p className="text-xs font-medium text-ink-primary">{formatDuration(pausedSeconds)}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
      )}
    </div>
  )
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
