// Sends a web push notification to every subscription a user has registered
// (src/routes/ProfileSettingsPage.tsx "Notiser"-switch). Used by strava-webhook
// when a new activity syncs in the background (see that function's comment on
// why AI evaluation itself isn't auto-triggered — this just nudges the user
// back into the app to do that manually).
// deno-lint-ignore no-explicit-any
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

interface PushPayload {
  title: string
  body: string
  url?: string
}

interface PushSubscriptionRow {
  endpoint: string
  p256dh: string
  auth: string
}

// deno-lint-ignore no-explicit-any
export async function sendPushToUser(supabase: SupabaseClient<any>, userId: string, payload: PushPayload) {
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subscriptions || subscriptions.length === 0) return

  await Promise.all(
    (subscriptions as PushSubscriptionRow[]).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        )
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        } else {
          console.error('sendPushToUser failed', error)
        }
      }
    }),
  )
}
