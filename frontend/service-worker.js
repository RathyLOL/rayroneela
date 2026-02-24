self.addEventListener('install', e => {
  e.waitUntil(caches.open('amor-v1').then(cache => cache.addAll(['/', 'index.html', 'dashboard.html', 'styles.css', 'script.js'])));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});