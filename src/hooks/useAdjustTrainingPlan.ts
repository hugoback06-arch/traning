import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import type { IntensityPreference } from '../types/domain'

interface AdjustTrainingPlanErrorBody {
  error: string
  code?: string
}

export interface AdjustTrainingPlanInput {
  trainingPlanId: string
  preference: IntensityPreference
}

export function useAdjustTrainingPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ trainingPlanId, preference }: AdjustTrainingPlanInput): Promise<{ adjusted: boolean; note: string }> => {
      const { data, error } = await supabase.functions.invoke<
        { adjusted: boolean; note: string } | AdjustTrainingPlanErrorBody
      >('adjust-training-plan', { body: { training_plan_id: trainingPlanId, preference } })

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte justera schemat')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.planSessionsPrefix })
      queryClient.invalidateQueries({ queryKey: ['training-plans'] })
    },
  })
}
