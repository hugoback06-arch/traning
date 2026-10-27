import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/common/Card'
import { BackButton } from '../components/common/BackButton'
import { Button } from '../components/common/Button'
import { Spinner } from '../components/common/Spinner'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'

interface ErrorLog {
  id: string
  user_id: string
  origin: string
  message: string
  stack: string | null
  context: Record<string, unknown> | null
  url: string | null
  user_agent: string | null
  created_at: string
}

const PAGE_SIZE = 200

function ErrorRow({ log }: { log: ErrorLog }) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="space-y-1">
      <button onClick={() => setOpen((value) => !value)} className="block w-full text-left">
        <p className="break-words text-sm text-ink-primary">{log.message}</p>
        <p className="text-xs text-ink-secondary">
          {new Date(log.created_at).toLocaleString('sv-SE')} · {log.origin}
          {log.url ? ` · ${log.url}` : ''} · {log.user_id.slice(0, 8)}
        </p>
      </button>
      {open && (
        <pre className="max-h-64 overflow-auto rounded-lg bg-surface-muted p-2 text-[11px] whitespace-pre-wrap text-ink-secondary">
          {[
            log.context ? JSON.stringify(log.context, null, 2) : null,
            log.stack,
            log.user_agent,
          ]
            .filter(Boolean)
            .join('\n\n')}
        </pre>
      )}
    </Card>
  )
}

export function AdminErrorsPage() {
  const queryClient = useQueryClient()
  const { data: logs, isLoading } = useQuery({
    queryKey: queryKeys.errorLogs,
    queryFn: async (): Promise<ErrorLog[]> => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
      if (error) throw error
      return data as ErrorLog[]
    },
  })

  const clearAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('error_logs').delete().not('id', 'is', null)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.errorLogs }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <BackButton to="/profile" label="Profil" />
          <h1 className="font-display text-lg font-semibold">Fellogg</h1>
          <p className="text-xs text-ink-secondary">De senaste {PAGE_SIZE} felen från appen och Edge Functions.</p>
        </div>
        <Button
          variant="secondary"
          disabled={!logs?.length || clearAll.isPending}
          onClick={() => confirm('Rensa hela felloggen?') && clearAll.mutate()}
        >
          Rensa
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !logs || logs.length === 0 ? (
        <p className="text-sm text-ink-secondary">Inga fel loggade.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <ErrorRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}
