import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { renameSavedMeal } from '../lib/savedMeals'
import { useAuth } from './useAuth'

interface RenameSavedMealInput {
  id: string
  name: string
}

export function useRenameSavedMeal() {
  const { session } = useAuth()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: RenameSavedMealInput) => renameSavedMeal(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedMeals(userId) })
    },
  })
}
