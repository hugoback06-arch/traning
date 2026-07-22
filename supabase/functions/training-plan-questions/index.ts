// Supabase Edge Function (Deno). Given the user's free-text goal for
// generate-training-plan, asks Claude for a short list of clarifying
// questions (frequency/week, session length, intensity, etc.) grounded in
// the goal + training history — answers get fed back into
// generate-training-plan to produce a better-targeted plan. A separate,
// cheap/fast model from CLAUDE_PLAN_MODEL since this is a small, low-stakes
// generation and latency matters (it blocks the user before they even see
// the questions).
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { COACH_SAFETY_SYSTEM_PROMPT } from '../_shared/safetyPrompt.ts'
import { fetchHistorySummary } from '../_shared/trainingHistory.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

// Match the exact model string already proven to work in this project
// (CLAUDE_VISION_MODEL/CLAUDE_TEXT_MODEL secrets use this same form) rather
// than a dated snapshot id that's never been verified against this account.
const MODEL = Deno.env.get('CLAUDE_QUESTIONS_MODEL') ?? 'claude-haiku-4-5'
const MAX_WEEKS = 12

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const QUESTIONS_TOOL = {
  name: 'ask_clarifying_questions',
  description:
    'Record 2-4 short clarifying questions to ask the user before building their training plan, each with quick-tap suggested answers.',
  input_schema: {
    type: 'object' as const,
    properties: {
      questions: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Short machine-readable id, e.g. "frequency", "session_length".' },
            question: { type: 'string', description: 'The question itself, in Swedish, short and concrete.' },
            suggested_answers: {
              type: 'array',
              minItems: 2,
              maxItems: 5,
              items: { type: 'string' },
              description: 'Short quick-tap answer options, in Swedish, e.g. ["2-3 ggr/vecka", "4-5 ggr/vecka", "6+ ggr/vecka"].',
            },
          },
          required: ['key', 'question', 'suggested_answers'],
        },
      },
    },
    required: ['questions'],
  },
}

const QUESTIONS_SYSTEM_PROMPT = `Du hjälper till att ta fram uppföljningsfrågor innan ett träningsschema byggs.
Ställ alltid minst 2 frågor, även om målet känns tydligt — det finns nästan alltid någon detalj
kvar som skulle förbättra schemat (t.ex. hur många pass/vecka, hur långa pass i tid, önskad
intensitet/ansträngningsnivå, specifikt måldatum eller lopp, eventuella begränsningar som skador,
utrustning eller platsbrist). Prioritera frågor vars svar faktiskt förändrar hur schemat byggs —
hoppa bara över en specifik fråga om just den redan besvaras tydligt av målet eller av
träningshistoriken (fråga t.ex. inte om träningsfrekvens om historiken redan visar ett tydligt,
stabilt mönster), men ersätt den då med en annan relevant fråga istället för att lämna färre än
2 kvar. Max 4 frågor totalt. Varje fråga ska ha 2-5 korta, konkreta svarsalternativ (inte "annat"
eller öppna svar — användaren kan ändå skriva eget svar i appen). Kort och koncist. Svara alltid
på svenska.

Om användaren UPPDATERAR ett befintligt schema (framgår av kontexten nedan): fokusera frågorna på
vad som ska ÄNDRAS jämfört med förra schemat — t.ex. vad som funkade bra/dåligt, om frekvens/
intensitet/passtyper ska ändras, om målet är detsamma eller nytt. Ställ inte samma generiska
förstagångsfrågor som om det vore ett helt nytt schema.`

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let prompt: unknown
  let weeksInput: unknown
  let previousPlanGoalInput: unknown
  try {
    ;({ prompt, weeks: weeksInput, previousPlanGoal: previousPlanGoalInput } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_REQUEST' }, 400)
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return jsonResponse({ error: 'prompt krävs', code: 'INVALID_REQUEST' }, 400)
  }

  const previousPlanGoal = typeof previousPlanGoalInput === 'string' ? previousPlanGoalInput.trim() : null

  const weeks = Math.min(MAX_WEEKS, Math.max(1, Math.round(Number(weeksInput) || 1)))

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

  const historySummary = await fetchHistorySummary(supabase, user.id)

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `${COACH_SAFETY_SYSTEM_PROMPT}\n\n${QUESTIONS_SYSTEM_PROMPT}`,
      tools: [QUESTIONS_TOOL],
      tool_choice: { type: 'tool', name: 'ask_clarifying_questions' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                `Användaren vill bygga ett träningsschema på ${weeks} veckor. ` +
                `Mål: "${prompt}". ` +
                (previousPlanGoal
                  ? `Detta är en UPPDATERING av ett befintligt aktivt schema, vars nuvarande mål är: "${previousPlanGoal}". `
                  : '') +
                `${historySummary}`,
            },
          ],
        },
      ],
    })

    const toolUse = message.content.find((block) => block.type === 'tool_use')
    if (!toolUse || toolUse.name !== 'ask_clarifying_questions') {
      return jsonResponse({ questions: [] })
    }

    return jsonResponse(toolUse.input)
  } catch (error) {
    const isRateLimit = error instanceof Anthropic.RateLimitError
    const message = error instanceof Error ? error.message : 'Okänt fel'
    return jsonResponse(
      { error: message, code: isRateLimit ? 'RATE_LIMITED' : 'QUESTIONS_ERROR' },
      isRateLimit ? 429 : 502,
    )
  }
})
