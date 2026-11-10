/* SADAD · mode offline tanpa nomor versi.
   Setiap kali aplikasi dibuka, berkasnya diambil dari GitHub lebih dulu dengan melewati simpanan HTTP peramban,
   jadi file yang baru kamu unggah langsung terpakai. Salinan di HP hanya cadangan saat offline atau saat jaringan
   terlalu lambat. File ini tidak perlu diubah ketika merilis versi baru. */
const CACHE = 'sadad';
const FONTS = 'sadad-fonts';
const SHELL = ['./', 'index.html', 'styles.css', 'core.js', 'quotes.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const WAIT = 3500; // batas tunggu jaringan saat membuka aplikasi (milidetik) sebelum memakai salinan di HP

// cache: 'no-cache' membuat peramban selalu bertanya ke server. Kalau file belum berubah, server cukup menjawab
// "masih sama" (304) tanpa mengirim ulang isinya, jadi tetap hemat kuota.
function fresh(req) {
  try { return fetch(new Request(req, { cache: 'no-cache' })); } catch (e) { return fetch(req); }
}
function keep(req, res) {
  if (!res || !res.ok) return Promise.resolve();
  const copy = res.clone();
  return caches.open(CACHE).then((c) => c.put(req, copy));
}
const saved = (req) => caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }));

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  // Membuang simpanan bernomor versi dari rilis sebelumnya (sadad-v1, sadad-v2).
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Satu kali buka memakai satu sumber, supaya HTML, skrip, dan gaya tidak bercampur antarversi:
// kalau halaman utama terpaksa diambil dari salinan di HP, berkas lainnya ikut dari salinan.
let fromSaved = false, openedAt = 0;

function openPage(req, net) {
  return new Promise((resolve, reject) => {
    let done = false;
    const use = (res, offline) => { if (done || !res) return; done = true; fromSaved = offline; openedAt = Date.now(); resolve(res); };
    const fallback = () => saved(req).then((hit) => hit || saved('./'));
    net.then(
      (res) => { if (res.ok || res.type === 'opaqueredirect') use(res, false); else fallback().then((hit) => use(hit || res, !!hit)); },
      () => fallback().then((hit) => { if (hit) use(hit, true); else if (!done) { done = true; reject(new TypeError('offline')); } })
    );
    setTimeout(() => fallback().then((hit) => use(hit, true)), WAIT);
  });
}
function getFile(req, net) {
  if (fromSaved && Date.now() - openedAt < 60000) return saved(req).then((hit) => hit || net);
  return net.then((res) => (res.ok ? res : saved(req).then((hit) => hit || res)), () => saved(req).then((hit) => hit || Response.error()));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(FONTS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== self.location.origin) return;
  const net = fresh(req);
  // Salinan di HP selalu diperbarui dari jaringan, termasuk saat yang ditampilkan masih salinan lama.
  e.waitUntil(net.then((res) => keep(req, res)).catch(() => {}));
  e.respondWith(req.mode === 'navigate' ? openPage(req, net) : getFile(req, net));
});
