import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { reportError } from './errorReporting'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => reportError(error, 'query', { queryKey: query.queryKey }),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) =>
      reportError(error, 'mutation', { mutationKey: mutation.options.mutationKey ?? null }),
  }),
})
