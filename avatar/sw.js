// Service worker: guarda o app e o modelo pra abrir rápido (e offline) no iPhone.
// Versão muda a cada deploy (tools/deploy_site.sh troca o número), o que apaga o cache antigo.
const VERSION = 'v202609170932';
const SHELL = ['./', './index.html', './scene.js', './model.js', './audio.js', './manifest.webmanifest',
  './avatar-tripo-anim.glb', './favicon.png', './favicon-32.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // três.js e fontes do CDN: cache-first (versão fixa na URL)
  const cdn = url.hostname.includes('unpkg.com') || url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com');
  const mine = url.origin === location.origin;
  if (!cdn && !mine) return;
  if (url.pathname.endsWith('.glb') || cdn) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })));
    return;
  }
  // resto (html/js): rede primeiro, cache se estiver offline
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
// notificações (Web Push chega aqui quando o Worker existir)
self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : { title: 'Pietra', body: 'Hora de registrar.' };
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: './favicon-512.png', badge: './favicon-32.png', tag: d.tag || 'pietra', renotify: true, data: d }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL('./index.html' + (e.notification.data && e.notification.data.open ? '?open=' + e.notification.data.open : ''), self.location).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const w = list.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.focus().then(() => w.navigate(target)) : self.clients.openWindow(target);
  }));
});
