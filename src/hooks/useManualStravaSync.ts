import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'

interface ManualSyncErrorBody {
  error: string
  code?: string
}

export function useManualStravaSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<{ synced_count: number }> => {
      const { data, error } = await supabase.functions.invoke<
        { synced_count: number } | ManualSyncErrorBody
      >('strava-manual-sync', { body: {} })

      if (error) throw error
      if (!data || 'error' in data) throw new Error(data?.error ?? 'Kunde inte synka')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutsPrefix })
      queryClient.invalidateQueries({ queryKey: queryKeys.planSessionsPrefix })
      queryClient.invalidateQueries({ queryKey: ['fitness-connection'] })
    },
  })
}
