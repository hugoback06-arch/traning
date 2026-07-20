// Supabase Edge Function (Deno). Second half of the OAuth account-linking fix
// (see supabase/migrations/0010_oauth_pending_link.sql and the comment atop
// strava-oauth-callback/index.ts): the callback stashes exchanged Strava
// tokens on the oauth_states row and redirects the browser here (via the SPA,
// with the browser's own Supabase session attached) instead of linking
// fitness_connections itself.
//
// This function runs authenticated (verify_jwt = true) and uses the anon key
// + the caller's forwarded JWT — NOT the service-role key — specifically so
// that RLS ("manage own oauth states": auth.uid() = user_id) enforces
// ownership for us: a state minted under one account is simply invisible to
// any other account's session, so an attacker who mints a state and gets a
// victim to complete the Strava consent screen can no longer have the
// victim's tokens land on the attacker's account.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STATE_TTL_MS = 15 * 60 * 1000

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Saknar autentisering', code: 'UNAUTHORIZED' }, 401)
  }

  let state: unknown
  try {
    ;({ state } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_REQUEST' }, 400)
  }

  if (typeof state !== 'string' || !state) {
    return jsonResponse({ error: 'state krävs', code: 'INVALID_REQUEST' }, 400)
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return jsonResponse({ error: 'Saknar autentisering', code: 'UNAUTHORIZED' }, 401)
  }

  // RLS scopes this to rows where oauth_states.user_id = auth.uid() — a state
  // minted by a different account simply won't be found here.
  const { data: stateRow, error: stateError } = await supabase
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .eq('provider', 'strava')
    .maybeSingle()

  if (stateError || !stateRow) {
    return jsonResponse({ error: 'Okänd länk eller tillhör en annan användare', code: 'NOT_FOUND' }, 404)
  }

  if (Date.now() - Date.parse(stateRow.created_at) > STATE_TTL_MS) {
    await supabase.from('oauth_states').delete().eq('state', state)
    return jsonResponse({ error: 'Länken har gått ut, försök ansluta igen', code: 'EXPIRED' }, 400)
  }

  if (!stateRow.pending_access_token) {
    return jsonResponse({ error: 'Anslutningen är inte klar än, försök igen', code: 'NOT_READY' }, 409)
  }

  const { error: upsertError } = await supabase.from('fitness_connections').upsert(
    {
      user_id: user.id,
      provider: 'strava',
      external_athlete_id: stateRow.pending_external_athlete_id,
      access_token: stateRow.pending_access_token,
      refresh_token: stateRow.pending_refresh_token,
      expires_at: stateRow.pending_expires_at,
      scope: stateRow.pending_scope,
      connected_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,provider' },
  )

  await supabase.from('oauth_states').delete().eq('state', state)

  if (upsertError) {
    return jsonResponse({ error: upsertError.message, code: 'DB_ERROR' }, 500)
  }

  return jsonResponse({ connected: true })
})
