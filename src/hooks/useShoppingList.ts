import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'

export interface ShoppingListItem {
  id: string
  name: string
  amount: string
  recipe_title: string | null
  checked: boolean
  created_at: string
}

export interface NewShoppingListItem {
  name: string
  amount: string
  recipeTitle: string
}

export function useShoppingList() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: queryKeys.shoppingList(userId),
    queryFn: async (): Promise<ShoppingListItem[]> => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('id, name, amount, recipe_title, checked, created_at')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as ShoppingListItem[]
    },
    enabled: !!userId,
  })
}

function useShoppingListMutation<TInput>(mutationFn: (input: TInput) => Promise<void>) {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList(session?.user.id) })
    },
  })
}

export function useAddToShoppingList() {
  return useShoppingListMutation(async (items: NewShoppingListItem[]) => {
    const { error } = await supabase.from('shopping_list_items').insert(
      items.map((item) => ({ name: item.name, amount: item.amount, recipe_title: item.recipeTitle })),
    )
    if (error) throw error
  })
}

export function useSetShoppingItemsChecked() {
  return useShoppingListMutation(async ({ ids, checked }: { ids: string[]; checked: boolean }) => {
    const { error } = await supabase.from('shopping_list_items').update({ checked }).in('id', ids)
    if (error) throw error
  })
}

export function useDeleteShoppingItems() {
  return useShoppingListMutation(async (ids: string[]) => {
    const { error } = await supabase.from('shopping_list_items').delete().in('id', ids)
    if (error) throw error
  })
}
