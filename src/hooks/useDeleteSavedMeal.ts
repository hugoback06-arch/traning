import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { deleteSavedMeal } from '../lib/savedMeals'
import { useAuth } from './useAuth'

export function useDeleteSavedMeal() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSavedMeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedMeals(userId) })
    },
  })
}
