const CACHE_NAME = 'pulse-pwa-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './parent.html',
  './teacher.html',
  './portals.html',
  './planner.html',
  './timetable.html',
  './exam.html',
  './marks.html',
  './attendance.html',
  './flashcards.html',
  './classroom.html',
  './notes.html',
  './analytics.html',
  './focus.html',
  './wellness.html',
  './progress.html',
  './search.html',
  './settings.html',
  './style.css',
  './navigation.js',
  './student-auth.js',
  './supabase.js',
  './pwa-installer.js',
  './portal-switcher.js',
  './manifest.json',
  './pwa-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        const refresh = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./portals.html');
        throw new Error('PULSE is offline and this page is not cached.');
      });
    })
  );
});