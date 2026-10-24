import { FunctionsHttpError } from '@supabase/supabase-js'

// supabase.functions.invoke() turns any non-2xx response into a generic
// "Edge Function returned a non-2xx status code" error — the function's own
// { error } body (e.g. the Claude API's message) is only on error.context.
export async function toFunctionError(error: unknown, fallback: string): Promise<Error> {
  if (error instanceof FunctionsHttpError) {
    const body = await error.context.json().catch(() => null)
    if (body && typeof body.error === 'string') return new Error(body.error)
  }
  return error instanceof Error ? error : new Error(fallback)
}
