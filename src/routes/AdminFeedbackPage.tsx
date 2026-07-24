import { Card } from '../components/common/Card'
import { BackButton } from '../components/common/BackButton'
import { Spinner } from '../components/common/Spinner'
import { useAllFeedbackSuggestions, type FeedbackSuggestion } from '../hooks/useAllFeedbackSuggestions'
import { useUpdateFeedbackHandled } from '../hooks/useUpdateFeedbackHandled'

function FeedbackRow({ suggestion }: { suggestion: FeedbackSuggestion }) {
  const updateHandled = useUpdateFeedbackHandled()

  return (
    <Card className={`space-y-2 ${suggestion.handled ? 'opacity-50' : ''}`}>
      <p className="text-sm text-ink-primary">{suggestion.message}</p>
      <div className="flex items-center justify-between gap-2 text-xs text-ink-secondary">
        <span>
          {new Date(suggestion.created_at).toLocaleString('sv-SE')} · {suggestion.user_id.slice(0, 8)}
        </span>
        <button
          disabled={updateHandled.isPending}
          onClick={() => updateHandled.mutate({ id: suggestion.id, handled: !suggestion.handled })}
          className={`shrink-0 rounded-full border px-3 py-1 ${
            suggestion.handled ? 'border-border text-ink-secondary' : 'border-accent text-accent'
          }`}
        >
          {suggestion.handled ? 'Markera ohanterad' : 'Markera hanterad'}
        </button>
      </div>
    </Card>
  )
}

export function AdminFeedbackPage() {
  const { data: suggestions, isLoading } = useAllFeedbackSuggestions()

  return (
    <div className="space-y-4">
      <div>
        <BackButton to="/profile" label="Profil" />
        <h1 className="font-display text-lg font-semibold">Feedback-förslag</h1>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !suggestions || suggestions.length === 0 ? (
        <p className="text-sm text-ink-secondary">Inga inskickade förslag än.</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <FeedbackRow key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  )
}
