// Supabase Edge Function (Deno). Strava redirects the user's browser here
// after they approve/deny the "Anslut Strava" consent screen — a plain GET
// navigation, so no Supabase JWT is attached. verify_jwt is OFF for this
// function (see supabase/config.toml); the opaque `state` minted by
// strava-oauth-start is the only thing tying this request back to a user, so
// it must be looked up with the service-role key (bypasses RLS by design —
// this is the one legitimate place for it in this app).
//
// IMPORTANT: this function does NOT link fitness_connections itself. state
// only proves who *started* the flow, not who is sitting in the browser that
// completed it — Strava's redirect carries no session of ours, so a state
// minted by an attacker and handed to a victim would otherwise get the
// victim's real Strava tokens linked to the attacker's account. Instead this
// function stashes the exchanged tokens on the oauth_states row and hands off
// to strava-oauth-finalize, which runs with the *caller's* JWT and relies on
// RLS to only let the user who actually started the flow claim the tokens.
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

  if (Date.now() - Date.parse(stateRow.created_at) > STATE_TTL_MS) {
    await supabase.from('oauth_states').delete().eq('state', state)
    return errorPage('länken har gått ut, försök ansluta igen')
  }

  if (stravaError) {
    await supabase.from('oauth_states').delete().eq('state', state)
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

    // Stash the exchanged tokens on the state row rather than linking
    // fitness_connections directly — strava-oauth-finalize (called with the
    // completing browser's own JWT) is what actually claims them, so only the
    // account that started this flow can ever pick them up.
    const { error: updateError } = await supabase
      .from('oauth_states')
      .update({
        pending_access_token: token.access_token,
        pending_refresh_token: token.refresh_token,
        pending_expires_at: new Date(token.expires_at * 1000).toISOString(),
        pending_external_athlete_id: String(token.athlete?.id ?? ''),
        pending_scope: 'read,activity:read_all',
      })
      .eq('state', state)

    if (updateError) throw new Error(updateError.message)

    return redirect(`${stateRow.return_origin}/profile?strava=pending&state=${encodeURIComponent(state)}`)
  } catch (error) {
    await supabase.from('oauth_states').delete().eq('state', state)
    const message = error instanceof Error ? error.message : 'okänt fel'
    return redirect(`${stateRow.return_origin}/profile?strava=error&message=${encodeURIComponent(message)}`)
  }
})
