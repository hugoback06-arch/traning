import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'

interface GenerateTrainingPlanErrorBody {
  error: string
  code?: string
}

export interface GenerateTrainingPlanInput {
  prompt: string
  weeks: number
  answers?: { question: string; answer: string }[]
  recentRace?: { distanceKm: number; timeSeconds: number }
}

export function useGenerateTrainingPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      prompt,
      weeks,
      answers,
      recentRace,
    }: GenerateTrainingPlanInput): Promise<{ training_plan_id: string }> => {
      const startDate = format(new Date(), 'yyyy-MM-dd')
      const { data, error } = await supabase.functions.invoke<
        { training_plan_id: string } | GenerateTrainingPlanErrorBody
      >('generate-training-plan', { body: { prompt, weeks, answers, recentRace, startDate } })

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte generera schema')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.planSessionsPrefix })
      queryClient.invalidateQueries({ queryKey: ['training-plans'] })
    },
  })
}
