// Supabase Edge Function (Deno). Starts the "Anslut Strava" flow: mints a
// one-time opaque state (stored server-side, tied to the caller's user_id)
// and hands back the Strava authorize URL for the client to redirect to.
// The opaque state — not the user's JWT — travels through the browser/Strava
// redirect, so no bearer token ever ends up in a URL or Strava's logs.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SCOPE = 'read,activity:read_all'

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

  let returnOrigin: unknown
  try {
    ;({ return_origin: returnOrigin } = await req.json())
  } catch {
    return jsonResponse({ error: 'Ogiltig begäran', code: 'INVALID_REQUEST' }, 400)
  }

  if (typeof returnOrigin !== 'string' || !returnOrigin) {
    return jsonResponse({ error: 'return_origin krävs', code: 'INVALID_REQUEST' }, 400)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Saknar autentisering', code: 'UNAUTHORIZED' }, 401)
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

  const state = crypto.randomUUID()
  const { error: insertError } = await supabase
    .from('oauth_states')
    .insert({ state, user_id: user.id, provider: 'strava', return_origin: returnOrigin })

  if (insertError) return jsonResponse({ error: insertError.message, code: 'DB_ERROR' }, 500)

  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/strava-oauth-callback`
  const authorizeUrl = new URL('https://www.strava.com/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', Deno.env.get('STRAVA_CLIENT_ID')!)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('approval_prompt', 'auto')
  authorizeUrl.searchParams.set('scope', SCOPE)
  authorizeUrl.searchParams.set('state', state)

  return jsonResponse({ authorize_url: authorizeUrl.toString() })
})
