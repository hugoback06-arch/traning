// Records an unexpected Edge Function error in error_logs (migration 0037) so
// it shows up on /admin/errors next to the web app's own errors. Uses the
// caller's client, so the row is attributed to that user via RLS.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export async function logFunctionError(
  supabase: SupabaseClient,
  functionName: string,
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  try {
    await supabase.from('error_logs').insert({
      origin: `edge:${functionName}`,
      message: message.slice(0, 2000),
      stack: stack?.slice(0, 8000) ?? null,
      context: context ?? null,
    })
  } catch (logError) {
    console.error('logFunctionError failed', logError)
  }
}
