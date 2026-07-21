import { useEffect, useState, type ReactNode } from 'react'
import type { AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

// supabase-js builds its error message from the raw (unparsed) fetch Response
// for any 5xx status — JSON.stringify(Response) is "{}", so error.message is
// literally the string "{}" on server-side failures (e.g. email sending
// failing). Show a real message for those instead of leaking that artifact.
function authErrorMessage(error: AuthError | null): string | null {
  if (!error) return null
  if (!error.status || error.status >= 500 || /^\{.*\}$/.test(error.message)) {
    return 'Kunde inte skicka koden just nu — försök igen om en liten stund.'
  }
  return error.message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    return { error: authErrorMessage(error) }
  }

  async function verifyOtp(email: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    return { error: authErrorMessage(error) }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, signInWithMagicLink, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
