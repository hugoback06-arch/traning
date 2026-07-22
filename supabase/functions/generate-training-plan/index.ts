// Supabase Edge Function (Deno). Takes the user's free-text goal (+ desired
// plan length), asks Claude for a structured multi-week training plan grounded
// in the user's actual recent training history when available, and writes it
// to training_plans + training_plan_sessions on the caller's behalf
// (RLS-respecting: writes go through a Supabase client authenticated with the
// caller's own JWT, not a service-role key). ANTHROPIC_API_KEY never reaches
// the browser.
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { COACH_SAFETY_SYSTEM_PROMPT } from '../_shared/safetyPrompt.ts'
import { PLAN_METHODOLOGY_PROMPT } from '../_shared/planMethodologyPrompt.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

// Own model setting (separate from CLAUDE_TEXT_MODEL, which evaluate-workout/
// strava-webhook use) — plan generation is a forced tool-use call producing
// many structured days per request, so it warrants a stronger model than the
// cheaper one used for one-off workout evaluations.
const MODEL = Deno.env.get('CLAUDE_PLAN_MODEL') ?? 'claude-sonnet-5'

// "Mycket längre än 1 vecka" (addendum punkt 1) without letting a single
// request balloon into an unbounded/expensive generation — 12 weeks covers a
// full training mesocycle, which is the common upper bound for one AI-plan.
const MAX_WEEKS = 12
// Effectively "all" logged history — this is a cost/safety ceiling, not a
// meaningful business limit. A summarized (not raw-dumped) history is cheap
// on tokens even at this size, and more history means better-grounded paces
// and volume trends than a small recent-only window would give.
const HISTORY_LIMIT = 1000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ACTIVITY_TYPES = ['running', 'cycling', 'swimming', 'strength', 'walking', 'rest', 'other'] as const

interface WorkoutRow {
  activity_type: (typeof ACTIVITY_TYPES)[number]
  started_at: string
  duration_seconds: number | null
  distance_meters: number | null
}

function buildPlanTool(dayCount: number) {
  return {
    name: 'record_training_plan',
    description: `Record a ${dayCount}-day training plan based on the user's stated goal and training history.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        plan_name: { type: 'string', description: 'Short name for the plan, in Swedish, e.g. "Sommarschema".' },
        goal: { type: 'string', description: 'One-sentence summary of the goal, in Swedish.' },
        days: {
          type: 'array',
          minItems: dayCount,
          maxItems: dayCount,
          items: {
            type: 'object',
            properties: {
              scheduled_date: {
                type: 'string',
                description: 'The exact ISO date (YYYY-MM-DD) provided for this day — copy it verbatim.',
              },
              activity_type: { type: 'string', enum: ACTIVITY_TYPES },
              title: {
                type: 'string',
                description:
                  'Short title, in Swedish. For endurance sessions, name the pass type so it\'s clear at a glance, ' +
                  'e.g. "Löpning – Långpass", "Löpning – Intervaller", "Löpning – Tröskel", "Löpning – Lugn distans" ' +
                  '(not just "Löpning 8 km" every time). For rest days, "Vila".',
              },
              description: {
                type: 'string',
                description:
                  'A clear, complete instruction for how to perform the session, in Swedish — this is what the user reads to know exactly what to do, so never leave it as a single vague sentence for a real training day. ' +
                  'For endurance sessions (running/cycling/swimming/walking), summarize warm-up, the main effort and cool-down, e.g. "10 min lugn uppvärmning, sedan 4×1000m i tröskeltempo (ca 4:45/km) med 2 min gångvila mellan, avsluta med 10 min nedvarvning." ' +
                  'For strength sessions, give a one-sentence overview of the session\'s focus and structure, e.g. "Helkropp, 5 övningar, 3-4 set styrkefokus — se övningslistan för detaljer." (the exercises themselves belong in target_data.exercises, not repeated here). ' +
                  'For rest days, a short encouraging note is enough, e.g. "Vilodag — återhämtning är en del av träningen."',
              },
              target_data: {
                type: 'object',
                description:
                  'Structured, detailed session data. Required (non-empty) for every non-rest day — this is what drives the exercise list / pace breakdown the user actually follows during the session: ' +
                  '- Strength ("strength"): { "exercises": [ { "name": string (Swedish, e.g. "Marklyft"), "sets": number, "reps": string (e.g. "8-10" or "12"), "rest_seconds": number, "notes": string (optional short cue, e.g. "tunga men tekniskt rena set") } ] }. Always list every exercise planned for the session, in order. ' +
                  '- Endurance ("running"/"cycling"/"swimming"/"walking"): { "distance_km": number, "pace": string (e.g. "5:30/km", omit if not pace-based), "segments": [ { "label": string (e.g. "Uppvärmning", "Intervall 1", "Nedvarvning"), "detail": string (e.g. "4×1000m i tröskeltempo, 2 min vila mellan") } ] }. Break the session into its actual segments, not just one line. ' +
                  '- Rest days ("rest"): {}.',
              },
            },
            required: ['scheduled_date', 'activity_type', 'title', 'description', 'target_data'],
          },
        },
      },
      required: ['plan_name', 'goal', 'days'],
    },
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function nextNDaysIso(n: number): string[] {
  const today = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today)
    d.setUTCDate(today.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

const PACEABLE_TYPES = new Set(['running', 'walking', 'cycling'])

function formatPace(secondsPerKm: number): string {
  const min = Math.floor(secondsPerKm / 60)
  const sec = Math.round(secondsPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

// Per activity type: count/avg distance+duration as before, plus (for
// distance-based endurance types) an average pace and the fastest sustained
// pace among longer efforts — a rough threshold-pace proxy the model can
// calibrate easy/tempo/interval paces against, instead of guessing numbers.
function summarizeByType(workouts: WorkoutRow[]): string[] {
  const byType = new Map<string, WorkoutRow[]>()
  for (const w of workouts) {
    byType.set(w.activity_type, [...(byType.get(w.activity_type) ?? []), w])
  }

  return Array.from(byType.entries()).map(([type, rows]) => {
    const totalDistanceKm = rows.reduce((sum, w) => sum + (w.distance_meters ?? 0), 0) / 1000
    const totalDurationMin = rows.reduce((sum, w) => sum + (w.duration_seconds ?? 0), 0) / 60

    const parts = [`${rows.length} pass`]
    if (totalDistanceKm > 0) parts.push(`snitt ${(totalDistanceKm / rows.length).toFixed(1)} km/pass`)
    if (totalDurationMin > 0) parts.push(`snitt ${Math.round(totalDurationMin / rows.length)} min/pass`)

    if (PACEABLE_TYPES.has(type) && totalDistanceKm > 0 && totalDurationMin > 0) {
      parts.push(`snittempo ${formatPace((totalDurationMin * 60) / totalDistanceKm)}`)

      const sustainedEfforts = rows.filter((w) => (w.distance_meters ?? 0) >= 2000 && (w.duration_seconds ?? 0) > 0)
      if (sustainedEfforts.length > 0) {
        const bestPaceSecPerKm = Math.min(
          ...sustainedEfforts.map((w) => w.duration_seconds! / (w.distance_meters! / 1000)),
        )
        parts.push(`snabbaste hållbara tempo ~${formatPace(bestPaceSecPerKm)}`)
      }
    }

    return `${type}: ${parts.join(', ')}`
  })
}

// Recent-vs-prior 4-week volume comparison — tells the model whether the
// user is ramping up, steady, or coming off a break, so a new plan doesn't
// restart too easy for someone already fit or too hard after time off.
function summarizeTrend(workouts: WorkoutRow[]): string | null {
  const now = Date.now()
  const FOUR_WEEKS_MS = 28 * 86_400_000

  const recent = workouts.filter((w) => now - Date.parse(w.started_at) <= FOUR_WEEKS_MS)
  const prior = workouts.filter((w) => {
    const age = now - Date.parse(w.started_at)
    return age > FOUR_WEEKS_MS && age <= FOUR_WEEKS_MS * 2
  })
  if (recent.length === 0) return null

  const recentKm = recent.reduce((s, w) => s + (w.distance_meters ?? 0), 0) / 1000
  const priorKm = prior.reduce((s, w) => s + (w.distance_meters ?? 0), 0) / 1000

  let trendNote = ''
  if (priorKm > 0) {
    const diffPct = Math.round(((recentKm - priorKm) / priorKm) * 100)
    if (diffPct > 15) trendNote = ' (ökande trend jämfört med perioden innan)'
    else if (diffPct < -15) trendNote = ' (minskande trend jämfört med perioden innan, ev. paus/vila — bygg försiktigt upp igen)'
    else trendNote = ' (stabil volym)'
  } else if (recent.length > 0) {
    trendNote = ' (ingen träning loggad perioden innan — nystart eller ny användare av synken)'
  }

  return `Senaste 4 veckorna: ${recent.length} pass, ${recentKm.toFixed(0)} km${trendNote}.`
}

// Compact, human-readable summary instead of raw rows — cheaper on tokens and
// more reliable for Claude to reason about than a long JSON dump.
function summarizeHistory(workouts: WorkoutRow[]): string {
  if (workouts.length === 0) {
    return 'Ingen tidigare träningshistorik finns än — utgå från att användaren är nybörjare/okänd nivå och bygg försiktigt.'
  }

  const oldestIso = workouts[workouts.length - 1].started_at
  const newestIso = workouts[0].started_at
  const spanDays = Math.max(1, Math.round((Date.parse(newestIso) - Date.parse(oldestIso)) / 86_400_000))

  return [
    `All loggad träningshistorik (${workouts.length} pass över ${spanDays} dagar): ${summarizeByType(workouts).join('; ')}.`,
    summarizeTrend(workouts),
  ]
    .filter(Boolean)
    .join(' ')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let prompt: unknown
  let weeksInput: unknown
  try {
    ;({ prompt, weeks: weeksInput } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_REQUEST' }, 400)
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return jsonResponse({ error: 'prompt krävs', code: 'INVALID_REQUEST' }, 400)
  }

  const weeks = Math.min(MAX_WEEKS, Math.max(1, Math.round(Number(weeksInput) || 1)))
  const dayCount = weeks * 7

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Saknar autentisering', code: 'UNAUTHORIZED' }, 401)
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return jsonResponse({ error: 'Saknar autentisering', code: 'UNAUTHORIZED' }, 401)
  }

  const { data: history } = await supabase
    .from('workouts')
    .select('activity_type, started_at, duration_seconds, distance_meters')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  const historySummary = summarizeHistory((history ?? []) as WorkoutRow[])
  const dates = nextNDaysIso(dayCount)

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: Math.min(16000, dayCount * 240 + 800),
      system: `${COACH_SAFETY_SYSTEM_PROMPT}\n\n${PLAN_METHODOLOGY_PROMPT}`,
      tools: [buildPlanTool(dayCount)],
      tool_choice: { type: 'tool', name: 'record_training_plan' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                `Skapa ett träningsschema på ${weeks} veckor (exakt ${dayCount} dagar, i denna ordning): ${dates.join(', ')}. ` +
                `Använd scheduled_date exakt som angivet för respektive dag. ` +
                `${historySummary} ` +
                `Användarens mål: "${prompt}". ` +
                `Basera intensitet, volym och tempo på träningshistoriken ovan när den finns — bygg vidare på nuvarande nivå och uppmätta tempon snarare än att gissa. ` +
                `Följ periodisering, 80/20-fördelning och passvariation enligt instruktionerna i systemprompten, och svara på svenska. ` +
                `Varje tränings dag ska vara fullt specificerad så användaren kan följa passet utan att gissa: styrkepass ska lista varje övning med set/reps i target_data.exercises, ` +
                `och kondition/löppass ska brytas ner i uppvärmning/huvudset/nedvarvning i target_data.segments — se verktygsbeskrivningen för exakt format.`,
            },
          ],
        },
      ],
    })

    const toolUse = message.content.find((block) => block.type === 'tool_use')
    if (!toolUse || toolUse.name !== 'record_training_plan') {
      return jsonResponse({ error: 'Kunde inte generera schema', code: 'PLAN_GENERATION_ERROR' }, 502)
    }

    const plan = toolUse.input as {
      plan_name: string
      goal: string
      days: {
        scheduled_date: string
        activity_type: (typeof ACTIVITY_TYPES)[number]
        title: string
        description: string
        target_data: Record<string, unknown>
      }[]
    }

    await supabase.from('training_plans').update({ status: 'archived' }).eq('user_id', user.id).eq('status', 'active')

    const { data: newPlan, error: planError } = await supabase
      .from('training_plans')
      .insert({
        user_id: user.id,
        name: plan.plan_name,
        goal: plan.goal,
        source_prompt: prompt,
        start_date: dates[0],
        end_date: dates[dates.length - 1],
        status: 'active',
      })
      .select('id')
      .single()

    if (planError || !newPlan) {
      return jsonResponse({ error: planError?.message ?? 'Kunde inte spara schema', code: 'DB_ERROR' }, 500)
    }

    const { error: sessionsError } = await supabase.from('training_plan_sessions').insert(
      plan.days.map((day) => ({
        training_plan_id: newPlan.id,
        scheduled_date: day.scheduled_date,
        activity_type: day.activity_type,
        title: day.title,
        description: day.description,
        target_data: day.target_data,
      })),
    )

    if (sessionsError) {
      return jsonResponse({ error: sessionsError.message, code: 'DB_ERROR' }, 500)
    }

    return jsonResponse({ training_plan_id: newPlan.id })
  } catch (error) {
    const isRateLimit = error instanceof Anthropic.RateLimitError
    const message = error instanceof Error ? error.message : 'Okänt fel'
    return jsonResponse(
      { error: message, code: isRateLimit ? 'RATE_LIMITED' : 'PLAN_GENERATION_ERROR' },
      isRateLimit ? 429 : 502,
    )
  }
})
