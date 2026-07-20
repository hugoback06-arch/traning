import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { useFitnessConnection } from '../../hooks/useFitnessConnection'
import { useConnectStrava } from '../../hooks/useConnectStrava'
import { useManualStravaSync } from '../../hooks/useManualStravaSync'

export function StravaConnectionCard() {
  const { data: connection, isLoading } = useFitnessConnection('strava')
  const connectStrava = useConnectStrava()
  const manualSync = useManualStravaSync()

  if (isLoading) return null

  return (
    <Card className="space-y-2">
      <h2 className="text-sm font-medium text-ink-primary">Strava</h2>

      {connection ? (
        <div className="space-y-2">
          <p className="text-xs text-ink-secondary">
            Ansluten sedan {format(new Date(connection.connected_at), 'd MMM yyyy', { locale: sv })}
            {connection.last_synced_at &&
              ` · Senast synkad ${format(new Date(connection.last_synced_at), 'd MMM HH:mm', { locale: sv })}`}
          </p>
          {manualSync.isError && <p className="text-sm text-warning">Synk misslyckades, försök igen.</p>}
          {manualSync.isSuccess && (
            <p className="text-xs text-ink-secondary">{manualSync.data.synced_count} nya pass synkade.</p>
          )}
          <button
            onClick={() => manualSync.mutate()}
            disabled={manualSync.isPending}
            className="text-sm text-accent underline"
          >
            {manualSync.isPending ? 'Synkar…' : 'Synka nu'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-ink-secondary">
            Anslut Strava för att automatiskt synka dina träningspass.
          </p>
          {connectStrava.isError && <p className="text-sm text-warning">Något gick fel, försök igen.</p>}
          <Button disabled={connectStrava.isPending} onClick={() => connectStrava.mutate()}>
            {connectStrava.isPending ? 'Öppnar Strava…' : 'Anslut Strava'}
          </Button>
        </div>
      )}
    </Card>
  )
}
