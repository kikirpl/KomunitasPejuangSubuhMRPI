/* ==========================================================================
 * Data dasar mushaf: jumlah ayat dan nama latin 114 surat.
 *
 * DIHASILKAN OTOMATIS dari data, bukan diketik dari ingatan:
 * - Jumlah ayat dan nama latin: data Kementerian Agama RI (quran.kemenag.go.id)
 *   melalui github.com/rioastamal/quran-json (berkas surah/1.json ... 114.json).
 * - Jumlah ayat dicocokkan dengan dua dataset lain dan hasilnya sama untuk
 *   seluruh 114 surat: fawazahmed0/quran-api (info.json) dan quran-json 3.1.2
 *   (npm). Total 6.236 ayat; Al-Isra 111 ayat, Al-Kahf 110 ayat.
 * - Nama latin mengikuti Kemenag; tanda petik di akhir nama dihilangkan agar
 *   rujukan tampil seperti "QS. Al-Isra: 90" (Kemenag: "Al-Isra'").
 * ========================================================================== */

/** Jumlah ayat tiap surat. Indeks 0 = surat ke-1 (Al-Fatihah). */
export const SURAH_AYAT_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99,
  128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37,
  35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40,
  31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5,
  4, 7, 3, 6, 3, 5, 4, 5, 6,
];

/** Nama latin tiap surat. Indeks 0 = surat ke-1. */
export const SURAH_NAMES: readonly string[] = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am",
  "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus", "Hud", "Yusuf",
  "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf",
  "Maryam", "Taha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur",
  "Al-Furqan", "Asy-Syu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Yasin",
  "As-Saffat", "Sad", "Az-Zumar", "Gafir", "Fussilat", "Asy-Syura",
  "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath",
  "Al-Hujurat", "Qaf", "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar",
  "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadalah", "Al-Hasyr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim",
  "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn",
  "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba",
  "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Insyiqaq",
  "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Gasyiyah", "Al-Fajr", "Al-Balad",
  "Asy-Syams", "Al-Lail", "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq",
  "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takasur",
  "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar",
  "Al-Kafirun", "An-Nasr", "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas",
];

/** Jumlah seluruh ayat Al-Qur'an (hitungan Kufah, sama dengan mushaf Kemenag). */
export const TOTAL_AYAT = 6236;
