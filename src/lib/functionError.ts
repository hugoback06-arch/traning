import { FunctionsHttpError } from '@supabase/supabase-js'

/** An Edge Function's own { error, code } body, surfaced as an Error. */
export class FunctionError extends Error {
  code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'FunctionError'
    this.code = code
  }
}

// supabase.functions.invoke() turns any non-2xx response into a generic
// "Edge Function returned a non-2xx status code" error — the function's own
// { error } body (e.g. the Claude API's message) is only on error.context.
export async function toFunctionError(error: unknown, fallback: string): Promise<Error> {
  if (error instanceof FunctionsHttpError) {
    const body = await error.context.json().catch(() => null)
    if (body && typeof body.error === 'string') return new FunctionError(body.error, body.code)
  }
  return error instanceof Error ? error : new Error(fallback)
}
