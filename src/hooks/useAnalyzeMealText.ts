import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toFunctionError } from '../lib/functionError'
import type { MealPhotoEstimate } from './useAnalyzeMealPhoto'

interface MealTextErrorBody {
  error: string
  code?: string
}

export function useAnalyzeMealText() {
  return useMutation({
    mutationFn: async (description: string): Promise<MealPhotoEstimate> => {
      const { data, error } = await supabase.functions.invoke<MealPhotoEstimate | MealTextErrorBody>(
        'analyze-meal-text',
        { body: { description } },
      )

      if (error) throw await toFunctionError(error, 'Kunde inte analysera beskrivningen')
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte analysera beskrivningen')
      return data
    },
  })
}
