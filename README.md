# Pejuang Subuh - Masjid Raya Pondok Indah (MRPI)

Website komunitas **Pejuang Subuh**: profil, jadwal kajian, ayat tadabbur pekan ini, kajian lewat Zoom, rekaman kajian, info infak, pengumuman, dan kontak admin. Dirancang agar mudah dipakai bapak dan ibu jamaah yang tidak terbiasa dengan teknologi: huruf besar, tombol besar, menu datar tanpa hamburger, dan pengaturan tampilan yang selalu terlihat.

Dibuat dengan **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**.

Jadwal kajian, kegiatan, dan pengumuman diubah pengurus sendiri lewat **Panel Pengurus** (`/admin`), tanpa menyentuh kode. Lihat bagian "Panel Pengurus" di bawah.

## Sebelum diterbitkan: masih ada DATA CONTOH dan isian yang kosong

Tidak ada data resmi masjid di dalam proyek ini. Nomor telepon, WhatsApp, alamat, tautan Zoom, rekening, QRIS, video, jadwal, dan pengumuman semuanya **contoh**. Tiap bagian yang masih contoh menampilkan lencana "Contoh data, belum resmi" supaya tidak pernah dianggap resmi oleh jamaah.

Daftar yang wajib diisi atau diganti:

- [ ] **Foto kegiatan** (opsional): kartu Kegiatan/Pengumuman memakai gambar pengganti sampai fotonya diunggah lewat Panel Pengurus. Lihat bagian "Kegiatan dan Pengumuman" di bawah.
- [ ] **Foto kajian** (opsional): kartu Jadwal Sepekan dan Kajian Hari Ini memakai gambar pengganti sampai foto tiap hari diunggah lewat Panel Pengurus. Lihat bagian "Foto kajian" di bawah.
- [ ] **Tautan TikTok, Instagram, dan Grup WhatsApp** (objek `SOCIAL_LINKS` di bagian atas `components/VideoGallery.tsx`). Saat ini berisi `#`. Tautan YouTube sudah diisi: https://www.youtube.com/@pejuangsubuhmrpi
- [ ] **Jadwal kajian** (lewat Panel Pengurus, menu Jadwal Kajian): jam, ustadz, tema, tempat, dan cara mengikuti (di masjid / Zoom / keduanya) untuk tiap hari
- [ ] Tautan Zoom, Meeting ID, dan kode sandi
- [ ] ID video YouTube untuk video utama di Rekaman Kajian (video contoh memakai ID palsu, jadi pemutar belum aktif)
- [ ] Gambar QRIS asli (berkas `public/qris-contoh.svg` hanya gambar contoh dan tidak bisa dipindai)
- [ ] Nama bank, nomor rekening, dan nama pemilik rekening
- [ ] **Kegiatan dan pengumuman** (lewat Panel Pengurus): empat butir contoh dari data awal tampil sebagai Kegiatan dan tab Pengumuman masih kosong. Ganti atau hapus butir contoh, lalu tambah yang resmi.
- [ ] Alamat, nomor telepon, nomor WhatsApp admin, dan tautan peta
- [ ] **Tandai resmi** Jadwal Kajian dan Kegiatan dan Pengumuman di Panel Pengurus (tombol "Tandai sudah resmi") setelah datanya diganti; lencana "Contoh data, belum resmi" di web pun hilang
- [ ] Bagian yang masih diubah lewat kode (Zoom, video, donasi, kontak): ubah `isSample: true` menjadi `isSample: false` di `data/content.ts` setelah diisi data resmi
- [ ] **Data cadangan Ayat Pekan Ini dari Al Quran Cloud** (`AYAT_CADANGAN` di `data/ayatPekan.ts`): saat ini sementara memakai teks Kemenag yang sudah diverifikasi, karena API Al Quran Cloud tidak bisa diakses dari lingkungan pembuat. Lihat "Ayat Pekan Ini".

Setelah itu, coba sendiri: pindai QRIS dengan aplikasi bank, tekan tombol WhatsApp, telepon, Zoom, dan keempat tombol media sosial dari ponsel.

## Menjalankan di komputer

Butuh **Node.js 20.9 atau lebih baru**.

```bash
npm install
npm run dev        # buka http://localhost:3000
```

Perintah lain:

```bash
npm run build      # build produksi
npm run start      # jalankan hasil build (http://localhost:3000)
npm run typecheck  # periksa tipe TypeScript
npm run lint       # periksa gaya kode
npm test           # tes otomatis (Vitest; butuh Node 22.12 atau lebih baru)
```

Tanpa pengaturan apa pun, situs tampil dari salinan `data/content.ts`. Untuk mencoba Panel Pengurus di komputer sendiri, lihat "Mencoba di komputer sendiri" di bagian Panel Pengurus.

Dua hal yang mungkin membuat bingung saat menjalankan:

- Saat pertama kali `npm run dev`, Next.js 16 membuat sendiri berkas `AGENTS.md` (petunjuk untuk asisten AI). Itu normal dan aman dibiarkan.
- `npm install` bisa menampilkan "5 high severity vulnerabilities". Peringatan itu hanya mengenai paket pemeriksa kode (`eslint-config-next`) yang dipakai saat pengembangan dan tidak dikirim ke pengunjung situs (`npm audit --omit=dev` melaporkan 0 masalah). Jangan jalankan `npm audit fix --force`: perintah itu akan menurunkan `eslint-config-next` ke versi lama.

## Panel Pengurus

**Panel Pengurus** (`/admin`) adalah halaman khusus pengurus untuk mengubah isi situs tanpa menyentuh kode: **jadwal kajian** (jam, ustadz, tema, tempat, dan foto tiap hari), **libur atau ganti jadwal pada tanggal tertentu**, serta **kegiatan dan pengumuman** lengkap dengan foto dari ponsel. Pengurus masuk dengan akun Google yang sudah didaftarkan, dan setiap Simpan langsung tampil di web. Bagian lain (Zoom, video, donasi, kontak, profil, ayat) belum ada di panel dan masih diubah lewat kode.

Halaman utama tetap statis dan cepat: dibuat ulang paling lama tiap 1 jam dan seketika setiap Simpan di panel.

### Mencoba di komputer sendiri (tanpa akun apa pun)

1. Buat berkas `.env.local` (tidak di-commit) berisi tiga baris ini:

   ```
   CONTENT_STORE=memory
   SESSION_SECRET=isi-dengan-hasil-perintah-di-bawah
   ADMIN_EMAILS=email-anda@gmail.com
   ```

   `SESSION_SECRET` dibuat dengan `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
2. Jalankan `npm run dev`, buka http://localhost:3000/admin, lalu tekan **Masuk mode pengembang**. Tombol itu hanya ada di `npm run dev`, tidak di hasil build.
3. Data disimpan di memori, jadi hilang saat server dimatikan; `CONTENT_STORE=memory` ditolak otomatis bila dijalankan di Vercel. Unggah foto aktif bila `BLOB_READ_WRITE_TOKEN` dan `BLOB_PUBLIC_HOST` diisi; tanpa itu panel menampilkan "Unggah foto belum disiapkan." dan bagian lain tetap bisa dipakai.

### Memasang di Vercel (sekali saja)

1. **Repositori.** Simpan proyek di Git (GitHub, GitLab, atau Bitbucket) lalu impor ke Vercel, atau deploy lewat CLI Vercel.
2. **Database.** Di proyek Vercel: Storage, Marketplace, **Neon**, lalu hubungkan ke proyek. Vercel mengisi `DATABASE_URL` sendiri.
3. **Foto.** Storage, **Blob**: buat toko berakses **Publik** dan hubungkan ke proyek (Production, Preview, dan Development bila ingin dicoba di komputer). Vercel mengisi `BLOB_READ_WRITE_TOKEN`. Isi `BLOB_PUBLIC_HOST` dengan host toko itu, yaitu bagian alamat berkas di antara `https://` dan garis miring pertama (`id-toko.public.blob.vercel-storage.com`). Tombol unggah di panel baru menyala setelah variabel ini terisi, jadi alamat pertama diambil dari dasbor Vercel: buka toko Blob itu, ambil satu berkas apa saja yang ada di dalamnya (unggah dulu lewat dasbor bila toko masih kosong), lalu salin alamatnya; tampilan dasbor bisa berubah, tetapi hostnya sama untuk semua berkas di toko itu. Alamat yang ditempel lengkap dengan `https://` atau garis miring di akhir tetap diterima: panel merapikannya. **Lalu deploy ulang**: nilai ini dibaca saat build untuk mengizinkan gambar dari toko itu.
4. **Masuk dengan Google.** Di Google Cloud Console buat proyek; isi layar persetujuan OAuth (jenis Eksternal, nama aplikasi, email dukungan, scope `openid`, `email`, `profile`); lalu Credentials, OAuth client ID jenis **Web**, dengan alamat balik `https://{alamat-situs}/admin/auth/google/callback` dan `http://localhost:3000/admin/auth/google/callback`. Salin ID dan rahasianya ke `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET`. Masuk hanya berfungsi di alamat produksi dan localhost, karena Google mewajibkan alamat balik yang terdaftar persis (tidak di alamat preview Vercel).
5. **Variabel lain.** Isi `SESSION_SECRET` (acak, paling sedikit 32 karakter), `ADMIN_EMAILS` (email pengurus, dipisah koma), `ADMIN_HELP_WHATSAPP` (opsional), dan `NEXT_PUBLIC_SITE_URL`.
6. **Deploy.** Buka `/admin`, masuk dengan Google, tekan **Siapkan database**, lalu **Lihat web**.

| Variabel | Fungsi | Dari mana |
| --- | --- | --- |
| `DATABASE_URL` | Sambungan ke database Neon | Terisi otomatis saat Neon dihubungkan |
| `BLOB_READ_WRITE_TOKEN` | Izin menyimpan dan menghapus foto di Blob | Terisi otomatis saat toko Blob dihubungkan |
| `BLOB_PUBLIC_HOST` | Host publik toko Blob; hanya foto dari host ini yang diterima dan dimuat | Diisi manual, lalu deploy ulang |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Masuk dengan Google | Google Cloud Console |
| `SESSION_SECRET` | Kunci enkripsi cookie sesi (paling sedikit 32 karakter; kosong atau pendek = panel menolak semua akses) | Dibuat sendiri, acak |
| `ADMIN_EMAILS` | Email yang boleh masuk, dipisah koma | Diisi manual |
| `ADMIN_HELP_WHATSAPP` | Nomor WhatsApp pengelola web untuk tautan "Bantuan" (opsional; kosong = tautan disembunyikan) | Diisi manual, format `62...` |
| `NEXT_PUBLIC_SITE_URL` | Alamat situs; dasar alamat balik masuk dengan Google dan gambar pratinjau tautan | Diisi manual |
| `CONTENT_STORE` | `memory` untuk menjalankan panel tanpa database di komputer sendiri (ditolak di Vercel) | Hanya di `.env.local` |

Contoh semuanya ada di `.env.example` (dikomentari, tanpa nilai rahasia).

### Pertama kali dipakai

1. Buka `/admin` dan masuk dengan Google.
2. Tekan **Siapkan database** sekali. Tombol ini membuat tabel dan menyalin data contoh dari `data/content.ts` supaya tampilan web tidak berubah; aman ditekan ulang dan tidak menimpa perubahan pengurus.
3. Ganti data contoh: ubah jadwal tiap hari, hapus atau ganti kegiatan contoh, tambah kegiatan dan pengumuman, unggah foto.
4. Bila datanya sudah resmi, tekan **Tandai sudah resmi** (di beranda panel, Jadwal Kajian, atau Kegiatan dan Pengumuman) supaya lencana "Contoh data, belum resmi" hilang dari web. Ada tautan **Kembalikan ke status contoh** bila perlu.

Sehari-hari: pilih **Jadwal Kajian** untuk mengubah satu hari, atau meliburkan dan mengganti kajian pada tanggal tertentu; pilih **Kegiatan dan Pengumuman** untuk menambah, mengubah, atau menghapus kartu. Setiap layar punya pratinjau kartu asli web, dan setiap penghapusan meminta konfirmasi.

### Mencabut atau menambah akses pengurus

Hapus emailnya dari `ADMIN_EMAILS` di variabel lingkungan Vercel, lalu **deploy ulang**. Daftar itu diperiksa pada setiap permintaan, jadi sesi lama (berlaku paling lama 14 hari) ikut tidak sah begitu deploy baru berjalan. Menambah pengurus caranya sama: tambahkan emailnya (huruf kecil, persis seperti akun Google-nya; varian titik atau plus pada Gmail tidak disamakan), lalu deploy ulang.

### Peringatan "aplikasi belum diverifikasi" dari Google

Belum dapat dipastikan dari dokumentasi resmi Google apakah layar persetujuan menampilkan peringatan "Google belum memverifikasi aplikasi ini" untuk aplikasi seperti ini (bergantung pada mode Testing atau Production). Periksa saat setup dan catat hasilnya di tabel ini:

1. Di Google Cloud Console, layar persetujuan OAuth, mode **Testing**: daftarkan email pengurus sebagai "Test user", masuk ke `/admin`, lalu catat apakah peringatan muncul dan apa yang harus ditekan pengurus.
2. Ubah ke mode **Production** (scope tetap hanya `openid`, `email`, `profile`), masuk lagi, dan catat hasilnya.

| Mode | Peringatan muncul? | Langkah yang perlu dilakukan pengurus |
| --- | --- | --- |
| Testing | _belum dicoba_ | _isi saat setup_ |
| Production | _belum dicoba_ | _isi saat setup_ |

### Uji ujung ke ujung di Vercel (daftar periksa pemilik repo)

Lakukan sekali setelah deploy pertama, dari ponsel dan dari komputer. Pembuat panel tidak bisa menguji Google, Neon, dan Blob yang asli dari lingkungannya (bagian-bagian itu diuji dengan tiruan), jadi daftar ini yang menutup celahnya:

- [ ] Buka `/admin` tanpa masuk: diarahkan ke layar masuk. Masuk dengan Google; email yang belum terdaftar ditolak dengan pesan ramah.
- [ ] Tekan **Siapkan database**; **Lihat web** menampilkan isi yang sama seperti sebelumnya.
- [ ] Ubah tema satu hari lalu **Simpan**: spanduk "Tersimpan" muncul dan web memuat tema baru.
- [ ] Buat **Libur** untuk besok dan **Ganti jadwal** untuk lusa: Kajian Hari Ini dan Jadwal Sepekan menampilkan lencana yang benar pada tanggalnya.
- [ ] Unggah foto dari kamera ponsel (tegak maupun mendatar): foto tampil tegak, ukurannya kecil, dan muncul di web. Ganti fotonya, lalu pastikan foto lama hilang dari Storage, Blob.
- [ ] Tambah satu pengumuman berjam; pastikan tampil di tab Pengumuman web ("... pukul 05.30 WIB"), lalu hapus lewat dialog konfirmasi.
- [ ] Tandai bagian resmi dan pastikan lencana "Contoh data, belum resmi" hilang di web.
- [ ] Cabut akses satu email uji (hapus dari `ADMIN_EMAILS`, deploy ulang) dan pastikan ia tidak bisa membuka panel.
- [ ] Di keluaran `npm run build` (atau log build Vercel), baris `/` bertanda statis atau ISR, bukan dinamis.

### Batas dan syarat paket gratis

- **Vercel Hobby** hanya untuk pemakaian **non-komersial**. Meminta donasi tidak dihitung komersial; menerima bayaran untuk membuat atau merawat situs dihitung komersial dan membutuhkan paket Pro. Periksa posisi Anda sendiri; rancangan panel tidak bergantung pada paket.
- **Neon gratis:** penyimpanan 1 GB (angka dari rancangan; paket gratis bisa berubah, cek halaman harga Neon). Komputasi tidur setelah 5 menit tidak dipakai, jadi halaman panel pertama bisa lebih lambat beberapa detik (halaman web publik tidak terpengaruh karena statis). Riwayat pemulihan hanya 6 jam: data yang terhapus salah hanya bisa dipulihkan bila cepat ketahuan, karena itu setiap penghapusan meminta konfirmasi.
- **Blob gratis (per bulan):** 1 GB penyimpanan, 2.000 operasi lanjutan (unggah dan sejenisnya), 10.000 operasi sederhana (pembacaan tanpa cache). Melewati batas mengunci Blob selama 30 hari. Foto diperkecil di ponsel (sisi terpanjang 1600 px, biasanya di bawah 1 MB), jadi batas ini sangat jauh. Penghapusan gratis, dan foto yang diganti atau dihapus dibersihkan otomatis.

### Catatan teknis saat deploy

- Halaman utama dibuat statis (`revalidate` 1 jam) dan dibuat ulang seketika setiap Simpan. Bila database terpasang tetapi tidak terjangkau saat build, **build sengaja gagal** (deploy tidak terbit) dan halaman tidak pernah diam-diam memakai data contoh. Setelah terbit, bila pembuatan ulang halaman gagal, halaman terakhir yang berhasil tetap disajikan (perilaku ini bersandar pada dokumentasi Next.js; menunggu satu jam untuk mengujinya tidak dilakukan saat pembuatan).
- Hasil pembacaan database saat halaman dibuat disimpan di **cache data Next.js**, bukan hanya di cache build. Setiap Simpan di panel membersihkannya. Bila Anda mengubah data **langsung di database** (bukan lewat panel) atau memulihkannya dari cadangan Neon, tekan Simpan apa saja di panel supaya halaman utama dibuat ulang; deploy ulang saja belum tentu cukup karena cache data bisa terpakai lagi.
- `BLOB_PUBLIC_HOST` dibaca saat **build**; mengubahnya butuh deploy ulang.
- Tanpa `DATABASE_URL` dan `CONTENT_STORE`, web memakai salinan `data/content.ts` dan panel menampilkan "Database belum dipasang" (formulir dinonaktifkan).
- Untuk mengulang pemeriksaan tampilan atau membandingkan piksel di komputer sendiri: jalankan `npm run build` segar sebelum `npm run start`, karena halaman utama yang sudah dibuat ulang tersimpan di folder `.next` dan ikut terbawa ke server berikutnya.

### Keamanan singkat

Hanya email di `ADMIN_EMAILS` yang bisa masuk (email Google harus terverifikasi). Sesi adalah cookie terenkripsi berumur 14 hari (`HttpOnly`, `Secure`, `SameSite=Lax`). Setiap halaman, aksi, dan endpoint panel memeriksa sesi sendiri, dan seluruh masukan divalidasi di server. Unggah foto dibatasi ke WebP atau JPEG di bawah 2 MB dan ke folder `kajian/` dan `kegiatan/`; gambar hanya dimuat dari toko Blob sendiri atau berkas di `public/`. Halaman panel tidak diindeks mesin pencari dan tidak boleh dibingkai situs lain.

### Pengujian

`npm test` menjalankan tes otomatis (Vitest): aturan jadwal, validasi, sesi, penyimpanan (memori dan SQL di atas PGlite), unggah foto, dan komponen panel. Tampilan di peramban (axe, ukuran huruf terbesar, kontras tinggi, Tampilan Sederhana, lebar 375 dan 1280 px) diperiksa saat pembuatan dengan skenario peramban terpisah yang tidak disertakan di repositori.

## Mengganti isi situs

**Jadwal kajian dan kegiatan/pengumuman diubah lewat Panel Pengurus** (lihat di atas). Isi lainnya ada di berkas **`data/content.ts`**; setiap bagian punya petunjuk singkat di komentarnya. `SCHEDULE` dan `ANNOUNCEMENTS` di berkas itu kini hanya **data awal** (disalin ke database saat "Siapkan database") dan **cadangan** (dipakai web selama database belum dipasang), bukan tempat mengubah jadwal sehari-hari.

| Bagian | Yang diisi | Catatan |
| --- | --- | --- |
| `SCHEDULE` | Data awal dan cadangan jadwal | Diubah lewat Panel Pengurus. `day`: 0 = Ahad, 1 = Senin ... 6 = Sabtu. Jam format 24 jam, zona WIB. `mode`: `"masjid"`, `"zoom"`, atau `"hybrid"` |
| `ZOOM` | `meetingUrl`, `meetingId`, `passcode`, `slots` | Tombol "Buka Zoom" dan "Salin Tautan Zoom" memakai `meetingUrl` |
| `VIDEO` | `title`, `ustadz`, `youtubeId` | Satu video utama. `youtubeId` = 11 karakter di akhir alamat YouTube, contoh `youtube.com/watch?v=XXXXXXXXXXX`. Pemutar baru dimuat setelah tombol putar ditekan |
| `DONATION` | `qris`, `bankAccounts` | Taruh gambar QRIS di `public/`, lalu isi `imageSrc` (contoh `"/qris.png"`), `width`, dan `height` sesuai ukuran asli gambar. Bisa lebih dari satu rekening |
| `ANNOUNCEMENTS` | Data awal dan cadangan kegiatan/pengumuman | Diubah lewat Panel Pengurus. `type`: `"kegiatan"` atau `"pengumuman"` (menentukan tab). `date` ISO, contoh `2026-10-09` atau `2026-10-09T05:00:00+07:00` (jam ikut tampil). Urutan otomatis: terbaru dulu |
| `CONTACT` | Alamat, telepon, WhatsApp, peta | `whatsappNumber` diawali `62` tanpa `0` dan tanpa `+` (contoh `6281234567890`). `phoneTel` format `+62...` |

Berkas lain yang mungkin diubah:

- **`components/VideoGallery.tsx`**, objek `SOCIAL_LINKS` di bagian atas: tautan TikTok, Instagram, YouTube, dan Grup WhatsApp.
- **`data/profile.ts`**: isi section "Tentang Kami" (sekilas profil, visi, misi, empat pilar, divisi).
- **`data/ayatPekan.ts`**: titik acuan, penimpa (override), qari, dan ayat cadangan Ayat Pekan Ini.
- **`app/globals.css`**, blok "PALET WARNA": semua warna situs.

Nama komunitas, nama masjid, dan singkatan (MRPI) ada di `COMMUNITY`. Judul dan deskripsi halaman untuk mesin pencari ada di `app/layout.tsx`.

## Tentang Kami (Profil)

Section `id="profil"` (setelah beranda, sebelum Rekaman Kajian) berjudul **Tentang Kami** dengan label kecil "Profil". Isinya disalin apa adanya dari naskah profil pengurus di `data/profile.ts`; koreksi yang dilakukan hanya "MPRI" menjadi "MRPI", "Memanfatkan" menjadi "Memanfaatkan", dan "aksi nyata aksi kemanusiaan" menjadi "aksi nyata kemanusiaan". Susunannya:

1. **Sekilas Profil**: dua paragraf dan tiga angka sorotan yang hanya diambil dari teks itu (berdiri Ramadan 2018, 900+ alumni, 120+ negara).
2. **Visi** (kartu navy beraksen emas) dan **Misi Utama** (4 kartu bernomor).
3. **Empat Pilar Pergerakan**: 4 kartu berikon SVG (2x2 di layar lebar, 1 kolom di ponsel).
4. **Divisi Operasional Komunitas**: 4 kartu ringkas (dipilih daripada accordion agar semua isi langsung terbaca di ponsel tanpa perlu dibuka-tutup).

## Kegiatan dan Pengumuman

Section Pengumuman punya dua tab, **Kegiatan** (bawaan) dan **Pengumuman**, dengan pola tabs WAI-ARIA: panah kiri/kanan (serta Home/End) untuk berpindah tab, fokus terlihat, area sentuh minimal 44px. Kartu diurutkan dari tanggal terbaru dan menampilkan lencana jenis, tanggal (format Indonesia, WIB, hari Ahad), judul, ringkasan maksimal 3 baris, dan tautan "Selengkapnya" bila `href` diisi. Bila satu tab kosong, tampil "Belum ada kegiatan." atau "Belum ada pengumuman.".

**Menambah dan mengubah kartu:** di Panel Pengurus pilih **Kegiatan dan Pengumuman**. Tiap kartu punya jenis (Kegiatan atau Pengumuman), judul, tanggal, jam (opsional), ringkasan, foto (opsional), dan tautan "Selengkapnya" (opsional).

**Mengganti gambar pengganti dengan foto asli:**

1. Di formulir kartu, tekan **Pilih foto** lalu ambil dari galeri atau kamera ponsel.
2. Foto diperkecil otomatis di ponsel (sisi terpanjang 1600 px, WebP atau JPEG, metadata seperti lokasi GPS dibuang) lalu diunggah ke Vercel Blob; indikatornya tampil di layar. Tidak perlu menyiapkan ukuran khusus; rasio 16:9 paling pas, foto lain dipotong rapi ke 16:9.
3. Pilih **Bagian foto yang tampil** (Atas, Tengah, atau Bawah) bila foto tegak, dan isi **Keterangan foto** bila foto memberi informasi (dibacakan pembaca layar).

Foto dimuat lewat `next/image` (otomatis diperkecil dan lazy load); ruang gambar 16:9 selalu dipesan, jadi halaman tidak bergeser saat foto dimuat. Foto di folder `public/` (jalur seperti `/kegiatan/foto.jpg`) tetap bisa dipakai pada data awal di `data/content.ts`.

## Foto kajian

Setiap kartu di **Jadwal Kajian Sepekan** punya gambar di bagian atas. Pada hari yang sesuai, gambar yang sama tampil di kartu **Kajian Hari Ini** bersama jam, tema, ustadz, dan cara mengikuti kajian. Selama belum ada foto, kartu memakai gambar pengganti (gradien biru, bintang segi delapan, ikon buku), sama seperti kartu Pengumuman.

1. Di Panel Pengurus pilih **Jadwal Kajian**, lalu **Ubah** pada hari yang sesuai.
2. Tekan **Pilih foto** dan ambil dari galeri atau kamera ponsel. Foto diperkecil otomatis di ponsel lalu diunggah (sama seperti foto kegiatan, lihat di atas).
3. Pilih **Bagian foto yang tampil** dan, bila foto memberi informasi, isi **Keterangan foto** (contoh "Ustadz menyampaikan tafsir di ruang utama masjid"), lalu **Simpan**.

Cukup mengisi sekali: satu foto mengisi kartu Jadwal Sepekan sekaligus Kajian Hari Ini. Bila kajian pada suatu tanggal diganti (**Ganti jadwal**), kajian pengganti memakai foto jadwal tetap hari itu.

## Ayat Pekan Ini

Bahan tadabbur Al-Qur'an pada kajian Ahad pagi: lima ayat berurutan setiap pekan.

- **Tampilan:** awalnya hanya ayat hari ini yang terlihat, dengan lencana "Hari ini · (nama hari)". Tombol **Lihat 5 ayat pekan ini** membuka kelima ayat secara berurutan dan berubah menjadi **Sembunyikan**. Ayat hari ini disorot dengan garis dan latar emas; setiap kartu menandai harinya.
- **Hari ke ayat:** Senin = ayat ke-1 ... Jumat = ke-5. Sabtu dan Ahad = **muraja'ah**: tanpa sorotan, yang terlihat awal adalah ayat pertama pekan itu dengan lencana "Muraja'ah pekan ini".
- **Tanggal:** selalu WIB (Asia/Jakarta) lewat `Intl.DateTimeFormat`, apa pun zona waktu perangkat jamaah. Pekan dihitung Senin sampai Ahad.
- **Rotasi otomatis (nomor ayat global):** setiap ayat punya nomor urut mushaf 1-6.236 (sama dengan `number` di API). Pekan Senin 5 Oktober 2026 berawal di **2117** (QS. Al-Isra 88); setiap pekan maju 5 nomor (awal = 2117 + 5 x indeks pekan), otomatis melewati batas surat (2-8 November 2026 = 2137-2141 = Al-Isra 108-111 dan Al-Kahf 1), dan kembali ke 1 setelah 6.236.
- **Bila jadwal tadabbur berubah**, isi objek `override` di `data/ayatPekan.ts`. Kuncinya tanggal Senin pekan itu, nilainya ayat pertama pekan itu, boleh `{ nomor: 2132 }` atau `{ surah: 17, ayat: 103 }`:
  - `"2026-11-16": { surah: 17, ayat: 103 }`: mulai pekan itu, pekan-pekan berikutnya ikut bergeser dan melanjutkan dari ayat ini (cocok bila kajian sempat libur).
  - `"2026-12-28": { nomor: 1, hanyaPekanIni: true }`: khusus satu pekan, lalu pekan berikutnya kembali ke pola semula.
- **Sumber data: [Al Quran Cloud](https://alquran.cloud/api)** (gratis, tanpa API key). Kartu mengambil data dari Route Handler situs sendiri, `GET /api/ayat?week=TAHUN-BULAN-TANGGAL`, yang memanggil
  `https://api.alquran.cloud/v1/ayah/{nomor}/editions/quran-uthmani,id.indonesian,ar.alafasy` untuk kelima ayat secara paralel. Tiap edisi dikenali lewat `edition.identifier` (teks Arab Utsmani, terjemahan Indonesia, audio Mishary Alafasy), responsnya divalidasi, lalu dinormalisasi. Hasil API di-cache server 24 jam (`next: { revalidate: 86400 }`), jadi API dipanggil paling banyak sekali sehari per ayat, bukan per pengunjung.
- **Basmalah:** pada ayat 1 sebuah surat (selain Al-Fatihah dan At-Taubah), teks API diawali Basmalah. Awalan itu dipisahkan HANYA bila sama persis dengan teks Al-Fatihah: 1 dari API, lalu ditampilkan sebagai baris pembuka tersendiri di atas ayat (tidak dibuang, tidak ada huruf yang diubah).
- **Murottal:** setiap kartu punya tombol **Putar murottal** (Qari Mishary Alafasy). Menekan lagi menjeda; memutar ayat lain otomatis menghentikan yang sedang berjalan. Tidak ada putar otomatis. Bila audio utama (128 kbps) gagal, audio cadangan (64 kbps) dicoba sekali; bila tetap gagal muncul "Audio belum dapat dimuat." tanpa merusak kartu. Ayat yang sedang diputar diberi cincin biru langit dan ikon equalizer, berbeda dari sorotan emas "hari ini". Audio berhenti saat daftar ditutup. Audio diputar langsung dari URL API (cdn.islamic.network), tidak diunduh atau di-host ulang. Qari diganti di konstanta `QARI` (`data/ayatPekan.ts`).
- **Atribusi** di bawah kartu: "Teks dan audio: Al Quran Cloud · Qari: Mishary Alafasy", ditambah nama edisi terjemahan dari API.
- **Bila API gagal:** pekan 5-11 Oktober 2026 (nomor 2117-2121) tersimpan di kode sebagai **data cadangan**, jadi kartu tetap tampil dengan pesan sopan; tombol murottal disembunyikan karena data cadangan belum punya URL audio. Pekan lain menampilkan pesan sopan, rujukan ayat hari ini untuk dibaca dari mushaf, dan tombol **Coba Lagi** (tidak pernah menampilkan ayat pekan lain).
  - **SEMENTARA:** data cadangan itu belum dari Al Quran Cloud. Saat revisi dibuat, API tidak bisa diakses dari lingkungan pembuat, jadi yang dipakai adalah teks Kemenag yang sudah diverifikasi (quran.kemenag.go.id melalui github.com/rioastamal/quran-json, diperiksa silang dengan quranenc.com dan fawazahmed0/quran-api), dan atribusinya ditulis jujur sebagai data cadangan Kemenag. Untuk menggantinya, tempelkan respons API untuk 2117-2121 (petunjuk lengkap ada di komentar `data/ayatPekan.ts`).
- **Ketentuan Al Quran Cloud** (alquran.cloud/terms-and-conditions, dicek saat revisi): gratis tanpa key, ada batas laju per IP per detik (sebab itu hasil di-cache 24 jam); teks harus ditampilkan tanpa diubah dan tidak dicampur dengan teks lain; penerjemah harus disebut dan identifier edisi dipertahankan; rekaman murottal boleh dipakai non-komersial dengan hak cipta tetap pada qari; tanpa jaminan ketersediaan.
- **Alamat API** bisa diganti lewat variabel lingkungan server `QURAN_API_BASE` (lihat `.env.example`).
- **Menguji hari lain (hanya saat `npm run dev`):** tambahkan `?tanggal=TAHUN-BULAN-TANGGAL`, misalnya `http://localhost:3000/?tanggal=2026-11-06`. Kartu menampilkan keterangan "Mode uji". Di situs yang diterbitkan (`npm run build`), parameter ini diabaikan.

| Alamat (development) | Yang seharusnya tampil |
| --- | --- |
| `?tanggal=2026-10-05` ... `2026-10-09` | Senin-Jumat: QS. Al-Isra 88-92 (nomor 2117-2121), masing-masing "Hari ini · (hari)" |
| `?tanggal=2026-10-10`, `2026-10-11` | Sabtu, Ahad: Al-Isra 88 dengan "Muraja'ah pekan ini", tanpa sorotan |
| `?tanggal=2026-10-14` | Pekan 12-18 Oktober: Al-Isra 93-97, hari ini 95 |
| `?tanggal=2026-10-21` | Pekan 19-25 Oktober: Al-Isra 98-102 |
| `?tanggal=2026-10-28` | Pekan 26 Oktober - 1 November: Al-Isra 103-107 |
| `?tanggal=2026-11-06` | Pekan 2-8 November: Al-Isra 108-111 dan Al-Kahf 1 (dengan baris Basmalah), hari ini Al-Kahf 1 |

**Catatan jujur tentang pengujian:** api.alquran.cloud tidak bisa dijangkau dari lingkungan pembuat. Route Handler diuji memakai server tiruan yang bentuk responsnya sama dengan Al Quran Cloud (termasuk Basmalah, BOM, urutan edisi acak, respons rusak, dan galat), dan audionya dicegat. Setelah diterbitkan, buka situs lalu `/api/ayat` dan pastikan `"sumber": "api"`, lalu coba tombol murottal dari ponsel.

## Aksesibilitas

Bilah **Atur tampilan** di bagian paling atas selalu terlihat dan pilihannya diingat di peramban jamaah:

- **A- / Normal / A+**: lima ukuran tulisan, dari Kecil sampai Terbesar. "Normal" sudah lebih besar dari web biasa (18px).
- **Kontras Tinggi**: latar putih, tulisan hitam, garis tebal.
- **Tampilan Sederhana**: satu kolom, tanpa hiasan, jadwal berbentuk kartu, menu berupa tombol besar.

Prinsip lain yang diterapkan:

- Menu datar: semua tujuan terlihat langsung, tanpa hamburger atau menu bertingkat. Layar kecil memakai kisi tombol "Menu Utama".
- Halaman panjang (di ponsel belasan layar), jadi setiap bagian ditutup tautan "Kembali ke Menu Utama" (di layar lebar: "Kembali ke atas") agar jamaah tidak perlu menggulir jauh.
- Semua tombol dan tautan setinggi minimal 44px (kebanyakan 56px atau lebih), jauh di atas ukuran target sentuh yang dianjurkan.
- Status tidak hanya dengan warna (ada ikon dan tulisan "Hidup"/"Mati", "Hari ini", "Sedang berlangsung", dst.).
- Bisa dipakai dengan papan ketik (fokus terlihat jelas, tautan "Langsung ke isi halaman", tombol buka-tutup ayat dengan `aria-expanded` dan `aria-controls`, dialog QRIS menangkap fokus dan menutup dengan Esc).
- Pembaca layar: nama tombol memuat tulisan yang terlihat, kabar penting (notifikasi salin) dibacakan otomatis.
- Gerakan otomatis hanya satu kali saat halaman dibuka (cahaya fajar di belakang masjid menguat dan partikel cahaya berkelip, selesai di bawah 5 detik). Gerakan lain terikat posisi gulir, bukan waktu (CSS scroll-driven, tanpa JavaScript): lapisan beranda bergeser berbeda (parallax), garis emas kepala bagian tergambar dari judul ke luar, kartu naik pelan saat masuk layar, dan siluet masjid di panel infak dan kaki halaman naik dari balik cakrawala. Di desktop bermouse, lapisan beranda juga bergeser sedikit mengikuti mouse. Gerakan yang menjawab tombol: fade tab 180 ms, kartu ayat muncul, equalizer saat murottal diputar, kartu dan tombol yang sedikit turun saat ditekan. Semua gerakan dimatikan bila perangkat meminta `prefers-reduced-motion`; gerak gulir juga mati pada Kontras Tinggi dan Tampilan Sederhana, dan di peramban yang belum mendukungnya semua isi langsung tampil utuh.
- Zoom peramban tidak dikunci.

Hasil pemeriksaan otomatis saat pembuatan (revisi 4): Lighthouse Accessibility 100 (ponsel dan desktop), CLS 0,001; axe-core 0 pelanggaran (WCAG 2.2 AA) pada 22 keadaan halaman (termasuk murottal diputar/galat, tab Pengumuman kosong, Basmalah, data cadangan); **semua teks minimal 4,5:1** (dihitung per piksel); tidak ada teks yang meluber atau terpotong dan tidak ada gulir mendatar pada tujuh lebar layar (360, 375, 390, 768, 1024, 1280, 1440px) di kelima ukuran tulisan, plus Mode Sederhana dan Kontras Tinggi. Pemeriksaan otomatis tidak menggantikan uji langsung: sebaiknya minta beberapa jamaah lansia mencoba sebelum diumumkan.

## Donasi

Sesuai rancangan: **tanpa formulir dan tanpa konfirmasi lewat WhatsApp**. Jamaah cukup memindai QRIS (bisa diperbesar dalam jendela) atau menyalin nomor rekening dengan satu tombol. Nomor yang disalin memunculkan pesan "Nomor Rekening Berhasil Disalin!". WhatsApp admin hanya untuk bertanya jadwal dan informasi masjid; tombol "Gabung Grup WhatsApp" di bagian Rekaman Kajian adalah untuk grup komunitas.

## Struktur proyek

```
app/            layout, halaman utama, gaya global, palet warna dan tema Tailwind (globals.css),
                huruf judul Alegreya (fonts/), gambar pratinjau tautan (opengraph-image.jpg), ikon situs (icon.png)
app/api/ayat/   Route Handler GET /api/ayat?week=... (Al Quran Cloud, cache 24 jam, data cadangan)
app/admin/      Panel Pengurus: layar masuk, beranda panel, jadwal (hari dan tanggal), kegiatan dan pengumuman;
                actions/ berisi Server Action (simpan, hapus, tandai resmi, siapkan database, keluar)
app/api/admin/  POST /api/admin/foto (izin unggah foto langsung ke Blob, hanya pengurus yang masuk)
components/     komponen tampilan, satu berkas per bagian halaman. Server Component kecuali bagian
                interaktif: AyatPekanCard (kartu ayat + murottal) dan AnnouncementTabs (tab) memakai
                "use client". Hero = beranda fajar MRPI, hero/ = ilustrasi masjid berlapis (MasjidScene)
                dan parallax mouse (HeroParallax), ProfileIcons = ikon empat pilar
components/ui/  komponen kecil bersama (tombol, lencana, logo, bagian halaman, CardImage, tombol salin,
                tautan kembali ke menu, rentang jam, bintang delapan, rosette, pemisah, siluet masjid)
components/admin/ komponen Panel Pengurus (kerangka, isian, kartu pilihan, dialog konfirmasi, PhotoField,
                form jadwal, pengecualian, dan pengumuman, daftar, spanduk hasil)
data/           content.ts (isi situs), profile.ts (Tentang Kami), nav.ts (menu),
                ayatPekan.ts (acuan, override, qari, ayat cadangan)
hooks/          useAyatPekan, useAyahAudio (satu pemutar murottal), useAccessibility, useWibNow
lib/            ayatPekan (rotasi nomor global, label), quranCloud (klien API, hanya server),
                ayatCadangan, validasiAyat (pemeriksa tipe tanpa any), announcements (urutan, tanggal WIB),
                quranMeta (jumlah ayat dan nama surat), accessibility, time (WIB), schedule (termasuk jadwal
                efektif per tanggal), clipboard, content (pembaca isi halaman utama dengan cadangan)
lib/store/      penyimpanan isi dinamis: antarmuka, SqlStore (Neon), MemoryStore (lokal), skema, data awal
lib/auth/       masuk dengan Google (OIDC dengan PKCE), sesi terenkripsi, daftar email, penjaga akses
lib/admin/      perintah simpan dan hapus (tanpa bergantung pada Next.js), keadaan formulir, pembantu aksi
lib/photo/      aturan foto, pengecilan di peramban, izin unggah, penghapusan foto lama
lib/validation/ skema zod dan pesan galat berbahasa Indonesia
proxy.ts        pagar awal untuk /admin (pemeriksaan sebenarnya ada di tiap halaman, aksi, dan endpoint)
tests/          tes otomatis Vitest (npm test)
types/          index.ts (semua tipe TypeScript)
public/         gambar statis (beranda/ lukisan masjid milik komunitas, kini tidak dipakai di beranda;
                qris-contoh.svg, logo.png)
```

## Desain

- **Arah desain "Iluminasi Biru"**: beranda dibuka seperti halaman pembuka mushaf (Masjid Raya Pondok Indah yang asli saat fajar), dan setiap bagian dibuka seperti kepala surat. Ringkasan produk dan aturan desain ada di `PRODUCT.md`; kontrak arah di `.impeccable/surfaces/app-page-tsx.md`; sistem desain lengkap di `DESIGN.md`.
- **Token tiga lapis** di `app/globals.css`: (1) warna mentah yang diambil dari foto MRPI, yaitu keluarga **genteng** (biru genteng glasir, `--genteng-50` sampai `--genteng-1000`), **batu** (andesit pelataran, `--batu-50` sampai `--batu-800`), **emas** (cahaya fajar), dan **tinta**; (2) nama peran yang dipakai komponen (`--paper`, `--brand`, `--primary`, `--gilt`, `--ink-soft`, dst., menjadi kelas seperti `bg-primary` dan `text-brand`); (3) token komponen untuk sudut, bayangan, bingkai, jarak bagian, dan durasi gerak (`rounded-card`, `rounded-control`, `shadow-elev-1..3`, `duration-(--dur-state)`, `ease-out-expo`). Mode Kontras Tinggi cukup menimpa lapis kedua. Komponen tidak memakai kode warna langsung.
- Warna utama: biru malam `#071D2C` (kepala halaman, beranda, section gelap, kaki halaman), bilah Atur Tampilan `#04121C`, judul `#0A304A`, tombol dan tautan `#0B5C89` (7,2:1 di atas putih), ikon `#1B8BC4`, latar halaman batu pucat `#F3F6F5`, latar selang-seling `#ECF5F9`, teks utama `#0C1F29`, teks sekunder `#495A57` (6,7:1). Emas: tombol utama `#E9B44C` dengan teks gelap (8,9:1), teks/ikon emas di atas biru malam `#F6D78B` (12:1), garis daun emas di latar terang `#C9972F` (hanya garis dan ornamen, bukan teks).
- **Bingkai iluminasi** (garis ganda tipis emas) hanya pada panel istimewa: angka profil, visi, Ayat Pekan Ini, panel jadwal Zoom, jendela QRIS, dan penutup infak. Kartu biasa memakai garis batu dan bayangan lembut; sudut 14px untuk kartu, 10px untuk tombol dan isian.
- **Kepala bagian** meniru kepala surat: judul di tengah diapit garis daun emas yang meruncing ke luar dengan bintang delapan di ujung dalamnya (`components/ui/Section.tsx`). Ornamen latar hanya satu motif: girih bintang delapan yang sangat halus. Rosette (bintang delapan dalam lingkaran, seperti penanda akhir ayat) menomori misi dan langkah Zoom.
- **Huruf:** Alegreya untuk judul dan angka jadwal (variabel 400–900, berkas di `app/fonts`, lisensi SIL OFL di `app/fonts/OFL-Alegreya.txt`; disajikan dari situs sendiri lewat `next/font`), Atkinson Hyperlegible Next untuk isi dan tombol (dirancang agar huruf mirip mudah dibedakan), Amiri untuk teks Arab. **Tidak ada permintaan ke Google Fonts.** Tidak ada kaligrafi hiasan: teks Arab hanya ayat yang dimuat dari Al Quran Cloud.
- Jam di jadwal memakai huruf judul dengan angka tegak dan tanda pisah panjang ("05.00 – 06.00"); pembaca layar mendengar "05.00 sampai 06.00".
- Jarak ikut membesar bersama huruf sampai ukuran "Besar", lalu dikunci agar kartu tidak kehabisan ruang di ponsel pada ukuran huruf terbesar.
- Di ponsel, tombol utama beranda ("Lihat Jadwal Hari Ini", "Buka Zoom") tampil sebelum paragraf sambutan. Tombol media sosial tersusun 2x2 di ponsel dan satu baris rata tengah di layar lebar; "Gabung Grup WhatsApp" paling menonjol.
- **Beranda "Fajar di MRPI"** (`components/Hero.tsx`): langit beranda adalah kelanjutan langsung dari bilah atas dan kepala halaman (biru malam yang sama), lalu menghangat menjadi cahaya fajar di belakang Masjid Raya Pondok Indah. Masjidnya digambar ulang sebagai ilustrasi SVG empat lapis (`components/hero/MasjidScene.tsx`: langit fajar dan partikel cahaya, pepohonan jauh, masjid, latar depan) dari foto asli yang dikirim pemilik: menara beton runcing berujung bulan sabit, atap limas bersusun berlapis genteng biru, deret tiang di bawah atap, palem, gerbang, tangga, dan dinding batu bertuliskan "MASJID RAYA PONDOK INDAH". Ilustrasi tidak punya langit sendiri dan pelatarannya berwarna sama dengan latar section berikutnya, jadi tidak ada tepi gambar. Fotonya sendiri tidak ditayangkan karena izin pakainya belum dikonfirmasi. Teks berada di atas langit gelap (semua teks beranda minimal 8,9:1 per piksel); padding bawah isi dihitung dari tinggi adegan sehingga teks tidak menimpa menara atau atap. Di layar lebar teks di kiri dan masjid di kanan; di ponsel dan tablet teks di atas, masjid utuh di bawah. Pada Kontras Tinggi dan Tampilan Sederhana ilustrasi dan hiasan disembunyikan. Ilustrasi adalah kode (tanpa berkas gambar), jadi tidak menambah waktu muat gambar.
- Siluet MRPI (`components/ui/MasjidSiluet.tsx`) dipakai ulang sebagai tanda air di Profil, di layar pemutar video, di panel penutup infak, dan sebagai cakrawala di tepi atas kaki halaman.
- Nama hari memakai "Ahad", bukan "Minggu".

## Privasi

Tidak ada pelacak, iklan, atau formulir. Pemutar YouTube memakai `youtube-nocookie.com` dan baru dimuat setelah jamaah menekan tombol putar. Peramban menyimpan secara lokal hanya pilihan tampilan (`ps:a11y:v1`). Teks ayat diambil server situs dari Al Quran Cloud; peramban jamaah hanya menghubungi situs ini, dan cdn.islamic.network ketika tombol murottal ditekan.

## Menerbitkan

Halaman utama dibangun statis (`next build`), sedangkan `/api/ayat` adalah Route Handler yang berjalan di server. Karena itu situs perlu dipasang di layanan yang menjalankan Next.js (Vercel, Netlify, atau server Node dengan `npm run build && npm run start`), bukan sebagai ekspor statis murni. Di Vercel cukup impor repositori: situs publik berjalan tanpa variabel lingkungan apa pun (isinya dari `data/content.ts`). Variabel lingkungan hanya dibutuhkan untuk Panel Pengurus; langkahnya ada di bagian "Panel Pengurus".

### Pratinjau tautan di WhatsApp

Saat tautan situs dibagikan di grup WhatsApp, muncul kartu pratinjau berisi judul, deskripsi, dan gambar (`app/opengraph-image.jpg`, 1200x630, di bawah 300 KB, bertema biru). Agar alamat gambarnya benar, isi variabel lingkungan `NEXT_PUBLIC_SITE_URL` dengan alamat situs (contoh `https://alamat-situs-anda.id`, lihat `.env.example`). Di Vercel, bila kosong, Next.js memakai alamat proyek secara otomatis. Selama variabel belum diisi, `npm run build` menampilkan peringatan `metadataBase` di terminal; itu hanya pengingat dan tidak menggagalkan build.

Untuk mengganti gambar, timpa `app/opengraph-image.jpg` dengan gambar berukuran 1200x630 piksel (JPG atau PNG, usahakan di bawah 300 KB) dan ubah teks alternatifnya di `app/opengraph-image.alt.txt`. WhatsApp menyimpan pratinjau lama beberapa lama; bila gambar baru belum muncul, bagikan tautan dengan tambahan `?v=2` di ujungnya.

Logo komunitas ada di dua tempat: `public/logo.png` (dipakai di kepala halaman dan kepala panel lewat `components/ui/Logo.tsx`) dan `app/icon.png` (ikon tab browser, persegi 256x256 piksel). Untuk menggantinya, timpa kedua file itu dengan logo baru. Browser menyimpan ikon tab lama dalam cache, jadi muat ulang dengan Ctrl+F5 bila ikon baru belum muncul.

## Pengembangan lanjutan (usulan)

- Waktu shalat harian lewat API jadwal shalat untuk Jakarta, ditampilkan di bawah sapaan.
- Mengelola Zoom, video, donasi, dan kontak lewat Panel Pengurus juga (kini masih lewat `data/content.ts`).
- Batas jumlah kartu di daftar Kegiatan dan Pengumuman di web bila daftarnya sudah sangat panjang.
