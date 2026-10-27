import { useState } from 'react'
import { Card } from '../components/common/Card'
import { BackButton } from '../components/common/BackButton'
import { Button } from '../components/common/Button'
import { supabase } from '../lib/supabase'
import { toFunctionError } from '../lib/functionError'
import { GENERIC_FOODS } from '../data/genericFoods'
import { MEAL_EVAL_CASES } from '../data/mealEvalCases'
import type { MealPhotoEstimate } from '../hooks/useAnalyzeMealPhoto'

const CONCURRENCY = 3

interface CaseResult {
  expectedKcal: number
  kcal?: number
  error?: string
}

const foodsBySlug = new Map(GENERIC_FOODS.map((food) => [food.slug, food]))

function expectedKcal(index: number): number {
  return MEAL_EVAL_CASES[index].components.reduce((total, { slug, grams }) => {
    const food = foodsBySlug.get(slug)
    if (!food) throw new Error(`Okänd slug i mealEvalCases: ${slug}`)
    return total + (food.caloriesPer100g * grams) / 100
  }, 0)
}

async function runEstimate(description: string): Promise<number> {
  const { data, error } = await supabase.functions.invoke<MealPhotoEstimate>('analyze-meal-text', {
    body: { description },
  })
  if (error) throw await toFunctionError(error, 'Okänt fel')
  if (!data) throw new Error('Tomt svar')
  return data.calories
}

function percentError(estimate: number, expected: number): number {
  return ((estimate - expected) / expected) * 100
}

function summarize(results: CaseResult[]) {
  const errors = results
    .filter((result) => result.kcal !== undefined)
    .map((result) => percentError(result.kcal!, result.expectedKcal))
  if (errors.length === 0) return null
  const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length
  return {
    count: errors.length,
    meanAbsolute: mean(errors.map(Math.abs)),
    bias: mean(errors),
    within15: errors.filter((value) => Math.abs(value) <= 15).length,
  }
}

function formatSigned(value: number): string {
  return `${value > 0 ? '+' : ''}${Math.round(value)} %`
}

export function AdminAiEvalPage() {
  const [results, setResults] = useState<CaseResult[]>(() =>
    MEAL_EVAL_CASES.map((_, index) => ({ expectedKcal: expectedKcal(index) })),
  )
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  async function runAll() {
    setRunning(true)
    setCopied(false)
    setResults((current) => current.map(({ expectedKcal }) => ({ expectedKcal })))

    let next = 0
    async function worker() {
      while (next < MEAL_EVAL_CASES.length) {
        const index = next++
        try {
          const kcal = await runEstimate(MEAL_EVAL_CASES[index].description)
          setResults((current) => current.map((result, i) => (i === index ? { ...result, kcal } : result)))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Okänt fel'
          setResults((current) => current.map((result, i) => (i === index ? { ...result, error: message } : result)))
        }
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    setRunning(false)
  }

  const summary = summarize(results)

  async function copySummary() {
    const headline = summary
      ? `Medelfel ${Math.round(summary.meanAbsolute)} %, bias ${formatSigned(summary.bias)}, inom ±15 %: ${summary.within15}/${summary.count}`
      : 'Inga resultat'
    const rows = MEAL_EVAL_CASES.map((evalCase, index) => {
      const result = results[index]
      const cell = result.error ?? (result.kcal !== undefined ? Math.round(result.kcal) : '–')
      return `${evalCase.description} | facit ${Math.round(result.expectedKcal)} | ${cell}`
    })
    await navigator.clipboard.writeText([headline, '', 'fall | facit | uppskattning', ...rows].join('\n'))
    setCopied(true)
  }

  return (
    <div className="space-y-4">
      <div>
        <BackButton to="/profile" label="Profil" />
        <h1 className="font-display text-lg font-semibold">AI-uppskattning: test</h1>
        <p className="text-xs text-ink-secondary">
          Kör {MEAL_EVAL_CASES.length} beskrivningar genom uppskattningen och jämför mot facit från livsmedelsdatabasen.
        </p>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" disabled={running} onClick={runAll}>
          {running ? 'Kör…' : 'Kör testet'}
        </Button>
        <Button variant="secondary" disabled={running || !summary} onClick={copySummary}>
          {copied ? 'Kopierat!' : 'Kopiera'}
        </Button>
      </div>

      <Card className="space-y-1">
        {summary ? (
          <>
            <p className="font-display text-2xl font-semibold text-ink-primary">{Math.round(summary.meanAbsolute)} %</p>
            <p className="text-xs text-ink-secondary">medelfel</p>
            <p className="text-xs text-ink-secondary">bias {formatSigned(summary.bias)}</p>
            <p className="text-xs text-ink-secondary">
              inom ±15 %: {summary.within15}/{summary.count}
            </p>
          </>
        ) : (
          <p className="text-xs text-ink-secondary">Inga resultat än</p>
        )}
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-ink-secondary">
            <tr>
              <th className="py-1 pr-2 font-medium">Beskrivning</th>
              <th className="py-1 pr-2 text-right font-medium">Facit</th>
              <th className="py-1 pl-2 text-right font-medium">Uppskattning</th>
            </tr>
          </thead>
          <tbody className="text-ink-primary">
            {MEAL_EVAL_CASES.map((evalCase, index) => {
              const result = results[index]
              return (
                <tr key={evalCase.description} className="border-t border-border align-top">
                  <td className="py-1.5 pr-2">{evalCase.description}</td>
                  <td className="py-1.5 pr-2 text-right">{Math.round(result.expectedKcal)}</td>
                  <td className="py-1.5 pl-2 text-right">
                    {result.error ? (
                      <span className="block max-w-28 break-words text-warning">{result.error}</span>
                    ) : result.kcal === undefined ? (
                      <span className="text-ink-secondary">–</span>
                    ) : (
                      <>
                        {Math.round(result.kcal)}
                        <span className="block text-ink-secondary">{formatSigned(percentError(result.kcal, result.expectedKcal))}</span>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
