import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Lightbulb, Palette, User, Utensils } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Spinner } from '../components/common/Spinner'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'
import { useUpdateDietaryPreference } from '../hooks/useUpdateDietaryPreference'
import { useSubmitFeedbackSuggestion } from '../hooks/useFeedbackSuggestions'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import type { DietaryPreference, ThemePreference } from '../types/domain'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Ljust' },
  { value: 'dark', label: 'Mörkt' },
]

const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: 'any', label: 'Allätare' },
  { value: 'meat_fish_poultry', label: 'Kött & fisk' },
  { value: 'vegetarian', label: 'Vegetariskt' },
  { value: 'vegan', label: 'Veganskt' },
]

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block text-sm text-ink-secondary">
      {label}
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
      />
    </label>
  )
}

export function ProfileSettingsPage() {
  const { session } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const { preference, setPreference } = useTheme()
  const updateDietaryPreference = useUpdateDietaryPreference()
  const submitSuggestion = useSubmitFeedbackSuggestion()
  const [suggestionText, setSuggestionText] = useState('')

  const [calorieGoal, setCalorieGoal] = useState(0)
  const [proteinG, setProteinG] = useState(0)
  const [carbsG, setCarbsG] = useState(0)
  const [fatG, setFatG] = useState(0)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_calorie_goal: calorieGoal,
          protein_goal_g: proteinG,
          carbs_goal_g: carbsG,
          fat_goal_g: fatG,
        })
        .eq('id', session?.user.id as string)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(session?.user.id) })
      setEditing(false)
    },
  })

  if (isLoading || !profile) return <Spinner />

  function handleSubmitSuggestion() {
    const message = suggestionText.trim()
    if (!message) return
    submitSuggestion.mutate(message, { onSuccess: () => setSuggestionText('') })
  }

  function startEditing() {
    if (!profile) return
    setCalorieGoal(profile.daily_calorie_goal ?? 0)
    setProteinG(profile.protein_goal_g ?? 0)
    setCarbsG(profile.carbs_goal_g ?? 0)
    setFatG(profile.fat_goal_g ?? 0)
    setEditing(true)
  }

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
        <User size={20} /> Profil
      </h1>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-primary">Dagligt mål</h2>
          {!editing && (
            <button onClick={startEditing} className="text-sm font-medium text-accent">
              Redigera
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3">
            <p className="text-3xl font-semibold text-ink-primary">{profile.daily_calorie_goal ?? 0} kcal</p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-protein" />
                <p className="font-semibold text-ink-primary">{profile.protein_goal_g ?? 0}g</p>
                <p className="text-xs text-ink-secondary">Protein</p>
              </div>
              <div>
                <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-carbs" />
                <p className="font-semibold text-ink-primary">{profile.carbs_goal_g ?? 0}g</p>
                <p className="text-xs text-ink-secondary">Kolhydrater</p>
              </div>
              <div>
                <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-macro-fat" />
                <p className="font-semibold text-ink-primary">{profile.fat_goal_g ?? 0}g</p>
                <p className="text-xs text-ink-secondary">Fett</p>
              </div>
            </div>
            <p className="text-xs text-ink-secondary">
              Beräknades automatiskt vid onboarding. Justera manuellt vid behov.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Kalorier (kcal)" value={calorieGoal} onChange={setCalorieGoal} />
              <NumberField label="Protein (g)" value={proteinG} onChange={setProteinG} />
              <NumberField label="Kolhydrater (g)" value={carbsG} onChange={setCarbsG} />
              <NumberField label="Fett (g)" value={fatG} onChange={setFatG} />
            </div>
            {saveMutation.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)}>
                Avbryt
              </Button>
              <Button className="flex-1" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? 'Sparar…' : 'Spara'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
          <Palette size={16} /> Utseende
        </h2>
        <SegmentedControl options={THEME_OPTIONS} value={preference} onChange={setPreference} />
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
            <Utensils size={16} /> Kostpreferens
          </h2>
          <p className="text-xs text-ink-secondary">Styr AI-måltidsförslagen på Hem-skärmen.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DIETARY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateDietaryPreference.mutate(option.value)}
              className={`press rounded-lg py-2 text-sm font-medium transition-colors ${
                profile.dietary_preference === option.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-surface-muted text-ink-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
            <Lightbulb size={16} /> Föreslå en ändring
          </h2>
          <p className="text-xs text-ink-secondary">Tips, buggar eller önskemål — skriv fritt, vi läser allt.</p>
        </div>
        <textarea
          value={suggestionText}
          onChange={(e) => setSuggestionText(e.target.value)}
          placeholder="Vad vill du ändra eller lägga till?"
          rows={3}
          disabled={submitSuggestion.isPending}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
        />
        {submitSuggestion.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
        {submitSuggestion.isSuccess && !suggestionText && (
          <p className="text-sm text-accent">Tack! Förslaget är sparat.</p>
        )}
        <Button
          className="w-full"
          disabled={submitSuggestion.isPending || !suggestionText.trim()}
          onClick={handleSubmitSuggestion}
        >
          {submitSuggestion.isPending ? 'Skickar…' : 'Skicka förslag'}
        </Button>
      </Card>

      {session?.user.email === 'hugoback06@gmail.com' && (
        <Link to="/admin/feedback" className="block text-center text-sm text-ink-secondary underline">
          Alla feedback-förslag (admin)
        </Link>
      )}
      {session?.user.email === 'hugoback06@gmail.com' && (
        <Link to="/admin/ai-eval" className="block text-center text-sm text-ink-secondary underline">
          Testa AI-uppskattningen (admin)
        </Link>
      )}
    </div>
  )
}
