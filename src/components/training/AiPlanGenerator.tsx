import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useActiveTrainingPlan } from '../../hooks/useActiveTrainingPlan'
import { useGenerateTrainingPlan } from '../../hooks/useGenerateTrainingPlan'
import { useTrainingPlanQuestions } from '../../hooks/useTrainingPlanQuestions'
import type { ClarifyingQuestion } from '../../hooks/useTrainingPlanQuestions'

const WEEK_PRESETS = [1, 4, 8, 12]
const RACE_DISTANCES = [
  { label: '5 km', km: 5 },
  { label: '10 km', km: 10 },
  { label: 'Halvmaraton', km: 21.1 },
  { label: 'Maraton', km: 42.2 },
]

// Accepts "mm:ss" or "h:mm:ss".
function parseTimeToSeconds(text: string): number | null {
  const parts = text.trim().split(':')
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => p === '' || Number.isNaN(Number(p)))) return null
  const nums = parts.map(Number)
  return nums.length === 2 ? nums[0] * 60 + nums[1] : nums[0] * 3600 + nums[1] * 60 + nums[2]
}

export function AiPlanGenerator() {
  const [prompt, setPrompt] = useState('')
  const [weeks, setWeeks] = useState(4)
  const [raceDistanceKm, setRaceDistanceKm] = useState<number | null>(null)
  const [raceTimeText, setRaceTimeText] = useState('')
  const [questions, setQuestions] = useState<ClarifyingQuestion[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const { data: activePlan } = useActiveTrainingPlan()
  const generatePlan = useGenerateTrainingPlan()
  const fetchQuestions = useTrainingPlanQuestions()

  const raceTimeSeconds = parseTimeToSeconds(raceTimeText)
  const recentRace = raceDistanceKm && raceTimeSeconds ? { distanceKm: raceDistanceKm, timeSeconds: raceTimeSeconds } : undefined

  function reset() {
    setPrompt('')
    setRaceDistanceKm(null)
    setRaceTimeText('')
    setQuestions(null)
    setAnswers({})
  }

  async function handleGenerate(answerList: { question: string; answer: string }[]) {
    await generatePlan.mutateAsync({ prompt, weeks, answers: answerList, recentRace })
    reset()
  }

  async function handleNext() {
    if (!prompt.trim()) return
    const result = await fetchQuestions.mutateAsync({ prompt, weeks, previousPlanGoal: activePlan?.goal ?? null })
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
      <div>
        <label className="block text-xs text-ink-secondary">Senaste bästa löptid (valfritt, ger exaktare löptempo)</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {RACE_DISTANCES.map((d) => (
            <button
              key={d.label}
              onClick={() => setRaceDistanceKm(raceDistanceKm === d.km ? null : d.km)}
              className={`rounded-full border px-3 py-1 text-xs ${
                raceDistanceKm === d.km ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-secondary'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        {raceDistanceKm && (
          <input
            type="text"
            inputMode="numeric"
            placeholder="Tid, t.ex. 24:30"
            value={raceTimeText}
            onChange={(e) => setRaceTimeText(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
          />
        )}
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
