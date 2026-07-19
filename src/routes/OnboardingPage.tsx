import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { differenceInYears, parseISO } from 'date-fns'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { calculateCalorieGoals } from '../lib/calorieCalc'
import type { ActivityLevel, Sex, WeightGoal } from '../types/domain'

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Kvinna' },
  { value: 'male', label: 'Man' },
  { value: 'other', label: 'Annat' },
]

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Stillasittande', description: 'Lite eller ingen träning' },
  { value: 'light', label: 'Lätt aktiv', description: 'Lätt träning 1–3 dagar/vecka' },
  { value: 'moderate', label: 'Måttligt aktiv', description: 'Måttlig träning 3–5 dagar/vecka' },
  { value: 'active', label: 'Aktiv', description: 'Hård träning 6–7 dagar/vecka' },
  { value: 'very_active', label: 'Mycket aktiv', description: 'Hård daglig träning eller fysiskt jobb' },
]

const GOAL_OPTIONS: { value: WeightGoal; label: string }[] = [
  { value: 'lose', label: 'Gå ner i vikt' },
  { value: 'maintain', label: 'Bibehålla vikt' },
  { value: 'gain', label: 'Gå upp i vikt' },
]

interface FormState {
  sex: Sex | null
  birthDate: string
  heightCm: string
  weightKg: string
  activityLevel: ActivityLevel | null
  goal: WeightGoal | null
}

const INITIAL_FORM: FormState = {
  sex: null,
  birthDate: '',
  heightCm: '',
  weightKg: '',
  activityLevel: null,
  goal: null,
}

const TOTAL_STEPS = 6

export function OnboardingPage() {
  const { session } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const age = differenceInYears(new Date(), parseISO(form.birthDate))
      const result = calculateCalorieGoals({
        sex: form.sex as Sex,
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
        age,
        activityLevel: form.activityLevel as ActivityLevel,
        goal: form.goal as WeightGoal,
      })

      const { error } = await supabase
        .from('profiles')
        .update({
          sex: form.sex,
          birth_date: form.birthDate,
          height_cm: Number(form.heightCm),
          weight_kg: Number(form.weightKg),
          activity_level: form.activityLevel,
          goal: form.goal,
          daily_calorie_goal: result.dailyCalorieGoal,
          protein_goal_g: result.proteinGoalG,
          carbs_goal_g: result.carbsGoalG,
          fat_goal_g: result.fatGoalG,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', session?.user.id as string)

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(session?.user.id) })
      navigate('/', { replace: true })
    },
  })

  if (profile?.onboarding_completed_at) {
    return <Navigate to="/" replace />
  }

  const canProceed =
    (step === 0 && form.sex !== null) ||
    (step === 1 && form.birthDate !== '') ||
    (step === 2 && form.heightCm !== '' && form.weightKg !== '') ||
    (step === 3 && form.activityLevel !== null) ||
    (step === 4 && form.goal !== null) ||
    step === 5

  const preview =
    step === 5
      ? calculateCalorieGoals({
          sex: form.sex as Sex,
          weightKg: Number(form.weightKg),
          heightCm: Number(form.heightCm),
          age: differenceInYears(new Date(), parseISO(form.birthDate)),
          activityLevel: form.activityLevel as ActivityLevel,
          goal: form.goal as WeightGoal,
        })
      : null

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4">
      <Card className="space-y-4">
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">Vilket kön har du?</h1>
            <div className="grid grid-cols-3 gap-2">
              {SEX_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, sex: opt.value })}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium ${
                    form.sex === opt.value ? 'border-accent bg-accent-light text-accent' : 'border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">Födelsedatum</h1>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">Längd och vikt</h1>
            <label className="block text-sm text-ink-secondary">
              Längd (cm)
              <input
                type="number"
                inputMode="decimal"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block text-sm text-ink-secondary">
              Vikt (kg)
              <input
                type="number"
                inputMode="decimal"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">Aktivitetsnivå</h1>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, activityLevel: opt.value })}
                  className={`block w-full rounded-lg border px-3 py-2 text-left ${
                    form.activityLevel === opt.value ? 'border-accent bg-accent-light' : 'border-border'
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs text-ink-secondary">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">Vad är ditt mål?</h1>
            <div className="space-y-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, goal: opt.value })}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ${
                    form.goal === opt.value ? 'border-accent bg-accent-light text-accent' : 'border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && preview && (
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">Ditt dagliga mål</h1>
            <p className="text-3xl font-semibold text-ink-primary">{preview.dailyCalorieGoal} kcal</p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-protein" />
                <p className="font-semibold text-ink-primary">{preview.proteinGoalG}g</p>
                <p className="text-xs text-ink-secondary">Protein</p>
              </div>
              <div>
                <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-carbs" />
                <p className="font-semibold text-ink-primary">{preview.carbsGoalG}g</p>
                <p className="text-xs text-ink-secondary">Kolhydrater</p>
              </div>
              <div>
                <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-fat" />
                <p className="font-semibold text-ink-primary">{preview.fatGoalG}g</p>
                <p className="text-xs text-ink-secondary">Fett</p>
              </div>
            </div>
            <p className="text-xs text-ink-secondary">
              Beräknat utifrån dina uppgifter. Du kan justera detta manuellt senare i profilinställningar.
            </p>
            {saveMutation.isError && (
              <p className="text-sm text-warning">Något gick fel, försök igen.</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <Button className="flex-1" variant="secondary" onClick={() => setStep(step - 1)}>
              Tillbaka
            </Button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <Button className="flex-1" disabled={!canProceed} onClick={() => setStep(step + 1)}>
              Nästa
            </Button>
          ) : (
            <Button className="flex-1" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Sparar…' : 'Kom igång'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
