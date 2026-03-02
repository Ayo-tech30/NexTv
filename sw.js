// NexTV Service Worker v3.0
const CACHE = 'nextv-v3';
const SHELL = [
  '/', '/index.html', '/style.css', '/app.js', '/db.js',
  '/movies.html', '/series.html', '/anime.html', '/cartoons.html',
  '/search.html', '/watchlist.html', '/profile.html', '/watch.html',
  '/genre.html', '/404.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache:'reload'})))).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Cache-first for TMDB images
  if (url.hostname === 'image.tmdb.org') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }
  // Network-first for HTML pages
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/404.html'))
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => {}))
  );
});
