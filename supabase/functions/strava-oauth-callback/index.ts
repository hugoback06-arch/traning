// Supabase Edge Function (Deno). Strava redirects the user's browser here
// after they approve/deny the "Anslut Strava" consent screen — a plain GET
// navigation, so no Supabase JWT is attached. verify_jwt is OFF for this
// function (see supabase/config.toml); the opaque `state` minted by
// strava-oauth-start is the only thing tying this request back to a user, so
// it must be looked up with the service-role key (bypasses RLS by design —
// this is the one legitimate place for it in this app).
import { createClient } from 'npm:@supabase/supabase-js@2'

const STATE_TTL_MS = 15 * 60 * 1000

function errorPage(message: string): Response {
  return new Response(`Strava-anslutning misslyckades: ${message}`, {
    status: 400,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

function redirect(url: string): Response {
  return new Response(null, { status: 302, headers: { Location: url } })
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const stravaError = url.searchParams.get('error')

  if (!state) return errorPage('saknar state-parameter')

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: stateRow, error: stateError } = await supabase
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .eq('provider', 'strava')
    .maybeSingle()

  if (stateError || !stateRow) return errorPage('okänd eller redan använd state')

  await supabase.from('oauth_states').delete().eq('state', state)

  if (Date.now() - Date.parse(stateRow.created_at) > STATE_TTL_MS) {
    return errorPage('länken har gått ut, försök ansluta igen')
  }

  if (stravaError) {
    return redirect(`${stateRow.return_origin}/profile?strava=denied`)
  }

  if (!code) return errorPage('saknar code-parameter')

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('STRAVA_CLIENT_ID'),
        client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) throw new Error(`token exchange ${tokenRes.status}`)
    const token = await tokenRes.json()

    const { error: upsertError } = await supabase.from('fitness_connections').upsert(
      {
        user_id: stateRow.user_id,
        provider: 'strava',
        external_athlete_id: String(token.athlete?.id ?? ''),
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: new Date(token.expires_at * 1000).toISOString(),
        scope: 'read,activity:read_all',
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' },
    )

    if (upsertError) throw new Error(upsertError.message)

    return redirect(`${stateRow.return_origin}/profile?strava=connected`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'okänt fel'
    return redirect(`${stateRow.return_origin}/profile?strava=error&message=${encodeURIComponent(message)}`)
  }
})
