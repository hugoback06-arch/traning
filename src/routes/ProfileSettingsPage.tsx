import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Spinner } from '../components/common/Spinner'
import { Switch } from '../components/common/Switch'
import { SegmentedControl } from '../components/common/SegmentedControl'
import { StravaConnectionCard } from '../components/profile/StravaConnectionCard'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useFinalizeStrava } from '../hooks/useFinalizeStrava'
import { useTheme } from '../hooks/useTheme'
import { useUpdateNotificationsEnabled } from '../hooks/useUpdateNotificationsEnabled'
import { useFeedbackSuggestions, useSubmitFeedbackSuggestion } from '../hooks/useFeedbackSuggestions'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import type { ThemePreference } from '../types/domain'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Ljust' },
  { value: 'dark', label: 'Mörkt' },
]

const STRAVA_STATUS_MESSAGES: Record<string, string> = {
  pending: 'Ansluter Strava…',
  connected: 'Strava anslutet!',
  denied: 'Strava-anslutningen avbröts.',
  error: 'Något gick fel vid anslutning till Strava.',
}

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const finalizeStrava = useFinalizeStrava()
  const [displayStravaStatus, setDisplayStravaStatus] = useState<string | null>(null)
  const { preference, setPreference } = useTheme()
  const updateNotificationsEnabled = useUpdateNotificationsEnabled()
  const [notificationsMessage, setNotificationsMessage] = useState<string | null>(null)
  const { data: suggestions } = useFeedbackSuggestions()
  const submitSuggestion = useSubmitFeedbackSuggestion()
  const [suggestionText, setSuggestionText] = useState('')

  const stravaStatus = searchParams.get('strava')
  const stravaState = searchParams.get('state')

  useEffect(() => {
    if (!stravaStatus) return

    if (stravaStatus === 'pending' && stravaState) {
      // The callback only stashed tokens — this call, made with our own
      // session's JWT, is what actually claims them via RLS-checked ownership
      // (see strava-oauth-finalize). See CLAUDE.md / oauth_pending_link migration.
      setDisplayStravaStatus('pending')
      finalizeStrava.mutate(stravaState, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['fitness-connection'] })
          setDisplayStravaStatus('connected')
        },
        onError: () => setDisplayStravaStatus('error'),
      })
    } else {
      queryClient.invalidateQueries({ queryKey: ['fitness-connection'] })
      setDisplayStravaStatus(stravaStatus)
    }

    setSearchParams((params) => {
      params.delete('strava')
      params.delete('state')
      params.delete('message')
      return params
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stravaStatus, stravaState, queryClient, setSearchParams])
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

  function handleNotificationsToggle(next: boolean) {
    setNotificationsMessage(null)
    if (!next) {
      updateNotificationsEnabled.mutate(false)
      return
    }
    if (!('Notification' in window)) {
      setNotificationsMessage('Notiser stöds inte i den här webbläsaren.')
      return
    }
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        updateNotificationsEnabled.mutate(true)
      } else {
        setNotificationsMessage('Tillåt notiser i webbläsaren för att slå på.')
      }
    })
  }

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
      <h1 className="font-display text-lg font-semibold">👤 Profil</h1>

      {displayStravaStatus && (
        <p className="rounded-lg bg-accent-light px-3 py-2 text-sm text-accent">
          {STRAVA_STATUS_MESSAGES[displayStravaStatus] ?? 'Klart.'}
        </p>
      )}

      <StravaConnectionCard />

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
        <h2 className="text-sm font-medium text-ink-primary">🎨 Utseende</h2>
        <SegmentedControl options={THEME_OPTIONS} value={preference} onChange={setPreference} />
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-ink-primary">🔔 Notiser</h2>
            <p className="text-xs text-ink-secondary">Påminnelser och uppdateringar från appen.</p>
          </div>
          <Switch checked={profile.notifications_enabled} onChange={handleNotificationsToggle} label="Notiser" />
        </div>
        {notificationsMessage && <p className="text-xs text-warning">{notificationsMessage}</p>}
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-ink-primary">💡 Föreslå en ändring</h2>
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

        {suggestions && suggestions.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium text-ink-secondary">Dina tidigare förslag</p>
            {suggestions.map((s) => (
              <div key={s.id} className="text-xs text-ink-secondary">
                <p className="text-ink-primary">{s.message}</p>
                <p>{new Date(s.created_at).toLocaleDateString('sv-SE')}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
