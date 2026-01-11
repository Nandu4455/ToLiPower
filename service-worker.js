
/* Service Worker – ToLi Power (static + runtime + offline fallback) */
const VERSION = 'v3';
const STATIC_CACHE = `tolipower-static-${VERSION}`;
const RUNTIME_CACHE = `tolipower-runtime-${VERSION}`;

const CORE_ASSETS = [
  '/', '/index.html', '/style.css', '/script.js',
  '/manifest.webmanifest', '/offline.html',
  '/bilder/hero.png',
  '/icons/icon-192.png', '/icons/icon-512.png',
  '/projekt-solarpark.html',
  '/projekt-windfeld.html',
  '/projekt-wasserkraft.html',
  '/projekt-speicher.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Heuristik:
// - API: network-first (mit Cache-Fallback)
// - Images/CSS/JS: stale-while-revalidate
// - Navigation: offline.html Fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isNavigate = req.mode === 'navigate';
  const isAPI = url.pathname.startsWith('/api/') || url.host.includes('api.');

  if (isAPI) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, net.clone());
        return net;
      } catch {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify({ status: 'offline', message: 'Kein Live-Datenzugriff' }), {
          headers: { 'Content-Type': 'application/json' }, status: 503
        });
      }
    })());
    return;
  }

  if (['image', 'style', 'script', 'font'].includes(req.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then(res => {
        cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return cached || (await fetchPromise) || fetch(req);
    })());
    return;
  }

  if (isNavigate) {
    event.respondWith((async () => {
      try { return await fetch(req); }
      catch {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match('/offline.html')) || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  event.respondWith((async () => (await caches.match(req)) || fetch(req))());
});
