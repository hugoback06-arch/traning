// Per-user daily caps on the AI functions, enforced in Postgres by
// consume_ai_quota (migration 0037) over a rolling 24-hour window. The caps
// are generous for real use — the text cap also covers a full /admin/ai-eval
// run — and only exist so one account can't run up the Anthropic bill.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export const AI_DAILY_LIMITS = {
  meal_text: 60,
  meal_photo: 30,
  recipes: 20,
} as const

export type AiQuotaKind = keyof typeof AI_DAILY_LIMITS

const QUOTA_LABELS: Record<AiQuotaKind, string> = {
  meal_text: 'beskrivningar',
  meal_photo: 'fotoanalyser',
  recipes: 'receptförslag',
}

/** Consumes one unit of the caller's quota. Returns an error message when the
 * cap is reached, otherwise null. Fails open if the check itself errors, so a
 * database hiccup never takes the AI features down. */
export async function consumeAiQuota(supabase: SupabaseClient, kind: AiQuotaKind): Promise<string | null> {
  const limit = AI_DAILY_LIMITS[kind]
  const { data, error } = await supabase.rpc('consume_ai_quota', { p_kind: kind, p_limit: limit })
  if (error) {
    console.error('consume_ai_quota failed', error)
    return null
  }
  if (data === true) return null
  return `Du har nått gränsen på ${limit} ${QUOTA_LABELS[kind]} per dygn. Försök igen senare.`
}
