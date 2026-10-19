# Product

<!-- impeccable:product-schema 1 -->

> Disusun dari isi repositori dan brief pemilik (Oktober 2026). Pemilik meminta langsung dikerjakan tanpa sesi tanya-jawab, jadi butir bertanda *(disimpulkan)* adalah kesimpulan, bukan jawaban yang sudah dikonfirmasi.

## Platform

web

## Users

- Jamaah Komunitas Pejuang Subuh Masjid Raya Pondok Indah (MRPI), Jakarta Selatan. Banyak yang berusia lanjut dan membuka situs dari HP dengan jaringan yang tidak selalu bagus *(disimpulkan dari README: "jamaah lansia", ukuran tulisan dasar 18px, bilah Atur Tampilan)*.
- Situasi umum: mengecek kajian hari ini sebelum Subuh atau dari rumah, membuka Zoom, membaca ayat pekan ini, berinfak lewat QRIS atau transfer, dan melihat pengumuman kegiatan.
- Pengurus komunitas memakai Panel Pengurus (`/admin`) untuk mengubah jadwal, pengecualian tanggal, serta kegiatan dan pengumuman.

## Product Purpose

Satu halaman yang memudahkan jamaah mengikuti kegiatan Subuh di MRPI, hadir langsung atau lewat Zoom, dan berinfak tanpa formulir. Berhasil bila jamaah lansia bisa menemukan jadwal, membuka Zoom, atau menyalin nomor rekening dalam beberapa ketukan tanpa bantuan.

## Positioning

Situs komunitas Subuh milik satu masjid tertentu, Masjid Raya Pondok Indah (dijuluki "Masjid Biru", diresmikan 4 Desember 1992): atap limas bersusun berlapis genteng glasir biru, menara beton runcing sekitar 50 m, dan dinding batu di pelataran. Bukan portal masjid generik.

## Operating Context

- Kajian Subuh rutin dengan jadwal sepekan dan pengecualian per tanggal (libur atau pengganti), diatur pengurus.
- Ayat Pekan Ini: lima ayat per pekan dari Al Quran Cloud, dengan murottal.
- Kajian daring lewat Zoom, rekaman lewat YouTube, grup WhatsApp komunitas.
- Infak lewat QRIS dan rekening BSI; sengaja tanpa formulir dan tanpa konfirmasi.
- Semua jam memakai WIB; nama hari memakai "Ahad".

## Capabilities and Constraints

- Next.js 16 (App Router) + Tailwind CSS v4, Server Components kecuali bagian interaktif. Data dinamis dari Neon/Postgres lewat Panel Pengurus, dengan cadangan `data/content.ts`.
- Bilah Atur Tampilan (ukuran tulisan 5 tingkat, Kontras Tinggi, Tampilan Sederhana) disimpan di peramban dan harus tetap bekerja.
- Tidak ada fitur jadwal sholat, galeri, berita, atau mode gelap; jangan ditambahkan tanpa keputusan pemilik.
- Perubahan desain tidak boleh mengubah fitur, route, API, data, perilaku form, autentikasi, atau teks bermakna.

## Brand Commitments

- Logo resmi komunitas: `public/logo.png` dan `app/icon.png`.
- Rupa masjid harus setia pada MRPI yang asli (acuan: foto dari pemilik); arsitektur tidak boleh dikarang.
- Adab: suasana tenang, hormat, dan elegan; tanpa figur makhluk bernyawa sebagai hiasan; kaligrafi hanya teks sahih dari pemilik.
- Bahasa Indonesia yang sopan dan sederhana ("Bapak dan Ibu").

## Evidence on Hand

- Foto asli MRPI dari pemilik (850x583 px, langit mendung), dipakai sebagai acuan bentuk dan warna; izin pakai fotonya sendiri belum dikonfirmasi, jadi tidak ditayangkan.
- Lukisan MRPI milik komunitas: `public/beranda/masjid-raya-pondok-indah.jpg`.
- Poster kajian resmi: `public/kajian/*.jpeg`; foto kegiatan: `public/kegiatan/*.jpg`.
- Belum ada: foto resolusi tinggi, foto interior, foto Subuh/golden hour, model 3D.

## Product Principles

1. Lansia dulu: tulisan besar, kontras tinggi, target sentuh besar, satu langkah per tindakan.
2. Tindakan utama (jadwal, Zoom, salin rekening) selalu terlihat dan terjangkau.
3. Khusyuk sebelum ramai: hiasan dan gerak sedikit, bermakna, dan bisa dimatikan.
4. Kebenaran di atas kesan: jadwal, rekening, ayat, dan rupa masjid tidak boleh dikarang.

## Accessibility & Inclusion

WCAG 2.2 AA minimum; teks diukur minimal 4,5:1 per piksel; tulisan dasar 18px; target sentuh minimal 44px (kebanyakan 56px); fokus terlihat; `prefers-reduced-motion` dihormati; mode Kontras Tinggi dan Tampilan Sederhana harus tetap bekerja di seluruh halaman.
