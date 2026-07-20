import { Link } from 'react-router'
import { AiPlanGenerator } from '../../components/training/AiPlanGenerator'

export function SchedulePage() {
  return (
    <div className="space-y-4">
      <Link to="/training" className="text-sm text-ink-secondary">
        ← Träning
      </Link>
      <h1 className="font-display text-lg font-semibold">🤖 Schemabyggare</h1>
      <AiPlanGenerator />
    </div>
  )
}
