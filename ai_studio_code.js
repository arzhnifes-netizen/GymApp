const CACHE_NAME = 'strong-il-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});