import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useActiveTrainingPlan } from '../../hooks/useActiveTrainingPlan'
import { useGenerateTrainingPlan } from '../../hooks/useGenerateTrainingPlan'

const WEEK_PRESETS = [1, 4, 8, 12]

export function AiPlanGenerator() {
  const [prompt, setPrompt] = useState('')
  const [weeks, setWeeks] = useState(4)
  const { data: activePlan } = useActiveTrainingPlan()
  const generatePlan = useGenerateTrainingPlan()

  async function handleGenerate() {
    if (!prompt.trim()) return
    await generatePlan.mutateAsync({ prompt, weeks })
    setPrompt('')
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
      {generatePlan.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
      <Button
        className="w-full"
        disabled={generatePlan.isPending || !prompt.trim()}
        onClick={handleGenerate}
      >
        {generatePlan.isPending ? 'Genererar…' : activePlan ? 'Uppdatera schema' : 'Generera schema'}
      </Button>
    </Card>
  )
}
