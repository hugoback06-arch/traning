import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/common/Card'

type Status = 'idle' | 'sending' | 'sent' | 'verifying' | 'error'

export function LoginPage() {
  const { session, loading, signInWithMagicLink, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await signInWithMagicLink(email)
    if (error) {
      setErrorMessage(error)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault()
    setStatus('verifying')
    const { error } = await verifyOtp(email, code)
    if (error) {
      setErrorMessage(error)
      setStatus('error')
    }
  }

  const showCodeStep = status === 'sent' || status === 'verifying' || (status === 'error' && code !== '')

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4">
      <Card>
        <h1 className="text-lg font-semibold">Logga in</h1>

        {!showCodeStep ? (
          <form onSubmit={handleSendCode} className="mt-4 space-y-3">
            <input
              type="email"
              required
              autoFocus
              placeholder="din@epost.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
            >
              {status === 'sending' ? 'Skickar…' : 'Skicka kod'}
            </button>
            {status === 'error' && <p className="text-sm text-warning">{errorMessage}</p>}
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="mt-4 space-y-3">
            <p className="text-sm text-ink-secondary">
              Vi har skickat en 6-siffrig kod till <strong>{email}</strong>. Ange den nedan.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-center text-lg tracking-widest outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={status === 'verifying'}
              className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
            >
              {status === 'verifying' ? 'Loggar in…' : 'Logga in'}
            </button>
            {status === 'error' && <p className="text-sm text-warning">{errorMessage}</p>}
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setCode('')
              }}
              className="flex w-full items-center justify-center gap-0.5 text-center text-xs text-ink-secondary"
            >
              <ChevronLeft size={13} /> Ange en annan e-postadress
            </button>
          </form>
        )}
      </Card>
    </div>
  )
}
