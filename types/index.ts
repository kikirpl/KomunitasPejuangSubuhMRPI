/* ==========================================================================
 * types/index.ts
 * Seluruh tipe data website "Pejuang Subuh - Masjid Raya Pondok Indah".
 * Dikelompokkan per fitur: API Al Quran Cloud, Ayat Pekan Ini, Jadwal, Zoom, Video,
 * Donasi, Profil, Pengumuman, Kontak, Aksesibilitas, dan Toast.
 * ========================================================================== */

/* -------------------------------------------------------------------------
 * 1. API Al Quran Cloud (https://alquran.cloud/api)
 *    GET {BASE}/ayah/{nomor}/editions/quran-uthmani,id.indonesian,ar.alafasy
 *      -> { code: 200, status: "OK", data: QuranCloudAyahEdition[] }
 *    GET {BASE}/ayah/1/quran-uthmani
 *      -> { code: 200, status: "OK", data: QuranCloudAyahEdition }
 *    Hanya kolom yang dipakai situs ini yang diwajibkan; respons divalidasi
 *    di lib/quranCloud.ts sebelum dipakai.
 * ----------------------------------------------------------------------- */

export interface QuranCloudEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface QuranCloudSurah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export interface QuranCloudAyahEdition {
  /** Nomor ayat global 1-6236. */
  number: number;
  text: string;
  numberInSurah: number;
  surah: QuranCloudSurah;
  edition: QuranCloudEdition;
  /** Hanya pada edisi audio (mis. ar.alafasy): MP3 128 kbps. */
  audio?: string | null;
  /** Hanya pada edisi audio: daftar URL cadangan (64 kbps). */
  audioSecondary?: string[] | null;
}

export interface QuranCloudResponse<T> {
  code: number;
  status: string;
  data: T;
}

/* -------------------------------------------------------------------------
 * 2. Ayat pekan ini (bahan tadabbur Ahad pagi)
 * ----------------------------------------------------------------------- */

/** Rujukan satu ayat: nomor surat (1-114) dan nomor ayat dalam surat. */
export interface RujukanAyat {
  surah: number;
  ayat: number;
}

/** Satu ayat yang sudah dinormalisasi untuk kartu (dari API atau data cadangan). */
export interface AyahData {
  /** Nomor ayat global 1-6236 (urutan mushaf), mis. 2117 = QS. Al-Isra: 88. */
  nomorGlobal: number;
  surah: {
    nomor: number;
    /** Nama Latin gaya Kemenag, mis. "Al-Isra". */
    nama: string;
    jumlahAyat: number;
  };
  nomorAyat: number;
  /** Teks Arab ayat, tanpa awalan Basmalah. */
  teksArab: string;
  /**
   * Basmalah pembuka yang dipisahkan dari teks ayat 1 sebuah surat (selain
   * Al-Fatihah dan At-Taubah). Ditampilkan sebagai baris pembuka tersendiri.
   */
  basmalah: string | null;
  terjemahan: string;
  /** Murottal 128 kbps; null = tombol audio disembunyikan. */
  audioUrl: string | null;
  /** Murottal cadangan (64 kbps), dicoba sekali bila audioUrl gagal. */
  audioFallbackUrl: string | null;
}

export type SumberAyat = "api" | "cadangan";

export interface EdisiInfo {
  identifier: string;
  nama: string;
}

/** Balasan GET /api/ayat?week=YYYY-MM-DD bila berhasil. */
export interface AyatPekanResponse {
  /** Tanggal Senin pekan itu. */
  senin: string;
  /** Lima nomor ayat global pekan itu. */
  nomor: number[];
  sumber: SumberAyat;
  ayat: AyahData[];
  /** Edisi terjemahan dari API (untuk atribusi). null pada data cadangan. */
  terjemahan: EdisiInfo | null;
  /** Pesan sopan untuk ditampilkan (mis. saat memakai data cadangan). */
  pesan: string | null;
}

/** Balasan GET /api/ayat bila gagal (status 4xx/5xx). */
export interface AyatPekanErrorResponse {
  pesan: string;
}

/** Ayat cadangan yang disimpan di kode (data/ayatPekan.ts). */
export interface AyatCadangan extends RujukanAyat {
  nomorGlobal: number;
  arab: string;
  terjemahan: string;
  audioUrl?: string;
  audioFallbackUrl?: string;
}

/**
 * Penimpa pola otomatis untuk satu pekan (kunci = tanggal Senin pekan itu).
 * Isi dengan nomor ayat global `{ nomor: 2141 }` ATAU surat dan ayat `{ surah: 18, ayat: 1 }`.
 * Bawaan: pekan-pekan berikutnya melanjutkan dari ayat ini.
 * `hanyaPekanIni: true` = khusus pekan itu saja, lalu kembali ke pola semula.
 */
export type OverrideAyatPekan = ({ nomor: number } | RujukanAyat) & {
  hanyaPekanIni?: boolean;
};

export interface AyatPekanConfig {
  /** Titik acuan: pekan yang dimulai Senin `senin` berawal di nomor ayat global `nomor`. */
  acuan: { senin: string; nomor: number };
  override: Record<string, OverrideAyatPekan>;
}

/* -------------------------------------------------------------------------
 * 3. Jadwal kajian
 * ----------------------------------------------------------------------- */

/** 0 = Ahad, 1 = Senin, ... 6 = Sabtu (sama dengan Date.getDay()). */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type SessionMode = "masjid" | "zoom" | "hybrid";

export interface StudySession {
  id: string;
  day: DayIndex;
  /** Format 24 jam "HH:mm", zona waktu WIB. */
  startTime: string;
  endTime: string;
  ustadz: string;
  topic: string;
  mode: SessionMode;
  location?: string;
  /**
   * Gambar kajian (rasio 16:9 disarankan), tampil di kartu Jadwal Sepekan dan di
   * Kajian Hari Ini. Berkas lokal: simpan di public/kajian/ lalu tulis
   * "/kajian/nama-berkas.jpg". Kosongkan untuk memakai gambar pengganti.
   */
  imageUrl?: string;
  /**
   * Teks alternatif gambar untuk pembaca layar, mis. "Ustadz sedang menyampaikan
   * kajian di ruang utama masjid". Kosongkan bila gambar hanya hiasan.
   */
  imageAlt?: string;
}

export interface ScheduleData {
  /** true = data contoh; tampilkan lencana "Data contoh" di halaman. */
  isSample?: boolean;
  sessions: StudySession[];
}

/* -------------------------------------------------------------------------
 * 4. Zoom, video, donasi
 * ----------------------------------------------------------------------- */

export interface ZoomSlot {
  label: string;
  time: string;
}

export interface ZoomInfo {
  isSample?: boolean;
  meetingUrl: string;
  meetingId: string;
  passcode: string;
  slots: ZoomSlot[];
  note?: string;
}

/** Satu video kajian yang ditampilkan di bagian Rekaman Kajian. */
export interface FeaturedVideo {
  isSample?: boolean;
  title: string;
  ustadz: string;
  /** ID video YouTube (11 karakter), misalnya "dQw4w9WgXcQ". */
  youtubeId: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface QrisInfo {
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
  merchantName: string;
}

export interface DonationInfo {
  isSample?: boolean;
  qris: QrisInfo;
  bankAccounts: BankAccount[];
}

/* -------------------------------------------------------------------------
 * 5. Profil, pengumuman, dan kontak
 * ----------------------------------------------------------------------- */

/** Satu angka sorotan di blok "Sekilas Profil" (hanya angka yang tertulis di teks profil). */
export interface ProfileHighlight {
  /** Angka/teks besar, mis. "900+". */
  nilai: string;
  /** Keterangan di bawah angka. */
  keterangan: string;
}

/** Butir berbentuk "Judul: isi" (dipakai Misi Utama dan Divisi Operasional). */
export interface ProfileTitledPoint {
  judul: string;
  isi: string;
}

/** Nama ikon SVG untuk tiap pilar (digambar di components/ProfileIcons.tsx). */
export type PillarIcon = "masjid" | "quran" | "peduli" | "global";

export interface ProfilePillar {
  /** Nama pilar, mis. "Makmurkan Masjid". */
  judul: string;
  /** Bidang dalam kurung pada teks asli, mis. "Ibadah & Spiritual". */
  bidang: string;
  ikon: PillarIcon;
  poin: string[];
}

/** Seluruh isi section "Tentang Kami" (id="profil"). */
export interface ProfileContent {
  sekilas: { judul: string; paragraf: string[]; sorotan: ProfileHighlight[] };
  visi: { judul: string; poin: string[] };
  misi: { judul: string; poin: ProfileTitledPoint[] };
  pilar: { judul: string; poin: ProfilePillar[] };
  divisi: { judul: string; poin: ProfileTitledPoint[] };
}

/** Jenis isi di section Pengumuman: menentukan tab tempat kartu tampil. */
export type AnnouncementType = "kegiatan" | "pengumuman";

export interface AnnouncementItem {
  id: string;
  type: AnnouncementType;
  title: string;
  /**
   * Tanggal ISO 8601. Cukup "YYYY-MM-DD", atau sertakan jam WIB
   * "YYYY-MM-DDTHH:mm:00+07:00" agar jamnya ikut ditampilkan.
   */
  date: string;
  /** Ringkasan; di kartu dipotong maksimal 3 baris. */
  excerpt: string;
  /**
   * Foto kartu (rasio 16:9 disarankan). Berkas lokal: simpan di public/kegiatan/
   * lalu tulis "/kegiatan/nama-berkas.jpg". Kosongkan untuk memakai gambar pengganti.
   */
  imageUrl?: string;
  /**
   * Teks alternatif foto untuk pembaca layar, mis. "Jamaah sarapan bersama di
   * serambi masjid". Kosongkan bila foto hanya hiasan.
   */
  imageAlt?: string;
  /** Tautan "Selengkapnya" (opsional). */
  href?: string;
}

export interface AnnouncementData {
  isSample?: boolean;
  items: AnnouncementItem[];
}

export interface ContactInfo {
  isSample?: boolean;
  mosqueName: string;
  addressLines: string[];
  mapsUrl: string;
  phoneDisplay: string;
  /** Format untuk tautan tel:, contoh "+62210000000". */
  phoneTel: string;
  /** Nomor WhatsApp admin, format internasional tanpa "+", contoh "628123456789". */
  whatsappNumber: string;
  whatsappMessage: string;
  officeHours?: string;
}

/* -------------------------------------------------------------------------
 * 6. Aksesibilitas dan toast
 * ----------------------------------------------------------------------- */

/** 0 = kecil, 1 = normal (bawaan), 2 = besar, 3 = lebih besar, 4 = terbesar. */
export type TextScaleLevel = 0 | 1 | 2 | 3 | 4;

export interface AccessibilitySettings {
  textScale: TextScaleLevel;
  highContrast: boolean;
  simpleLayout: boolean;
}

export interface TextScaleOption {
  level: TextScaleLevel;
  /** Persentase terhadap ukuran huruf bawaan peramban. */
  percent: number;
  label: string;
}

export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}
