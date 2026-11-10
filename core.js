/* SADAD · inti logika (tanpa tampilan).
   Tanggal, waktu matahari untuk batas blok, rencana harian, progres, rantai, dan pemilihan kutipan.
   Dipakai app.js di browser; bisa juga diuji lewat Node. */
(function (root) {
  'use strict';

  /* ================= tanggal ================= */
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (k) => { const a = k.split('-'); return new Date(+a[0], +a[1] - 1, +a[2], 12); };
  const addDays = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return ymd(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const dowOf = (k) => parse(k).getDay();
  const dayNum = (k) => { const a = k.split('-'); return Math.round(Date.UTC(+a[0], +a[1] - 1, +a[2]) / 864e5); };
  const weekStart = (k, ws) => addDays(k, -((dowOf(k) - ws + 7) % 7));

  // "Hari aplikasi" berganti pukul 03:00, supaya begadang sebentar tidak memotong hari.
  const DAY_START = 180;
  const appKey = (d) => { const x = new Date(d.getTime()); if (x.getHours() * 60 + x.getMinutes() < DAY_START) x.setDate(x.getDate() - 1); return ymd(x); };
  const appMin = (d) => { const m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; return m < DAY_START ? m + 1440 : m; };

  /* ================= waktu matahari ================= */
  // Rumus posisi matahari yang umum dipakai kalkulator waktu shalat (ketelitian sekitar satu menit).
  const RAD = Math.PI / 180;
  const sin = (d) => Math.sin(d * RAD), cos = (d) => Math.cos(d * RAD), tan = (d) => Math.tan(d * RAD);
  const asin = (x) => Math.asin(x) / RAD, acos = (x) => Math.acos(x) / RAD, atan2 = (y, x) => Math.atan2(y, x) / RAD, acot = (x) => Math.atan(1 / x) / RAD;
  const fix = (a, m) => { a -= m * Math.floor(a / m); return a < 0 ? a + m : a; };
  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPos(jd) {
    const D = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fix(RA, 24) };
  }
  // Hasil: menit sejak tengah malam (jam perangkat) pada tanggal k. null bila matahari tidak terbit/terbenam normal.
  function sunTimes(k, lat, lng, fajrAngle) {
    const a = k.split('-').map(Number);
    const jd = julian(a[0], a[1], a[2]) - lng / 360;
    const mid = (t) => fix(12 - sunPos(jd + t).eqt, 24);
    const angle = (ang, t, before) => {
      const dc = sunPos(jd + t).decl;
      const x = (-sin(ang) - sin(dc) * sin(lat)) / (cos(dc) * cos(lat));
      if (!(x >= -1 && x <= 1)) return NaN;
      const T = acos(x) / 15;
      return mid(t) + (before ? -T : T);
    };
    const asr = (f, t) => { const dc = sunPos(jd + t).decl; return angle(-acot(f + tan(Math.abs(lat - dc))), t, false); };
    let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18 };
    for (let i = 0; i < 2; i++) {
      const p = {};
      Object.keys(t).forEach((x) => { p[x] = t[x] / 24; });
      t = { fajr: angle(fajrAngle || 18.5, p.fajr, true), sunrise: angle(0.833, p.sunrise, true), dhuhr: mid(p.dhuhr), asr: asr(1, p.asr), maghrib: angle(0.833, p.maghrib, false) };
      if (Object.keys(t).some((x) => !isFinite(t[x]))) return null;
    }
    const utc0 = Date.UTC(a[0], a[1] - 1, a[2]), local0 = new Date(a[0], a[1] - 1, a[2]).getTime();
    const out = {};
    Object.keys(t).forEach((x) => { out[x] = (utc0 + (t[x] - lng / 15) * 3600e3 - local0) / 60000; });
    out.isha = out.maghrib + 90;
    return out;
  }

  const MANUAL = { fajr: 270, sunrise: 360, dhuhr: 720, asr: 930, maghrib: 1080 };
  const BLOCKS = ['subuh', 'pagi', 'siang', 'sore', 'malam', 'any'];
  // Batas lima blok untuk tanggal k. Kalau hitungan otomatis tidak masuk akal (zona waktu perangkat
  // tidak cocok dengan lokasi, atau lintang ekstrem), pakai jam manual.
  function dayTimes(k, set) {
    let t = null, auto = false;
    if (set.mode !== 'manual' && isFinite(set.lat) && isFinite(set.lng)) {
      const s = sunTimes(k, +set.lat, +set.lng, 18.5);
      if (s && s.fajr < s.sunrise && s.sunrise > DAY_START && s.sunrise < s.dhuhr && s.dhuhr > 570 && s.dhuhr < 930 && s.dhuhr < s.asr && s.asr < s.maghrib && s.maghrib < 1500) { t = s; auto = true; }
    }
    if (!t) {
      const m = Object.assign({}, MANUAL, set.manual || {});
      t = { fajr: Math.min(m.fajr, m.sunrise - 30), sunrise: m.sunrise, dhuhr: m.dhuhr, asr: m.asr, maghrib: m.maghrib, isha: m.maghrib + 90 };
    }
    Object.keys(t).forEach((x) => { t[x] = Math.round(t[x]); });
    const blocks = [
      { id: 'subuh', s: DAY_START, e: t.sunrise }, { id: 'pagi', s: t.sunrise, e: t.dhuhr }, { id: 'siang', s: t.dhuhr, e: t.asr },
      { id: 'sore', s: t.asr, e: t.maghrib }, { id: 'malam', s: t.maghrib, e: DAY_START + 1440 },
    ];
    return { t, auto, wanted: set.mode !== 'manual', blocks };
  }
  const blockAt = (dt, m) => dt.blocks.find((b) => m >= b.s && m < b.e) || dt.blocks[m < dt.blocks[0].s ? 0 : 4];

  /* ================= data ================= */
  function fresh(today) {
    return {
      v: 1, start: today, sealed: null, seq: 1, tasks: [], days: {}, todos: [], dl: [], pauses: [],
      set: { min: 70, weekStart: 0, mode: 'auto', loc: 'Madinah', lat: 24.4672, lng: 39.6112, manual: Object.assign({}, MANUAL), sound: false, haptic: true, hide: {} },
      meta: { demo: false, miles: {}, weekSeen: null, backupAt: null, nagAt: null, faidahDay: null, fi: 0, gapSeen: null },
    };
  }
  const newId = (S, p) => (p || 't') + (S.seq++).toString(36);
  const bIdx = (b) => { const i = BLOCKS.indexOf(b); return i < 0 ? 5 : i; };
  const taskSort = (a, b) => bIdx(a.block) - bIdx(b.block) || (a.ord || 0) - (b.ord || 0);
  const tgt = (t) => (t.type === 'count' ? Math.max(1, Math.round(t.target) || 1) : 1);
  const taskById = (S, id) => S.tasks.find((t) => t.id === id) || null;

  // Daftar wajib untuk tanggal k menurut definisi task saat ini: [id, target, inti].
  function liveDue(S, k) {
    const w = dowOf(k);
    return S.tasks.filter((t) => t.on && !t.gone && t.created <= k && t.days.indexOf(w) >= 0).sort(taskSort).map((t) => [t.id, tgt(t), t.core ? 1 : 0]);
  }
  // Hari yang sudah lewat dibekukan, supaya mengedit task tidak mengubah riwayat.
  function dueList(S, k) {
    const d = S.days[k];
    if (d && d.due) return d.due;
    if (k < S.start || (S.sealed && k <= S.sealed)) return [];
    return liveDue(S, k);
  }
  function seal(S, today) {
    let k = S.sealed ? addDays(S.sealed, 1) : S.start, n = 0;
    while (k < today && n < 1500) {
      const due = liveDue(S, k), d = S.days[k];
      if (due.length) { const x = d || (S.days[k] = { v: {} }); x.due = due; x.m = S.set.min; }
      else if (d && !Object.keys(d.v || {}).length) delete S.days[k];
      S.sealed = k; k = addDays(k, 1); n++;
    }
    return n;
  }
  const paused = (S, k) => S.pauses.some((p) => p.a <= k && (!p.b || k <= p.b));
  const valOf = (S, k, id) => { const d = S.days[k]; return (d && d.v && d.v[id]) || 0; };
  function setVal(S, k, id, val) {
    const d = S.days[k] || (S.days[k] = { v: {} });
    if (!d.v) d.v = {};
    if (val > 0) d.v[id] = val; else delete d.v[id];
    if (!d.due && !Object.keys(d.v).length) delete S.days[k];
  }

  /* ================= progres harian ================= */
  // cp: 0 belum mulai · 1 Mulai · 2 Separuh · 3 Aman (batas minimum + semua task inti) · 4 Sempurna
  function stat(S, k) {
    const due = dueList(S, k), n = due.length, d = S.days[k], v = (d && d.v) || {};
    const min = ((d && d.m) || S.set.min) / 100;
    if (!n) return { n: 0, done: 0, credit: 0, pct: 0, min, core: 0, coreDone: 0, safe: false, perfect: false, cp: 0, rest: true };
    let credit = 0, done = 0, core = 0, coreDone = 0;
    for (let i = 0; i < n; i++) {
      const e = due[i], x = Math.min((v[e[0]] || 0) / e[1], 1);
      credit += x;
      if (x >= 1) done++;
      if (e[2]) { core++; if (x >= 1) coreDone++; }
    }
    const pct = credit / n, safe = pct >= min - 1e-9 && coreDone === core, perfect = done === n;
    const cp = perfect ? 4 : safe ? 3 : pct >= 0.5 - 1e-9 ? 2 : credit > 0 ? 1 : 0;
    return { n, done, credit, pct, min, core, coreDone, safe, perfect, cp, rest: false };
  }
  // Berapa task lagi menuju titik berikutnya.
  function need(st) {
    if (st.rest || st.cp >= 4) return null;
    const up = (f) => Math.max(1, Math.ceil(f * st.n - st.credit - 1e-9));
    if (st.cp === 3) return { to: 4, tasks: st.n - st.done, coreLeft: 0 };
    const coreLeft = st.core - st.coreDone;
    if (st.cp === 0) return { to: 1, tasks: 1, coreLeft };
    if (st.cp === 1 && st.min > 0.5 + 1e-9) return { to: 2, tasks: up(0.5), coreLeft };
    const byPct = st.pct >= st.min - 1e-9 ? 0 : up(st.min);
    return { to: 3, tasks: Math.max(byPct, coreLeft), coreLeft, onlyCore: byPct === 0 };
  }
  // Tingkat warna peta: r libur · p jeda · 0 kosong · 1 <50% · 2 belum aman · 3 aman · 4 sempurna
  function level(S, k, st) {
    st = st || stat(S, k);
    if (st.rest) return 'r';
    if (st.perfect) return 4;
    if (st.safe) return 3;
    if (paused(S, k)) return 'p';
    return st.credit <= 0 ? 0 : st.pct < 0.5 ? 1 : 2;
  }

  /* ================= rantai ================= */
  // Hari tanpa rutinitas dan hari jeda bersifat netral. Sekali per pekan, satu hari yang bolong diampuni.
  function streak(S, today) {
    let cur = 0, best = 0, bestAt = null, safeDays = 0, perfectDays = 0, broke = null;
    const grace = {};
    for (let k = S.start; k <= today; k = addDays(k, 1)) {
      const st = stat(S, k);
      if (st.rest) continue;
      if (st.perfect) perfectDays++;
      if (st.safe) { cur++; safeDays++; if (cur > best) { best = cur; bestAt = k; } continue; }
      if (k === today || paused(S, k)) continue;
      const wk = weekStart(k, S.set.weekStart);
      if (cur > 0 && !grace[wk]) { grace[wk] = k; continue; }
      if (cur > 0) broke = k;
      cur = 0;
    }
    return { cur, best, bestAt, safeDays, perfectDays, broke, graceUsed: grace[weekStart(today, S.set.weekStart)] || null, todaySafe: stat(S, today).safe };
  }
  function consistency(S, today, n) {
    let elig = 0, ok = 0;
    for (let i = 0; i < n; i++) {
      const k = addDays(today, -i);
      if (k < S.start) break;
      const st = stat(S, k);
      if (st.rest) continue;
      if (st.safe) { elig++; ok++; continue; }
      if (i === 0 || paused(S, k)) continue;
      elig++;
    }
    return { elig, ok, pct: elig ? ok / elig : 0 };
  }
  // Konsistensi per task selama n hari terakhir (hari ini hanya dihitung bila sudah selesai).
  function taskRates(S, today, n) {
    const r = {};
    for (let i = 0; i < n; i++) {
      const k = addDays(today, -i);
      if (k < S.start) break;
      if (paused(S, k)) continue;
      const due = dueList(S, k), v = (S.days[k] && S.days[k].v) || {};
      for (let j = 0; j < due.length; j++) {
        const e = due[j], ok = (v[e[0]] || 0) >= e[1];
        if (i === 0 && !ok) continue;
        const x = r[e[0]] || (r[e[0]] = { due: 0, done: 0 });
        x.due++;
        if (ok) x.done++;
      }
    }
    return r;
  }
  function weekSummary(S, wk, today) {
    let elig = 0, safe = 0, perfect = 0, sum = 0;
    for (let i = 0; i < 7; i++) {
      const k = addDays(wk, i);
      if (k > today || k < S.start) continue;
      const st = stat(S, k);
      if (st.rest || (paused(S, k) && !st.safe)) continue;
      if (k === today && !st.safe) continue;
      elig++; sum += st.pct;
      if (st.safe) safe++;
      if (st.perfect) perfect++;
    }
    return { elig, safe, perfect, avg: elig ? sum / elig : 0 };
  }
  // Rentang hari bolong beruntun tepat sebelum hari ini (untuk tawaran "tandai sebagai jeda").
  function gapBefore(S, today) {
    let b = null, a = null;
    for (let k = addDays(today, -1); k >= S.start; k = addDays(k, -1)) {
      const st = stat(S, k);
      if (st.rest) { if (!b) continue; break; }
      if (st.credit > 0 || paused(S, k)) break;
      if (!b) b = k;
      a = k;
    }
    return b && diffDays(a, b) >= 1 ? { a, b, days: diffDays(a, b) + 1 } : null;
  }

  /* ================= kutipan ================= */
  const qid = (q) => { const s = (q.src || '') + '|' + (q.ar || q.id || '').slice(0, 48); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // Urutan acak yang tetap (sama di semua perangkat), lalu dirapikan agar jenis yang sama tidak berdempetan.
  function rotation(list, seed) {
    const r = rng(seed), idx = list.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const x = idx[i]; idx[i] = idx[j]; idx[j] = x; }
    for (let i = 1; i < idx.length; i++) {
      if (list[idx[i]].k !== list[idx[i - 1]].k) continue;
      for (let j = i + 1; j < idx.length; j++) if (list[idx[j]].k !== list[idx[i - 1]].k) { const x = idx[i]; idx[i] = idx[j]; idx[j] = x; break; }
    }
    return idx;
  }
  const _rot = {};
  function pick(list, k, hide, seed) {
    if (!list || !list.length) return null;
    const key = seed + ':' + list.length, order = _rot[key] || (_rot[key] = rotation(list, seed));
    const n = order.length, d = dayNum(k);
    for (let i = 0; i < n; i++) { const q = list[order[(((d + i) % n) + n) % n]]; if (!hide || !hide[qid(q)]) return q; }
    return list[order[((d % n) + n) % n]];
  }

  const api = {
    pad, ymd, parse, addDays, diffDays, dowOf, dayNum, weekStart, DAY_START, appKey, appMin,
    sunTimes, dayTimes, blockAt, BLOCKS, MANUAL,
    fresh, newId, bIdx, taskSort, tgt, taskById, liveDue, dueList, seal, paused, valOf, setVal,
    stat, need, level, streak, consistency, taskRates, weekSummary, gapBefore, qid, rotation, pick,
  };
  root.SADAD_CORE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);
