/* SADAD · mode offline.
   Berkas aplikasi disajikan dari simpanan supaya langsung terbuka, lalu diperbarui diam-diam dari jaringan.
   Setiap rilis menaikkan VERSION. Versi baru lalu dipasang di latar belakang dan halaman memuat ulang sekali. */
const VERSION = 'sadad-v2';
const FONTS = 'sadad-fonts';
const SHELL = ['./', 'index.html', 'styles.css', 'core.js', 'quotes.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  // cache: 'reload' melewati simpanan HTTP peramban, supaya yang dipasang benar-benar berkas terbaru dari GitHub.
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== FONTS).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(FONTS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => {
    const fresh = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => hit || c.match('index.html'));
    return hit || fresh;
  })));
});
