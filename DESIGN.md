---
name: Pejuang Subuh MRPI
description: Halaman iluminasi Masjid Biru untuk jamaah lansia Komunitas Pejuang Subuh Masjid Raya Pondok Indah.
colors:
  primary: "#0b5c89"
  primary-hover: "#0b466a"
  brand: "#0a304a"
  brand-deep: "#071d2c"
  toolbar: "#04121c"
  accent: "#1b8bc4"
  tint: "#ecf5f9"
  on-brand-soft: "#d4eaf4"
  langit-1: "#0a2a41"
  langit-2: "#0d3a58"
  langit-3: "#10476b"
  gold: "#e9b44c"
  gold-soft: "#f6d78b"
  gilt: "#c9972f"
  gold-tint: "#fbf1d8"
  paper: "#f3f6f5"
  card: "#ffffff"
  line: "#ccd6d3"
  ink: "#0c1f29"
  ink-soft: "#495a57"
  danger: "#b3261e"
  danger-tint: "#fdecea"
typography:
  display:
    fontFamily: "Alegreya, Georgia, Times New Roman, serif"
    fontSize: "4.5rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
    fontFeature: "\"lnum\" 1"
  headline:
    fontFamily: "Alegreya, Georgia, Times New Roman, serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.12
    fontFeature: "\"lnum\" 1"
  title:
    fontFamily: "Alegreya, Georgia, Times New Roman, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: "\"lnum\" 1"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  arabic:
    fontFamily: "Amiri, Scheherazade New, Noto Naskh Arabic, serif"
    fontSize: "max(32px, clamp(2rem, 1.35rem + 2.6vw, 3.6rem))"
    fontWeight: 400
    lineHeight: 2.2
    letterSpacing: "0"
rounded:
  control: "0.625rem"
  card: "0.875rem"
  pill: "9999px"
spacing:
  frame-gap: "5px"
  gutter: "1.25rem"
  gutter-wide: "2rem"
  card-pad: "1.5rem"
  card-pad-wide: "2rem"
  section-y: "clamp(3.25rem, 2rem + 4vw, 6rem)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "0.875rem 1.75rem"
    height: "4rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "1rem 2rem"
    height: "5rem"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.25rem"
    height: "3.5rem"
  button-outline-hover:
    backgroundColor: "{colors.tint}"
  button-outline-on-dark:
    backgroundColor: "{colors.brand-deep}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "1rem 2rem"
    height: "5rem"
  button-outline-on-dark-hover:
    backgroundColor: "{colors.card}"
    textColor: "{colors.brand}"
  button-danger:
    backgroundColor: "{colors.card}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.25rem"
    height: "3.5rem"
  button-danger-solid:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.25rem"
    height: "3.5rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  card-dark:
    backgroundColor: "{colors.brand-deep}"
    textColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "2.25rem 1.5rem"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1rem"
    height: "3.5rem"
  chip:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.brand}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.875rem"
  chip-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.875rem"
  kartus:
    backgroundColor: "{colors.gold-tint}"
    textColor: "{colors.brand}"
    typography: "{typography.headline}"
    padding: "0.5rem 2.25rem"
  nav-item:
    textColor: "{colors.card}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "3.5rem"
---

# Design System: Pejuang Subuh MRPI

## Overview

**Creative North Star: "Iluminasi Biru"**

Situs ini dibaca seperti halaman iluminasi dari Masjid Biru. Warnanya diambil dari Masjid Raya Pondok Indah sendiri: genteng glasir biru atap limasnya, batu andesit pucat di pelataran, dan beton menaranya. Emas bukan warna bangunan, melainkan daun emas iluminasi mushaf dan cahaya fajar: ia hadir sebagai garis tipis, bintang delapan, dan satu tombol utama, tidak pernah sebagai bidang luas. Beranda dibuka seperti frontispiece: langit malam yang menyambung dari bilah atas turun ke cahaya fajar di belakang siluet MRPI, lalu pelataran batu memudar menjadi dasar halaman, sehingga section berikutnya terasa sebagai lanjutan pelataran.

Kepadatan sengaja longgar karena pembacanya lansia di ponsel. Ukuran dasar huruf 18px (html 112,5%), tombol dan isian setinggi minimal 56px, dan seluruh jarak dihitung dalam rem sehingga ikut membesar bersama bilah "Atur tampilan" (lima ukuran: 100%, 112,5%, 125%, 143,75%, 162,5%). Pada dua ukuran terbesar jarak dikunci di 5px per langkah dan hanya hurufnya yang terus membesar. Hiasan selalu dapat dilepas: Kontras Tinggi dan Tampilan Sederhana mematikan girih, kartus, adegan masjid, dan bayangan tanpa merusak tata letak.

Setiap bagian dibuka seperti kepala surat. Bagian inti memakai kartus berujung runcing diapit garis daun emas yang meruncing; bagian pendukung memakai kepala ringan rata kiri dengan bintang dan garis emas yang memudar, seperti daftar isi mushaf. Sistem ini menolak slider foto, hijau-emas generik, dan deret kartu seragam sebagai struktur halaman.

**Key Characteristics:**
- Tiga lapis token: primitif (genteng, batu, emas, tinta), peran semantik, dan token komponen; komponen hanya memakai peran.
- Biru genteng sebagai bidang dan tindakan, batu pucat sebagai dasar, emas hanya sebagai garis, ornamen, dan satu tombol fajar.
- Satu ornamen berulang: bintang delapan (khatam), dalam bentuk StarMark, Rosette, dan pola girih 4-7%.
- Alegreya dengan angka tegak untuk judul, Atkinson Hyperlegible Next untuk isi, Amiri minimal 32px untuk Arab.
- Gerak hanya pada momen yang dirancang: parallax berlapis di beranda dan garis kepala surat yang tergambar saat digulir.
- Mode Kontras Tinggi dan Tampilan Sederhana adalah bagian sistem, bukan tambalan.

## Colors

Biru glasir dan biru malam di atas batu andesit pucat, disulam daun emas.

### Primary
- **Biru Genteng** (primary): warna tindakan. Isi tombol utama, tautan, kontrol terpilih (7,2:1 di atas putih). Saat disentuh bergeser ke **Genteng Bayang** (primary-hover).
- **Biru Judul** (brand): judul di latar terang, angka Rosette, teks chip.
- **Langit Malam** (brand-deep): bidang gelap untuk kepala halaman, beranda, section gelap, panel visi dan donasi, kaki halaman. Bilah Atur Tampilan memakai versi tergelapnya, **Malam Terdalam** (toolbar), yang juga menjadi `themeColor`.
- **Langit Subuh** (langit-1, langit-2, langit-3): gradasi dari biru malam ke cakrawala, dipakai di langit beranda dan panel langit Subuh kecil.
- **Genteng Tersinari** (accent): ikon di dalam lingkaran tint. Hanya untuk ikon dan hiasan, bukan teks.
- **Kabut Genteng** (tint): latar chip, hover lembut, lingkaran ikon, section selang-seling (paper-2 memakai nilai yang sama).
- **Genteng Muda** (on-brand-soft): teks sekunder di atas langit malam.

### Secondary
- **Emas Fajar** (gold): isi satu tombol utama beranda, chip "hari ini", tombol putar video, garis cahaya fajar di tepi atas section gelap. Teks di atasnya selalu tinta (8,9:1).
- **Emas Lembut** (gold-soft): teks dan ikon emas di atas biru malam (12:1), garis bingkai di latar gelap, cincin fokus di latar gelap.
- **Daun Emas** (gilt): garis bingkai, kartus, garis kepala bagian, StarMark, Rosette, dan tepi tombol emas di latar terang. Bukan untuk teks.
- **Kertas Emas** (gold-tint): isi kartus, lencana contoh, kartu ayat hari ini.

### Neutral
- **Pelataran Batu** (paper): latar halaman.
- **Kertas Putih** (card): permukaan kartu, isian, dan teks di atas biru.
- **Garis Batu** (line): garis kartu dan pemisah di latar terang. Di latar gelap garisnya emas 28% (`--line-dark`).
- **Tinta** (ink): teks utama biru-hitam.
- **Batu Tua** (ink-soft): teks sekunder dan garis isian (6,7:1 di atas dasar).
- **Merah Bata** (danger) dan **Merah Pucat** (danger-tint): hanya untuk hapus dan galat.

### Named Rules
**The Daun Emas Rule.** Emas di latar terang adalah garis dan ornamen (gilt), tidak pernah teks. Teks emas hanya ada di atas biru malam (gold-soft). Bidang emas hanya ada pada satu tombol utama per layar dan chip status kecil.

**The Lewat Peran Rule.** Komponen tidak menulis kode warna langsung; mereka memakai peran semantik (`--primary`, `--ink`, `--gilt`, ...). Kontras Tinggi bekerja dengan menimpa peran itu di `html[data-contrast="high"]` (putih, hitam, biru #003f66, kuning #ffd23f), jadi warna baru yang tidak lewat peran akan lolos dari mode itu.

**The Langit Menyambung Rule.** Bilah atas, kepala halaman, dan langit beranda memakai biru malam yang sama sehingga tidak ada tepi di antaranya; langit makin terang ke cakrawala, tidak sebaliknya.

## Typography

**Display Font:** Alegreya (dengan Georgia, Times New Roman, serif), disajikan sendiri lewat next/font/local
**Body Font:** Atkinson Hyperlegible Next Variable (dengan Segoe UI, system-ui, sans-serif)
**Arabic Font:** Amiri (dengan Scheherazade New, Noto Naskh Arabic)

**Character:** Alegreya berakar goresan pena lebar dan serumpun dengan naskh Amiri, jadi judul Latin dan ayat Arab terasa ditulis tangan yang sama. Atkinson Hyperlegible Next dipilih karena bentuk hurufnya mudah dibedakan bagi mata lansia.

### Hierarchy
Semua ukuran dalam rem relatif terhadap dasar 18px dan ikut skala Atur Tampilan.
- **Display** (600, 2.9rem di ponsel sampai 4.5rem, line-height 1.02, tracking -0.025em): nama komunitas di beranda. "Komunitas" ditulis kecil (1.5-1.875rem, 500) di dalam h1 yang sama, di atas "Pejuang Subuh".
- **Headline** (600, 1.75rem / 2.25rem / 2.75rem, line-height 1.12): judul bagian kepala surat. Kepala ringan berhenti di 2.25rem (line-height 1.15). Judul layar panel pengurus 2.25rem.
- **Title** (600, 1.5rem): judul kartu dan sub-bagian.
- **Body** (400, 1.125rem, line-height 1.7): teks isi; intro bagian dan sambutan 1.25rem dengan line-height lega, lebar maksimal 42rem.
- **Label** (700, 1rem-1.125rem): chip, lencana, label tombol (tombol 1.125-1.5rem, 700-800), label isian 1.25rem tebal.
- **Arabic** (400, minimal 32px, line-height 2.2): ayat; kata Arab tidak pernah dipatahkan.

### Named Rules
**The Angka Tegak Rule.** Huruf judul selalu memakai angka tegak (`"lnum" 1`); angka dalam jadwal, Rosette, dan nomor rekening memakai `tabular-nums`.

**The 32px Arab Rule.** Teks Arab tidak pernah di bawah 32px, berapa pun ukuran layarnya.

**The Judul Bicara Sendiri Rule.** Judul tidak diberi label kecil di atasnya. Hierarki datang dari ukuran, ketebalan, dan kepala surat.

## Layout

Satu kolom isi selebar maksimal 72rem (max-w-6xl) dengan tepi 1.25rem di ponsel dan 2rem mulai 40rem; Tampilan Sederhana menyempitkannya ke 48rem dan menumpuk semua grid menjadi satu kolom. Jarak vertikal bagian memakai `--section-y` (clamp 3.25rem sampai 6rem) di atas dan 55% darinya di bawah, sehingga ruang di atas judul selalu lebih besar dari ruang di bawahnya. Kartu memakai bantalan 1.5rem, 2rem di layar lebih lebar.

Titik henti mengikuti Tailwind: 40rem, 48rem, 64rem, 80rem. Navigasi atas tampil mulai 80rem; di bawahnya menu utama ada di halaman. Varian `pendek` (lebar minimal 64rem, tinggi maksimal 52rem, hanya tampilan biasa) memadatkan beranda agar kedua tombol utama dan masjid utuh terlihat di laptop 1366x768 dan 1280x720. Varian `huge` (ukuran tulisan Lebih besar dan Terbesar) mengembalikan tata letak bertumpuk, menyembunyikan ikon di tombol, dan mengecilkan judul di ponsel.

Beranda: di ponsel teks di atas dan masjid utuh di bawah (adegan lebar 200%), tombol tampil sebelum paragraf sambutan; mulai 64rem teks di kolom kiri dan masjid di kanan. Bagian latar terang bergantian antara paper dan paper-2; section gelap memakai langit malam.

## Elevation & Depth

Sistem berlapis lembut: bayangan biru malam yang diffuse dengan offset ke bawah, ditambah lapisan tonal (batu, kabut genteng, kertas putih). Kedalaman yang paling kuat bukan bayangan, melainkan parallax beranda: empat lapis (langit, pepohonan jauh, masjid, latar depan) bergeser berbeda mengikuti gulir dan penunjuk. Di Kontras Tinggi semua bayangan menjadi `none` dan kartu diberi garis 2px hitam.

### Shadow Vocabulary
- **Elev 1** (`0 1px 2px rgb(7 29 44 / 0.06), 0 2px 8px -2px rgb(7 29 44 / 0.08)`): tombol diam, chip emas.
- **Elev 2** (`0 1px 2px rgb(7 29 44 / 0.05), 0 18px 36px -22px rgb(7 29 44 / 0.34)`): kartu (`--card-shadow`), panel bingkai, tombol saat hover.
- **Elev 3** (`0 4px 10px rgb(7 29 44 / 0.12), 0 32px 64px -24px rgb(7 29 44 / 0.45)`): tombol putar video di atas poster.
- **Pendar Emas** (`0 14px 30px -14px` emas 70%): hanya di bawah tombol emas beranda di atas langit malam.

### Named Rules
**The Tekan Turun Rule.** Saat ditekan tombol turun 1px dan bayangannya hilang; saat hover bayangan naik satu tingkat. Tidak ada animasi panjang pada kontrol.

**The Ornamen Berbisik Rule.** Pola girih bintang delapan hanya 4-7% opacity (`--ornament-light`, `--ornament-dark`), memudar di tepi atas dan bawah bagian, dan hilang total di Kontras Tinggi dan Tampilan Sederhana.

## Shapes

Sudut lembut dan konsisten: kontrol 0.625rem, kartu 0.875rem, chip dan lingkaran ikon bulat penuh. Bentuk khas diambil dari mushaf: kartus berujung runcing (clip-path segi enam, ujung 1.1rem di ponsel dan 1.5rem mulai 40rem) dengan garis daun emas 1.5px; garis kepala bagian berbentuk baji 3px yang meruncing ke luar; bingkai iluminasi garis ganda 1px berjarak 5px; Rosette lingkaran dengan bintang delapan di dalamnya. Garis tegas 2px dipakai untuk tombol dan isian; garis 1px untuk kartu dan daftar.

**The Bingkai Langka Rule.** Bingkai garis ganda hanya untuk panel istimewa (ayat, visi, donasi), tidak pernah pada setiap kartu.

## Components

### Buttons
Kokoh dan besar, dibuat untuk jari yang kurang presisi.
- **Shape:** sudut kontrol (0.625rem), garis 2px, teks tebal, ikon lucide di kiri.
- **Ukuran:** md minimal 56px, lg minimal 64px, xl minimal 80px (beranda). Tidak ada tombol di bawah 56px untuk sentuhan.
- **Primary:** biru genteng berisi putih, Elev 1; hover ke genteng bayang dan Elev 2.
- **Gold:** emas fajar bertepi daun emas, teks tinta; satu per layar, untuk tindakan utama ("Lihat Jadwal Hari Ini").
- **Outline / Light:** garis biru genteng di atas kertas putih; hover ke kabut genteng.
- **Outline on dark:** garis putih di atas biru malam 55% tembus pandang; hover menjadi putih dengan teks biru judul.
- **Danger / Danger solid:** garis merah di kertas untuk tombol hapus; isi merah untuk konfirmasi hapus.
- **Hover / Focus:** transisi 160ms dengan `--ease-out-expo`; fokus papan ketik cincin 4px offset 3px (biru judul di terang, emas lembut di gelap). Di atas langit beranda cincin emas diberi alas biru malam 11px agar tetap kontras.

### Chips
- **Style:** bulat penuh, teks 1rem tebal biru judul di atas kabut genteng dengan garis tipis; chip "hari ini" emas berteks tinta; lencana contoh bergaris putus-putus daun emas di kertas emas.
- **State:** chip terpilih bergaris 2px; di Kontras Tinggi semua chip bergaris 2px hitam.

### Cards / Containers
- **Corner Style:** 0.875rem.
- **Background:** kertas putih; versi info memakai kabut genteng; panel istimewa memakai langit malam atau langit Subuh dengan bingkai iluminasi.
- **Shadow Strategy:** Elev 2 (lihat Elevation & Depth).
- **Border:** 1px garis batu; 2px hitam di Kontras Tinggi.
- **Internal Padding:** 1.5rem, 2rem mulai 40rem.
- Ikon kartu duduk di lingkaran kabut genteng 48-56px dengan cincin daun emas 35%.

### Inputs / Fields
- **Style:** kertas putih, garis 2px batu tua (3:1), sudut kontrol, tinggi minimal 56px, teks 1.25rem. Label terlihat di atas dengan keterangan "(wajib)" atau "(boleh dikosongkan)", bantuan di bawah label.
- **Focus:** cincin fokus global 4px.
- **Error:** garis merah bata dan pesan merah tebal dengan ikon di bawah isian. Pilihan ganda memakai kartu pilihan; yang terpilih bergaris 4px biru genteng di atas kabut genteng.

### Navigation
- **Style:** bilah biru malam di bawah kepala halaman, dipisah garis emas tipis; tujuh butir dengan ikon emas di atas label putih tebal 1.125rem, tinggi minimal 56px.
- **Hover / Focus:** garis emas 2px tumbuh dari tengah di bawah label (240ms).
- **Mobile:** navigasi atas disembunyikan di bawah 80rem dan di Tampilan Sederhana; Menu Utama di halaman menjadi daftar baris bergaris daun emas dengan lingkaran ikon, label biru genteng, petunjuk abu batu, dan chevron emas.

### Kepala Surat (signature)
Judul bagian inti di dalam kartus kertas emas bergaris daun emas, diapit garis baji emas dan StarMark. Garis "tergambar" dari judul ke luar saat bagian masuk layar (CSS scroll-driven, `entry 5% cover 35%`). Di ponsel hanya kartus yang tampil. Kepala ringan untuk bagian pendukung: judul rata kiri, StarMark, garis emas memudar ke kanan. Kontras Tinggi dan Tampilan Sederhana menjadikan kartus judul polos.

### Adegan Fajar MRPI (signature)
Ilustrasi SVG MRPI (menara jarum, atap limas tiga tingkat bergenteng biru, dinding batu bertuliskan nama) dengan palet adegan sendiri (`--scene-*`) dalam empat lapis parallax: gulir (scroll-driven, 20vh/13vh/8vh) dan penunjuk (6-24px, transisi 1.4s, hanya perangkat bermouse). Di layar 64rem ke atas cahaya fajar menguat sekali saat dibuka (2.8s) dan selesai di bawah 5 detik. Siluet MRPI yang lebih kecil (`.terbit`) naik dari balik cakrawala di panel infak dan kaki halaman. Tersembunyi di Kontras Tinggi dan Tampilan Sederhana.

### Pemisah dan Rosette
Pemisah: garis emas pendek, StarMark, garis emas memudar; di bawah judul beranda dan judul layar panel. Rosette: penanda akhir ayat (lingkaran plus bintang delapan) berisi angka, hanya untuk urutan yang bermakna (langkah Zoom, butir misi); butir daftar biasa memakai belah ketupat.

## Do's and Don'ts

### Do:
- **Do** pakai peran semantik dari `app/globals.css` untuk setiap warna baru, dan tambahkan nilainya di blok Kontras Tinggi.
- **Do** jaga tinggi minimal 56px untuk tombol, isian, dan tautan berbentuk tombol.
- **Do** tulis ukuran dalam rem agar ikut lima ukuran Atur Tampilan, dan uji di ukuran Terbesar (162,5%) di ponsel.
- **Do** beri setiap hiasan baru jalan keluar di Kontras Tinggi dan Tampilan Sederhana (`hc:hidden`, `simple:hidden`).
- **Do** pakai kepala "surat" untuk bagian inti dan kepala "ringan" untuk bagian pendukung.
- **Do** pakai `--dur-hover` (160ms), `--dur-state` (240ms), dan `--ease-out-expo` untuk transisi kontrol; gerak lain hormati "kurangi gerakan".
- **Do** pakai `overflow: clip`, bukan `hidden`, pada pembungkus bagian yang punya gerak scroll-driven.

### Don't:
- **Don't** pakai emas (gilt atau gold) sebagai warna teks di latar terang.
- **Don't** pasang bingkai iluminasi atau Rosette pada setiap kartu; keduanya hanya untuk panel istimewa dan urutan bermakna.
- **Don't** naikkan opacity pola girih di atas 7%.
- **Don't** beri animasi masuk pada kartu dan isi; isi selalu tampil utuh, gerak gulir hanya untuk garis kepala surat dan siluet terbit.
- **Don't** taruh label kecil atau eyebrow di atas judul bagian.
- **Don't** pakai slider foto, hijau-emas generik, atau deret kartu seragam sebagai struktur halaman.
