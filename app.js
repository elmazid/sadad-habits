/* SADAD · tampilan & interaksi. Tanpa framework dan tanpa server; semua data tersimpan di perangkat. */
(function () {
  'use strict';
  const C = window.SADAD_CORE, QD = window.SADAD_QUOTES, PREVIEW = !!window.SADAD_PREVIEW;
  const KEY = 'sadad.v1', VERSION = '1.2';
  const { pad, parse, addDays, diffDays } = C;

  /* ================= util ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hm = (m) => { m = Math.round(m); m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  const toMin = (s) => { const a = String(s || '').split(':'); return (+a[0] || 0) * 60 + (+a[1] || 0); };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const DOW = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], DOW3 = ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const MON = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const longDate = (k) => { const d = parse(k); return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()]; };
  const shortDate = (k) => { const d = parse(k); return d.getDate() + ' ' + MON3[d.getMonth()]; };
  const fullDate = (k) => { const d = parse(k); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); };
  const standalone = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch (e) { return false; } };
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const P = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    down: '<path d="M6 9l6 6 6-6"/>', left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>', up: '<path d="M6 15l6-6 6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    noon: '<circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    dawn: '<path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 9V5M9.5 7.5L12 5l2.5 2.5M4.5 11l1.8 1.8M19.5 11l-1.8 1.8"/>',
    sunset: '<path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 5v4M9.5 6.5L12 9l2.5-2.5M4.5 11l1.8 1.8M19.5 11l-1.8 1.8"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    loop: '<path d="M17 4l3 3-3 3M20 7H8a4 4 0 0 0-4 4M7 20l-3-3 3-3M4 17h12a4 4 0 0 0 4-4"/>',
    week: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', flag: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
    sliders: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.6"/><circle cx="8" cy="17" r="2.6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
    shield: '<path d="M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6l7-3z"/>', star: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6 6.9 19.3l1-5.7-4.1-4 5.7-.8L12 3.6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', pause: '<path d="M9 5v14M15 5v14"/>', play: '<path d="M8 5l11 7-11 7V5z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    share: '<path d="M12 15V3M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>', book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', eyeoff: '<path d="M3 3l18 18M10.6 5.2A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.2 6.6A16.6 16.6 0 0 0 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    save: '<path d="M5 4h11l3 3v13H5V4zM8 4v5h7V4M8 20v-6h8v6"/>',
    note: '<path d="M7 3h7l5 5v13H7V3z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>',
  };
  const ic = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

  const BL = {
    subuh: { n: 'Subuh', ar: 'الفجر', ic: 'dawn' }, pagi: { n: 'Pagi', ar: 'الضُّحى', ic: 'sun' }, siang: { n: 'Siang', ar: 'الظَّهيرة', ic: 'noon' },
    sore: { n: 'Sore', ar: 'الأصيل', ic: 'sunset' }, malam: { n: 'Malam', ar: 'اللَّيل', ic: 'moon' }, any: { n: 'Kapan saja', ar: '', ic: 'loop' },
  };
  const CITIES = [
    ['Madinah', 24.4672, 39.6112, 'Asia/Riyadh'], ['Makkah', 21.4225, 39.8262], ['Jeddah', 21.5433, 39.1728], ['Riyadh', 24.7136, 46.6753],
    ['Jakarta', -6.2088, 106.8456, 'Asia/Jakarta'], ['Bandung', -6.9175, 107.6191], ['Semarang', -6.9667, 110.4167], ['Yogyakarta', -7.7956, 110.3695],
    ['Surabaya', -7.2575, 112.7521], ['Malang', -7.9666, 112.6326], ['Jember', -8.1845, 113.6681], ['Medan', 3.5952, 98.6722], ['Padang', -0.9471, 100.4172],
    ['Palembang', -2.9761, 104.7754], ['Pontianak', -0.0263, 109.3425, 'Asia/Pontianak'], ['Banjarmasin', -3.3186, 114.5944], ['Makassar', -5.1477, 119.4327, 'Asia/Makassar'],
    ['Denpasar', -8.6705, 115.2126], ['Jayapura', -2.5916, 140.669, 'Asia/Jayapura'], ['Kuala Lumpur', 3.139, 101.6869, 'Asia/Kuala_Lumpur'], ['Kairo', 30.0444, 31.2357, 'Africa/Cairo'], ['Istanbul', 41.0082, 28.9784, 'Europe/Istanbul'],
  ];
  const MILES = [7, 30, 66, 100, 365];
  const MILE = {
    7: ['Sepekan penuh', 'Tujuh hari berturut-turut. Fondasinya sudah diletakkan.'],
    30: ['Sebulan', 'Tiga puluh hari. Rutinitas ini mulai terasa bagian dari harimu.'],
    66: ['Enam puluh enam hari', 'Dalam penelitian, ini median waktu sebuah perilaku menjadi otomatis, dengan rentang 18 sampai 254 hari.'],
    100: ['Seratus hari', 'Tiga digit. Yang dulu butuh niat, sekarang mulai berjalan sendiri.'],
    365: ['Setahun', 'Satu putaran penuh tanpa putus. Alhamdulillah.'],
  };
  const nextMile = (n) => MILES.find((m) => m > n) || (Math.floor(n / 365) + 1) * 365;
  const mileInfo = (n) => MILE[n] || [(n / 365) + ' tahun', 'Satu putaran lagi tanpa putus. Alhamdulillah.'];

  /* ================= keadaan ================= */
  let S = null, memo = {}, storageOk = true;
  const ui = { tab: 'hari-ini', defs: 0, just: null, prev: null, wkOff: 0, wkSel: null, heatSel: null, acc: {}, sub: null, sheet: null, libF: 'semua', ask: null, dlDone: false, io: '', err: '', hold: {}, holdDay: null, open: {}, openSig: null, arrive: {}, undo: null, pendUndo: null, mileT: null };
  const t0 = Date.now();
  let fake = null;
  try { const q = new URLSearchParams(location.search).get('now'); if (q && !isNaN(new Date(q))) fake = new Date(q).getTime(); } catch (e) { /* abaikan */ }
  const now = () => new Date(fake ? fake + (Date.now() - t0) : Date.now());
  const today = () => C.appKey(now());

  function normalize(o, k) {
    const f = C.fresh(k);
    o.set = Object.assign({}, f.set, o.set || {});
    o.set.manual = Object.assign({}, f.set.manual, o.set.manual || {});
    o.set.hide = o.set.hide || {};
    o.meta = Object.assign({}, f.meta, o.meta || {});
    o.meta.miles = o.meta.miles || {};
    ['tasks', 'todos', 'dl', 'pauses', 'marks', 'lists'].forEach((x) => { if (!Array.isArray(o[x])) o[x] = []; });
    o.lists.forEach((l) => { if (!Array.isArray(l.items)) l.items = []; });
    if (!o.days || typeof o.days !== 'object') o.days = {};
    o.start = o.start || k; o.seq = o.seq || 1;
    o.tasks.forEach((t) => { if (!Array.isArray(t.days)) t.days = [0, 1, 2, 3, 4, 5, 6]; if (t.sticky == null) t.sticky = true; if (t.on == null) t.on = true; if (!t.step) t.step = 1; });
    return o;
  }
  function load(k) {
    try { const raw = localStorage.getItem(KEY); if (!raw) return null; const o = JSON.parse(raw); if (o && o.v === 1 && Array.isArray(o.tasks)) return normalize(o, k); } catch (e) { /* mulai baru */ }
    return null;
  }
  function save() { memo = {}; try { localStorage.setItem(KEY, JSON.stringify(S)); storageOk = true; } catch (e) { storageOk = false; } }
  const streak = (k) => (memo.sk && memo.skK === k ? memo.sk : ((memo.skK = k), (memo.sk = C.streak(S, k))));

  function seedDemo(k) {
    const T = (name, block, o) => S.tasks.push(Object.assign({ id: C.newId(S), name, block, days: [0, 1, 2, 3, 4, 5, 6], type: 'check', target: 1, unit: '', step: 1, core: false, sticky: true, on: true, created: k, ord: S.seq, demo: 1 }, o || {}));
    T('Dzikir pagi', 'subuh');
    T("Tilawah Al-Qur'an", 'subuh', { type: 'count', target: 5, unit: 'halaman', core: true });
    T('Shalat Dhuha', 'pagi', { sticky: false });
    T('Belajar fokus 45 menit', 'pagi', { core: true });
    T('Tidur siang 20 menit', 'siang', { sticky: false });
    T('Baca buku', 'siang', { type: 'count', target: 10, unit: 'halaman', step: 5 });
    T('Olahraga', 'sore', { days: [6, 1, 3] });
    T('Dzikir petang', 'sore');
    T('Rapikan meja 5 menit', 'malam');
    T('Tulis rencana besok', 'malam');
    T('Tidur sebelum 22:30', 'malam', { sticky: false });
    T('Minum air', 'any', { type: 'count', target: 8, unit: 'gelas' });
    T('Kabari orang tua', 'any', { days: [5] });
    S.dl.push({ id: C.newId(S, 'd'), name: 'Contoh: kumpulkan tugas', date: addDays(k, 9), note: '', done: null, demo: 1 });
    const M = (name, type, val, o) => S.marks.push(Object.assign({ id: C.newId(S, 'm'), name, type, val, unit: '', start: null, end: null, laps: 0, at: addDays(k, -1), ord: S.seq, demo: 1 }, o || {}));
    M('Tilawah', 'page', 195, { start: 1, end: 604 });
    M('Murojaah juz akhir', 'page', 587, { start: 482, end: 604, laps: 2, at: k });
    M('Cas jam', 'date', addDays(k, -4));
    S.lists.push({ id: C.newId(S, 'l'), name: 'Wish list', items: [{ id: C.newId(S, 'i'), text: 'Mushaf saku', done: null }, { id: C.newId(S, 'i'), text: 'Botol minum 1 liter', done: null }], ord: S.seq, demo: 1 });
    S.meta.demo = true;
  }
  function firstRun(k) {
    S = C.fresh(k);
    S.marks = []; S.lists = [];
    try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone, c = CITIES.find((x) => x[3] === tz); if (c) { S.set.loc = c[0]; S.set.lat = c[1]; S.set.lng = c[2]; } } catch (e) { /* pakai bawaan */ }
    S.meta.weekSeen = C.weekStart(k, S.set.weekStart);
    seedDemo(k);
    save();
  }

  /* ================= hijriah & langit ================= */
  const _hj = {};
  function hijri(k) {
    if (_hj[k]) return _hj[k];
    let text = '', day = 15;
    try {
      const d = parse(k), f = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });
      if (/islamic/.test(f.resolvedOptions().calendar)) {
        text = f.format(d).replace(/\s*هـ\s*$/, '');
        const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric' }).formatToParts(d).find((x) => x.type === 'day');
        if (p) day = +p.value || 15;
      }
    } catch (e) { /* tanpa hijriah */ }
    return (_hj[k] = { text, day });
  }
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const lum = (h) => { const c = hex(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  function skyStops(t) {
    const a = C.DAY_START, z = a + 1440, mid = (x, y) => (x + y) / 2, N = ['#0a0a14', '#131226'];
    const L = [
      [a, N[0], N[1]], [t.fajr - 60, '#0b0a1a', '#17132b'], [t.fajr, '#1c1740', '#3a2a5c'], [t.sunrise - 15, '#4f3f7a', '#e9a08a'], [t.sunrise + 10, '#eaa98f', '#f9dcc4'],
      [t.sunrise + 60, '#a6cff0', '#fcecd9'], [mid(t.sunrise + 60, t.dhuhr), '#5badea', '#e2f1fc'], [t.dhuhr, '#6fb6ea', '#f2f6fa'], [t.asr - 20, '#8fc2e6', '#f8f1e0'],
      [t.asr + 30, '#eac77a', '#fff3d8'], [t.maghrib - 45, '#efb259', '#ffe6bd'], [t.maghrib - 8, '#e7894b', '#f8cd9f'], [t.maghrib + 12, '#76438d', '#de7e5e'],
      [t.maghrib + 45, '#3b2b6d', '#693e71'], [t.isha + 15, '#231e4a', '#372b5a'], [t.isha + 120, '#15132a', '#221b38'], [Math.max(t.isha + 240, 1500), N[0], N[1]], [z, N[0], N[1]],
    ];
    return L.filter((s, i) => i === 0 || (s[0] > L[i - 1][0] && s[0] <= z));
  }
  function applyTheme() {
    const n = now(), k = C.appKey(n), m = C.appMin(n), dt = C.dayTimes(k, S.set), t = dt.t, L = skyStops(t);
    let i = 0;
    while (i < L.length - 2 && m >= L[i + 1][0]) i++;
    const A = L[i], B = L[i + 1], f = clamp((m - A[0]) / Math.max(1, B[0] - A[0]), 0, 1);
    const top = mix(A[1], B[1], f), bot = mix(A[2], B[2], f), dark = (lum(top) + lum(bot)) / 2 < 0.3;
    const R = document.documentElement, st = R.style;
    st.setProperty('--sky-top', top); st.setProperty('--sky-bot', bot);
    st.setProperty('--night', String(clamp(1 - (lum(top) + lum(bot)) * 5, 0, 1).toFixed(2)));
    R.setAttribute('data-ink', dark ? 'light' : 'dark');
    const tc = $('meta[name="theme-color"]');
    if (tc) tc.setAttribute('content', top);
    const sky = $('#sky');
    if (!sky) return;
    const day = m >= t.sunrise - 20 && m <= t.maghrib + 15;
    let orb = '';
    if (day) {
      const p = clamp((m - t.sunrise) / Math.max(1, t.maghrib - t.sunrise), 0, 1);
      orb = `<div class="orb sun" style="left:${(10 + 80 * p).toFixed(1)}%;top:${(24 - 15 * Math.sin(Math.PI * p)).toFixed(1)}%"></div>`;
    } else {
      const s = t.maghrib + 15, e = t.sunrise - 20 + 1440, mm = m < t.sunrise ? m + 1440 : m, p = clamp((mm - s) / Math.max(1, e - s), 0, 1), hd = hijri(k).day;
      const ph = hd <= 15 ? hd / 15 : (30 - hd) / 15, off = (1 - clamp(ph, 0.08, 1)) * 26 * (hd <= 15 ? -1 : 1);
      orb = `<div class="orb moon" style="left:${(44 + 20 * p).toFixed(1)}%;top:calc(env(safe-area-inset-top, 0px) + ${(40 - 9 * Math.sin(Math.PI * p)).toFixed(0)}px)"><svg width="46" height="46" viewBox="0 0 46 46"><defs><mask id="mk"><rect width="46" height="46" fill="#000"/><circle cx="23" cy="23" r="13" fill="#fff"/><circle cx="${(23 + off).toFixed(1)}" cy="23" r="13" fill="#000"/></mask></defs><circle cx="23" cy="23" r="13" fill="rgba(255,244,214,.14)"/><circle cx="23" cy="23" r="13" fill="#fff3cf" mask="url(#mk)"/></svg></div>`;
    }
    sky.innerHTML = '<div class="stars"></div>' + orb;
  }

  /* ================= umpan balik ================= */
  let actx = null;
  function chime(kind) {
    if (!S.set.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === 'gold' ? [659, 784, 988, 1319] : kind === 'cp' ? [659, 880] : [880];
      notes.forEach((fq, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), at = actx.currentTime + i * 0.09;
        o.type = 'sine'; o.frequency.value = fq;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.12, at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
        o.connect(g); g.connect(actx.destination); o.start(at); o.stop(at + 0.34);
      });
    } catch (e) { /* tanpa bunyi */ }
  }
  // Android bergetar lewat Vibration API. iOS tidak punya API itu, tetapi mengetuk label sakelar bawaan Safari
  // yang disembunyikan di luar layar memicu getar ringan.
  function buzz() {
    if (!S.set.haptic) return;
    try { if (navigator.vibrate) navigator.vibrate(9); else { const l = $('#hx'); if (l) l.click(); } } catch (e) { /* tanpa getar */ }
  }
  function confetti(gold) {
    const cv = $('#fx');
    if (!cv || reduced()) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = (cv.width = innerWidth * dpr), H = (cv.height = innerHeight * dpr), ctx = cv.getContext('2d');
    const cols = gold ? ['#f5b300', '#fde68a', '#ffffff', '#fcd34d', '#d99a00'] : ['#34d399', '#a5b4fc', '#fde68a', '#67e8f9'];
    const N = gold ? 90 : 44, ps = [];
    for (let i = 0; i < N; i++) ps.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.36, vx: (Math.random() - 0.5) * 13 * dpr, vy: -(6 + Math.random() * 10) * dpr, s: (4 + Math.random() * 5) * dpr, r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length] });
    const start = performance.now(), dur = gold ? 2100 : 1400;
    (function frame(tm) {
      const el = tm - start;
      ctx.clearRect(0, 0, W, H);
      if (el > dur) return;
      ctx.globalAlpha = clamp(1 - (el - dur * 0.6) / (dur * 0.4), 0, 1);
      ps.forEach((p) => { p.vy += 0.42 * dpr; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); ctx.restore(); });
      requestAnimationFrame(frame);
    })(start);
  }
  // Toast dari sebuah centang membawa tombol Batalkan. Faidah menunggu sampai toast yang sedang tampil selesai.
  let toastT = null, toastOn = false, queued = null;
  function toast(html, ms, cls, undoable) {
    const el = $('#toast');
    if (!el) return;
    ui.undo = undoable ? ui.pendUndo : null;
    el.className = cls || '';
    el.innerHTML = ui.undo ? html + '<button class="t-undo" data-act="undo">Batalkan</button>' : html;
    toastOn = true;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastT);
    toastT = setTimeout(hideToast, ui.undo ? Math.max(ms || 0, 4500) : ms || 2600);
  }
  function hideToast() {
    const el = $('#toast');
    clearTimeout(toastT);
    toastOn = false; ui.undo = null;
    if (el) el.classList.remove('show');
    if (queued) { const q = queued; queued = null; setTimeout(() => { if (toastOn) queued = q; else toast(q[0], q[1], q[2]); }, 400); }
  }
  function modal(html) { const m = $('#modal'); m.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; const b = $('.btn', m); if (b) b.focus(); }
  function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

  /* ================= potongan tampilan ================= */
  function quoteHTML(q, cls) {
    if (!q) return '';
    const ar = q.ar ? `<p class="q-ar" lang="ar" dir="rtl">${q.k === 'quran' ? '﴿' + esc(q.ar) + '﴾' : '«' + esc(q.ar) + '»'}</p>` : '';
    return `<figure class="quote ${cls || ''}">${ar}<p class="q-id">${esc(q.id)}</p>${q.orig ? `<p class="q-orig">${esc(q.orig)}</p>` : ''}<figcaption class="q-src">${esc(q.src)}</figcaption></figure>`;
  }
  const blkRange = (dt, id) => { const b = dt.blocks.find((x) => x.id === id); return !b ? '' : id === 'subuh' ? 'sampai ' + hm(b.e) : id === 'malam' ? 'mulai ' + hm(b.s) : hm(b.s) + '–' + hm(b.e); };
  function dayItems(k) {
    const due = C.dueList(S, k), d = S.days[k], v = (d && d.v) || {};
    return due.map((e) => {
      const t = C.taskById(S, e[0]) || { id: e[0], name: 'Task terhapus', block: 'any', unit: '', step: 1, sticky: true };
      const val = Math.min(v[e[0]] || 0, e[1]);
      return { id: e[0], t, tg: e[1], core: !!e[2], val, done: val >= e[1] };
    });
  }
  function taskRow(x, k, o) {
    o = o || {};
    const t = x.t, cnt = x.tg > 1, meta = [];
    if (cnt) meta.push(`<span>${x.val} dari ${x.tg}${t.unit ? ' ' + esc(t.unit) : ''}</span>`);
    if (o.from) meta.push(`<span>dari ${o.from}</span>`);
    if (!t.sticky && t.block !== 'any') meta.push(`<span>${ic('clock')}terikat waktu</span>`);
    const body = `<span class="t-body"><span class="t-name">${esc(t.name)}${x.core ? `<span class="t-star">${ic('star')}<span class="sr"> (task inti)</span></span>` : ''}</span>${meta.length ? `<span class="t-meta">${meta.join('')}</span>` : ''}</span>`;
    const cls = `task${x.done ? ' done' : ''}${ui.just === k + x.id ? ' just' : ''}${ui.arrive[x.id] ? ' arrive' : ''}`;
    const box = cnt && !x.done ? `<span class="t-box ring"><svg viewBox="0 0 32 32"><circle class="r0" cx="16" cy="16" r="13"/><circle class="r1" cx="16" cy="16" r="13" stroke-dasharray="${(81.68 * x.val / x.tg).toFixed(1)} 81.68"/></svg><b>${x.val}</b></span>` : `<span class="t-box">${ic('check')}</span>`;
    // Yang bisa diketuk hanya bulatan dan tulisannya. Sisa baris di kanan sengaja kosong sebagai tempat jempol menggulir.
    if (o.ro) return `<li class="${cls} ro"><div class="t-hit">${box}${body}</div></li>`;
    const at = `data-k="${k}" data-id="${x.id}"`;
    if (!cnt) return `<li class="${cls}" data-row="${x.id}"><button class="t-hit" role="checkbox" aria-checked="${x.done}" data-act="toggle" ${at}>${box}${body}</button></li>`;
    return `<li class="${cls}" data-row="${x.id}"><button class="t-hit" data-act="inc" ${at} aria-label="${esc(t.name)}, ${x.val} dari ${x.tg}. Ketuk untuk menambah ${t.step || 1}.">${box}${body}</button>${x.val > 0 ? `<button class="t-dec" data-act="dec" ${at} aria-label="Kurangi ${esc(t.name)}">${ic('minus')}</button>` : ''}</li>`;
  }
  const taskList = (items, k, o) => `<ul class="tasks">${items.map((x) => taskRow(x, k, typeof o === 'function' ? o(x) : o)).join('')}</ul>`;
  const countChip = (items) => { const d = items.filter((x) => x.done).length, full = items.length && d === items.length; return `<span class="count${full ? ' full' : ''}">${full ? ic('check') : ''}${d}/${items.length}</span>`; };

  /* ---------- busur ---------- */
  const GA = { cx: 100, cy: 92, r: 78, a0: 150, sw: 240 };
  const gpt = (f) => { const a = (GA.a0 + GA.sw * f) * Math.PI / 180; return [GA.cx + GA.r * Math.cos(a), GA.cy + GA.r * Math.sin(a)]; };
  const GLEN = GA.r * GA.sw * Math.PI / 180;
  const GPATH = (() => { const a = gpt(0), b = gpt(1); return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}A${GA.r} ${GA.r} 0 1 1 ${b[0].toFixed(2)} ${b[1].toFixed(2)}`; })();
  const shown = (st) => (st.rest ? 0 : st.cp >= 1 ? Math.max(st.pct, 0.04) : 0);
  const pctNum = (st) => { if (st.rest) return 0; let n = Math.round(st.pct * 100); if (st.credit > 0 && n === 0) n = 1; if (!st.perfect && n >= 100) n = 99; return n; };
  function gaugeCard(k, st, sk) {
    const f = shown(st), num = pctNum(st), prev = ui.prev && ui.prev.k === k ? ui.prev : { f, num, cp: st.cp };
    const half = st.min > 0.5 + 1e-9, nd = C.need(st);
    const nodes = [[1, 0], [2, 0.5], [3, st.min], [4, 1]].filter((n) => half || n[0] !== 2).map((n) => { const p = gpt(n[1]), on = !st.rest && st.cp >= n[0]; return `<circle class="g-node c${n[0]}${on ? ' on' : ''}${on && prev.cp < n[0] ? ' pop' : ''}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="7.5"/>`; }).join('');
    const rungs = [[1, 'Mulai', 'centang 1'], [2, 'Separuh', '50%'], [3, 'Aman', Math.round(st.min * 100) + '%'], [4, 'Sempurna', '100%']].filter((r) => half || r[0] !== 2).map((r) => {
      const on = !st.rest && st.cp >= r[0], next = !st.rest && nd && nd.to === r[0];
      const right = on ? ic('check') : next ? `<small>${nd.onlyCore ? 'tinggal inti' : nd.tasks + ' lagi'}</small>` : `<small>${r[2]}</small>`;
      return `<li class="rung c${r[0]}${on ? ' on' : ''}${next ? ' next' : ''}"><i></i><span>${r[1]}</span>${right}</li>`;
    }).join('');
    let note;
    if (st.rest) note = 'Tidak ada rutinitas terjadwal hari ini.';
    else if (C.paused(S, k) && !st.safe) note = 'Sedang jeda. Rantai tidak putus.';
    else if (st.cp === 4) note = `Semua tuntas. Rantai ${sk.cur} hari.`;
    else if (st.cp === 3) note = `Hari ini aman. Rantai ${sk.cur} hari.`;
    else if (nd && nd.onlyCore) note = `Tinggal ${nd.coreLeft} task inti agar hari ini dihitung aman.`;
    else note = sk.cur > 0 ? `Aman hari ini, rantai jadi ${sk.cur + 1} hari.` : 'Aman hari ini memulai rantai baru.';
    const q = C.pick(QD.CP[st.rest ? 0 : st.cp], k, S.set.hide, 100 + st.cp);
    ui.prev = { k, f, num, cp: st.cp };
    return `<section class="card hi gauge" data-cp="${st.rest ? 0 : st.cp}" aria-label="Progres hari ini">
      <div class="g-top">
        <div class="g-wrap">
          <svg class="g-svg" viewBox="0 0 200 146" role="img" aria-label="${num} persen, ${st.done} dari ${st.n} selesai"><path class="g-track" d="${GPATH}"/><path class="g-fill" d="${GPATH}" stroke-dasharray="${GLEN.toFixed(2)} ${GLEN.toFixed(2)}" style="stroke-dashoffset:${(GLEN * (1 - prev.f)).toFixed(2)}" data-to="${(GLEN * (1 - f)).toFixed(2)}"/>${nodes}</svg>
          <div class="g-center"><div class="g-pct"><b data-from="${prev.num}" data-to="${num}">${prev.num}</b><span>%</span></div><div class="g-sub">${st.rest ? 'hari longgar' : st.done + ' dari ' + st.n}</div></div>
        </div>
        <div class="g-side"><ol class="ladder">${rungs}</ol><p class="g-note">${note}</p></div>
      </div>
      ${quoteHTML(q, 'g-quote')}
    </section>`;
  }
  function afterRender() {
    const f = $('.g-fill');
    if (f && f.dataset.to != null) { const to = f.dataset.to; if (reduced()) f.style.strokeDashoffset = to; else requestAnimationFrame(() => requestAnimationFrame(() => { f.style.strokeDashoffset = to; })); }
    const b = $('.g-pct b');
    if (b && b.dataset.from !== b.dataset.to) {
      const a = +b.dataset.from, z = +b.dataset.to;
      if (reduced()) b.textContent = z;
      else { const s = performance.now(); (function step(t) { const p = clamp((t - s) / 600, 0, 1); if (!b.isConnected) return; b.textContent = Math.round(a + (z - a) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(s); }
    }
  }

  /* ================= Hari ini ================= */
  // Daftar atas hanya berisi yang belum selesai: blok sekarang, yang tertinggal dari blok sebelumnya, dan Kapan saja.
  // Selebihnya, termasuk semua yang sudah dicentang, ada di "Semua blok hari ini".
  // Task yang baru disentuh ditahan di tempatnya sebentar (ui.hold), lalu menyingkir bersama-sama.
  const topCand = (t, cur) => t.block === cur || t.block === 'any' || (t.sticky && C.bIdx(t.block) < C.bIdx(cur));
  const natZone = (x, cur) => (!x.done && topCand(x.t, cur) ? 'top' : 'arch');
  const zoneOf = (x, cur) => ui.hold[x.id] || natZone(x, cur);
  const curBlock = (k) => C.blockAt(C.dayTimes(k, S.set), C.appMin(now())).id;
  let flushT = null;
  function holdRow(k, id) {
    if (ui.holdDay !== k) { ui.hold = {}; ui.holdDay = k; }
    if (!ui.hold[id]) { const x = dayItems(k).find((y) => y.id === id); if (x) ui.hold[id] = natZone(x, curBlock(k)); }
    clearTimeout(flushT);
    flushT = setTimeout(flush, 1400);
  }
  function flush() {
    flushT = null;
    if (!Object.keys(ui.hold).length) return;
    if (ui.tab !== 'hari-ini') { ui.hold = {}; return; }
    // Jangan merapikan selagi jari menempel atau layar masih bergerak.
    if (pActive || performance.now() - lastScroll < 250) { flushT = setTimeout(flush, 500); return; }
    const k = today(), cur = curBlock(k), moving = dayItems(k).filter((x) => ui.hold[x.id] && ui.hold[x.id] !== natZone(x, cur));
    if (!moving.length) { ui.hold = {}; return; }
    let n = 0;
    moving.forEach((x) => document.querySelectorAll(`[data-row="${x.id}"]`).forEach((li) => { collapse(li); n++; }));
    const finish = () => { ui.hold = {}; ui.arrive = {}; moving.forEach((x) => { if (natZone(x, cur) === 'top') ui.arrive[x.id] = 1; }); render(); ui.arrive = {}; };
    if (n && !reduced()) setTimeout(finish, 300); else finish();
  }
  function collapse(li) {
    li.style.height = li.getBoundingClientRect().height + 'px';
    li.style.minHeight = '0px'; li.style.overflow = 'hidden';
    void li.offsetHeight;
    li.style.transition = 'height .28s cubic-bezier(.4, 0, .2, 1), opacity .2s ease';
    li.style.height = '0px'; li.style.opacity = '0';
  }
  function noteCard(icon, title, text, btns, cls) {
    return `<section class="card note ${cls || ''}">${ic(icon)}<div class="body"><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}${btns ? `<div class="btn-row">${btns}</div>` : ''}</div></section>`;
  }
  const btn = (act, label, cls, extra) => `<button class="btn sm ${cls || ''}" data-act="${act}"${extra || ''}>${label}</button>`;
  function notice(k) {
    if (!storageOk) return noteCard('info', 'Penyimpanan tidak tersedia', 'Peramban ini menolak menyimpan data, jadi centangmu hilang saat aplikasi ditutup. Coba buka di luar mode privat.');
    if (C.paused(S, k)) { const p = S.pauses.find((x) => x.a <= k && (!x.b || k <= x.b)); return noteCard('pause', 'Sedang jeda sejak ' + shortDate(p.a), 'Hari selama jeda tidak memutus rantai. Kamu tetap boleh mencentang.', btn('resume', 'Akhiri jeda', 'primary')) + `<section class="card">${quoteHTML(QD.PAUSE)}</section>`; }
    if (S.meta.demo) return noteCard('spark', 'Ini contoh rutinitas', 'Coba centang beberapa untuk merasakan alurnya. ' + (PREVIEW ? 'Ini pratinjau: data di sini tidak ikut ke aplikasi yang nanti kamu pasang.' : 'Sesudah itu ganti dengan rutinitasmu sendiri.'), btn('demoClear', 'Kosongkan, isi sendiri', 'primary') + btn('demoKeep', 'Pakai contoh ini'));
    const g = C.gapBefore(S, k);
    if (g && S.meta.gapSeen !== g.b) return noteCard('shield', `Kamu absen ${g.days} hari`, `${shortDate(g.a)} sampai ${shortDate(g.b)} kosong. Kalau itu karena safar atau sakit, tandai sebagai jeda supaya tidak memutus rantai.`, btn('gapPause', 'Tandai sebagai jeda', 'primary') + btn('gapNo', 'Bukan, lanjut saja'));
    const wk = C.weekStart(k, S.set.weekStart);
    if (S.meta.weekSeen !== wk) {
      const w = C.weekSummary(S, addDays(wk, -7), k);
      if (w.elig > 0) return noteCard('week', 'Lembar baru', `Pekan lalu ${w.safe} dari ${w.elig} hari aman${w.perfect ? ', ' + w.perfect + ' di antaranya sempurna' : ''}, dengan rata-rata ${Math.round(w.avg * 100)}%. Pekan ini mulai dari nol lagi.`, btn('recapOk', 'Mulai pekan ini', 'primary'));
    }
    const nDays = Object.keys(S.days).length, last = S.meta.backupAt;
    if (nDays >= 14 && (!last || diffDays(last, k) >= 30) && (!S.meta.nagAt || diffDays(S.meta.nagAt, k) >= 7)) return noteCard('save', 'Waktunya mencadangkan', `Sudah ${nDays} hari tercatat${last ? ', dan cadangan terakhir ' + shortDate(last) : ' dan belum pernah dicadangkan'}. Data hanya ada di HP ini.`, btn('bakNow', 'Cadangkan', 'primary') + btn('bakLater', 'Nanti'));
    return '';
  }
  function viewToday() {
    const n = now(), k = C.appKey(n), m = C.appMin(n), dt = C.dayTimes(k, S.set), cur = C.blockAt(dt, m), items = dayItems(k), st = C.stat(S, k), sk = streak(k), hj = hijri(k);
    if (ui.holdDay !== k) { ui.hold = {}; ui.holdDay = k; }
    if (ui.openSig !== k + cur.id) { ui.open = {}; ui.openSig = k + cur.id; }
    const by = (b) => items.filter((x) => x.t.block === b), z = (x) => zoneOf(x, cur.id), top = items.filter((x) => z(x) === 'top');
    const hero = `<header class="hero"><div class="hero-top"><div><div class="phase-ar" lang="ar" dir="rtl">${BL[cur.id].ar}</div><div class="phase-id">${BL[cur.id].n} <span>${blkRange(dt, cur.id)}</span></div></div>
      <div class="pills"><button class="pill${sk.todaySafe ? ' safe' : ''}" data-act="tab" data-tab="capaian" aria-label="Rantai ${sk.cur} hari. Buka capaian.">${ic('link')}${sk.cur}<span>hari</span></button></div></div>
      <div class="hero-date"><span>${longDate(k)}</span>${hj.text ? `<span lang="ar" dir="rtl">${hj.text}</span>` : ''}</div></header>`;
    if (!S.tasks.some((t) => !t.gone)) {
      return hero + dlTop(k) + notice(k) + `<section class="card hi"><div class="empty">${ic('plus')}<p>Belum ada rutinitas. Tambahkan task pertamamu, lalu ia muncul di sini sesuai blok waktunya.</p><button class="btn primary" data-act="new">Tambah task</button></div></section>` + extras(k);
    }
    const ownAll = by(cur.id), own = top.filter((x) => x.t.block === cur.id), any = top.filter((x) => x.t.block === 'any'), late = top.filter((x) => x.t.block !== cur.id && x.t.block !== 'any');
    let nowBody = '';
    if (own.length) nowBody += taskList(own, k);
    else if (late.length || any.length) nowBody += `<p class="muted">${ownAll.length ? 'Blok ' + BL[cur.id].n + ' sudah tuntas.' : 'Tidak ada task khusus blok ini.'}</p>`;
    if (late.length) nowBody += `<div class="grp">Belum sempat</div>` + taskList(late, k, (x) => ({ from: BL[x.t.block].n }));
    if (any.length) nowBody += `<div class="grp">Kapan saja</div>` + taskList(any, k);
    if (!nowBody) {
      const left = (b) => by(b).filter((x) => !x.done).length, nx = dt.blocks.find((b) => b.s > cur.s && left(b.id)), ok = items.length && (st.perfect || ownAll.length);
      const head = !items.length ? 'Tidak ada rutinitas hari ini.' : st.perfect ? 'Semua task hari ini tuntas.' : ownAll.length ? `Blok ${BL[cur.id].n} tuntas.` : 'Blok ini kosong.';
      nowBody = `<div class="clear${ok ? '' : ' idle'}">${ic(ok ? 'check' : BL[cur.id].ic)}<p><b>${head}</b>${nx ? `Berikutnya ${BL[nx.id].n} mulai ${hm(nx.s)}, ${left(nx.id)} task.` : ''}</p></div>`;
    }
    const nowCard = `<section class="card hi"><div class="blk-head"><div class="blk-title"><div class="label">Sekarang</div><h2>${ic(BL[cur.id].ic)}${BL[cur.id].n}</h2></div>${ownAll.length ? countChip(ownAll) : ''}</div>${nowBody}</section>`;
    const folds = C.BLOCKS.map((b) => {
      const all = by(b), arch = all.filter((x) => z(x) === 'arch');
      if (!arch.length) return '';
      const up = all.length - arch.length, open = !!ui.open[b], sub = b === cur.id ? 'sekarang' : blkRange(dt, b);
      return `<div class="fold${open ? ' open' : ''}"><button class="fold-head" data-act="fold" data-b="${b}" aria-expanded="${open}">${ic(BL[b].ic, 'b')}<b>${BL[b].n}${sub ? `<small>${sub}</small>` : ''}</b>${countChip(all)}${ic('down', 'chev')}</button>
        ${open ? `<div class="fold-body">${taskList(arch, k)}${up ? `<p class="muted">${up} lainnya ada di daftar atas.</p>` : ''}</div>` : ''}</div>`;
    }).join('');
    return hero + dlTop(k) + gaugeCard(k, st, sk) + notice(k) + nowCard + (folds ? `<section class="card"><div class="card-h"><h2>Semua blok hari ini</h2></div><div class="folds">${folds}</div></section>` : '') + extras(k);
  }
  function dlChip(d, k) { const n = diffDays(k, d.date); return `<span class="dl-h ${n < 0 ? '' : n <= 1 ? 'now' : n <= 3 ? 'soon' : n <= 7 ? 'near' : ''}">${n === 0 ? 'Hari ini' : n === 1 ? 'Besok' : n > 0 ? 'H-' + n : 'Lewat ' + -n + ' hr'}</span>`; }
  const dlOpen = () => S.dl.filter((d) => !d.done).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  function extras(k) {
    const todos = S.todos.filter((t) => (!t.done && t.date <= k) || t.done === k), q = C.pick(QD.DAILY, k, S.set.hide, 20261110);
    let h = '';
    if (todos.length) h += `<section class="card"><div class="card-h"><h2>Sekali jalan</h2><span class="count">${todos.filter((t) => t.done).length}/${todos.length}</span></div><ul class="tasks">${todos.map((t) => `<li class="task${t.done ? ' done' : ''}"><button class="t-hit" role="checkbox" aria-checked="${!!t.done}" data-act="todo" data-id="${t.id}"><span class="t-box">${ic('check')}</span><span class="t-body"><span class="t-name">${esc(t.name)}</span>${t.date < k && !t.done ? `<span class="t-meta"><span>sejak ${shortDate(t.date)}</span></span>` : ''}</span></button></li>`).join('')}</ul></section>`;
    if (q) h += `<section class="card"><div class="label">Kutipan hari ini</div>${quoteHTML(q, 'big')}</section>`;
    return h;
  }

  // Tiga deadline terdekat tampil di bagian atas Hari ini, tepat di bawah tanggal.
  function dlTop(k) {
    const dls = dlOpen().slice(0, 3);
    if (!dls.length) return '';
    return `<section class="card dl-top"><div class="card-h"><h2>${ic('flag')}Deadline</h2><button class="link" data-act="tab" data-tab="catatan" data-to="sec-deadline">Semua${ic('right')}</button></div><div>${dls.map((d) => `<div class="dl">${dlChip(d, k)}<div class="dl-main"><b>${esc(d.name)}</b><span>${longDate(d.date)}</span></div></div>`).join('')}</div></section>`;
  }

  /* ================= Pekan ================= */
  const miniRing = (st, lv, txt, fut) => `<span class="mini l${lv}${fut ? ' fut' : ''}"><svg viewBox="0 0 36 36"><circle class="r0" cx="18" cy="18" r="15"/>${!fut && !st.rest && st.pct > 0 ? `<circle class="r1" cx="18" cy="18" r="15" stroke-dasharray="${(94.25 * st.pct).toFixed(1)} 94.25"/>` : ''}</svg><b>${txt}</b></span>`;
  function viewWeek() {
    const k = today(), ws = S.set.weekStart, wk = addDays(C.weekStart(k, ws), ui.wkOff * 7), days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(wk, i));
    const sel = ui.wkSel && days.indexOf(ui.wkSel) >= 0 ? ui.wkSel : days.indexOf(k) >= 0 ? k : days[0], sum = C.weekSummary(S, wk, k), yest = addDays(k, -1);
    const strip = days.map((d) => { const st = C.stat(S, d), fut = d > k; return `<button class="wk-day${d === k ? ' today' : ''}${d === sel ? ' sel' : ''}" data-act="wkSel" data-k="${d}" aria-label="${longDate(d)}${fut || st.rest ? '' : ', ' + pctNum(st) + ' persen'}" aria-pressed="${d === sel}"><span>${DOW3[parse(d).getDay()]}</span>${miniRing(st, C.level(S, d, st), parse(d).getDate(), fut || d < S.start)}</button>`; }).join('');
    const items = sel >= S.start ? dayItems(sel) : [], st = C.stat(S, sel), editable = (sel === k || sel === yest) && sel >= S.start;
    let dayBody;
    if (!items.length) dayBody = `<p class="muted">${sel < S.start ? 'Sebelum aplikasi mulai dipakai.' : 'Tidak ada rutinitas terjadwal.'}</p>`;
    else dayBody = C.BLOCKS.filter((b) => items.some((x) => x.t.block === b)).map((b) => `<div class="grp">${BL[b].n}</div>` + taskList(items.filter((x) => x.t.block === b), sel, { ro: !editable })).join('');
    const status = sel > k ? 'rencana' : st.rest ? 'longgar' : st.perfect ? 'sempurna' : st.safe ? 'aman' : C.paused(S, sel) ? 'jeda' : pctNum(st) + '%';
    const ids = [], seen = {};
    days.forEach((d) => { if (d >= S.start) C.dueList(S, d).forEach((e) => { if (!seen[e[0]]) { seen[e[0]] = 1; ids.push(e[0]); } }); });
    const rows = ids.map((id) => C.taskById(S, id) || { id, name: 'Task terhapus', block: 'any' }).sort(C.taskSort).map((t) => `<div class="mx-n">${esc(t.name)}</div>` + days.map((d) => {
      const e = d >= S.start ? C.dueList(S, d).find((x) => x[0] === t.id) : null;
      if (!e) return '<i class="mx-c x"></i>';
      const v = C.valOf(S, d, t.id);
      return `<i class="mx-c ${d > k ? 'f' : v >= e[1] ? 'd' : v > 0 ? 'p' : 'u'}"></i>`;
    }).join('')).join('');
    return `<header class="page-h"><div><h1>${ui.wkOff === 0 ? 'Pekan ini' : ui.wkOff === -1 ? 'Pekan lalu' : ui.wkOff === 1 ? 'Pekan depan' : 'Pekan ' + shortDate(wk)}</h1><p>${shortDate(wk)} sampai ${shortDate(days[6])}${sum.elig ? `. ${sum.safe} dari ${sum.elig} hari aman, rata-rata ${Math.round(sum.avg * 100)}%.` : ''}</p></div>
      <div class="wk-nav"><button class="iconbtn" data-act="wkPrev" aria-label="Pekan sebelumnya"${addDays(wk, -1) < S.start ? ' disabled' : ''}>${ic('left')}</button><button class="iconbtn" data-act="wkNext" aria-label="Pekan berikutnya"${ui.wkOff >= 4 ? ' disabled' : ''}>${ic('right')}</button></div></header>
      <section class="card hi"><div class="wk-strip">${strip}</div></section>
      <section class="card"><div class="card-h"><h2>${longDate(sel)}</h2><span class="count${st.safe && sel <= k ? ' full' : ''}">${status}</span></div>${sel === yest && items.length ? '<p class="muted">Kemarin masih bisa dicentang susulan.</p>' : ''}${dayBody}</section>
      ${ids.length ? `<section class="card"><div class="card-h"><h2>Papan pekan</h2></div><div class="mx"><div></div>${days.map((d) => `<div class="mx-h${d === k ? ' today' : ''}">${DOW3[parse(d).getDay()][0]}</div>`).join('')}${rows}</div><div class="legend"><span><i style="background:var(--cp3)"></i>selesai</span><span><i style="background:linear-gradient(135deg,var(--cp3) 50%,var(--dim) 50%)"></i>sebagian</span><span><i style="background:var(--dim)"></i>belum</span><span><i style="box-shadow:inset 0 0 0 1.5px var(--ink-4)"></i>akan datang</span></div></section>` : ''}`;
  }

  /* ================= Catatan: penanda, daftar, deadline ================= */
  // Mushaf Madinah 604 halaman. Halaman awal (SA) dan akhir (SE) tiap surah mengikuti data halaman api.quran.com.
  const SA = [1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549, 551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585, 586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599, 600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604];
  const SE = [1, 49, 76, 106, 127, 150, 176, 186, 207, 221, 235, 248, 255, 261, 267, 281, 293, 304, 312, 321, 331, 341, 349, 359, 366, 376, 385, 396, 404, 410, 414, 417, 427, 434, 440, 445, 452, 458, 467, 476, 482, 489, 495, 498, 502, 506, 510, 515, 517, 520, 523, 525, 528, 531, 534, 537, 541, 545, 548, 551, 552, 554, 555, 557, 559, 561, 564, 566, 568, 570, 571, 573, 575, 577, 578, 580, 581, 583, 584, 585, 586, 587, 589, 589, 590, 591, 592, 592, 594, 594, 595, 596, 596, 596, 597, 597, 598, 599, 599, 600, 600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604];
  const SN = ["Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Taha", "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Yasin", "As-Saffat", "Sad", "Az-Zumar", "Gafir", "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadalah", "Al-Hasyr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Gasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail", "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr", "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas"];
  const juzOf = (p) => (p < 22 ? 1 : Math.min(30, Math.floor((p - 2) / 20) + 1));
  const jStart = (j) => (j === 1 ? 1 : 20 * j - 18);
  const jEnd = (j) => (j === 30 ? 604 : 20 * j + 1);
  // Surah pertama di halaman itu, sama dengan nama surah di kepala halaman mushaf.
  const surahOf = (p) => { for (let i = 0; i < 114; i++) if (SA[i] <= p && p <= SE[i]) return SN[i]; return ''; };
  const pageInfo = (p) => `Juz ${juzOf(p)}, ${surahOf(p)}`;
  const hasRange = (m) => m.type === 'page' && m.start >= 1 && m.end > m.start;
  const isJuzRange = (m) => m.start === jStart(juzOf(m.start)) && m.end === jEnd(juzOf(m.end));
  const rangeLabel = (m) => { if (!isJuzRange(m)) return `hlm ${m.start}–${m.end}`; const a = juzOf(m.start), b = juzOf(m.end); return a === b ? `Juz ${a}` : `Juz ${a}–${b}`; };
  // Angka penanda adalah posisi sekarang: di awal rentang 0%, melewati akhir rentang berarti khatam.
  const rangePct = (m) => clamp((m.val - m.start) / (m.end - m.start + 1), 0, 1);
  const ago = (d) => { const n = diffDays(d, today()); return n <= 0 ? 'hari ini' : n === 1 ? 'kemarin' : n + ' hari lalu'; };
  const dayDist = (d) => { const n = diffDays(d, today()); return n === 0 ? 'hari ini' : n === 1 ? 'kemarin' : n > 1 ? n + ' hari lalu' : n === -1 ? 'besok' : -n + ' hari lagi'; };
  const byOrd = (a, b) => (a.ord || 0) - (b.ord || 0);
  function markTile(m) {
    let main, sub = '', foot = m.at ? 'diubah ' + ago(m.at) : '';
    if (m.type === 'page') { main = `<span class="mk-v">${m.val}<small>hlm</small></span>`; sub = pageInfo(m.val); }
    else if (m.type === 'num') main = `<span class="mk-v">${esc(m.val)}${m.unit ? `<small>${esc(m.unit)}</small>` : ''}</span>`;
    else if (m.type === 'date') { main = `<span class="mk-v">${m.val ? shortDate(m.val) : '–'}</span>`; sub = m.val ? dayDist(m.val) : 'belum diisi'; foot = ''; }
    else main = `<span class="mk-t">${m.val ? esc(m.val) : 'Kosong'}</span>`;
    const bar = hasRange(m) ? `<span class="mk-bar"><i style="width:${(rangePct(m) * 100).toFixed(1)}%"></i></span><span class="mk-r"><span>${rangeLabel(m)}</span>${m.laps ? `<b>khatam ${m.laps}×</b>` : ''}</span>` : '';
    return `<button class="mk" data-act="mOpen" data-id="${m.id}"><span class="mk-n">${esc(m.name)}</span>${main}${sub ? `<span class="mk-s">${sub}</span>` : ''}${bar}${foot ? `<span class="mk-f">${foot}</span>` : ''}</button>`;
  }
  function viewNotes() {
    const k = today(), open = dlOpen(), done = S.dl.filter((d) => d.done).sort((a, b) => (a.done < b.done ? 1 : -1)), marks = S.marks.slice().sort(byOrd), lists = S.lists.slice().sort(byOrd);
    const row = (d) => `<div class="dl${d.done ? ' done' : ''}">${d.done ? `<span class="dl-h">${shortDate(d.date)}</span>` : dlChip(d, k)}<button class="dl-main" data-act="dlEdit" data-id="${d.id}"><b>${esc(d.name)}</b><span>${d.done ? 'Selesai ' + shortDate(d.done) : longDate(d.date) + ' ' + parse(d.date).getFullYear()}${d.note ? ', ' + esc(d.note) : ''}</span></button><button class="iconbtn" data-act="dlDone" data-id="${d.id}" aria-label="${d.done ? 'Buka lagi' : 'Tandai selesai'} ${esc(d.name)}">${ic(d.done ? 'loop' : 'check')}</button></div>`;
    const list = (l) => { const o = l.items.filter((x) => !x.done); return `<button class="ls" data-act="lOpen" data-id="${l.id}"><span class="ls-h"><b>${esc(l.name)}</b><span class="count">${o.length ? o.length + ' belum' : 'kosong'}</span></span>${o.length ? `<span class="ls-p">${o.slice(0, 3).map((x) => esc(x.text)).join(', ')}</span>` : ''}</button>`; };
    const add = (act, label) => `<button class="btn sm" data-act="${act}">${ic('plus')}${label}</button>`;
    return `<header class="page-h"><div><h1>Catatan</h1><p>${marks.length} penanda, ${lists.length} daftar, ${open.length} deadline.</p></div></header>
      <section class="card hi" id="sec-penanda"><div class="card-h"><h2>Penanda</h2>${add('mNew', 'Penanda')}</div>
        ${marks.length ? `<div class="mk-grid">${marks.map(markTile).join('')}</div>` : '<p class="muted">Catat posisi tilawah, murojaah, hafalan, atau tanggal yang ingin kamu ingat. Ketuk penanda untuk memajukannya.</p>'}</section>
      <section class="card" id="sec-daftar"><div class="card-h"><h2>Daftar</h2>${add('lNew', 'Daftar')}</div>
        ${lists.length ? `<div class="ls-wrap">${lists.map(list).join('')}</div>` : '<p class="muted">Untuk wish list, list artikel, dan sejenisnya. Isinya bertahan sampai dicentang dan tidak muncul di Hari ini.</p>'}</section>
      <section class="card" id="sec-deadline"><div class="card-h"><h2>Deadline</h2>${add('dlNew', 'Deadline')}</div>
        ${open.length ? `<div>${open.map(row).join('')}</div>` : '<p class="muted">Belum ada deadline. Tiga yang terdekat tampil di bagian atas Hari ini.</p>'}
        ${done.length ? `<div><button class="link" data-act="dlShow">${ui.dlDone ? 'Sembunyikan yang selesai' : 'Lihat ' + done.length + ' yang selesai'}</button></div>${ui.dlDone ? `<div>${done.map(row).join('')}</div>` : ''}` : ''}</section>`;
  }

  /* ================= Capaian ================= */
  function viewStats() {
    const k = today(), sk = streak(k), cs = C.consistency(S, k, 30), nm = nextMile(sk.cur), pm = MILES.filter((m) => m <= sk.cur).pop() || 0, ws = S.set.weekStart;
    const W = 18, end = addDays(C.weekStart(k, ws), 6), first = addDays(end, -(W * 7 - 1));
    let cells = '', months = '';
    for (let w = 0; w < W; w++) {
      const c0 = addDays(first, w * 7), d0 = parse(c0), dEnd = parse(addDays(c0, 6));
      months += `<span>${dEnd.getDate() <= 7 ? MON3[dEnd.getMonth()] : w === 0 ? MON3[d0.getMonth()] : ''}</span>`;
      for (let i = 0; i < 7; i++) { const d = addDays(c0, i); cells += d > k ? '<i class="hc out"></i>' : d < S.start ? '<i class="hc pre"></i>' : `<button class="hc l${C.level(S, d)}${ui.heatSel === d ? ' sel' : ''}" data-act="heat" data-k="${d}" aria-label="${longDate(d)}"></button>`; }
    }
    let cap = 'Ketuk satu kotak untuk melihat harinya.';
    if (ui.heatSel) { const st = C.stat(S, ui.heatSel), lv = C.level(S, ui.heatSel, st); cap = `${longDate(ui.heatSel)}: ${lv === 'r' ? 'tanpa rutinitas terjadwal' : lv === 'p' ? 'jeda' : `${pctNum(st)}%, ${st.done} dari ${st.n}${st.perfect ? ', sempurna' : st.safe ? ', aman' : ''}`}.`; }
    const rates = C.taskRates(S, k, 30), list = S.tasks.filter((t) => !t.gone && t.on && rates[t.id] && rates[t.id].due >= 3).map((t) => ({ t, r: rates[t.id], p: rates[t.id].done / rates[t.id].due })).sort((a, b) => a.p - b.p);
    const grace = sk.graceUsed ? `Jatah ampunan pekan ini terpakai ${longDate(sk.graceUsed)}.` : 'Jatah ampunan pekan ini masih ada: satu hari bolong tidak memutus rantai.';
    return `<header class="page-h"><div><h1>Capaian</h1><p>Yang dihitung adalah hari yang mencapai Aman.</p></div></header>
      <section class="card hi streak"><div><div class="label">Rantai sekarang</div><div class="streak-n"><b>${sk.cur}</b><span>hari</span></div></div><span class="count${sk.todaySafe ? ' full' : ''}">${sk.todaySafe ? ic('check') + 'hari ini aman' : 'hari ini belum'}</span>
        <div style="grid-column:1/-1;display:grid;gap:6px"><div class="bar" style="--p:${clamp(((sk.cur - pm) / (nm - pm)) * 100, 0, 100).toFixed(1)}%;--c:var(--cp4)"><i></i></div><p class="muted">${nm - sk.cur} hari lagi menuju tonggak ${nm} hari. ${grace}</p></div></section>
      <section class="stats"><div class="stat"><b>${sk.best}</b><span>rantai terpanjang</span></div><div class="stat"><b>${cs.elig ? Math.round(cs.pct * 100) + '%' : '–'}</b><span>konsisten 30 hari</span></div><div class="stat"><b>${sk.perfectDays}</b><span>hari sempurna</span></div></section>
      <section class="card"><div class="card-h"><h2>Peta ${W} pekan</h2><span class="count">${sk.safeDays} hari aman</span></div>${sk.safeDays + sk.perfectDays === 0 && Object.keys(S.days).length < 2 ? '<p class="muted">Masih kosong. Tiap hari yang kamu jalani mengisi satu kotak di sini.</p>' : ''}
        <div><div class="heat-m">${months}</div><div class="heat">${cells}</div></div><p class="muted">${cap}</p>
        <div class="legend"><span><i style="background:var(--cp3);opacity:.3"></i>di bawah separuh</span><span><i style="background:var(--cp3);opacity:.6"></i>belum aman</span><span><i style="background:var(--cp3)"></i>aman</span><span><i style="background:var(--gold-hi)"></i>sempurna</span></div></section>
      <section class="card"><div class="card-h"><h2>Tonggak</h2></div><div class="chips">${MILES.concat(sk.best > 365 ? [nextMile(Math.max(365, sk.best - 1))] : []).map((m) => `<span class="chip${S.meta.miles[m] || sk.best >= m ? ' on' : ''}" style="cursor:default">${m} hari</span>`).join('')}</div></section>
      <section class="card"><div class="card-h"><h2>Konsistensi per task</h2><span class="label">30 hari</span></div>${list.length ? `<div>${list.map((x) => `<div class="rate"><span>${esc(x.t.name)}</span><b>${x.r.done}/${x.r.due}</b><div class="bar" style="--p:${(x.p * 100).toFixed(0)}%;--c:${x.p >= 0.7 ? 'var(--cp3)' : x.p >= 0.4 ? 'var(--cp2)' : 'var(--warm)'}"><i></i></div>${x.p < 0.4 && x.r.due >= 5 ? '<small>Sering terlewat. Coba perkecil targetnya atau pindahkan bloknya.</small>' : ''}</div>`).join('')}</div>` : '<p class="muted">Muncul setelah sebuah task terjadwal minimal tiga kali. Dari sini kelihatan mana yang perlu diperkecil.</p>'}</section>`;
  }

  /* ================= Kelola ================= */
  const ordDays = () => [0, 1, 2, 3, 4, 5, 6].map((i) => (i + S.set.weekStart) % 7);
  const daysText = (t) => (t.days.length === 7 ? 'Setiap hari' : ordDays().filter((d) => t.days.indexOf(d) >= 0).map((d) => DOW3[d]).join(' '));
  const sw = (act, on, label, extra) => `<button class="sw" role="switch" aria-checked="${!!on}" aria-label="${label}" data-act="${act}"${extra || ''}></button>`;
  const acc = (key, icon, title, body) => { const open = !!ui.acc[key]; return `<div class="acc${open ? ' open' : ''}"><button class="acc-head" data-act="acc" data-key="${key}" aria-expanded="${open}">${ic(icon)}<span>${title}</span>${ic('down', 'chev')}</button>${open ? `<div class="acc-body">${body}</div>` : ''}</div>`; };
  function viewManage() {
    if (ui.sub === 'pustaka') return viewLibrary();
    const k = today(), tasks = S.tasks.filter((t) => !t.gone).sort(C.taskSort), dt = C.dayTimes(k, S.set), nCore = tasks.filter((t) => t.core && t.on).length;
    const groups = C.BLOCKS.filter((b) => tasks.some((t) => t.block === b)).map((b) => `<div class="grp">${BL[b].n}</div>` + tasks.filter((t) => t.block === b).map((t) => `<div class="mg${t.on ? '' : ' off'}"><button class="mg-main" data-act="edit" data-id="${t.id}"><b>${esc(t.name)}${t.core ? `<span class="t-star">${ic('star')}</span>` : ''}</b><span>${[daysText(t), t.type === 'count' ? t.target + (t.unit ? ' ' + esc(t.unit) : ' kali') : '', !t.sticky && b !== 'any' ? 'terikat waktu' : '', t.on ? '' : 'nonaktif'].filter(Boolean).join(', ')}</span></button>${sw('tOn', t.on, 'Aktifkan ' + esc(t.name), ` data-id="${t.id}"`)}</div>`).join('')).join('');
    const todos = S.todos.filter((t) => !t.done);
    const p = S.pauses.find((x) => x.a <= k && (!x.b || k <= x.b));
    const T = dt.t, timeRow = `<div class="times"><span>Subuh<b>${hm(T.fajr)}</b></span><span>Terbit<b>${hm(T.sunrise)}</b></span><span>Zuhur<b>${hm(T.dhuhr)}</b></span><span>Ashar<b>${hm(T.asr)}</b></span><span>Maghrib<b>${hm(T.maghrib)}</b></span></div>`;
    const known = CITIES.some((c) => c[0] === S.set.loc);
    const waktu = `<div class="chips">${['auto', 'manual'].map((m) => `<button class="chip${S.set.mode === m ? ' on' : ''}" data-act="mode" data-v="${m}">${m === 'auto' ? 'Otomatis dari lokasi' : 'Jam manual'}</button>`).join('')}</div>
      ${S.set.mode === 'auto' ? `<label class="field"><span>Kota</span><select class="input" id="set-loc" data-chg="loc">${CITIES.map((c) => `<option value="${c[0]}"${S.set.loc === c[0] ? ' selected' : ''}>${c[0]}</option>`).join('')}<option value="custom"${known ? '' : ' selected'}>${known ? 'Koordinat sendiri' : esc(S.set.loc) + ' (' + (+S.set.lat).toFixed(2) + ', ' + (+S.set.lng).toFixed(2) + ')'}</option></select></label>
        ${ui.acc.coord || !known ? `<div class="row3"><label class="field"><span>Lintang</span><input class="input" id="set-lat" inputmode="decimal" value="${esc(S.set.lat)}"></label><label class="field"><span>Bujur</span><input class="input" id="set-lng" inputmode="decimal" value="${esc(S.set.lng)}"></label><div class="field"><span>&nbsp;</span><button class="btn" data-act="coord">Pakai</button></div></div>` : ''}
        <div class="btn-row"><button class="btn sm" data-act="geo">${ic('pin')}Pakai lokasi HP ini</button></div>${ui.err === 'geo' ? '<p class="err">Lokasi tidak bisa dibaca di sini. Pilih kota atau isi koordinat.</p>' : ''}${ui.err === 'coord' ? '<p class="err">Lintang antara -66 dan 66, bujur antara -180 dan 180.</p>' : ''}
        ${dt.auto ? '' : '<p class="err">Hitungan untuk lokasi ini tidak cocok dengan zona waktu HP, jadi sementara dipakai jam manual di bawah.</p>'}` : `<div class="row2">${[['sunrise', 'Pagi mulai'], ['dhuhr', 'Siang mulai'], ['asr', 'Sore mulai'], ['maghrib', 'Malam mulai']].map((x) => `<label class="field"><span>${x[1]}</span><input class="input" id="man-${x[0]}" type="time" data-chg="manual" data-key="${x[0]}" value="${hm(S.set.manual[x[0]])}"></label>`).join('')}</div>${ui.err === 'manual' ? '<p class="err">Urutannya harus naik: pagi, siang, sore, lalu malam.</p>' : ''}`}
      ${timeRow}<p class="muted">Ini patokan batas blok, bukan jadwal adzan. Bisa selisih satu sampai dua menit dari jadwal resmi. Hari aplikasi berganti pukul 03:00.</p>`;
    const cadangan = `<p class="muted">Semua data hanya ada di perangkat ini. ${S.meta.backupAt ? 'Cadangan terakhir ' + fullDate(S.meta.backupAt) + '.' : 'Belum pernah dicadangkan.'}</p>
      <div class="btn-row"><button class="btn sm primary" data-act="bakCopy">${ic('copy')}Salin cadangan</button><button class="btn sm" data-act="bakShare">${ic('share')}Bagikan sebagai file</button></div>
      <label class="field"><span>Pulihkan dari teks cadangan</span><textarea class="input" id="bak-text" placeholder="Tempel teks cadangan di sini">${esc(ui.io)}</textarea></label>
      ${ui.err === 'bak' ? '<p class="err">Teks itu bukan cadangan SADAD yang utuh.</p>' : ''}
      ${ui.ask === 'restore' ? `<p class="err">Data sekarang akan diganti seluruhnya.</p><div class="btn-row">${btn('restoreYes', 'Ya, pulihkan', 'primary')}${btn('askNo', 'Batal')}</div>` : `<div class="btn-row">${btn('restore', 'Pulihkan')}</div>`}`;
    const tentang = `${quoteHTML(QD.NAME)}<p class="muted">Sadad berarti tepat mengenai sasaran. Kalau belum bisa tepat, mendekatlah: itulah fungsi titik Aman. Aplikasi ini menyimpan semuanya di perangkatmu, tanpa akun dan tanpa server.</p>
      ${PREVIEW ? '<p class="muted">Ini pratinjau. Data di sini terpisah dari aplikasi yang nanti kamu pasang dari GitHub.</p>' : `${standalone() ? '' : '<p class="muted">Agar terasa seperti aplikasi: di iPhone buka lewat Safari, ketuk Bagikan, lalu Tambahkan ke Layar Utama. Di Android, pilih Instal aplikasi dari menu Chrome. Sesudah itu selalu buka dari ikonnya, karena penyimpanannya terpisah dari tab peramban.</p>'}<div class="btn-row"><button class="btn sm" data-act="shareApp">${ic('share')}Bagikan aplikasi</button></div>${quoteHTML(QD.SHARE)}`}
      <p class="muted">Versi ${VERSION}.</p>
      ${ui.ask === 'reset' ? `<p class="err">Semua task, riwayat, dan deadline akan dihapus dari perangkat ini.</p><div class="btn-row">${btn('resetYes', 'Ya, hapus semuanya', 'primary')}${btn('askNo', 'Batal')}</div>` : `<div class="btn-row">${btn('reset', 'Hapus semua data', 'quiet')}</div>`}`;
    return `<header class="page-h"><div><h1>Kelola</h1><p>${tasks.length} rutinitas, ${nCore} dari 3 task inti terpakai.</p></div><button class="btn primary" data-act="new">${ic('plus')}Task</button></header>
      ${S.meta.demo ? noteCard('spark', 'Masih memakai contoh', 'Ubah satu per satu, atau kosongkan sekaligus.', btn('demoClear', 'Kosongkan contoh', 'primary') + btn('demoKeep', 'Pakai contoh ini')) : ''}
      <section class="card hi"><div class="card-h"><h2>Rutinitas</h2></div>${groups || `<div class="empty"><p>Belum ada. Ketuk tombol Task di atas untuk menambah yang pertama.</p></div>`}</section>
      <section class="card"><div class="card-h"><h2>Sekali jalan</h2><span class="label">tidak masuk hitungan harian</span></div>
        <form class="dl-add" data-form="todo" novalidate><div class="row2" style="grid-template-columns:minmax(0,1fr) auto"><input class="input" id="todo-name" name="name" maxlength="60" autocomplete="off" aria-label="Nama keperluan sekali jalan" placeholder="Misal: beli sabun"><button class="btn" type="submit" aria-label="Tambah">${ic('plus')}</button></div></form>
        ${todos.length ? `<div>${todos.map((t) => `<div class="mg"><div class="mg-main"><b>${esc(t.name)}</b><span>${t.date > k ? 'mulai ' + shortDate(t.date) : 'tampil di Hari ini'}</span></div><button class="iconbtn" data-act="todoDel" data-id="${t.id}" aria-label="Hapus ${esc(t.name)}">${ic('trash')}</button></div>`).join('')}</div>` : ''}</section>
      <section class="card"><div class="accs">
        ${acc('min', 'shield', 'Batas minimum dan pekan', `<div class="field"><label for="set-min">Batas Aman: <b id="min-out">${S.set.min}%</b></label><input class="range" id="set-min" type="range" min="50" max="90" step="5" value="${S.set.min}" data-chg="min" data-live="min"></div><p class="muted">Hari dihitung aman bila progres mencapai batas ini dan semua task inti selesai. Perubahan berlaku mulai hari ini.</p><div class="field"><span>Awal pekan</span><div class="chips">${[6, 0, 1].map((d) => `<button class="chip${S.set.weekStart === d ? ' on' : ''}" data-act="wkStart" data-v="${d}">${DOW[d]}</button>`).join('')}</div></div>`)}
        ${acc('waktu', 'clock', 'Waktu dan lokasi', waktu)}
        ${acc('umpan', 'spark', 'Bunyi dan getar', `<div class="opt" style="border-top:0"><div><b>Bunyi saat mencentang</b><small>Denting pendek, lebih panjang di titik progres.</small></div>${sw('sound', S.set.sound, 'Bunyi')}</div><div class="opt"><div><b>Getar</b><small>Di iPhone getarnya berasal dari sakelar bawaan Safari, jadi bisa saja tidak terasa di versi iOS tertentu.</small></div>${sw('haptic', S.set.haptic, 'Getar')}</div>`)}
        ${acc('jeda', 'pause', 'Jeda untuk safar atau sakit', `<p class="muted">${p ? 'Jeda berjalan sejak ' + fullDate(p.a) + '.' : 'Selama jeda, hari yang tidak mencapai Aman tidak memutus rantai.'}</p><div class="btn-row">${p ? btn('resume', 'Akhiri jeda', 'primary') : btn('pause', 'Mulai jeda hari ini', 'primary')}</div>${quoteHTML(QD.PAUSE)}`)}
        ${acc('cadangan', 'save', 'Cadangan', cadangan)}
        <div class="acc"><button class="acc-head" data-act="lib">${ic('book')}<span>Pustaka kutipan</span>${ic('right', 'chev')}</button></div>
        ${acc('tentang', 'info', 'Tentang', tentang)}
      </div></section>`;
  }
  const allQuotes = () => QD.DAILY.concat.apply(QD.DAILY, QD.CP);
  function viewLibrary() {
    const all = allQuotes(), hide = S.set.hide, F = { semua: () => true, quran: (q) => q.k === 'quran', hadits: (q) => q.k === 'hadits', atsar: (q) => q.k === 'atsar', umum: (q) => q.k === 'umum', cek: (q) => q.cek, hid: (q) => hide[C.qid(q)] };
    const nCek = all.filter(F.cek).length, nHid = all.filter(F.hid).length, list = all.filter(F[ui.libF] || F.semua);
    const chips = [['semua', 'Semua'], ['quran', "Al-Qur'an"], ['hadits', 'Hadits'], ['atsar', 'Atsar dan ulama'], ['umum', 'Umum'], ['cek', 'Perlu dicek ' + nCek], ['hid', 'Disembunyikan ' + nHid]];
    return `<header class="page-h"><div><button class="link" data-act="libBack">${ic('left')}Kelola</button><h1>Pustaka kutipan</h1><p>${all.length} kutipan. Yang disembunyikan tidak akan tampil di halaman mana pun.</p></div></header>
      <section class="card hi"><div class="chips">${chips.map((c) => `<button class="chip${ui.libF === c[0] ? ' on' : ''}" data-act="libF" data-v="${c[0]}">${c[1]}</button>`).join('')}</div>${ui.libF === 'cek' ? '<p class="muted">Kutipan ini ditulis dari ingatan dan belum dicocokkan lagi ke kitab sumbernya. Cek dulu teks dan nomornya sebelum dipakai, atau sembunyikan.</p>' : ''}</section>
      <section class="card">${list.length ? `<div>${list.map((q) => { const id = C.qid(q), h = !!hide[id]; return `<div class="lib${h ? ' hid' : ''}"><div>${q.cek ? '<span class="tag">perlu dicek</span>' : ''}${quoteHTML(q)}</div><button class="iconbtn" data-act="hide" data-id="${id}" aria-label="${h ? 'Tampilkan lagi' : 'Sembunyikan'}" aria-pressed="${h}">${ic(h ? 'eyeoff' : 'eye')}</button></div>`; }).join('')}</div>` : '<p class="muted">Tidak ada kutipan di kelompok ini.</p>'}</section>`;
  }

  /* ================= lembar isian ================= */
  const chip = (f, v, label, on) => `<button type="button" class="chip${on ? ' on' : ''}" data-act="pick" data-f="${f}" data-v="${v}" aria-pressed="${!!on}">${label}</button>`;
  const optRow = (f, title, sub, on) => `<div class="opt"><div><b>${title}</b><small>${sub}</small></div>${sw('flip', on, title, ` data-f="${f}" type="button"`)}</div>`;
  function taskSheet() {
    const sh = ui.sheet, d = sh.d, isNew = sh.isNew, once = d.rep === 'once';
    return `<form class="sheet" data-form="task" novalidate aria-label="${isNew ? 'Task baru' : 'Ubah task'}">
      <div class="sh-head"><h2>${isNew ? 'Task baru' : 'Ubah task'}</h2><button type="button" class="iconbtn" data-act="closeSheet" aria-label="Tutup">${ic('x')}</button></div>
      <label class="field"><span>Nama</span><input class="input" id="f-name" data-f="name" value="${esc(d.name)}" maxlength="60" autocomplete="off" placeholder="Misal: Murajaah 2 halaman"></label>
      <div class="field"><span>Diulang</span><div class="chips">${chip('rep', 'daily', 'Setiap hari', d.rep === 'daily')}${chip('rep', 'days', 'Hari tertentu', d.rep === 'days')}${isNew ? chip('rep', 'once', 'Sekali saja', once) : ''}</div>
        ${d.rep === 'days' ? `<div class="chips days">${ordDays().map((w) => chip('day', w, DOW3[w], d.days.indexOf(w) >= 0)).join('')}</div>` : ''}
        ${once ? `<input class="input" id="f-date" type="date" data-f="date" value="${d.date}" aria-label="Tanggal"><small class="muted">Tampil di Hari ini sampai dicentang, tanpa memengaruhi progres harian.</small>` : ''}</div>
      ${once ? '' : `<div class="field"><span>Blok waktu</span><div class="chips">${C.BLOCKS.map((b) => chip('block', b, BL[b].n, d.block === b)).join('')}</div></div>
      <div class="field"><span>Jenis</span><div class="chips">${chip('type', 'check', 'Centang', d.type === 'check')}${chip('type', 'count', 'Hitungan', d.type === 'count')}</div>
        ${d.type === 'count' ? `<div class="row3"><label class="field"><span>Target</span><input class="input" id="f-target" type="number" inputmode="numeric" min="2" max="999" data-f="target" value="${esc(d.target)}"></label><label class="field"><span>Satuan</span><input class="input" id="f-unit" data-f="unit" value="${esc(d.unit)}" maxlength="12" autocomplete="off" placeholder="halaman"></label><label class="field"><span>Per ketuk</span><input class="input" id="f-step" type="number" inputmode="numeric" min="1" max="999" data-f="step" value="${esc(d.step)}"></label></div>` : ''}</div>
      <div>${optRow('core', 'Task inti', 'Wajib selesai agar hari dihitung aman. Maksimal tiga.', d.core)}${d.block === 'any' ? '' : optRow('sticky', 'Ikut turun kalau terlewat', 'Matikan untuk task yang terikat waktu, seperti shalat Dhuha.', d.sticky)}${isNew ? '' : optRow('on', 'Aktif', 'Matikan sementara tanpa menghapus, misalnya saat liburan.', d.on)}</div>
      ${isNew ? '' : `<div class="btn-row"><button type="button" class="btn sm" data-act="move" data-dir="-1">${ic('up')}Naik</button><button type="button" class="btn sm" data-act="move" data-dir="1">${ic('down')}Turun</button></div>`}`}
      ${sh.err ? `<p class="err" role="alert">${sh.err}</p>` : ''}
      ${sh.ask ? `<p class="err">Hapus task ini? Riwayat hari-hari yang lalu tetap tersimpan.</p><div class="sh-foot"><button type="button" class="btn" data-act="delNo">Batal</button><button type="button" class="btn primary" data-act="delYes">Ya, hapus</button></div>` : `<div class="sh-foot">${isNew ? '' : '<button type="button" class="btn quiet" data-act="askDel">Hapus</button>'}<button type="submit" class="btn primary">Simpan</button></div>`}
    </form>`;
  }
  function dlSheet() {
    const sh = ui.sheet, d = sh.d, isNew = !sh.id;
    return `<form class="sheet" data-form="dlEdit" novalidate aria-label="${isNew ? 'Deadline baru' : 'Ubah deadline'}">
      <div class="sh-head"><h2>${isNew ? 'Deadline baru' : 'Ubah deadline'}</h2><button type="button" class="iconbtn" data-act="closeSheet" aria-label="Tutup">${ic('x')}</button></div>
      <label class="field"><span>Nama</span><input class="input" id="e-name" data-f="name" value="${esc(d.name)}" maxlength="60" autocomplete="off" placeholder="Misal: UAS Ushul Fiqh"></label>
      <label class="field"><span>Tanggal</span><input class="input" id="e-date" type="date" data-f="date" value="${d.date}"></label>
      <label class="field"><span>Catatan singkat</span><input class="input" id="e-note" data-f="note" value="${esc(d.note)}" maxlength="60" autocomplete="off" placeholder="Opsional"></label>
      ${sh.err ? `<p class="err" role="alert">${sh.err}</p>` : ''}
      ${sh.ask ? `<p class="err">Hapus deadline ini?</p><div class="sh-foot"><button type="button" class="btn" data-act="delNo">Batal</button><button type="button" class="btn primary" data-act="dlDelYes">Ya, hapus</button></div>` : `<div class="sh-foot">${isNew ? '' : '<button type="button" class="btn quiet" data-act="askDel">Hapus</button>'}<button type="submit" class="btn primary">${isNew ? 'Tambah' : 'Simpan'}</button></div>`}
    </form>`;
  }

  // Lembar penanda: tampilan cepat untuk memajukan angka, atau formulir detail untuk penanda baru dan pengaturannya.
  const MSTEP = { page: [-1, 1, 2, 5, 10, 20], num: [-1, 1, 5, 10] };
  const curMark = () => (ui.sheet && S.marks.find((x) => x.id === ui.sheet.id)) || null;
  const curList = () => (ui.sheet && S.lists.find((x) => x.id === ui.sheet.id)) || null;
  const sheetHead = (t) => `<div class="sh-head"><h2>${t}</h2><button type="button" class="iconbtn" data-act="closeSheet" aria-label="Tutup">${ic('x')}</button></div>`;
  function markSheet() {
    const sh = ui.sheet, d = sh.d, m = curMark(), err = sh.err ? `<p class="err" role="alert">${sh.err}</p>` : '';
    if (m && !sh.edit) {
      let body;
      if (m.type === 'date') {
        body = `<div class="mk-big"><b>${m.val ? shortDate(m.val) : '–'}</b></div><p class="mk-info">${m.val ? longDate(m.val) + ', ' + dayDist(m.val) : 'Belum diisi'}</p>
          <button type="button" class="btn primary" data-act="mToday">Jadikan hari ini</button>
          <label class="field"><span>Atau pilih tanggal lain</span><input class="input" id="m-date" type="date" data-chg="mDate" value="${m.val || ''}"></label>`;
      } else if (m.type === 'text') {
        body = `<form class="mk-jump" data-form="mText" novalidate><input class="input" id="m-text" data-f="text" value="${esc(d.text != null ? d.text : m.val || '')}" maxlength="80" autocomplete="off" aria-label="Isi ${esc(m.name)}"><button class="btn primary" type="submit">Simpan</button></form>`;
      } else {
        const r = hasRange(m), pct = r ? rangePct(m) : 0, jl = m.type === 'page' ? 'Lompat ke halaman' : 'Ganti angka';
        body = `<div class="mk-big"><b>${esc(m.val)}</b>${m.type === 'page' ? '<small>hlm</small>' : m.unit ? `<small>${esc(m.unit)}</small>` : ''}</div>
          ${m.type === 'page' ? `<p class="mk-info">${pageInfo(m.val)}</p>` : ''}
          ${r ? `<div class="mk-prog"><div class="bar" style="--p:${(pct * 100).toFixed(1)}%;--c:var(--cp3)"><i></i></div><span>${rangeLabel(m)}, ${Math.round(pct * 100)}%${m.laps ? `, khatam ${m.laps}×` : ''}</span></div>` : ''}
          <div class="chips steps">${MSTEP[m.type].map((n) => `<button type="button" class="chip step${n < 0 ? ' neg' : ''}" data-act="mStep" data-n="${n}" aria-label="${n < 0 ? 'Kurangi' : 'Tambah'} ${Math.abs(n)}">${n < 0 ? '−' + -n : '+' + n}</button>`).join('')}</div>
          ${r && m.val >= m.end ? `<button type="button" class="btn primary" data-act="mLap">${ic('book')}Khatam, mulai putaran baru</button>` : ''}
          <form class="mk-jump" data-form="mJump" novalidate><input class="input" id="m-jump" type="number" inputmode="${m.type === 'page' ? 'numeric' : 'decimal'}" data-f="jump" value="${esc(d.jump || '')}" placeholder="${jl}" aria-label="${jl}"><button class="btn" type="submit">Pakai</button></form>`;
      }
      return `<div class="sheet" role="dialog" aria-label="${esc(m.name)}">${sheetHead(esc(m.name))}${body}${err}<div class="mk-meta"><span>${m.at ? 'Diubah ' + ago(m.at) : ''}</span><button type="button" class="link" data-act="mEdit">Ubah detail</button></div></div>`;
    }
    const isNew = !m, ty = d.type, field = (label, inner) => `<label class="field"><span>${label}</span>${inner}</label>`;
    const num = (id, f, v, mode) => `<input class="input" id="${id}" type="number" inputmode="${mode || 'numeric'}" data-f="${f}" value="${esc(v)}">`;
    let range = '';
    if (ty === 'page') {
      range = `<div class="field"><span>Rentang target</span><div class="chips">${chip('rm', 'juz', 'Per juz', d.rm === 'juz')}${chip('rm', 'page', 'Per halaman', d.rm === 'page')}${chip('rm', 'none', 'Tanpa rentang', d.rm === 'none')}</div></div>`;
      if (d.rm === 'juz') range += `<div class="row2">${field('Dari juz', num('m-ja', 'ja', d.ja))}${field('Sampai juz', num('m-jb', 'jb', d.jb))}</div>`;
      if (d.rm === 'page') range += `<div class="row2">${field('Dari halaman', num('m-pa', 'pa', d.pa))}${field('Sampai halaman', num('m-pb', 'pb', d.pb))}</div>`;
      range += `<p class="muted" id="m-rhint">${d.rm === 'none' ? 'Tanpa bilah progres dan hitungan khatam.' : ''}</p>`;
    }
    const valInput = ty === 'date' ? `<input class="input" id="m-val" type="date" data-f="val" value="${/^\d{4}-\d{2}-\d{2}$/.test(d.val) ? d.val : ''}">`
      : ty === 'text' ? `<input class="input" id="m-val" data-f="val" value="${esc(d.val)}" maxlength="80" autocomplete="off">`
      : `<input class="input" id="m-val" type="number" inputmode="${ty === 'page' ? 'numeric' : 'decimal'}" data-f="val" value="${esc(d.val)}"${ty === 'page' ? ' placeholder="Kosongkan untuk mulai dari awal rentang"' : ''}>`;
    const valLabel = ty === 'page' ? 'Posisi sekarang (halaman)' : ty === 'num' ? 'Angka sekarang' : ty === 'date' ? 'Tanggal' : 'Isi';
    return `<form class="sheet" data-form="mSave" novalidate aria-label="${isNew ? 'Penanda baru' : 'Ubah penanda'}">${sheetHead(isNew ? 'Penanda baru' : 'Ubah penanda')}
      ${field('Nama', `<input class="input" id="m-name" data-f="name" value="${esc(d.name)}" maxlength="40" autocomplete="off" placeholder="Misal: Murojaah juz akhir">`)}
      <div class="field"><span>Jenis</span><div class="chips">${[['page', 'Halaman mushaf'], ['num', 'Angka'], ['date', 'Tanggal'], ['text', 'Teks']].map((t) => chip('type', t[0], t[1], ty === t[0])).join('')}</div></div>
      ${range}
      ${field(valLabel, valInput)}
      ${ty === 'num' ? field('Satuan', `<input class="input" id="m-unit" data-f="unit" value="${esc(d.unit)}" maxlength="12" autocomplete="off" placeholder="Opsional, misal: ayat">`) : ''}
      ${ty === 'page' && d.rm !== 'none' && !isNew ? field('Sudah khatam berapa kali', num('m-laps', 'laps', d.laps)) : ''}
      ${isNew ? '' : `<div class="btn-row"><button type="button" class="btn sm" data-act="mMove" data-dir="-1">${ic('up')}Naik</button><button type="button" class="btn sm" data-act="mMove" data-dir="1">${ic('down')}Turun</button></div>`}
      ${err}
      ${sh.ask ? `<p class="err">Hapus penanda ini?</p><div class="sh-foot"><button type="button" class="btn" data-act="delNo">Batal</button><button type="button" class="btn primary" data-act="mDelYes">Ya, hapus</button></div>` : `<div class="sh-foot">${isNew ? '' : '<button type="button" class="btn quiet" data-act="askDel">Hapus</button>'}<button type="submit" class="btn primary">Simpan</button></div>`}
    </form>`;
  }
  function markForm(m) {
    const r = !!m && hasRange(m);
    const d = m
      ? { name: m.name, type: m.type, val: String(m.val == null ? '' : m.val), unit: m.unit || '', rm: m.type !== 'page' ? 'juz' : !r ? 'none' : isJuzRange(m) ? 'juz' : 'page', ja: r ? juzOf(m.start) : 1, jb: r ? juzOf(m.end) : 30, pa: r ? m.start : 1, pb: r ? m.end : 604, laps: m.laps || 0 }
      : { name: '', type: 'page', val: '', unit: '', rm: 'juz', ja: 1, jb: 30, pa: 1, pb: 604, laps: 0 };
    return { type: 'mark', id: m ? m.id : null, edit: true, d, err: '', ask: false };
  }
  // Keterangan rentang diperbarui selagi mengetik, tanpa menggambar ulang lembar (supaya keyboard tidak tertutup).
  function markHint() {
    const el = $('#m-rhint'), sh = ui.sheet;
    if (!el || !sh || sh.type !== 'mark' || !sh.edit) return;
    const d = sh.d, I = (x) => Math.round(+x);
    if (d.rm === 'juz') { const a = I(d.ja), b = I(d.jb); el.textContent = a >= 1 && b <= 30 && a <= b ? `Halaman ${jStart(a)}–${jEnd(b)}, ${jEnd(b) - jStart(a) + 1} halaman.` : 'Isi juz 1 sampai 30.'; }
    else if (d.rm === 'page') { const a = I(d.pa), b = I(d.pb); el.textContent = a >= 1 && b <= 604 && a < b ? `Juz ${juzOf(a)} sampai ${juzOf(b)}, ${b - a + 1} halaman.` : 'Isi halaman 1 sampai 604.'; }
  }
  function celebrateLap(m) {
    chime('gold'); confetti(true);
    ui.sheet = null; renderSheet();
    const q = C.pick(QD.CP[4], today(), S.set.hide, 400 + m.laps);
    modal(`<div class="medal">${ic('book')}</div><h2>Khatam ke-${m.laps}</h2><p>${esc(m.name)}, ${rangeLabel(m)}. Penanda kembali ke halaman ${m.start}.</p>${q ? quoteHTML(q) : ''}<button class="btn primary" data-act="modalClose">Lanjut</button>`);
  }
  function stepMark(n) {
    const m = curMark();
    if (!m) return;
    let v = (+m.val || 0) + n, lapped = false;
    if (m.type === 'page') {
      if (hasRange(m)) {
        if (v > m.end) { v = m.start + Math.min(v - m.end - 1, m.end - m.start); m.laps = (m.laps || 0) + 1; lapped = true; }
        else if (v < m.start) v = m.start;
      }
      v = clamp(v, 1, 604);
    } else v = Math.max(0, Math.round(v * 100) / 100);
    m.val = v; m.at = today(); ui.sheet.err = ''; save(); buzz();
    render();
    if (lapped) celebrateLap(m); else renderSheet();
  }
  function setMarkVal(v) { const m = curMark(); if (!m) return; m.val = v; m.at = today(); save(); buzz(); renderSheet(); render(); }
  function saveMark() {
    const sh = ui.sheet, d = sh.d, I = (x) => Math.round(+x), name = String(d.name || '').trim(), blank = String(d.val).trim() === '';
    const fail = (msg) => { sh.err = msg; renderSheet(); };
    if (!name) return fail('Beri nama dulu.');
    const o = { name, type: d.type, unit: d.type === 'num' ? String(d.unit || '').trim() : '', start: null, end: null, laps: 0 };
    if (d.type === 'page') {
      if (d.rm === 'juz') { const a = I(d.ja), b = I(d.jb); if (!(a >= 1 && b <= 30 && a <= b)) return fail('Juz antara 1 dan 30, dan juz awal tidak boleh melewati juz akhir.'); o.start = jStart(a); o.end = jEnd(b); }
      else if (d.rm === 'page') { const a = I(d.pa), b = I(d.pb); if (!(a >= 1 && b <= 604 && a < b)) return fail('Halaman antara 1 dan 604, dan halaman awal harus sebelum halaman akhir.'); o.start = a; o.end = b; }
      const lo = o.start || 1, hi = o.end || 604, v = blank ? lo : I(d.val);
      if (!(v >= lo && v <= hi)) return fail(`Posisi harus antara halaman ${lo} dan ${hi}.`);
      o.val = v; o.laps = o.start ? Math.max(0, I(d.laps) || 0) : 0;
    } else if (d.type === 'num') { const v = blank ? 0 : +d.val; if (!isFinite(v)) return fail('Isi dengan angka.'); o.val = v; }
    else if (d.type === 'date') o.val = /^\d{4}-\d{2}-\d{2}$/.test(d.val) ? d.val : today();
    else o.val = String(d.val || '').trim();
    const k = today(), m = curMark();
    if (m) { if (String(m.val) !== String(o.val) || m.type !== o.type) o.at = k; Object.assign(m, o); delete m.demo; }
    else S.marks.push(Object.assign({ id: C.newId(S, 'm'), ord: S.seq, at: k }, o));
    save(); ui.sheet = null; renderSheet(); render();
    toast(ic('check') + `<span>${m ? 'Penanda disimpan.' : 'Penanda ditambahkan.'}</span>`);
  }

  // Lembar daftar: isi bertahan sampai dicentang; yang dicentang turun ke Selesai.
  function listSheet() {
    const sh = ui.sheet, d = sh.d, l = curList(), err = sh.err ? `<p class="err" role="alert">${sh.err}</p>` : '';
    if (!l) {
      return `<form class="sheet" data-form="lNew" novalidate aria-label="Daftar baru">${sheetHead('Daftar baru')}
        <label class="field"><span>Nama daftar</span><input class="input" id="l-name" data-f="name" value="${esc(d.name)}" maxlength="40" autocomplete="off" placeholder="Misal: Wish list"></label>
        ${err}<div class="sh-foot"><button type="submit" class="btn primary">Buat daftar</button></div></form>`;
    }
    const open = l.items.filter((x) => !x.done), done = l.items.filter((x) => x.done);
    const item = (x) => `<li class="task${x.done ? ' done' : ''}"><button type="button" class="t-hit" role="checkbox" aria-checked="${!!x.done}" data-act="item" data-id="${x.id}"><span class="t-box">${ic('check')}</span><span class="t-body"><span class="t-name">${esc(x.text)}</span></span></button>${sh.edit ? `<button type="button" class="t-dec" data-act="itemDel" data-id="${x.id}" aria-label="Hapus ${esc(x.text)}">${ic('trash')}</button>` : ''}</li>`;
    const tools = sh.ask
      ? `<p class="err">Hapus daftar ${esc(l.name)} beserta isinya?</p><div class="btn-row"><button type="button" class="btn" data-act="delNo">Batal</button><button type="button" class="btn primary" data-act="lDelYes">Ya, hapus</button></div>`
      : `<div class="btn-row"><button type="button" class="btn sm" data-act="lMove" data-dir="-1">${ic('up')}Naik</button><button type="button" class="btn sm" data-act="lMove" data-dir="1">${ic('down')}Turun</button><button type="button" class="btn sm quiet" data-act="askDel">Hapus daftar</button></div>`;
    return `<div class="sheet" role="dialog" aria-label="${esc(l.name)}">
      <div class="sh-head"><h2>${esc(l.name)}</h2><div class="btn-row"><button type="button" class="btn sm quiet" data-act="lEdit">${sh.edit ? 'Selesai' : 'Ubah'}</button><button type="button" class="iconbtn" data-act="closeSheet" aria-label="Tutup">${ic('x')}</button></div></div>
      ${sh.edit ? `<div class="mk-jump"><input class="input" id="l-rename" data-f="name" value="${esc(d.name)}" maxlength="40" autocomplete="off" aria-label="Nama daftar"><button type="button" class="btn" data-act="lRename">Ganti nama</button></div>` : ''}
      <form class="mk-jump" data-form="item" novalidate><input class="input" id="li-new" data-f="draft" value="${esc(d.draft || '')}" maxlength="80" autocomplete="off" placeholder="Tambah isi daftar" aria-label="Tambah isi daftar"><button class="btn primary" type="submit" aria-label="Tambah">${ic('plus')}</button></form>
      ${open.length ? `<ul class="tasks">${open.map(item).join('')}</ul>` : '<p class="muted">Belum ada yang perlu dicentang.</p>'}
      ${done.length ? `<div class="fold${sh.showDone ? ' open' : ''}"><button type="button" class="fold-head" data-act="lDone" aria-expanded="${!!sh.showDone}">${ic('check', 'b')}<b>Selesai<small>${done.length}</small></b><span></span>${ic('down', 'chev')}</button>${sh.showDone ? `<div class="fold-body"><ul class="tasks">${done.map(item).join('')}</ul><button type="button" class="btn sm" data-act="lClear">Bersihkan yang selesai</button></div>` : ''}</div>` : ''}
      ${sh.edit ? tools : ''}
    </div>`;
  }
  function renderSheet(focusName) {
    const el = $('#sheet');
    if (!ui.sheet) { el.hidden = true; el.innerHTML = ''; return; }
    const sc = $('.sheet', el), top = sc ? sc.scrollTop : 0;
    const T = ui.sheet.type;
    el.innerHTML = T === 'task' ? taskSheet() : T === 'mark' ? markSheet() : T === 'list' ? listSheet() : dlSheet();
    el.hidden = false;
    const ns = $('.sheet', el);
    if (ns) { ns.style.animation = sc ? 'none' : ''; ns.scrollTop = top; }
    if (focusName) { const i = $('#f-name', el) || $('#e-name', el) || $('#m-name', el) || $('#l-name', el); if (i && !i.value) i.focus(); }
    if (T === 'mark') markHint();
  }
  function openTask(id) {
    const k = today(), t = id ? C.taskById(S, id) : null;
    const d = t ? { name: t.name, block: t.block, rep: t.days.length === 7 ? 'daily' : 'days', days: t.days.slice(), type: t.type, target: t.target || 5, unit: t.unit || '', step: t.step || 1, core: !!t.core, sticky: t.sticky !== false, on: t.on !== false, date: k }
      : { name: '', block: C.blockAt(C.dayTimes(k, S.set), C.appMin(now())).id, rep: 'daily', days: [0, 1, 2, 3, 4, 5, 6], type: 'check', target: 5, unit: '', step: 1, core: false, sticky: true, on: true, date: k };
    ui.sheet = { type: 'task', id: id || null, isNew: !t, d, err: '', ask: false };
    renderSheet(true);
  }
  function saveTask() {
    const sh = ui.sheet, d = sh.d, k = today(), name = String(d.name || '').trim();
    if (!name) { sh.err = 'Beri nama dulu.'; return renderSheet(); }
    if (d.rep === 'once') {
      if (!d.date) { sh.err = 'Pilih tanggalnya.'; return renderSheet(); }
      S.todos.push({ id: C.newId(S, 'o'), name, date: d.date < k ? k : d.date, done: null });
      save(); ui.sheet = null; renderSheet(); render(); toast(ic('check') + '<span>Tersimpan di Sekali jalan.</span>');
      return;
    }
    const days = d.rep === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : d.days.slice().sort();
    if (!days.length) { sh.err = 'Pilih minimal satu hari.'; return renderSheet(); }
    let type = d.type, target = Math.round(+d.target) || 0, step = Math.max(1, Math.round(+d.step) || 1);
    if (type === 'count') { if (target < 2 || target > 999) { sh.err = 'Target hitungan antara 2 dan 999.'; return renderSheet(); } if (step > target) step = target; } else { target = 1; step = 1; }
    const others = S.tasks.filter((t) => !t.gone && t.on && t.core && t.id !== sh.id).length;
    if (d.core && d.on && others >= 3) { sh.err = 'Task inti sudah tiga. Lepas satu dulu.'; return renderSheet(); }
    const patch = { name, block: d.block, days, type, target, unit: String(d.unit || '').trim(), step, core: !!d.core, sticky: d.block === 'any' ? true : !!d.sticky, on: !!d.on };
    if (sh.isNew) S.tasks.push(Object.assign({ id: C.newId(S), created: k, ord: S.seq }, patch));
    else { const t = C.taskById(S, sh.id); if (t.block !== patch.block) patch.ord = S.seq++; Object.assign(t, patch); delete t.demo; }
    ui.defs++; save(); ui.sheet = null; renderSheet(); render(); toast(ic('check') + `<span>${sh.isNew ? 'Task ditambahkan.' : 'Perubahan disimpan.'}</span>`);
  }

  /* ================= render ================= */
  const TABS = [['hari-ini', 'Hari ini', 'sun'], ['pekan', 'Pekan', 'week'], ['catatan', 'Catatan', 'note'], ['capaian', 'Capaian', 'trophy'], ['kelola', 'Kelola', 'sliders']];
  const tabOf = (h) => (h === 'deadline' ? 'catatan' : h);
  function render() {
    applyTheme();
    const v = ui.tab, html = v === 'pekan' ? viewWeek() : v === 'catatan' ? viewNotes() : v === 'capaian' ? viewStats() : v === 'kelola' ? viewManage() : viewToday();
    const ae = document.activeElement, keep = ae && ae.id && $('#view').contains(ae) ? { id: ae.id, s: ae.selectionStart, e: ae.selectionEnd } : null;
    $('#view').innerHTML = html;
    $('#tabs').innerHTML = `<nav class="tabbar" aria-label="Halaman">${TABS.map((t) => `<button class="tab" data-act="tab" data-tab="${t[0]}"${t[0] === v ? ' aria-current="page"' : ''}>${ic(t[2])}<span>${t[1]}</span></button>`).join('')}</nav>`;
    if (keep) { const el = document.getElementById(keep.id); if (el) { el.focus(); try { if (keep.s != null) el.setSelectionRange(keep.s, keep.e); } catch (e) { /* bukan teks */ } } }
    afterRender();
  }
  function go(tab, o) {
    tab = tabOf(tab);
    if (!TABS.some((t) => t[0] === tab)) tab = 'hari-ini';
    ui.tab = tab; ui.hold = {}; clearTimeout(flushT); ui.prev = null; ui.err = ''; ui.ask = null;
    if (tab !== 'kelola') ui.sub = null;
    try { if (location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab); } catch (e) { /* tanpa hash */ }
    render();
    if (!(o && o.keep)) window.scrollTo(0, 0);
  }

  /* ================= aksi ================= */
  function react(k, before, after, skBefore, up, name, done) {
    const tdy = k === today(), sk = streak(today()), nm = esc(name || '');
    if (!up) return;
    if (!tdy) {
      if (sk.cur > skBefore) toast(ic('link') + `<span>${longDate(k)} jadi aman.<small>Rantai tersambung: ${sk.cur} hari.</small></span>`, 4500, '', true);
      else if (done) toast(ic('check') + `<span>${nm} selesai.<small>Dicatat untuk ${longDate(k)}.</small></span>`, 4500, '', true);
      return;
    }
    if (after.cp > before.cp) {
      if (after.cp >= 3 && before.cp < 3) {
        const m = (MILES.indexOf(sk.cur) >= 0 || (sk.cur > 365 && sk.cur % 365 === 0)) && !S.meta.miles[sk.cur] ? sk.cur : 0;
        if (m) { S.meta.miles[m] = k; save(); if (ui.pendUndo) ui.pendUndo.mile = m; }
        if (after.cp === 4) { chime('gold'); confetti(true); toast(ic('star') + `<span>Sempurna hari ini.<small>Rantai ${sk.cur} hari.</small></span>`, 4500, '', true); }
        else { chime('cp'); confetti(false); toast(ic('shield') + `<span>Aman. Rantai ${sk.cur} hari.<small>Sisanya bonus menuju Sempurna.</small></span>`, 4500, '', true); }
        if (m) ui.mileT = setTimeout(() => { const info = mileInfo(m); confetti(true); modal(`<div class="medal">${ic('trophy')}</div><div class="big">${m}</div><h2>${info[0]}</h2><p>${info[1]}</p><button class="btn primary" data-act="modalClose">Lanjut</button>`); }, 1500);
      } else if (after.cp === 4) { chime('gold'); confetti(true); toast(ic('star') + '<span>Sempurna hari ini.<small>Semua tuntas.</small></span>', 4500, '', true); }
      else if (after.cp === 2) { chime('cp'); toast(ic('check') + `<span>Separuh jalan.${done ? `<small>${nm} selesai.</small>` : ''}</span>`, 4500, '', true); }
      else if (after.cp === 1) { chime('cp'); toast(ic('play') + `<span>Mulai. Langkah pertama hari ini.${done ? `<small>${nm} selesai.</small>` : ''}</span>`, 4500, '', true); }
      return;
    }
    chime('one');
    if (done) toast(ic('check') + `<span>${nm} selesai.</span>`, 4500, '', true);
    if (S.meta.faidahDay !== k && Math.random() < 0.09 && QD.FAIDAH.length) {
      S.meta.faidahDay = k; const f = QD.FAIDAH[S.meta.fi % QD.FAIDAH.length]; S.meta.fi++; save();
      const html = ic('bulb') + `<span><small>Faidah</small>${esc(f)}</span>`;
      if (toastOn) queued = [html, 9000, 'faidah'];
      else setTimeout(() => { if (toastOn) queued = [html, 9000, 'faidah']; else toast(html, 9000, 'faidah'); }, 500);
    }
  }
  function setTask(k, id, val) {
    const before = C.stat(S, k), skB = streak(today()).cur, old = C.valOf(S, k, id), e = C.dueList(S, k).find((x) => x[0] === id), tg = e ? e[1] : 1, t = C.taskById(S, id);
    if (ui.undo) hideToast();
    if (ui.tab === 'hari-ini' && k === today()) holdRow(k, id);
    C.setVal(S, k, id, val); save();
    const up = val > old;
    ui.just = up ? k + id : null;
    if (up) buzz();
    render();
    ui.just = null;
    ui.pendUndo = up ? { k, id, old } : null;
    react(k, before, C.stat(S, k), skB, up, t ? t.name : '', val >= tg && old < tg);
    ui.pendUndo = null;
  }
  const editable = (k) => { const t = today(); return (k === t || k === addDays(t, -1)) && k >= S.start; };
  function tick(force) {
    const k = today();
    if (S.sealed !== addDays(k, -1) && C.seal(S, k)) save();
    if (S.todos.some((t) => t.done && diffDays(t.done, k) > 30)) { S.todos = S.todos.filter((t) => !(t.done && diffDays(t.done, k) > 30)); save(); }
    const sig = k + '|' + C.blockAt(C.dayTimes(k, S.set), C.appMin(now())).id;
    if (sig !== ui.sig || force) {
      ui.sig = sig;
      const ae = document.activeElement, busy = ui.sheet || !$('#modal').hidden || (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && !ae.classList.contains('t-in'));
      if (busy && !force) { ui.sig = null; applyTheme(); return; }
      render();
    } else applyTheme();
  }
  function copyText(text, okMsg) {
    const fail = () => { ui.io = text; ui.acc.cadangan = true; render(); const ta = $('#bak-text'); if (ta) { ta.focus(); ta.select(); } toast('<span>Salin otomatis ditolak. Teksnya sudah dipilih, tinggal salin.</span>', 4200); };
    try { navigator.clipboard.writeText(text).then(() => toast(ic('check') + `<span>${okMsg}</span>`), fail); } catch (e) { fail(); }
  }
  const A = {
    tab: (el) => { go(el.dataset.tab); const to = el.dataset.to && document.getElementById(el.dataset.to); if (to) window.scrollTo(0, Math.max(0, to.getBoundingClientRect().top + window.scrollY - 12)); },
    fold: (el) => { ui.open[el.dataset.b] = !ui.open[el.dataset.b]; render(); },
    toggle: (el) => { const k = el.dataset.k, id = el.dataset.id, e = C.dueList(S, k).find((x) => x[0] === id); if (e && editable(k)) setTask(k, id, C.valOf(S, k, id) >= e[1] ? 0 : e[1]); },
    todo: (el) => { const t = S.todos.find((x) => x.id === el.dataset.id); if (!t) return; t.done = t.done ? null : today(); save(); if (t.done) { buzz(); chime('one'); } render(); },
    undo: () => {
      const u = ui.undo;
      if (!u) return;
      clearTimeout(ui.mileT);
      if (u.mile && S.meta.miles[u.mile] === u.k) { delete S.meta.miles[u.mile]; closeModal(); }
      C.setVal(S, u.k, u.id, u.old); save();
      hideToast();
      if (!ui.hold[u.id]) ui.arrive = { [u.id]: 1 };
      render(); ui.arrive = {};
      toast(ic('loop') + '<span>Dibatalkan.</span>', 1800);
    },
    inc: (el) => { const k = el.dataset.k, id = el.dataset.id, e = C.dueList(S, k).find((x) => x[0] === id), t = C.taskById(S, id); if (e && editable(k)) { const v = C.valOf(S, k, id); if (v < e[1]) setTask(k, id, Math.min(e[1], v + ((t && t.step) || 1))); } },
    dec: (el) => { const k = el.dataset.k, id = el.dataset.id, t = C.taskById(S, id); if (editable(k)) setTask(k, id, Math.max(0, C.valOf(S, k, id) - ((t && t.step) || 1))); },
    new: () => openTask(null),
    edit: (el) => openTask(el.dataset.id),
    closeSheet: () => { ui.sheet = null; renderSheet(); },
    pick: (el) => {
      const d = ui.sheet.d, f = el.dataset.f, v = el.dataset.v;
      if (f === 'day') { const w = +v, i = d.days.indexOf(w); if (i >= 0) d.days.splice(i, 1); else d.days.push(w); }
      else { d[f] = v; if (f === 'rep' && v === 'days' && d.days.length === 7) d.days = [dowToday()]; }
      ui.sheet.err = ''; renderSheet();
    },
    flip: (el) => { const d = ui.sheet.d; d[el.dataset.f] = !d[el.dataset.f]; ui.sheet.err = ''; renderSheet(); },
    askDel: () => { ui.sheet.ask = true; renderSheet(); },
    delNo: () => { ui.sheet.ask = false; renderSheet(); },
    delYes: () => { const t = C.taskById(S, ui.sheet.id), k = today(); if (t) { if (t.created === k && !Object.keys(S.days).some((d) => d !== k && S.days[d].due && S.days[d].due.some((e) => e[0] === t.id))) { S.tasks = S.tasks.filter((x) => x !== t); if (S.days[k] && S.days[k].v) C.setVal(S, k, t.id, 0); } else t.gone = k; } ui.defs++; save(); ui.sheet = null; renderSheet(); render(); toast('<span>Task dihapus.</span>'); },
    move: (el) => { const t = C.taskById(S, ui.sheet.id), L = S.tasks.filter((x) => !x.gone && x.block === t.block).sort(C.taskSort), i = L.indexOf(t), j = i + +el.dataset.dir; if (j < 0 || j >= L.length) return; L.splice(i, 1); L.splice(j, 0, t); L.forEach((x, n) => { x.ord = n + 1; }); ui.defs++; save(); render(); toast(`<span>${esc(t.name)} sekarang urutan ${j + 1} di ${BL[t.block].n}.</span>`, 1800); },
    tOn: (el) => { const t = C.taskById(S, el.dataset.id); if (!t) return; if (!t.on && t.core && S.tasks.filter((x) => !x.gone && x.on && x.core).length >= 3) t.core = false; t.on = !t.on; ui.defs++; save(); render(); },
    todoDel: (el) => { S.todos = S.todos.filter((t) => t.id !== el.dataset.id); save(); render(); },
    dlEdit: (el) => { const d = S.dl.find((x) => x.id === el.dataset.id); if (!d) return; ui.sheet = { type: 'dl', id: d.id, d: { name: d.name, date: d.date, note: d.note || '' }, err: '', ask: false }; renderSheet(); },
    dlDone: (el) => { const d = S.dl.find((x) => x.id === el.dataset.id); if (!d) return; d.done = d.done ? null : today(); save(); if (d.done) { buzz(); chime('cp'); toast(ic('check') + `<span>${esc(d.name)} selesai.</span>`); } render(); },
    dlDelYes: () => { S.dl = S.dl.filter((x) => x.id !== ui.sheet.id); save(); ui.sheet = null; renderSheet(); render(); },
    dlShow: () => { ui.dlDone = !ui.dlDone; render(); },
    wkPrev: () => { ui.wkOff--; ui.wkSel = null; render(); },
    wkNext: () => { ui.wkOff++; ui.wkSel = null; render(); },
    wkSel: (el) => { ui.wkSel = el.dataset.k; render(); },
    heat: (el) => { ui.heatSel = ui.heatSel === el.dataset.k ? null : el.dataset.k; render(); },
    acc: (el) => { ui.acc[el.dataset.key] = !ui.acc[el.dataset.key]; ui.err = ''; ui.ask = null; render(); },
    wkStart: (el) => { S.set.weekStart = +el.dataset.v; S.meta.weekSeen = C.weekStart(today(), S.set.weekStart); save(); render(); },
    mode: (el) => { S.set.mode = el.dataset.v; ui.err = ''; save(); tick(true); },
    coord: () => { const la = parseFloat(String($('#set-lat').value).replace(',', '.')), lo = parseFloat(String($('#set-lng').value).replace(',', '.')); if (!(la >= -66 && la <= 66 && lo >= -180 && lo <= 180)) { ui.err = 'coord'; return render(); } S.set.lat = la; S.set.lng = lo; S.set.loc = 'Koordinat sendiri'; ui.err = ''; ui.acc.coord = false; save(); tick(true); },
    geo: () => {
      const bad = () => { ui.err = 'geo'; render(); };
      try { navigator.geolocation.getCurrentPosition((p) => { S.set.lat = +p.coords.latitude.toFixed(4); S.set.lng = +p.coords.longitude.toFixed(4); S.set.loc = 'Lokasi HP'; ui.err = ''; save(); tick(true); toast(ic('pin') + '<span>Lokasi dipakai untuk batas blok.</span>'); }, bad, { timeout: 8000, maximumAge: 3600e3 }); } catch (e) { bad(); }
    },
    sound: () => { S.set.sound = !S.set.sound; save(); render(); if (S.set.sound) chime('cp'); },
    haptic: () => { S.set.haptic = !S.set.haptic; save(); render(); buzz(); },
    pause: () => { const k = today(); if (!C.paused(S, k)) S.pauses.push({ a: k, b: null }); save(); render(); toast(ic('pause') + '<span>Jeda dimulai. Rantai tidak putus selama jeda.</span>', 3200); },
    resume: () => { const k = today(); S.pauses.forEach((p) => { if (p.a <= k && !p.b) p.b = addDays(k, -1); }); S.pauses = S.pauses.filter((p) => !p.b || p.b >= p.a); save(); render(); toast(ic('play') + '<span>Jeda diakhiri. Selamat melanjutkan.</span>'); },
    demoKeep: () => { S.meta.demo = false; S.tasks.forEach((t) => delete t.demo); S.marks.forEach((m) => delete m.demo); S.lists.forEach((l) => delete l.demo); S.dl = S.dl.filter((d) => !d.demo); save(); render(); },
    demoClear: () => { const k = today(); S.tasks = S.tasks.filter((t) => !t.demo); S.marks = S.marks.filter((m) => !m.demo); S.lists = S.lists.filter((l) => !l.demo); S.dl = S.dl.filter((d) => !d.demo); S.meta.demo = false; if (!S.tasks.length) { S.days = {}; S.start = k; S.sealed = null; S.pauses = []; S.meta.miles = {}; } ui.defs++; save(); go('kelola'); toast('<span>Contoh dikosongkan. Tambahkan task pertamamu.</span>', 3200); },
    gapPause: () => { const g = C.gapBefore(S, today()); if (g) { S.pauses.push({ a: g.a, b: g.b }); S.meta.gapSeen = g.b; save(); render(); toast(ic('shield') + '<span>Ditandai sebagai jeda. Rantai tetap tersambung.</span>', 3200); } },
    gapNo: () => { const g = C.gapBefore(S, today()); if (g) { S.meta.gapSeen = g.b; save(); render(); } },
    recapOk: () => { S.meta.weekSeen = C.weekStart(today(), S.set.weekStart); save(); render(); },
    bakNow: () => { ui.acc.cadangan = true; go('kelola'); },
    bakLater: () => { S.meta.nagAt = today(); save(); render(); },
    bakCopy: () => { S.meta.backupAt = today(); save(); copyText(JSON.stringify(S), 'Cadangan disalin. Tempel di Notes atau kirim ke dirimu sendiri.'); render(); },
    bakShare: () => {
      const text = JSON.stringify(S);
      try { const file = new File([text], 'sadad-cadangan-' + today() + '.json', { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: 'Cadangan SADAD' }).then(() => { S.meta.backupAt = today(); save(); render(); }, () => {}); return; } } catch (e) { /* lanjut ke salin */ }
      toast('<span>Berbagi file tidak tersedia di sini. Pakai Salin cadangan.</span>', 3600);
    },
    restore: () => { ui.io = $('#bak-text').value; try { const o = JSON.parse(ui.io); if (!(o && o.v === 1 && Array.isArray(o.tasks) && o.days)) throw 0; ui.err = ''; ui.ask = 'restore'; } catch (e) { ui.err = 'bak'; ui.ask = null; } render(); },
    restoreYes: () => { try { S = normalize(JSON.parse(ui.io), today()); ui.io = ''; ui.ask = null; ui.defs++; save(); tick(true); toast(ic('check') + '<span>Data dipulihkan.</span>'); } catch (e) { ui.err = 'bak'; ui.ask = null; render(); } },
    reset: () => { ui.ask = 'reset'; render(); },
    askNo: () => { ui.ask = null; render(); },
    resetYes: () => { try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ } ui.ask = null; ui.acc = {}; ui.defs++; firstRun(today()); go('hari-ini'); toast('<span>Semua data dihapus. Kembali ke contoh awal.</span>', 3200); },
    shareApp: () => { const url = location.href.split('#')[0]; try { if (navigator.share) { navigator.share({ title: 'SADAD', text: 'Planner rutinitas harian', url }).catch(() => {}); return; } } catch (e) { /* lanjut ke salin */ } copyText(url, 'Alamat aplikasi disalin.'); },
    lib: () => { ui.sub = 'pustaka'; render(); window.scrollTo(0, 0); },
    libBack: () => { ui.sub = null; render(); window.scrollTo(0, 0); },
    libF: (el) => { ui.libF = el.dataset.v; render(); },
    hide: (el) => { const id = el.dataset.id; if (S.set.hide[id]) delete S.set.hide[id]; else S.set.hide[id] = 1; save(); render(); },
    dlNew: () => { ui.sheet = { type: 'dl', id: null, d: { name: '', date: addDays(today(), 7), note: '' }, err: '', ask: false }; renderSheet(true); },
    mNew: () => { ui.sheet = markForm(null); renderSheet(true); },
    mOpen: (el) => { if (!S.marks.some((x) => x.id === el.dataset.id)) return; ui.sheet = { type: 'mark', id: el.dataset.id, edit: false, d: { jump: '', text: null }, err: '', ask: false }; renderSheet(); },
    mEdit: () => { const m = curMark(); if (m) { ui.sheet = markForm(m); renderSheet(); } },
    mStep: (el) => stepMark(+el.dataset.n),
    mLap: () => { const m = curMark(); if (!m || !hasRange(m)) return; m.laps = (m.laps || 0) + 1; m.val = m.start; m.at = today(); save(); render(); celebrateLap(m); },
    mToday: () => setMarkVal(today()),
    mMove: (el) => { const m = curMark(); if (!m) return; const L = S.marks.slice().sort(byOrd), i = L.indexOf(m), j = i + +el.dataset.dir; if (j < 0 || j >= L.length) return; L.splice(i, 1); L.splice(j, 0, m); L.forEach((x, n) => { x.ord = n + 1; }); save(); render(); toast(`<span>${esc(m.name)} sekarang urutan ${j + 1}.</span>`, 1600); },
    mDelYes: () => { S.marks = S.marks.filter((x) => x.id !== ui.sheet.id); save(); ui.sheet = null; renderSheet(); render(); toast('<span>Penanda dihapus.</span>'); },
    lNew: () => { ui.sheet = { type: 'list', id: null, d: { name: '' }, err: '' }; renderSheet(true); },
    lOpen: (el) => { const l = S.lists.find((x) => x.id === el.dataset.id); if (!l) return; ui.sheet = { type: 'list', id: l.id, d: { name: l.name, draft: '' }, err: '', edit: false, ask: false, showDone: false }; renderSheet(); },
    item: (el) => { const l = curList(), x = l && l.items.find((y) => y.id === el.dataset.id); if (!x) return; x.done = x.done ? null : today(); save(); if (x.done) { buzz(); chime('one'); } renderSheet(); render(); },
    itemDel: (el) => { const l = curList(); if (!l) return; l.items = l.items.filter((y) => y.id !== el.dataset.id); save(); renderSheet(); render(); },
    lEdit: () => { ui.sheet.edit = !ui.sheet.edit; ui.sheet.ask = false; renderSheet(); },
    lRename: () => { const l = curList(), n = String(ui.sheet.d.name || '').trim(); if (!l || !n) return; l.name = n; save(); renderSheet(); render(); toast(ic('check') + '<span>Nama daftar diganti.</span>', 1600); },
    lDone: () => { ui.sheet.showDone = !ui.sheet.showDone; renderSheet(); },
    lClear: () => { const l = curList(); if (!l) return; l.items = l.items.filter((y) => !y.done); save(); renderSheet(); render(); },
    lMove: (el) => { const l = curList(); if (!l) return; const L = S.lists.slice().sort(byOrd), i = L.indexOf(l), j = i + +el.dataset.dir; if (j < 0 || j >= L.length) return; L.splice(i, 1); L.splice(j, 0, l); L.forEach((x, n) => { x.ord = n + 1; }); save(); render(); toast(`<span>${esc(l.name)} sekarang urutan ${j + 1}.</span>`, 1600); },
    lDelYes: () => { S.lists = S.lists.filter((x) => x.id !== ui.sheet.id); save(); ui.sheet = null; renderSheet(); render(); toast('<span>Daftar dihapus.</span>'); },
    modalClose: () => closeModal(),
  };
  const dowToday = () => parse(today()).getDay();
  const CHG = {
    min: (el) => { S.set.min = clamp(Math.round(+el.value / 5) * 5, 50, 90); save(); render(); },
    loc: (el) => { if (el.value === 'custom') { ui.acc.coord = true; return render(); } const c = CITIES.find((x) => x[0] === el.value); if (c) { S.set.loc = c[0]; S.set.lat = c[1]; S.set.lng = c[2]; ui.acc.coord = false; ui.err = ''; save(); tick(true); } },
    manual: (el) => { const m = Object.assign({}, S.set.manual); m[el.dataset.key] = toMin(el.value); if (!(m.sunrise > 200 && m.sunrise < m.dhuhr && m.dhuhr < m.asr && m.asr < m.maghrib && m.maghrib < 1400)) { ui.err = 'manual'; return render(); } m.fajr = Math.max(190, m.sunrise - 80); S.set.manual = m; ui.err = ''; save(); tick(true); },
    mDate: (el) => { if (el.value) setMarkVal(el.value); },
  };
  const SUBMIT = {
    task: () => saveTask(),
    dlEdit: () => {
      const sh = ui.sheet, name = String(sh.d.name || '').trim();
      if (!name || !sh.d.date) { sh.err = 'Nama dan tanggal wajib diisi.'; return renderSheet(); }
      const o = { name, date: sh.d.date, note: String(sh.d.note || '').trim() }, d = sh.id ? S.dl.find((x) => x.id === sh.id) : null;
      if (d) Object.assign(d, o); else S.dl.push(Object.assign({ id: C.newId(S, 'd'), done: null }, o));
      save(); ui.sheet = null; renderSheet(); render();
      if (!d) { const n = diffDays(today(), o.date); toast(ic('flag') + `<span>Deadline ditambahkan, ${n > 0 ? 'H-' + n : n === 0 ? 'hari ini' : 'sudah lewat'}.</span>`); }
    },
    mSave: () => saveMark(),
    mJump: () => {
      const sh = ui.sheet, m = curMark(), raw = String(sh.d.jump || '').trim();
      if (!m) return;
      const v = m.type === 'page' ? Math.round(+raw) : +raw;
      if (!raw || !isFinite(v)) { sh.err = 'Isi angkanya dulu.'; return renderSheet(); }
      if (m.type === 'page') { const a = hasRange(m) ? m.start : 1, b = hasRange(m) ? m.end : 604; if (v < a || v > b) { sh.err = `Halaman harus antara ${a} dan ${b}.`; return renderSheet(); } }
      sh.d.jump = ''; sh.err = ''; setMarkVal(v);
    },
    mText: () => { const sh = ui.sheet, m = curMark(); if (!m) return; m.val = String(sh.d.text != null ? sh.d.text : m.val || '').trim(); m.at = today(); save(); ui.sheet = null; renderSheet(); render(); toast(ic('check') + '<span>Tersimpan.</span>', 1600); },
    lNew: () => {
      const sh = ui.sheet, n = String(sh.d.name || '').trim();
      if (!n) { sh.err = 'Beri nama dulu.'; return renderSheet(); }
      const l = { id: C.newId(S, 'l'), name: n, items: [], ord: S.seq };
      S.lists.push(l); save();
      ui.sheet = { type: 'list', id: l.id, d: { name: n, draft: '' }, err: '', edit: false, ask: false, showDone: false };
      renderSheet(); render();
      const i = $('#li-new'); if (i) i.focus();
    },
    item: () => {
      const sh = ui.sheet, l = curList(), t = String(sh.d.draft || '').trim();
      if (!l || !t) return;
      l.items.push({ id: C.newId(S, 'i'), text: t, done: null }); sh.d.draft = ''; save();
      renderSheet(); render();
      const i = $('#li-new'); if (i) i.focus();
    },
    todo: (f) => { const name = f.elements.name.value.trim(); if (!name) return; S.todos.push({ id: C.newId(S, 'o'), name, date: today(), done: null }); save(); f.elements.name.value = ''; render(); const i = $('#todo-name'); if (i) i.focus(); },
  };

  // Ketukan pada task hanya dihitung bila jari tidak bergeser dan halaman tidak sedang bergerak.
  // Sentuhan yang menghentikan luncuran layar atau yang menjadi awal guliran diabaikan.
  let pDown = null, pActive = false, lastScroll = 0;
  window.addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
  document.addEventListener('pointerdown', (e) => { pActive = true; pDown = { x: e.clientX, y: e.clientY, t: performance.now(), sy: window.scrollY }; }, { passive: true, capture: true });
  ['pointerup', 'pointercancel'].forEach((n) => document.addEventListener(n, () => { pActive = false; }, { passive: true, capture: true }));
  const GUARD = { toggle: 1, inc: 1, dec: 1, todo: 1, item: 1, itemDel: 1, mStep: 1, mOpen: 1, lOpen: 1 };
  function deliberate(e) {
    if (!e.detail || !pDown) return true;
    if (pDown.t - lastScroll < 160) return false;
    return Math.abs(e.clientX - pDown.x) <= 10 && Math.abs(e.clientY - pDown.y) <= 10 && Math.abs(window.scrollY - pDown.sy) <= 2;
  }
  document.addEventListener('click', (e) => {
    if (e.target.id === 'sheet') { ui.sheet = null; return renderSheet(); }
    const el = e.target.closest && e.target.closest('[data-act]');
    if (el && A[el.dataset.act]) { if (GUARD[el.dataset.act] && !deliberate(e)) return; return A[el.dataset.act](el, e); }
    if (e.target.closest && e.target.closest('#toast')) hideToast();
  });
  document.addEventListener('change', (e) => { const el = e.target; if (el.dataset && el.dataset.chg && CHG[el.dataset.chg]) CHG[el.dataset.chg](el); });
  document.addEventListener('input', (e) => { const el = e.target, d = el.dataset || {}; if (d.f && ui.sheet) { ui.sheet.d[d.f] = el.value; if (ui.sheet.type === 'mark') markHint(); } if (d.live === 'min') { const o = $('#min-out'); if (o) o.textContent = el.value + '%'; } if (el.id === 'bak-text') ui.io = el.value; });
  document.addEventListener('submit', (e) => { e.preventDefault(); const f = e.target.dataset.form; if (f && SUBMIT[f]) SUBMIT[f](e.target); });
  document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!$('#modal').hidden) closeModal(); else if (ui.sheet) { ui.sheet = null; renderSheet(); } });
  window.addEventListener('hashchange', () => { const h = tabOf(location.hash.slice(1)); if (h && h !== ui.tab && TABS.some((t) => t[0] === h)) go(h); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  /* ================= mulai ================= */
  (function boot() {
    const k = today();
    S = load(k);
    if (!S) firstRun(k);
    const h = tabOf(location.hash.slice(1));
    if (TABS.some((t) => t[0] === h)) ui.tab = h;
    tick(true);
    setInterval(tick, 30000);
    window.SADAD_DEBUG = { C, get S() { return S; }, ui, render, tick, setNow: (d) => { fake = new Date(d).getTime() - (Date.now() - t0); tick(true); }, save, version: VERSION };
    // Dipanggil index.html saat versi baru mengambil alih. Muat ulang ditunda selama ada yang sedang dikerjakan.
    window.SADAD_RELOAD = function retry() {
      const ae = document.activeElement, busy = ui.sheet || !$('#modal').hidden || ui.undo || Object.keys(ui.hold).length || (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName));
      if (busy) setTimeout(retry, 2000); else location.reload();
    };
  })();
})();
