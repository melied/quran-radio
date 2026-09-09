/* إذاعة القرآن الكريم — Service Worker
   يخزّن واجهة التطبيق للعمل دون اتصال، ولا يخزّن البث المباشر إطلاقًا. */
var CACHE = 'quran-radio-v1';
var ASSETS = [
  '/preview.html',
  '/generator.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  /* البث المباشر وأي مصادر خارجية (الخطوط/الأيقونات): الشبكة فقط، بلا تخزين */
  if (req.destination === 'audio' || url.origin !== self.location.origin) return;

  /* التنقل: الشبكة أولًا مع سقوط آمن على النسخة المخزنة */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('/preview.html', copy); });
          return res;
        })
        .catch(function () { return caches.match('/preview.html'); })
    );
    return;
  }

  /* الأصول المحلية: المخزن أولًا ثم التحديث من الشبكة */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
