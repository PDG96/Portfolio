// Service worker: guarda o app e o modelo pra abrir rápido (e offline) no iPhone.
// Versão muda a cada deploy (tools/deploy_site.sh troca o número), o que apaga o cache antigo.
const VERSION = 'v202609171027';
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
// notificações: o push chega vazio (sem payload cifrado); o SW pergunta ao Worker o que está pendente e mostra.
// api e id vêm da URL de registro (sw.js?api=...&id=...), que o navegador guarda.
const CFG = Object.fromEntries(new URL(self.location).searchParams);
const LABEL = { breakfast: 'Café da manhã', lunch: 'Almoço', snack: 'Lanche', dinner: 'Jantar', water: 'Água', sleep: 'Sono' };
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let list = [];
    try { const r = await fetch(`${CFG.api}/pending?id=${CFG.id}`, { cache: 'no-store' }); list = (await r.json()).pending || []; } catch (err) {}
    if (!list.length) list = [{ type: 'pietra', title: 'Pietra', body: 'Dá uma olhada em como ela está.' }];
    const first = list[0];
    const extra = list.length > 1 ? ` · também: ${list.slice(1).map(p => (LABEL[p.type] || p.type).toLowerCase()).join(', ')}` : '';
    // iOS exige mostrar uma notificação por push; a tag substitui a anterior do mesmo tipo em vez de empilhar
    await self.registration.showNotification(first.title, { body: first.body + extra, icon: './favicon-512.png', badge: './favicon-32.png', tag: 'pietra-' + first.type, renotify: true, data: { open: first.type } });
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const open = e.notification.data && e.notification.data.open;
  const target = new URL('./index.html' + (open && open !== 'pietra' ? '?open=' + open : ''), self.location).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const w = list.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.focus().then(() => w.navigate(target)) : self.clients.openWindow(target);
  }));
});
