import { AYAT_PEKAN_CONFIG } from "@/data/ayatPekan";
import { SURAH_AYAT_COUNTS, SURAH_NAMES, TOTAL_AYAT } from "@/lib/quranMeta";
import type { AyatPekanConfig, OverrideAyatPekan, RujukanAyat } from "@/types";

/* ==========================================================================
 * Logika "Ayat Pekan Ini": menentukan pekan, lima nomor ayat globalnya, dan
 * ayat hari ini. Semua fungsi di sini murni (tanpa React), sehingga mudah diuji
 * dan dipakai bersama oleh Route Handler (server) dan kartu (peramban).
 *
 * Rotasi memakai nomor ayat global 1-6236 (sama dengan `number` di API
 * Al Quran Cloud): awal pekan = acuan + 5 x indeksPekan, lalu kembali ke 1
 * setelah 6236. Tabel jumlah ayat per surat (lib/quranMeta.ts) hanya dipakai
 * untuk label "QS. Al-Isra: 90" dan untuk override berbentuk { surah, ayat }.
 * ========================================================================== */

export const AYAT_PER_PEKAN = 5;
export const ZONA_WAKTU = "Asia/Jakarta";

/** Nama hari dalam satu pekan tadabbur. Indeks 0 = Senin ... 6 = Ahad. */
export const NAMA_HARI_PEKAN = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Ahad",
] as const;

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const MS_PER_HARI = 86_400_000;

/* ---------------------------------- Tanggal ---------------------------------- */

const formatTanggalWib = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_WAKTU,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Tanggal kalender WIB ("TAHUN-BULAN-TANGGAL") untuk satu saat.
 * Memakai Intl.DateTimeFormat dengan timeZone Asia/Jakarta, jadi hasilnya sama
 * di perangkat mana pun, apa pun zona waktu yang dipasang di perangkat itu.
 */
export function tanggalWib(saat: Date): string {
  const bagian = formatTanggalWib.formatToParts(saat);
  const ambil = (jenis: Intl.DateTimeFormatPartTypes) =>
    bagian.find((b) => b.type === jenis)?.value ?? "";
  return `${ambil("year")}-${ambil("month")}-${ambil("day")}`;
}

interface TanggalKalender {
  tahun: number;
  bulan: number;
  hari: number;
}

/** "2026-10-07" -> { tahun, bulan, hari }, atau null bila bukan tanggal yang ada. */
export function bacaTanggal(teks: string): TanggalKalender | null {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(teks.trim());
  if (!cocok) return null;
  const tahun = Number(cocok[1]);
  const bulan = Number(cocok[2]);
  const hari = Number(cocok[3]);
  const cek = new Date(Date.UTC(tahun, bulan - 1, hari));
  if (
    cek.getUTCFullYear() !== tahun ||
    cek.getUTCMonth() !== bulan - 1 ||
    cek.getUTCDate() !== hari
  ) {
    return null;
  }
  return { tahun, bulan, hari };
}

/** Nomor hari kalender sejak 1 Januari 1970 (hitungan kalender murni, tanpa zona waktu). */
function nomorHari(iso: string): number {
  const t = bacaTanggal(iso);
  if (!t) throw new Error(`Tanggal tidak valid: ${iso}`);
  return Math.floor(Date.UTC(t.tahun, t.bulan - 1, t.hari) / MS_PER_HARI);
}

function tanggalDariNomorHari(nomor: number): string {
  const d = new Date(nomor * MS_PER_HARI);
  const dua = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${dua(d.getUTCMonth() + 1)}-${dua(d.getUTCDate())}`;
}

/** Posisi hari dalam pekan: 0 = Senin ... 6 = Ahad. */
export function urutanHari(iso: string): number {
  const getDay = new Date(nomorHari(iso) * MS_PER_HARI).getUTCDay(); // 0 = Ahad, 1 = Senin
  return (getDay + 6) % 7;
}

/** Tanggal Senin dari pekan yang memuat `iso`. */
export function seninDari(iso: string): string {
  return tanggalDariNomorHari(nomorHari(iso) - urutanHari(iso));
}

/* ---------------------------- Nomor ayat global ---------------------------- */

/** Bungkus ke rentang 1..6236: 6237 menjadi 1, 0 menjadi 6236. */
export function bungkusNomor(nomor: number): number {
  return ((((nomor - 1) % TOTAL_AYAT) + TOTAL_AYAT) % TOTAL_AYAT) + 1;
}

export function nomorValid(nomor: number): boolean {
  return Number.isInteger(nomor) && nomor >= 1 && nomor <= TOTAL_AYAT;
}

/** Lima nomor global berurutan mulai `awal` (lintas surat, berputar setelah 6236). */
export function nomorBlok(awal: number, jumlah = AYAT_PER_PEKAN): number[] {
  return Array.from({ length: jumlah }, (_, k) => bungkusNomor(awal + k));
}

/** AWAL_SURAH[s - 1] = nomor global ayat pertama surat ke-s (1 untuk Al-Fatihah). */
const AWAL_SURAH: readonly number[] = SURAH_AYAT_COUNTS.reduce<number[]>(
  (awal, _jumlah, i) => {
    awal.push(i === 0 ? 1 : awal[i - 1] + SURAH_AYAT_COUNTS[i - 1]);
    return awal;
  },
  [],
);

export function rujukanValid(ref: RujukanAyat): boolean {
  return (
    Number.isInteger(ref.surah) &&
    Number.isInteger(ref.ayat) &&
    ref.surah >= 1 &&
    ref.surah <= SURAH_AYAT_COUNTS.length &&
    ref.ayat >= 1 &&
    ref.ayat <= SURAH_AYAT_COUNTS[ref.surah - 1]
  );
}

/** { surah: 17, ayat: 88 } -> 2117 */
export function nomorDariRujukan(ref: RujukanAyat): number {
  return AWAL_SURAH[ref.surah - 1] + ref.ayat - 1;
}

/** 2117 -> { surah: 17, ayat: 88 } (untuk label sebelum/tanpa data API). */
export function rujukanDariNomor(nomor: number): RujukanAyat {
  const n = bungkusNomor(nomor);
  let surah = SURAH_AYAT_COUNTS.length;
  while (AWAL_SURAH[surah - 1] > n) surah--;
  return { surah, ayat: n - AWAL_SURAH[surah - 1] + 1 };
}

/* ----------------------------------- Pekan ----------------------------------- */

export interface PekanTadabbur {
  /** Tanggal yang dipakai (hari ini WIB, atau tanggal uji). */
  tanggal: string;
  senin: string;
  ahad: string;
  /** Lima nomor ayat global pekan ini, berurutan. */
  nomor: number[];
  /** Lima rujukan surat:ayat yang sama, untuk label. */
  rujukan: RujukanAyat[];
  /** 0 = Senin ... 6 = Ahad. */
  urutanHariIni: number;
  /** Indeks ayat hari ini (0-4) untuk Senin-Jumat; null pada Sabtu dan Ahad. */
  indeksHariIni: number | null;
  /** Sabtu dan Ahad: mode muraja'ah, tidak ada ayat yang disorot. */
  murajaah: boolean;
}

interface TitikAwal {
  senin: number;
  nomor: number;
  hanyaPekanIni: boolean;
}

/** Nomor global dari isi override ({ nomor } atau { surah, ayat }); null bila tidak sah. */
function nomorOverride(nilai: OverrideAyatPekan): number | null {
  if ("nomor" in nilai) return nomorValid(nilai.nomor) ? nilai.nomor : null;
  return rujukanValid(nilai) ? nomorDariRujukan(nilai) : null;
}

/** Override yang valid: kunci dirapikan ke tanggal Senin, isi yang tidak sah diabaikan. */
function overrideValid(override: Record<string, OverrideAyatPekan>): Map<number, TitikAwal> {
  const hasil = new Map<number, TitikAwal>();
  for (const [kunci, nilai] of Object.entries(override)) {
    const nomor = bacaTanggal(kunci) ? nomorOverride(nilai) : null;
    if (nomor === null) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Ayat Pekan Ini] override "${kunci}" diabaikan: tanggal atau ayat tidak valid.`);
      }
      continue;
    }
    const senin = nomorHari(seninDari(kunci));
    hasil.set(senin, { senin, nomor, hanyaPekanIni: nilai.hanyaPekanIni === true });
  }
  return hasil;
}

/**
 * Nomor global ayat pertama untuk pekan yang dimulai pada Senin bernomor `senin`.
 * Urutan prioritas: override khusus pekan itu, lalu titik awal terakhir sebelumnya
 * (acuan atau override "lanjutkan"), dimajukan 5 nomor per pekan.
 */
function nomorAwalPekan(senin: number, config: AyatPekanConfig): number {
  const daftarOverride = overrideValid(config.override);
  const tepat = daftarOverride.get(senin);
  if (tepat) return tepat.nomor;

  const titik: TitikAwal[] = [
    {
      senin: nomorHari(seninDari(config.acuan.senin)),
      nomor: bungkusNomor(config.acuan.nomor),
      hanyaPekanIni: false,
    },
    ...[...daftarOverride.values()].filter((t) => !t.hanyaPekanIni),
  ].sort((a, b) => a.senin - b.senin);

  // Titik awal terakhir yang tidak melewati pekan ini; bila pekan ini lebih awal
  // dari semua titik, hitung mundur dari titik paling awal.
  const dasar = [...titik].reverse().find((t) => t.senin <= senin) ?? titik[0];
  const indeksPekan = Math.round((senin - dasar.senin) / 7);
  return bungkusNomor(dasar.nomor + AYAT_PER_PEKAN * indeksPekan);
}

/** Semua informasi pekan untuk tanggal kalender WIB `tanggal` ("TAHUN-BULAN-TANGGAL"). */
export function hitungPekan(
  tanggal: string,
  config: AyatPekanConfig = AYAT_PEKAN_CONFIG,
): PekanTadabbur {
  const senin = seninDari(tanggal);
  const nomorSenin = nomorHari(senin);
  const urutanHariIni = urutanHari(tanggal);
  const murajaah = urutanHariIni >= AYAT_PER_PEKAN;
  const nomor = nomorBlok(nomorAwalPekan(nomorSenin, config));
  return {
    tanggal,
    senin,
    ahad: tanggalDariNomorHari(nomorSenin + 6),
    nomor,
    rujukan: nomor.map(rujukanDariNomor),
    urutanHariIni,
    indeksHariIni: murajaah ? null : urutanHariIni,
    murajaah,
  };
}

/* ---------------------------------- Label ---------------------------------- */

export function namaSurat(surah: number): string {
  return SURAH_NAMES[surah - 1] ?? `Surat ${surah}`;
}

/** "QS. Al-Isra: 90" */
export function labelRujukan(ref: RujukanAyat): string {
  return `QS. ${namaSurat(ref.surah)}: ${ref.ayat}`;
}

/** "QS. Al-Isra ayat 90" (dipakai pada label tombol murottal). */
export function labelAyatPanjang(ref: RujukanAyat): string {
  return `QS. ${namaSurat(ref.surah)} ayat ${ref.ayat}`;
}

/** "QS. Al-Isra 88–92", atau "QS. Al-Isra 108–111 dan Al-Kahf 1" bila lintas surat. */
export function labelBlok(rujukan: readonly RujukanAyat[]): string {
  const kelompok: { surah: number; awal: number; akhir: number }[] = [];
  for (const ref of rujukan) {
    const terakhir = kelompok[kelompok.length - 1];
    if (terakhir && terakhir.surah === ref.surah && ref.ayat === terakhir.akhir + 1) {
      terakhir.akhir = ref.ayat;
    } else {
      kelompok.push({ surah: ref.surah, awal: ref.ayat, akhir: ref.ayat });
    }
  }
  const bagian = kelompok.map(
    (k) => `${namaSurat(k.surah)} ${k.awal === k.akhir ? k.awal : `${k.awal}–${k.akhir}`}`,
  );
  return `QS. ${bagian.join(" dan ")}`;
}

/** "5–11 Oktober 2026", "26 Oktober – 1 November 2026", "29 Desember 2026 – 4 Januari 2027" */
export function labelRentangTanggal(senin: string, ahad: string): string {
  const a = bacaTanggal(senin);
  const b = bacaTanggal(ahad);
  if (!a || !b) return `${senin} – ${ahad}`;
  const bulanA = NAMA_BULAN[a.bulan - 1];
  const bulanB = NAMA_BULAN[b.bulan - 1];
  if (a.tahun !== b.tahun) return `${a.hari} ${bulanA} ${a.tahun} – ${b.hari} ${bulanB} ${b.tahun}`;
  if (a.bulan !== b.bulan) return `${a.hari} ${bulanA} – ${b.hari} ${bulanB} ${b.tahun}`;
  return `${a.hari}–${b.hari} ${bulanB} ${b.tahun}`;
}

/** "7 Oktober 2026" */
export function labelTanggal(iso: string): string {
  const t = bacaTanggal(iso);
  return t ? `${t.hari} ${NAMA_BULAN[t.bulan - 1]} ${t.tahun}` : iso;
}

/** Kunci pembeda blok ayat, mis. "2117,2118,2119,2120,2121". */
export function kunciNomor(nomor: readonly number[]): string {
  return nomor.join(",");
}
