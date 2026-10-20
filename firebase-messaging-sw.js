/* (the same retirement as /service-worker.js, for the old app's push worker)
   The old HITFAT+ (built on Movement, mvt.so) registered a Workbox service
   worker here, at /service-worker.js, and kept serving its own cached app on
   app.hitfat.io: phones that ever opened it saw the old app and its "Page Not
   Found" instead of this one (20 Oct 2026). While this path answered 404 the
   browser kept that worker for good. Now a phone that checks for an update
   gets this instead: it empties every cache the old app left, removes
   itself, and reloads the page, which then comes from the network as the
   real HITFAT+ (whose own worker is /sw.js). */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    try { var ks = await caches.keys(); await Promise.all(ks.map(function (k) { return caches.delete(k); })); } catch (x) {}
    try { await self.registration.unregister(); } catch (x) {}
    try {
      var cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      cs.forEach(function (c) { try { c.navigate(c.url); } catch (x) {} });
    } catch (x) {}
  })());
});
/* until it is gone, never answer from a cache */
self.addEventListener('fetch', function () {});
