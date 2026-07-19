import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageCompression'

export interface MealPhotoEstimate {
  food_name: string
  estimated_weight_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: 'low' | 'medium' | 'high'
}

interface MealPhotoErrorBody {
  error: string
  code?: string
}

export function useAnalyzeMealPhoto() {
  return useMutation({
    mutationFn: async (file: File): Promise<MealPhotoEstimate> => {
      const { base64, mimeType } = await compressImage(file)
      const { data, error } = await supabase.functions.invoke<MealPhotoEstimate | MealPhotoErrorBody>(
        'analyze-meal-photo',
        { body: { image_base64: base64, mime_type: mimeType } },
      )

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte analysera bilden')
      return data
    },
  })
}
