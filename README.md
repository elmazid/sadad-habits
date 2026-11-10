# SADAD

Planner rutinitas harian dan pekanan dalam bentuk aplikasi web (PWA). Namanya dari hadits «سدِّدوا وقارِبوا»: bidik yang tepat, dan kalau belum bisa tepat, mendekatlah. Semua data tersimpan di perangkat, tanpa akun dan tanpa server.

## Isi singkat

- **Hari ini**: busur progres dengan empat titik (Mulai, Separuh, Aman, Sempurna), blok waktu yang sedang berjalan, task yang belum sempat dari blok sebelumnya, deadline terdekat, dan satu kutipan per hari.
- **Pekan**: tujuh hari dalam satu baris, daftar per hari (kemarin masih bisa dicentang susulan), dan papan task per hari.
- **Deadline**: daftar bertanggal, urut dari yang terdekat, dengan hitungan H-n.
- **Capaian**: rantai, rantai terpanjang, konsistensi 30 hari, peta 18 pekan, dan konsistensi per task.
- **Kelola**: tambah, ubah, urutkan, nonaktifkan, atau hapus task; pengaturan; cadangan; pustaka kutipan.

Lima blok waktu (Subuh, Pagi, Siang, Sore, Malam) dibatasi terbit matahari, Zuhur, Ashar, dan Maghrib. Batasnya dihitung di perangkat dari koordinat kota, jadi ikut bergeser sepanjang tahun. Ini patokan blok, bukan jadwal adzan, dan bisa selisih satu sampai dua menit. Hari aplikasi berganti pukul 03:00.

## Pasang di GitHub Pages (sekitar 5 menit)

1. Ekstrak `sadad.zip`. Isinya 12 file dalam satu folder, tanpa subfolder.
2. Di github.com: **New repository**, beri nama misalnya `sadad`, pilih **Public**, lalu Create. Pilih namanya sekarang dan jangan diganti: di iPhone, alamat baru berarti ikon baru dan data mulai dari nol.
3. Di repo itu: **Add file → Upload files**, pilih semua file, lalu **Commit changes**.
4. **Settings → Pages**: Source *Deploy from a branch*, Branch `main`, folder `/ (root)`, lalu **Save**.
5. Tunggu 1 sampai 2 menit, lalu buka `https://USERNAME.github.io/sadad/`.
6. iPhone: buka alamat itu di Safari, ketuk **Bagikan → Tambahkan ke Layar Utama**. Android: di Chrome pilih **Instal aplikasi**.
7. Selalu buka dari ikon di layar utama. Penyimpanannya terpisah dari tab peramban.

Aplikasi mulai dengan contoh rutinitas. Ketuk **Kosongkan, isi sendiri** untuk mulai dari nol, atau ubah contohnya satu per satu.

## Memperbarui

Unggah file yang berubah ke repo yang sama. Aplikasi mengambil versi baru di latar belakang dan memakainya pada pembukaan berikutnya, jadi buka dua kali. Kalau tetap versi lama, naikkan `VERSION` di `sw.js` (misalnya `sadad-v2`).

Mengubah kode tidak menyentuh data. Data hanya hilang kalau aplikasi dihapus dari layar utama, data situs dibersihkan, atau alamatnya berganti.

## Cadangan

**Kelola → Cadangan**: salin teks cadangan ke Notes atau bagikan sebagai file. Untuk memulihkan, tempel teksnya lalu ketuk **Pulihkan**. Aplikasi mengingatkan tiap 30 hari.

## Kutipan

Semua kutipan ada di `quotes.js`: 128 kutipan harian, 60 kutipan titik progres (12 per titik, berganti tiap hari), dan 29 faidah kejutan. Menambah kutipan cukup dengan menambah baris di file itu.

**Wajib diaudit sebelum dipakai serius.** Sebagian besar teks dan nomor ditulis dari ingatan. Yang sempat dicocokkan ke sumber daring saat disusun hanya ini:

- «لكلِّ عملٍ شِرَّة»: Ahmad 6958, Ibnu Hibban 11, Shahih al-Jami' 2152.
- «اغتنِمْ خمسًا قبل خمس»: al-Hakim 7846, Shahih at-Targhib 3355.
- «إنَّ اللهَ يحبُّ إذا عمل أحدُكم عملًا أن يُتقِنَه»: Shahih al-Jami' 1880 (hasan).
- Dua ucapan an-Nawawi (teksnya), dan ucapan Ibnu Taimiyyah «هذه غَدوتي» di al-Wabil ash-Shayyib.

19 entri di luar Al-Qur'an dan Shahihain diberi angka `1` di ujung barisnya. Di aplikasi, entri itu bertanda **perlu dicek** dan terkumpul di **Kelola → Pustaka kutipan → Perlu dicek**. Setelah kamu cocokkan dengan kitabnya, hapus angka `1` itu. Yang meragukan bisa disembunyikan dari aplikasi tanpa mengubah file. Entri tanpa tanda (ayat, hadits Bukhari dan Muslim, serta kutipan lama dari DAWAM) tetap layak dicek ulang nomornya.

## Batasan

- Tidak ada notifikasi. Web push butuh server, jadi pengingatnya ditumpangkan ke blok waktu.
- Getar di iPhone memakai sakelar bawaan Safari (iOS 17.4 ke atas) dan belum diuji di perangkat sungguhan. Di Android memakai Vibration API.
- Data tidak tersinkron antarperangkat. Pindah HP dilakukan lewat cadangan.

## Isi folder

| File | Fungsi |
| --- | --- |
| `index.html` | Kerangka halaman |
| `styles.css` | Tampilan |
| `core.js` | Logika: waktu matahari, rencana harian, progres, rantai |
| `quotes.js` | Kutipan dan faidah |
| `app.js` | Tampilan dan interaksi |
| `sw.js` | Mode offline |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | Ikon dan data instalasi |
| `README.md` | Panduan ini |
