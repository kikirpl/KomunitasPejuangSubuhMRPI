import type {
  AnnouncementData,
  ContactInfo,
  DonationInfo,
  FeaturedVideo,
  ScheduleData,
  ZoomInfo,
} from "@/types";

/* ==========================================================================
 * data/content.ts: isi situs yang masih diubah lewat kode (Zoom, video, rekening, kontak).
 * Isi "Tentang Kami" ada di data/profile.ts; Ayat Pekan Ini di data/ayatPekan.ts.
 *
 * JADWAL KAJIAN dan KEGIATAN/PENGUMUMAN (SCHEDULE dan ANNOUNCEMENTS) kini diubah
 * lewat Panel Pengurus (/admin), bukan di berkas ini. Isi keduanya di sini hanya
 * DATA AWAL (disalin ke database saat tombol "Siapkan database" ditekan) dan
 * CADANGAN (dipakai web selama database belum dipasang atau belum disiapkan).
 * Penanda "contoh/resmi" kedua bagian itu juga diatur di panel.
 *
 * PENTING: semua isi di bawah ini masih DATA CONTOH. Ganti dengan data resmi,
 * lalu ubah `isSample: true` menjadi `isSample: false` pada tiap bagian yang
 * diubah lewat kode (Zoom, video, donasi, kontak) agar lencana "Contoh data,
 * belum resmi" hilang dari halaman.
 * ========================================================================== */

export const COMMUNITY = {
  name: "Komunitas Pejuang Subuh",
  mosque: "Masjid Raya Pondok Indah",
  mosqueShort: "MRPI",
} as const;

/* ------------------------------- Jadwal kajian ------------------------------ */
/* DATA AWAL dan CADANGAN: jadwal sebenarnya diubah lewat Panel Pengurus (/admin). Berkas ini dipakai hanya saat */
/* "Siapkan database" pertama kali, atau selama database belum dipasang. */
/* day: 0 = Ahad, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu */
/* Jam memakai format 24 jam dan zona waktu WIB. mode: "masjid" | "zoom" | "hybrid" */
/* imageUrl: opsional. Simpan gambar di public/kajian/ lalu tulis "/kajian/senin.jpg" (rasio 16:9 paling pas). */
/*           Tampil di Jadwal Sepekan, dan di Kajian Hari Ini pada harinya. Tanpa imageUrl dipakai gambar pengganti. */
/* imageAlt: opsional, keterangan gambar untuk pembaca layar. */
export const SCHEDULE: ScheduleData = {
  isSample: false,
  sessions: [
    {
      id: "selasa",
      day: 2,
      startTime: "05:15",
      endTime: "06:45",
      ustadz: "Bapak Ahmad Susilo",
      topic: "Bedah Kitab Tauhid. Sesi 31",
      mode: "masjid",
      location: "Ruang utama masjid",
      imageAlt: "ustad",
      imageUrl: "/kajian/selasa.jpeg",
    },
    {
      id: "jumat",
      day: 5,
      startTime: "05:15",
      endTime: "07:15",
      ustadz: "Bapak Arief Gunawan. SAg. MPd.",
      topic: "",
      mode: "hybrid",
      location: "Ruang utama masjid",
      imageAlt: "ustad",
      imageUrl: "/kajian/jumat.jpeg",
    },
    {
      id: "sabtu",
      day: 6,
      startTime: "05:15",
      endTime: "06:45",
      ustadz: "Bapak Dr. Ahmad Sarwat. Lc. MA.",
      topic: "",
      mode: "hybrid",
      location: "MRPI",
      imageAlt: "ustad",
      imageUrl: "/kajian/rabu.jpeg",
    },
    {
      id: "ahad",
      day: 0,
      startTime: "05:15",
      endTime: "06:45",
      ustadz: "Bapak Dr. Haris Hakam. MA.",
      topic: "Tadabbur Surat Al Israa' 17 Ayat 94-98",
      mode: "hybrid",
      location: "MRPI",
      imageAlt: "ustad",
      imageUrl: "/kajian/minggu.jpeg",
    },
  ],
};

/* ---------------------------------- Zoom ---------------------------------- */
export const ZOOM: ZoomInfo = {
  isSample: false,
  meetingUrl: "https://bit.ly/kajianpsmrpi",
  meetingId: "988 0693 3810",
  passcode: "1730114",
  slots: [
    { label: "Senin sampai Sabtu", time: "05.00 WIB" },
    { label: "Ahad", time: "05.30 WIB" },
  ],
  note: "Kajian disiarkan langsung dari masjid. Mohon matikan suara mikrofon selama kajian berlangsung.",
};

/* ----------------------------- Video kajian (YouTube) ----------------------------- */
/* Satu video utama. youtubeId = 11 karakter di akhir alamat video, contoh: youtube.com/watch?v=XXXXXXXXXXX */
/* Tautan TikTok, Instagram, YouTube, dan Grup WhatsApp ada di bagian atas components/VideoGallery.tsx. */
export const VIDEO: FeaturedVideo = {
  isSample: false,
  title: "BELAJAR MELIHAT MUKJIZAT AL-QURAN",
  ustadz: "Ustadz Donny Amir Sagaf",
  youtubeId: "r_rHJWwhrEE",
};

/* ----------------------------- Donasi (tanpa konfirmasi) ----------------------------- */
/* Letakkan gambar QRIS asli di folder public/, lalu ubah imageSrc (contoh: "/qris.png"). */
export const DONATION: DonationInfo = {
  isSample: false,
  qris: {
    imageSrc: "/qris2.jpeg",
    imageAlt: "Kode QRIS donasi Masjid Raya Pondok Indah",
    width: 640,
    height: 640,
    merchantName: "Donasi Pejuang Subuh MRPI",
  },
  bankAccounts: [
    {
      id: "bsi",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "(451) 811 1730 114",
      accountHolder: "Komunitas Pejuang Subuh MRP",
    },
  ],
};

/* ---------------------------------- Pengumuman ---------------------------------- */
/*
 * DATA AWAL dan CADANGAN: kegiatan dan pengumuman sebenarnya diubah lewat Panel Pengurus (/admin).
 * Berkas ini dipakai hanya saat "Siapkan database" pertama kali, atau selama database belum dipasang.
 *
 * Isi section "Pengumuman Kegiatan", dibagi dua tab:
 *   type: "kegiatan"   -> acara yang dihadiri jamaah (tab Kegiatan)
 *   type: "pengumuman" -> informasi/pemberitahuan (tab Pengumuman)
 * date:     ISO, contoh "2026-10-09" atau "2026-10-09T05:00:00+07:00" (dengan jam WIB).
 * excerpt:  ringkasan singkat (di kartu dipotong maksimal 3 baris).
 * imageUrl: opsional. Simpan foto di public/kegiatan/ lalu tulis "/kegiatan/nama.jpg".
 *           Tanpa imageUrl, kartu memakai gambar pengganti (gradien + ikon).
 * imageAlt: opsional, keterangan foto untuk pembaca layar.
 * href:     opsional, tautan "Selengkapnya".
 * Urutan di halaman otomatis: tanggal terbaru lebih dulu.
 */
export const ANNOUNCEMENTS: AnnouncementData = {
  isSample: false,
  items: [
    /*
     * Kegiatan Dakwah & Sosial: program tetap komunitas, bukan acara sekali jalan. Kartu wajib
     * bertanggal, jadi kelimanya diberi tanggal yang sama dan tampil sesuai urutan id (a1 sampai a5).
     * Ringkasan hanya menjelaskan judul; mohon dilengkapi pengurus (jadwal, syarat penerima, kontak).
     */
    {
      id: "a1",
      type: "kegiatan",
      title: "Pengajian online dan offline 5 kali setiap minggu",
      date: "2026-10-10",
      excerpt: "Pengajian rutin 5 kali setiap minggu, bisa diikuti langsung di masjid maupun secara daring.",
        imageAlt: "pengajian",
      imageUrl: "/kegiatan/pendidikan.jpg",
    },
    {
      id: "a2",
      type: "kegiatan",
      title: "Bantuan pemakaman jenazah untuk dhuafa",
      date: "2026-10-10",
      excerpt: "Membantu pengurusan pemakaman jenazah bagi keluarga dhuafa.",
      imageAlt: "pengajian",
      imageUrl: "/kegiatan/kuburan.jpg",
    },
    {
      id: "a3",
      type: "kegiatan",
      title: "Bantuan pendidikan untuk anak yatim dan dhuafa",
      date: "2026-10-10",
      excerpt: "Bantuan pendidikan bagi anak yatim dan dhuafa agar tetap dapat belajar.",
      imageAlt: "pengajian",
      imageUrl: "/kegiatan/pendidikan.jpg",
    },
    {
      id: "a4",
      type: "kegiatan",
      title: "Bantuan pengobatan untuk dhuafa",
      date: "2026-10-10",
      excerpt: "Membantu kebutuhan pengobatan bagi dhuafa yang membutuhkan.",
      imageAlt: "pengajian",
      imageUrl: "/kegiatan/pendidikan.jpg",
    },
    {
      id: "a5",
      type: "kegiatan",
      title: "Bantuan bencana alam",
      date: "2026-10-10",
      excerpt: "Penyaluran bantuan bagi saudara-saudara yang terdampak bencana alam.",
      imageAlt: "pengajian",
      imageUrl: "/kegiatan/kuburan.jpg",
    },
  ],
};

/* ------------------------------------ Kontak ------------------------------------ */
/* whatsappNumber: awali dengan 62 (tanpa 0 dan tanpa +). Contoh: 6281234567890 */
export const CONTACT: ContactInfo = {
  isSample: false,
  mosqueName: "Masjid Raya Pondok Indah",
  addressLines: ["Masjid Raya Pondok Indah", "Kawasan Pondok Indah, Jakarta Selatan"],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Masjid+Raya+Pondok+Indah+Jakarta",
  phoneDisplay: "08111730114",
  phoneTel: "+628111730114",
  whatsappNumber: "628111730114",
  whatsappMessage:
    "Assalamualaikum, saya ingin bertanya tentang jadwal kajian Pejuang Subuh di Masjid Raya Pondok Indah.",
};
