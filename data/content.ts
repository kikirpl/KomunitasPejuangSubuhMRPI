import type {
  AnnouncementData,
  ContactInfo,
  DonationInfo,
  FeaturedVideo,
  ScheduleData,
  ZoomInfo,
} from "@/types";

/* ==========================================================================
 * data/content.ts: berkas utama yang perlu diubah pengurus untuk
 * mengganti isi situs (jadwal, Zoom, video, rekening, pengumuman, kontak).
 * Isi "Tentang Kami" ada di data/profile.ts; Ayat Pekan Ini di data/ayatPekan.ts.
 *
 * PENTING: semua isi di bawah ini masih DATA CONTOH. Ganti dengan data resmi,
 * lalu ubah `isSample: true` menjadi `isSample: false` pada tiap bagian agar
 * lencana "Contoh data, belum resmi" hilang dari halaman.
 * ========================================================================== */

export const COMMUNITY = {
  name: "Pejuang Subuh",
  mosque: "Masjid Raya Pondok Indah",
  mosqueShort: "MRPI",
} as const;

/* ------------------------------- Jadwal kajian ------------------------------ */
/* day: 0 = Ahad, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu */
/* Jam memakai format 24 jam dan zona waktu WIB. mode: "masjid" | "zoom" | "hybrid" */
/* imageUrl: opsional. Simpan gambar di public/kajian/ lalu tulis "/kajian/senin.jpg" (rasio 16:9 paling pas). */
/*           Tampil di Jadwal Sepekan, dan di Kajian Hari Ini pada harinya. Tanpa imageUrl dipakai gambar pengganti. */
/* imageAlt: opsional, keterangan gambar untuk pembaca layar. */
export const SCHEDULE: ScheduleData = {
  isSample: true,
  sessions: [
    {
      id: "senin",
      day: 1,
      startTime: "05:00",
      endTime: "06:00",
      ustadz: "Ustadz Fulan A",
      topic: "Tafsir Juz 'Amma",
      mode: "hybrid",
      location: "Ruang utama masjid",
    },
    {
      id: "selasa",
      day: 2,
      startTime: "05:00",
      endTime: "06:00",
      ustadz: "Ustadz Fulan B",
      topic: "Fiqih Ibadah Sehari-hari",
      mode: "masjid",
      location: "Ruang utama masjid",
    },
    {
      id: "rabu",
      day: 3,
      startTime: "05:00",
      endTime: "06:00",
      ustadz: "Ustadz Fulan C",
      topic: "Hadits Arba'in",
      mode: "hybrid",
      location: "Ruang utama masjid",
    },
    {
      id: "kamis",
      day: 4,
      startTime: "05:00",
      endTime: "06:00",
      ustadz: "Ustadz Fulan A",
      topic: "Akhlak dan Adab Sehari-hari",
      mode: "masjid",
      location: "Ruang utama masjid",
    },
    {
      id: "jumat",
      day: 5,
      startTime: "05:00",
      endTime: "06:30",
      ustadz: "Ustadz Fulan D",
      topic: "Sirah Nabawiyah, dilanjut sarapan bersama",
      mode: "hybrid",
      location: "Ruang utama masjid",
    },
    {
      id: "sabtu",
      day: 6,
      startTime: "05:00",
      endTime: "06:00",
      ustadz: "Ustadz Fulan B",
      topic: "Tadabbur Al-Qur'an",
      mode: "hybrid",
      location: "Ruang utama masjid",
    },
    {
      id: "ahad",
      day: 0,
      startTime: "05:30",
      endTime: "06:30",
      ustadz: "Ustadz Fulan C",
      topic: "Keluarga Sakinah",
      mode: "masjid",
      location: "Ruang utama masjid",
    },
  ],
};

/* ---------------------------------- Zoom ---------------------------------- */
export const ZOOM: ZoomInfo = {
  isSample: true,
  meetingUrl: "https://zoom.us/j/0000000000",
  meetingId: "000 0000 0000",
  passcode: "000000",
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
  isSample: true,
  title: "Keutamaan Shalat Subuh Berjamaah",
  ustadz: "Ustadz Fulan A",
  youtubeId: "ID_VIDEO_1",
};

/* ----------------------------- Donasi (tanpa konfirmasi) ----------------------------- */
/* Letakkan gambar QRIS asli di folder public/, lalu ubah imageSrc (contoh: "/qris.png"). */
export const DONATION: DonationInfo = {
  isSample: true,
  qris: {
    imageSrc: "/qris-contoh.svg",
    imageAlt: "Kode QRIS donasi Masjid Raya Pondok Indah",
    width: 640,
    height: 640,
    merchantName: "DKM Masjid Raya Pondok Indah",
  },
  bankAccounts: [
    {
      id: "bsi",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "0000000000",
      accountHolder: "DKM Masjid Raya Pondok Indah",
    },
  ],
};

/* ---------------------------------- Pengumuman ---------------------------------- */
/*
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
  isSample: true,
  items: [
    /*
     * CATATAN KLASIFIKASI: data lama belum punya jenis. Keempat butir di bawah
     * diklasifikasikan "kegiatan" karena semuanya acara bertanggal yang dihadiri
     * jamaah. Belum ada butir "pengumuman", jadi tab Pengumuman menampilkan
     * "Belum ada pengumuman." Mohon dicek pengurus.
     * Jam, tempat, dan rincian lama tidak lagi ditampilkan di kartu baru.
     */
    {
      id: "a1",
      type: "kegiatan", // diklasifikasikan dari isi: acara Subuh berjamaah + sarapan
      title: "Subuh berjamaah dan sarapan bersama",
      date: "2026-10-09",
      excerpt:
        "Jumat berkah: shalat Subuh berjamaah, kajian singkat, lalu sarapan bersama para jamaah.",
    },
    {
      id: "a2",
      type: "kegiatan", // diklasifikasikan dari isi: acara jalan sehat
      title: "Jalan sehat Pejuang Subuh",
      date: "2026-10-11",
      excerpt:
        "Jalan santai bersama mengelilingi kawasan sekitar masjid. Rute pendek dan ramah untuk lansia.",
    },
    {
      id: "a3",
      type: "kegiatan", // diklasifikasikan dari isi: acara penyerahan santunan
      title: "Santunan anak yatim dan dhuafa",
      date: "2026-10-16",
      excerpt: "Penyerahan santunan kepada anak yatim dan dhuafa di sekitar masjid.",
    },
    {
      id: "a4",
      type: "kegiatan", // diklasifikasikan dari isi: acara kerja bakti
      title: "Kerja bakti membersihkan masjid",
      date: "2026-10-17",
      excerpt:
        "Membersihkan dan merapikan masjid bersama-sama. Setiap bantuan, sekecil apa pun, sangat berarti.",
    },
  ],
};

/* ------------------------------------ Kontak ------------------------------------ */
/* whatsappNumber: awali dengan 62 (tanpa 0 dan tanpa +). Contoh: 6281234567890 */
export const CONTACT: ContactInfo = {
  isSample: true,
  mosqueName: "Masjid Raya Pondok Indah",
  addressLines: ["Masjid Raya Pondok Indah", "Kawasan Pondok Indah, Jakarta Selatan"],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Masjid+Raya+Pondok+Indah+Jakarta",
  phoneDisplay: "(021) 000-0000",
  phoneTel: "+62210000000",
  whatsappNumber: "6281200000000",
  whatsappMessage:
    "Assalamualaikum, saya ingin bertanya tentang jadwal kajian Pejuang Subuh di Masjid Raya Pondok Indah.",
};
