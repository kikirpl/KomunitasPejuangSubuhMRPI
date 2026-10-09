# Pejuang Subuh - Masjid Raya Pondok Indah (MRPI)

Website komunitas **Pejuang Subuh**: profil, jadwal kajian, ayat tadabbur pekan ini, kajian lewat Zoom, rekaman kajian, info infak, pengumuman, dan kontak admin. Dirancang agar mudah dipakai bapak dan ibu jamaah yang tidak terbiasa dengan teknologi: huruf besar, tombol besar, menu datar tanpa hamburger, dan pengaturan tampilan yang selalu terlihat.

Dibuat dengan **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**.

## Sebelum diterbitkan: masih ada DATA CONTOH dan isian yang kosong

Tidak ada data resmi masjid di dalam proyek ini. Nomor telepon, WhatsApp, alamat, tautan Zoom, rekening, QRIS, video, jadwal, dan pengumuman semuanya **contoh**. Tiap bagian yang masih contoh menampilkan lencana "Contoh data, belum resmi" supaya tidak pernah dianggap resmi oleh jamaah.

Daftar yang wajib diisi atau diganti:

- [ ] **Foto kegiatan** (opsional): kartu Kegiatan/Pengumuman memakai gambar pengganti sampai `imageUrl` diisi. Cara mengisinya ada di bagian "Kegiatan dan Pengumuman" di bawah.
- [ ] **Foto kajian** (opsional): kartu Jadwal Sepekan dan Kajian Hari Ini memakai gambar pengganti sampai `imageUrl` tiap hari diisi. Lihat bagian "Foto kajian" di bawah.
- [ ] **Tautan TikTok, Instagram, dan Grup WhatsApp** (objek `SOCIAL_LINKS` di bagian atas `components/VideoGallery.tsx`). Saat ini berisi `#`. Tautan YouTube sudah diisi: https://www.youtube.com/@pejuangsubuhmrpi
- [ ] Jadwal kajian: hari, jam, ustadz, tema, tempat, dan mode (masjid / Zoom / keduanya)
- [ ] Tautan Zoom, Meeting ID, dan kode sandi
- [ ] ID video YouTube untuk video utama di Rekaman Kajian (video contoh memakai ID palsu, jadi pemutar belum aktif)
- [ ] Gambar QRIS asli (berkas `public/qris-contoh.svg` hanya gambar contoh dan tidak bisa dipindai)
- [ ] Nama bank, nomor rekening, dan nama pemilik rekening
- [ ] Kegiatan dan pengumuman (`ANNOUNCEMENTS`): isi `type` tiap butir (`"kegiatan"` atau `"pengumuman"`). Empat butir contoh sementara diklasifikasikan sebagai kegiatan; tab Pengumuman masih kosong.
- [ ] Alamat, nomor telepon, nomor WhatsApp admin, dan tautan peta
- [ ] Ubah `isSample: true` menjadi `isSample: false` pada tiap bagian yang sudah diisi data resmi
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
```

Dua hal yang mungkin membuat bingung saat menjalankan:

- Saat pertama kali `npm run dev`, Next.js 16 membuat sendiri berkas `AGENTS.md` (petunjuk untuk asisten AI). Itu normal dan aman dibiarkan.
- `npm install` bisa menampilkan "5 high severity vulnerabilities". Peringatan itu hanya mengenai paket pemeriksa kode (`eslint-config-next`) yang dipakai saat pengembangan dan tidak dikirim ke pengunjung situs (`npm audit --omit=dev` melaporkan 0 masalah). Jangan jalankan `npm audit fix --force`: perintah itu akan menurunkan `eslint-config-next` ke versi lama.

## Mengganti isi situs

Sebagian besar isi ada di satu berkas: **`data/content.ts`**. Setiap bagian punya petunjuk singkat di komentarnya.

| Bagian | Yang diisi | Catatan |
| --- | --- | --- |
| `SCHEDULE` | Satu entri per hari | `day`: 0 = Ahad, 1 = Senin ... 6 = Sabtu. Jam format 24 jam, zona WIB. `mode`: `"masjid"`, `"zoom"`, atau `"hybrid"`. Opsional: `imageUrl`, `imageAlt` (foto kajian, lihat "Foto kajian") |
| `ZOOM` | `meetingUrl`, `meetingId`, `passcode`, `slots` | Tombol "Buka Zoom" dan "Salin Tautan Zoom" memakai `meetingUrl` |
| `VIDEO` | `title`, `ustadz`, `youtubeId` | Satu video utama. `youtubeId` = 11 karakter di akhir alamat YouTube, contoh `youtube.com/watch?v=XXXXXXXXXXX`. Pemutar baru dimuat setelah tombol putar ditekan |
| `DONATION` | `qris`, `bankAccounts` | Taruh gambar QRIS di `public/`, lalu isi `imageSrc` (contoh `"/qris.png"`), `width`, dan `height` sesuai ukuran asli gambar. Bisa lebih dari satu rekening |
| `ANNOUNCEMENTS` | Satu entri per kegiatan/pengumuman | `type`: `"kegiatan"` atau `"pengumuman"` (menentukan tab). `date` ISO, contoh `2026-10-09` atau `2026-10-09T05:00:00+07:00` (jam ikut tampil). `excerpt` ringkasan (dipotong 3 baris). Opsional: `imageUrl`, `imageAlt`, `href` (tautan "Selengkapnya"). Urutan otomatis: terbaru dulu |
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

**Mengganti gambar pengganti dengan foto asli:**

1. Simpan foto di folder `public/kegiatan/` (buat foldernya), misalnya `public/kegiatan/kerja-bakti-2026-10.jpg`. Rasio 16:9 paling pas (contoh 1600x900 piksel); foto lain tetap dipotong rapi ke 16:9.
2. Di `data/content.ts`, pada butir yang sesuai, tambahkan `imageUrl: "/kegiatan/kerja-bakti-2026-10.jpg"` (tanpa kata `public`) dan, bila foto memberi informasi, `imageAlt: "Jamaah membersihkan serambi masjid"`.
3. Foto dari situs lain (URL `https://...`) juga bisa, tetapi alamat situsnya harus diizinkan dulu di `images.remotePatterns` pada `next.config.ts` (contohnya ada di komentar berkas itu).

Foto dimuat lewat `next/image` (otomatis diperkecil dan lazy load). Ruang gambar 16:9 selalu dipesan, jadi halaman tidak bergeser saat foto dimuat.

## Foto kajian

Setiap kartu di **Jadwal Kajian Sepekan** punya gambar di bagian atas. Pada hari yang sesuai, gambar yang sama tampil di kartu **Kajian Hari Ini** bersama jam, tema, ustadz, dan cara mengikuti kajian. Selama `imageUrl` belum diisi, kartu memakai gambar pengganti (gradien biru, bintang segi delapan, ikon buku), sama seperti kartu Pengumuman.

1. Simpan foto di folder `public/kajian/` (buat foldernya), misalnya `public/kajian/senin.jpg`. Rasio 16:9 paling pas (contoh 1600x900 piksel); foto lain tetap dipotong rapi ke 16:9.
2. Di `data/content.ts`, pada entri `SCHEDULE` hari yang sesuai, tambahkan `imageUrl: "/kajian/senin.jpg"` (tanpa kata `public`) dan, bila foto memberi informasi, `imageAlt: "Ustadz menyampaikan tafsir di ruang utama masjid"`.

Cukup mengisi sekali: satu `imageUrl` mengisi kartu Jadwal Sepekan sekaligus Kajian Hari Ini. Foto dari situs lain (URL `https://...`) memakai aturan yang sama seperti foto Pengumuman (`images.remotePatterns` di `next.config.ts`).

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
- Gerakan otomatis hanya satu kali saat halaman dibuka (fajar di hiasan beranda); pegunungan di beranda diam (tanpa animasi kabut dan tanpa parallax). Gerakan lain hanya menjawab tombol yang ditekan (fade tab 180 ms, kartu ayat muncul, equalizer saat murottal diputar). Semua gerakan dimatikan bila perangkat meminta `prefers-reduced-motion`.
- Zoom peramban tidak dikunci.

Hasil pemeriksaan otomatis saat pembuatan (revisi 4): Lighthouse Accessibility 100 (ponsel dan desktop), CLS 0,001; axe-core 0 pelanggaran (WCAG 2.2 AA) pada 22 keadaan halaman (termasuk murottal diputar/galat, tab Pengumuman kosong, Basmalah, data cadangan); **semua teks minimal 4,5:1** (dihitung per piksel); tidak ada teks yang meluber atau terpotong dan tidak ada gulir mendatar pada tujuh lebar layar (360, 375, 390, 768, 1024, 1280, 1440px) di kelima ukuran tulisan, plus Mode Sederhana dan Kontras Tinggi. Pemeriksaan otomatis tidak menggantikan uji langsung: sebaiknya minta beberapa jamaah lansia mencoba sebelum diumumkan.

## Donasi

Sesuai rancangan: **tanpa formulir dan tanpa konfirmasi lewat WhatsApp**. Jamaah cukup memindai QRIS (bisa diperbesar dalam jendela) atau menyalin nomor rekening dengan satu tombol. Nomor yang disalin memunculkan pesan "Nomor Rekening Berhasil Disalin!". WhatsApp admin hanya untuk bertanya jadwal dan informasi masjid; tombol "Gabung Grup WhatsApp" di bagian Rekaman Kajian adalah untuk grup komunitas.

## Struktur proyek

```
app/            layout, halaman utama, gaya global, palet warna dan tema Tailwind (globals.css),
                huruf judul (fonts/), gambar pratinjau tautan (opengraph-image.jpg), ikon situs (icon.svg)
app/api/ayat/   Route Handler GET /api/ayat?week=... (Al Quran Cloud, cache 24 jam, data cadangan)
components/     komponen tampilan, satu berkas per bagian halaman. Server Component kecuali bagian
                interaktif: AyatPekanCard (kartu ayat + murottal) dan AnnouncementTabs (tab) memakai
                "use client". MountainBackdrop = pegunungan beranda, ProfileIcons = ikon empat pilar
components/ui/  komponen kecil bersama (tombol, lencana, logo, bagian halaman, CardImage, tombol salin,
                tautan kembali ke menu, rentang jam)
data/           content.ts (isi situs), profile.ts (Tentang Kami), nav.ts (menu),
                ayatPekan.ts (acuan, override, qari, ayat cadangan)
hooks/          useAyatPekan, useAyahAudio (satu pemutar murottal), useAccessibility, useWibNow
lib/            ayatPekan (rotasi nomor global, label), quranCloud (klien API, hanya server),
                ayatCadangan, validasiAyat (pemeriksa tipe tanpa any), announcements (urutan, tanggal WIB),
                quranMeta (jumlah ayat dan nama surat), accessibility, time (WIB), schedule, clipboard
types/          index.ts (semua tipe TypeScript)
public/         gambar statis (qris-contoh.svg)
```

## Desain

- **Palet biru** (selaras poster), semuanya variabel CSS di `app/globals.css`: Navy `#0B2559` (header, footer, judul di latar terang), Biru royal `#1F4FB8` (tombol dan tautan), Biru langit `#2490DB` (ikon, gradasi, hover; tidak dipakai untuk teks kecil), Biru es `#EAF5FC` dan `#BFE3F7` (latar section dan kartu), Emas `#D4AF37` dengan tint `#FFF6D9` (garis, border, sorotan), Gading `#FBFAF5` (latar), teks utama `#0F1B33`, teks sekunder `#5A6B85`. Komponen tidak memakai kode warna langsung, melainkan nama peran (mis. `bg-primary`, `text-brand`), jadi mengganti warna cukup di satu blok.
- Emas hanya untuk aksen, garis, ikon, latar sorotan, atau teks besar di atas navy; tidak untuk teks kecil di atas putih.
- Kartu `rounded-2xl`, bayangan lembut kebiruan, garis emas tipis di bawah judul setiap bagian.
- Ornamen hanya satu motif: bintang segi delapan (khatam) yang sangat halus (opacity 5-8%) di beranda, Profil, Jadwal Sepekan, dan Zoom. Warnanya juga diatur lewat variabel (`--ornament-light`, `--ornament-dark`).
- **Huruf:** Playfair Display untuk judul (berkas di `app/fonts`, lisensi SIL OFL; disajikan dari situs sendiri lewat `next/font`, jadi tidak ada permintaan ke Google), Atkinson Hyperlegible Next untuk isi dan tombol (dirancang agar huruf mirip mudah dibedakan), Amiri untuk teks Arab. **Tidak ada permintaan ke Google Fonts.**
- Jam di jadwal memakai huruf judul dengan angka tegak dan tanda pisah panjang ("05.00 – 06.00"); pembaca layar mendengar "05.00 sampai 06.00".
- Jarak ikut membesar bersama huruf sampai ukuran "Besar", lalu dikunci agar kartu tidak kehabisan ruang di ponsel pada ukuran huruf terbesar.
- Di ponsel, lengkung beranda dibuat kecil dan tombol utama ("Lihat Jadwal Hari Ini", "Buka Zoom") tampil sebelum paragraf sambutan. Tombol media sosial tersusun 2x2 di ponsel dan satu baris rata tengah di layar lebar; "Gabung Grup WhatsApp" paling menonjol.
- **Pegunungan biru muda** di dasar beranda (`components/MountainBackdrop.tsx`, SVG inline sekitar 4 KB): empat lapis punggung gunung dari `#EAF5FC` sampai `#8CC7EE` (makin dekat makin pekat), cahaya emas samar di balik puncak terjauh, dan kabut yang memudar tepat ke warna latar section berikutnya. Warna tiap lapis di variabel `--mtn-1` ... `--mtn-4`, `--mtn-glow`, `--mtn-mist`, tinggi di `--mtn-height` (`clamp(160px, 28vw, 340px)`), semuanya di `app/globals.css`. Padding bawah beranda dihitung dari tinggi itu sehingga teks dan tombol tidak pernah menimpa gunung. Disembunyikan pada Kontras Tinggi dan Tampilan Sederhana. Hanya dipakai di satu tempat (beranda); animasi kabut sengaja tidak dibuat agar tenang bagi jamaah lansia dan tidak perlu tombol jeda (WCAG 2.2.2).
- Nama hari memakai "Ahad", bukan "Minggu".

## Privasi

Tidak ada pelacak, iklan, atau formulir. Pemutar YouTube memakai `youtube-nocookie.com` dan baru dimuat setelah jamaah menekan tombol putar. Peramban menyimpan secara lokal hanya pilihan tampilan (`ps:a11y:v1`). Teks ayat diambil server situs dari Al Quran Cloud; peramban jamaah hanya menghubungi situs ini, dan cdn.islamic.network ketika tombol murottal ditekan.

## Menerbitkan

Halaman utama dibangun statis (`next build`), sedangkan `/api/ayat` adalah Route Handler yang berjalan di server. Karena itu situs perlu dipasang di layanan yang menjalankan Next.js (Vercel, Netlify, atau server Node dengan `npm run build && npm run start`), bukan sebagai ekspor statis murni. Di Vercel cukup impor repositori; tidak ada variabel lingkungan yang wajib diisi.

### Pratinjau tautan di WhatsApp

Saat tautan situs dibagikan di grup WhatsApp, muncul kartu pratinjau berisi judul, deskripsi, dan gambar (`app/opengraph-image.jpg`, 1200x630, di bawah 300 KB, bertema biru). Agar alamat gambarnya benar, isi variabel lingkungan `NEXT_PUBLIC_SITE_URL` dengan alamat situs (contoh `https://alamat-situs-anda.id`, lihat `.env.example`). Di Vercel, bila kosong, Next.js memakai alamat proyek secara otomatis. Selama variabel belum diisi, `npm run build` menampilkan peringatan `metadataBase` di terminal; itu hanya pengingat dan tidak menggagalkan build.

Untuk mengganti gambar, timpa `app/opengraph-image.jpg` dengan gambar berukuran 1200x630 piksel (JPG atau PNG, usahakan di bawah 300 KB) dan ubah teks alternatifnya di `app/opengraph-image.alt.txt`. WhatsApp menyimpan pratinjau lama beberapa lama; bila gambar baru belum muncul, bagikan tautan dengan tambahan `?v=2` di ujungnya.

Sebelum publikasi, pertimbangkan juga mengganti `app/icon.svg` bila masjid punya logo resmi.

## Pengembangan lanjutan (usulan)

- Waktu shalat harian lewat API jadwal shalat untuk Jakarta, ditampilkan di bawah sapaan.
- Mengelola isi lewat panel admin sederhana (bukan lewat berkas) bila pengurus sering mengubah jadwal.
