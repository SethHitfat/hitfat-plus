/* HITFAT+ service worker: Bara's reminders, and nothing else.
   No fetch handler and no cache, on purpose: the app always loads fresh
   from the network. It only shows a push from plus-push and, when one is
   tapped, brings HITFAT+ to the front. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'HITFAT+', {
    body: d.body || '',
    icon: '/img/mascot/push-icon.png',
    badge: '/img/mascot/push-badge.png',
    tag: d.tag || 'bell',
    renotify: false,
    data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ws) {
    for (var i = 0; i < ws.length; i++) { if ('focus' in ws[i]) return ws[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
