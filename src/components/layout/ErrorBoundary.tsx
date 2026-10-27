import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../common/Button'
import { reportError } from '../../lib/errorReporting'

interface ErrorBoundaryState {
  hasError: boolean
}

// Catches render crashes so the user gets a way out instead of a blank
// screen, and reports them to error_logs.
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, 'render', { componentStack: info.componentStack?.slice(0, 2000) ?? null })
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface-muted p-6 text-center">
        <p className="font-display text-lg font-semibold text-ink-primary">Något gick fel</p>
        <p className="text-sm text-ink-secondary">Felet har rapporterats. Ladda om sidan och försök igen.</p>
        <Button onClick={() => window.location.reload()}>Ladda om</Button>
      </div>
    )
  }
}
