/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope

// registerType: 'autoUpdate' relies on the page's registerSW.js posting a
// SKIP_WAITING message once it detects a new worker — without this listener
// the new service worker stays "waiting" until every tab/PWA instance is
// fully closed, so users keep seeing an old cached build indefinitely.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)
