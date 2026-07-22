import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ClarifyingQuestion {
  key: string
  question: string
  suggested_answers: string[]
}

interface TrainingPlanQuestionsInput {
  prompt: string
  weeks: number
  previousPlanGoal?: string | null
}

interface TrainingPlanQuestionsErrorBody {
  error: string
  code?: string
}

export function useTrainingPlanQuestions() {
  return useMutation({
    mutationFn: async ({
      prompt,
      weeks,
      previousPlanGoal,
    }: TrainingPlanQuestionsInput): Promise<ClarifyingQuestion[]> => {
      const { data, error } = await supabase.functions.invoke<
        { questions: ClarifyingQuestion[] } | TrainingPlanQuestionsErrorBody
      >('training-plan-questions', { body: { prompt, weeks, previousPlanGoal } })

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte ta fram frågor')
      return data.questions
    },
  })
}
