import { supabase } from './supabase'
import { FunctionError } from './functionError'

// Errors the user is already told about and that say nothing about a bug.
const EXPECTED_CODES = new Set(['QUOTA_EXCEEDED', 'UNAUTHORIZED', 'INVALID_TEXT', 'INVALID_IMAGE', 'INVALID_INPUT'])
const MAX_REPORTS_PER_SESSION = 20

const reported = new Set<string>()

function isExpected(error: unknown): boolean {
  if (error instanceof FunctionError && error.code && EXPECTED_CODES.has(error.code)) return true
  // Offline / aborted requests are noise, not bugs.
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message) && !navigator.onLine) return true
  return false
}

/** Best-effort: stores the error in error_logs (shown on /admin/errors) for
 * signed-in users. Never throws, dedupes per session and caps the volume so a
 * render loop can't flood the table. */
export function reportError(error: unknown, origin: string, context?: Record<string, unknown>): void {
  if (isExpected(error)) return
  const message = (error instanceof Error ? error.message : String(error)).slice(0, 2000)
  const key = `${origin}:${message}`
  if (reported.has(key) || reported.size >= MAX_REPORTS_PER_SESSION) return
  reported.add(key)

  void (async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return
      await supabase.from('error_logs').insert({
        origin: origin.slice(0, 100),
        message,
        stack: error instanceof Error ? (error.stack?.slice(0, 8000) ?? null) : null,
        context: context ?? null,
        url: window.location.pathname.slice(0, 500),
        user_agent: navigator.userAgent.slice(0, 500),
      })
    } catch {
      // Reporting must never cause another error.
    }
  })()
}

export function installGlobalErrorHandlers(): void {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, 'window.error')
  })
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, 'unhandledrejection')
  })
}
