/* HITFAT+ service worker: Bara's reminders, and nothing else.
   No fetch handler and no cache, on purpose: the app always loads fresh
   from the network. It only shows a push from plus-push and, when one is
   tapped, brings HITFAT+ to the front, at the place the push points to. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  /* a title of '' is kept: with none, an iPhone shows just "from Hitfat+" and the body */
  e.waitUntil(self.registration.showNotification(typeof d.title === 'string' ? d.title : 'HITFAT+', {
    body: d.body || '',
    /* each reminder its own Bara (Android, desktop); an iPhone shows the app icon */
    icon: (typeof d.icon === 'string' && /^\/img\/mascot\/[a-z0-9_\/-]+\.png$/.test(d.icon)) ? d.icon : '/img/mascot/push-icon.png',
    badge: '/img/mascot/push-badge.png',
    tag: d.tag || 'bell',
    renotify: false,
    data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  /* the app already open: bring it up and tell it where to go (a comment
     opens the class group); closed: open it at that address */
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ws) {
    for (var i = 0; i < ws.length; i++) {
      if ('focus' in ws[i]) { try { ws[i].postMessage({ hf: 'open', url: url }); } catch (x) {} return ws[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
