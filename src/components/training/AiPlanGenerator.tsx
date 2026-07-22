import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useActiveTrainingPlan } from '../../hooks/useActiveTrainingPlan'
import { useGenerateTrainingPlan } from '../../hooks/useGenerateTrainingPlan'
import { useTrainingPlanQuestions } from '../../hooks/useTrainingPlanQuestions'
import type { ClarifyingQuestion } from '../../hooks/useTrainingPlanQuestions'

const WEEK_PRESETS = [1, 4, 8, 12]

export function AiPlanGenerator() {
  const [prompt, setPrompt] = useState('')
  const [weeks, setWeeks] = useState(4)
  const [questions, setQuestions] = useState<ClarifyingQuestion[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const { data: activePlan } = useActiveTrainingPlan()
  const generatePlan = useGenerateTrainingPlan()
  const fetchQuestions = useTrainingPlanQuestions()

  function reset() {
    setPrompt('')
    setQuestions(null)
    setAnswers({})
  }

  async function handleGenerate(answerList: { question: string; answer: string }[]) {
    await generatePlan.mutateAsync({ prompt, weeks, answers: answerList })
    reset()
  }

  async function handleNext() {
    if (!prompt.trim()) return
    const result = await fetchQuestions.mutateAsync({ prompt, weeks })
    if (result.length === 0) {
      await handleGenerate([])
      return
    }
    setQuestions(result)
  }

  function handleSubmitAnswers() {
    const answerList = (questions ?? [])
      .filter((q) => answers[q.key]?.trim())
      .map((q) => ({ question: q.question, answer: answers[q.key] }))
    handleGenerate(answerList)
  }

  if (questions) {
    return (
      <Card className="space-y-4">
        <p className="text-sm font-medium text-ink-primary">Några snabba frågor för att göra schemat bättre</p>
        {questions.map((q) => (
          <div key={q.key}>
            <p className="text-xs text-ink-secondary">{q.question}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {q.suggested_answers.map((option) => (
                <button
                  key={option}
                  onClick={() => setAnswers((a) => ({ ...a, [q.key]: option }))}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    answers[q.key] === option ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Eget svar…"
              value={answers[q.key] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        ))}
        {generatePlan.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={generatePlan.isPending}
            onClick={() => handleGenerate([])}
          >
            Hoppa över
          </Button>
          <Button className="flex-1" disabled={generatePlan.isPending} onClick={handleSubmitAnswers}>
            {generatePlan.isPending ? 'Genererar…' : 'Skapa schema'}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-3">
      <input
        type="text"
        placeholder="Beskriv vad du vill uppnå…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div>
        <label className="block text-xs text-ink-secondary">Längd</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {WEEK_PRESETS.map((w) => (
            <button
              key={w}
              onClick={() => setWeeks(w)}
              className={`rounded-full border px-3 py-1 text-xs ${
                weeks === w ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-secondary'
              }`}
            >
              {w} {w === 1 ? 'vecka' : 'veckor'}
            </button>
          ))}
        </div>
      </div>
      {(fetchQuestions.isError || generatePlan.isError) && (
        <p className="text-sm text-warning">Något gick fel, försök igen.</p>
      )}
      <Button
        className="w-full"
        disabled={fetchQuestions.isPending || generatePlan.isPending || !prompt.trim()}
        onClick={handleNext}
      >
        {fetchQuestions.isPending || generatePlan.isPending
          ? 'Tar fram förslag…'
          : activePlan
            ? 'Uppdatera schema'
            : 'Generera schema'}
      </Button>
    </Card>
  )
}
