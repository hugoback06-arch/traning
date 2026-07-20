// Shared core of "ask Claude to evaluate a completed workout" — used by both
// evaluate-workout (on-demand, user-triggered from the workout detail sheet)
// and strava-webhook (automatic, right after a new activity syncs in). Kept
// here so the two call sites can't drift apart on prompt/safety behavior.
import Anthropic from 'npm:@anthropic-ai/sdk'
// deno-lint-ignore no-explicit-any
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { COACH_SAFETY_SYSTEM_PROMPT } from './safetyPrompt.ts'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const MODEL = Deno.env.get('CLAUDE_TEXT_MODEL') ?? 'claude-opus-4-8'

const EVALUATION_TOOL = {
  name: 'record_workout_evaluation',
  description: "Record a short coach-style evaluation of the user's completed workout.",
  input_schema: {
    type: 'object' as const,
    properties: {
      summary: {
        type: 'string',
        description: 'Very short tag-like summary, in Swedish, max ~4 words, e.g. "Bra tempo ↑" or "Stabil progression".',
      },
      feedback: {
        type: 'string',
        description: '1-3 sentences of constructive, supportive feedback, in Swedish.',
      },
      score: { type: 'number', description: 'Overall quality/effort score for this workout, 1-10.' },
    },
    required: ['summary', 'feedback', 'score'],
  },
}

// deno-lint-ignore no-explicit-any
export async function evaluateWorkout(supabase: SupabaseClient<any>, workoutId: string, userId: string) {
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle()

  if (workoutError) return { error: workoutError.message }
  if (!workout) return { error: 'Passet hittades inte' }

  let plannedText = 'Inget planerat pass kopplat.'
  if (workout.training_plan_session_id) {
    const { data: session } = await supabase
      .from('training_plan_sessions')
      .select('title, description, target_data')
      .eq('id', workout.training_plan_session_id)
      .maybeSingle()
    if (session) {
      plannedText = `Planerat pass: "${session.title}"${session.description ? ` — ${session.description}` : ''}. Mål: ${JSON.stringify(session.target_data ?? {})}.`
    }
  }

  const workoutText =
    `Aktivitetstyp: ${workout.activity_type}. ` +
    `${workout.distance_meters ? `Distans: ${(workout.distance_meters / 1000).toFixed(1)} km. ` : ''}` +
    `${workout.duration_seconds ? `Tid: ${Math.round(workout.duration_seconds / 60)} min. ` : ''}` +
    `${workout.avg_heart_rate ? `Snittpuls: ${workout.avg_heart_rate} bpm. ` : ''}` +
    `${workout.calories_burned ? `Kalorier: ${workout.calories_burned} kcal. ` : ''}` +
    `${workout.perceived_exertion ? `Upplevd ansträngning: ${workout.perceived_exertion}/10. ` : ''}`

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: COACH_SAFETY_SYSTEM_PROMPT,
      tools: [EVALUATION_TOOL],
      tool_choice: { type: 'tool', name: 'record_workout_evaluation' },
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: `Utvärdera detta genomförda träningspass åt användaren. ${workoutText} ${plannedText}` }],
        },
      ],
    })

    const toolUse = message.content.find((block) => block.type === 'tool_use')
    if (!toolUse || toolUse.name !== 'record_workout_evaluation') {
      return { error: 'Kunde inte utvärdera passet' }
    }

    const evaluation = toolUse.input as { summary: string; feedback: string; score: number }

    const { data: saved, error: saveError } = await supabase
      .from('workout_evaluations')
      .insert({
        workout_id: workoutId,
        user_id: userId,
        summary: evaluation.summary,
        feedback: evaluation.feedback,
        score: Math.round(evaluation.score),
      })
      .select('*')
      .single()

    if (saveError || !saved) return { error: saveError?.message ?? 'Kunde inte spara utvärdering' }
    return { data: saved }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Okänt fel'
    return { error: message }
  }
}
