import type { AyatCadangan, AyatPekanConfig } from "@/types";

/* ==========================================================================
 * AYAT PEKAN INI: bahan tadabbur Al-Qur'an pada kajian Ahad pagi.
 *
 * Pola otomatis (tidak perlu diubah tiap pekan):
 * - Pekan dihitung Senin sampai Ahad, memakai tanggal WIB (Asia/Jakarta).
 * - Memakai NOMOR AYAT GLOBAL (1-6236, urutan mushaf). Pekan yang dimulai Senin
 *   `acuan.senin` berawal di nomor `acuan.nomor` (2117 = QS. Al-Isra: 88).
 * - Setiap pekan maju 5 nomor: awal = 2117 + 5 x indeksPekan. Batas surat
 *   terlewati otomatis (2137-2141 = Al-Isra 108-111 lalu Al-Kahf 1). Setelah
 *   6236 (An-Nas: 6) kembali ke 1 (Al-Fatihah: 1).
 * - Senin = ayat ke-1, Selasa = ke-2, Rabu = ke-3, Kamis = ke-4, Jumat = ke-5.
 *   Sabtu dan Ahad = muraja'ah (mengulang kelima ayat pekan itu).
 * ========================================================================== */
export const AYAT_PEKAN_CONFIG: AyatPekanConfig = {
  acuan: { senin: "2026-10-05", nomor: 2117 },

  /*
   * PENIMPA POLA (override), dipakai bila jadwal tadabbur berubah.
   * Kunci = tanggal SENIN pekan yang ingin diubah, format "TAHUN-BULAN-TANGGAL".
   * Nilai = ayat PERTAMA pekan itu, boleh salah satu bentuk:
   *           { nomor: 2132 }            nomor ayat global, atau
   *           { surah: 17, ayat: 103 }   nomor surat dan ayat.
   *         4 ayat berikutnya mengikuti urutan mushaf.
   * Bawaan: pekan-pekan sesudahnya ikut bergeser dan melanjutkan dari ayat ini.
   * Tambahkan `hanyaPekanIni: true` bila perubahan hanya untuk satu pekan,
   * lalu pekan berikutnya kembali ke pola semula.
   *
   * Contoh (hapus tanda // untuk memakai):
   *   "2026-11-16": { surah: 17, ayat: 103 },                    // kajian sempat libur, ulangi 103-107 lalu lanjut
   *   "2026-12-28": { nomor: 1, hanyaPekanIni: true },           // tema khusus satu pekan (Al-Fatihah)
   */
  override: {
    // "2026-11-16": { surah: 17, ayat: 103 },
  },
};

/* ------------------------------ Sumber API ------------------------------ */

/** Edisi teks Arab di Al Quran Cloud (rasm Utsmani). */
export const EDISI_ARAB = "quran-uthmani";
/** Edisi terjemahan Indonesia di Al Quran Cloud. */
export const EDISI_TERJEMAHAN = "id.indonesian";
/** Qari murottal. Ganti di sini saja bila ingin qari lain (identifier edisi audio Al Quran Cloud). */
export const QARI = { identifier: "ar.alafasy", nama: "Mishary Alafasy" } as const;

/* ---------------------------- Data cadangan ---------------------------- */

/*
 * Ayat pekan 5-11 Oktober 2026 (QS. Al-Isra 88-92, nomor global 2117-2121)
 * disimpan di kode agar kartu tetap tampil walau layanan API tidak dapat dihubungi.
 *
 * SEMENTARA: teks di bawah BUKAN dari Al Quran Cloud. Saat revisi ini dibuat,
 * API Al Quran Cloud tidak dapat diakses dari lingkungan pengerjaan, jadi yang
 * dipakai adalah data cadangan lama yang sudah diverifikasi (Kemenag RI, lihat
 * sumber di bawah). Tidak ada URL audio, jadi tombol murottal disembunyikan saat
 * kartu memakai data ini. Untuk menggantinya: tempelkan respons
 *   https://api.alquran.cloud/v1/ayah/2117/editions/quran-uthmani,id.indonesian,ar.alafasy
 * (dan 2118 s.d. 2121), salin `text` quran-uthmani ke `arab`, `text`
 * id.indonesian ke `terjemahan`, `audio` dan `audioSecondary[0]` ar.alafasy ke
 * `audioUrl`/`audioFallbackUrl`, lalu ubah SUMBER_CADANGAN di bawah.
 */
export const SUMBER_CADANGAN = {
  /** Ditampilkan di atribusi kecil saat kartu memakai data cadangan. */
  teks: "Al-Qur'an dan Terjemahan Kementerian Agama RI",
} as const;

export const AYAT_CADANGAN: readonly AyatCadangan[] = [
  // Sumber teks Arab dan terjemahan: data Kementerian Agama RI (quran.kemenag.go.id)
  // melalui github.com/rioastamal/quran-json, surah/17.json. Diperiksa silang: susunan
  // huruf Arab sama dengan teks Utsmani quranenc.com, dan isi terjemahan sama dengan
  // terjemahan Kemenag di quranenc.com (indonesian_affairs) dan fawazahmed0/quran-api.
  {
    nomorGlobal: 2117,
    surah: 17,
    ayat: 88,
    arab: "قُلْ لَّىِٕنِ اجْتَمَعَتِ الْاِنْسُ وَالْجِنُّ عَلٰٓى اَنْ يَّأْتُوْا بِمِثْلِ هٰذَا الْقُرْاٰنِ لَا يَأْتُوْنَ بِمِثْلِهٖ وَلَوْ كَانَ بَعْضُهُمْ لِبَعْضٍ ظَهِيْرًا",
    terjemahan: "Katakanlah, “Sesungguhnya jika manusia dan jin berkumpul untuk membuat yang serupa (dengan) Al-Qur'an ini, mereka tidak akan dapat membuat yang serupa dengannya, sekalipun mereka saling membantu satu sama lain.”",
  },
  {
    nomorGlobal: 2118,
    surah: 17,
    ayat: 89,
    arab: "وَلَقَدْ صَرَّفْنَا لِلنَّاسِ فِيْ هٰذَا الْقُرْاٰنِ مِنْ كُلِّ مَثَلٍۖ فَاَبٰىٓ اَكْثَرُ النَّاسِ اِلَّا كُفُوْرًا",
    terjemahan: "Dan sungguh, Kami telah menjelaskan berulang-ulang kepada manusia dalam Al-Qur'an ini dengan bermacam-macam perumpamaan, tetapi kebanyakan manusia tidak menyukainya bahkan mengingkari(nya).",
  },
  {
    nomorGlobal: 2119,
    surah: 17,
    ayat: 90,
    arab: "وَقَالُوْا لَنْ نُّؤْمِنَ لَكَ حَتّٰى تَفْجُرَ لَنَا مِنَ الْاَرْضِ يَنْۢبُوْعًاۙ",
    terjemahan: "Dan mereka berkata, “Kami tidak akan percaya kepadamu (Muhammad) sebelum engkau memancarkan mata air dari bumi untuk kami,",
  },
  {
    nomorGlobal: 2120,
    surah: 17,
    ayat: 91,
    arab: "اَوْ تَكُوْنَ لَكَ جَنَّةٌ مِّنْ نَّخِيْلٍ وَّعِنَبٍ فَتُفَجِّرَ الْاَنْهٰرَ خِلٰلَهَا تَفْجِيْرًاۙ",
    terjemahan: "atau engkau mempunyai sebuah kebun kurma dan anggur, lalu engkau alirkan di celah-celahnya sungai yang deras alirannya,",
  },
  {
    nomorGlobal: 2121,
    surah: 17,
    ayat: 92,
    arab: "اَوْ تُسْقِطَ السَّمَاۤءَ كَمَا زَعَمْتَ عَلَيْنَا كِسَفًا اَوْ تَأْتِيَ بِاللّٰهِ وَالْمَلٰۤىِٕكَةِ قَبِيْلًاۙ",
    terjemahan: "atau engkau jatuhkan langit berkeping-keping atas kami, sebagaimana engkau katakan, atau (sebelum) engkau datangkan Allah dan para malaikat berhadapan muka dengan kami,",
  },
];
