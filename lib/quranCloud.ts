import { EDISI_ARAB, EDISI_TERJEMAHAN, QARI } from "@/data/ayatPekan";
import { SURAH_NAMES } from "@/lib/quranMeta";
import { isInt, isRecord, isString } from "@/lib/validasiAyat";
import type {
  AyahData,
  EdisiInfo,
  QuranCloudAyahEdition,
  QuranCloudEdition,
  QuranCloudSurah,
} from "@/types";

/* ==========================================================================
 * Klien Al Quran Cloud (https://alquran.cloud/api). HANYA dipakai di server
 * (Route Handler app/api/ayat/route.ts).
 *
 *   GET {BASE}/ayah/{nomor}/editions/quran-uthmani,id.indonesian,ar.alafasy
 *     data: array edisi; dikenali lewat edition.identifier (bukan urutan).
 *   GET {BASE}/ayah/1/quran-uthmani
 *     teks Al-Fatihah: 1, untuk memisahkan awalan Basmalah pada ayat 1 surat lain.
 *
 * Tiap panggilan di-cache 24 jam oleh Next (fetch + next.revalidate), jadi API
 * hanya dipanggil paling banyak sekali sehari per ayat, bukan per pengunjung.
 * Audio TIDAK diunduh di sini: URL MP3 dari API langsung diputar peramban.
 * ========================================================================== */

export const QURAN_API_BASE = (
  process.env.QURAN_API_BASE ?? "https://api.alquran.cloud/v1"
).replace(/\/+$/, "");

const REVALIDATE_DETIK = 86_400;
const BATAS_WAKTU_MS = 8_000;

export type QuranCloudErrorKind = "network" | "timeout" | "http" | "format";

export class QuranCloudError extends Error {
  readonly kind: QuranCloudErrorKind;

  constructor(message: string, kind: QuranCloudErrorKind) {
    super(message);
    this.name = "QuranCloudError";
    this.kind = kind;
  }
}

/* ------------------------------ Validasi respons ------------------------------ */

function isEdition(nilai: unknown): nilai is QuranCloudEdition {
  return (
    isRecord(nilai) &&
    isString(nilai.identifier) &&
    isString(nilai.language) &&
    isString(nilai.name) &&
    isString(nilai.englishName) &&
    isString(nilai.format) &&
    isString(nilai.type)
  );
}

function isSurah(nilai: unknown): nilai is QuranCloudSurah {
  return (
    isRecord(nilai) &&
    isInt(nilai.number) &&
    isString(nilai.name) &&
    isString(nilai.englishName) &&
    isInt(nilai.numberOfAyahs)
  );
}

function isAyahEdition(nilai: unknown): nilai is QuranCloudAyahEdition {
  if (!isRecord(nilai)) return false;
  const { audio, audioSecondary } = nilai;
  return (
    isInt(nilai.number) &&
    isString(nilai.text) &&
    isInt(nilai.numberInSurah) &&
    isSurah(nilai.surah) &&
    isEdition(nilai.edition) &&
    (audio === undefined || audio === null || isString(audio)) &&
    (audioSecondary === undefined ||
      audioSecondary === null ||
      (Array.isArray(audioSecondary) && audioSecondary.every(isString)))
  );
}

/** `data` dari respons ber-`code` 200, atau lempar QuranCloudError("format"). */
function dataDariRespons(json: unknown): unknown {
  if (!isRecord(json) || json.code !== 200 || !("data" in json)) {
    throw new QuranCloudError("Respons API tidak berkode 200", "format");
  }
  return json.data;
}

/* --------------------------------- Pemanggilan --------------------------------- */

async function ambilJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_DETIK },
      signal: AbortSignal.timeout(BATAS_WAKTU_MS),
    });
  } catch (error) {
    const timeout = error instanceof DOMException && error.name === "TimeoutError";
    throw new QuranCloudError(
      timeout ? "Waktu tunggu API habis" : "Tidak dapat terhubung ke API",
      timeout ? "timeout" : "network",
    );
  }
  if (!response.ok) {
    throw new QuranCloudError(`API membalas status ${response.status}`, "http");
  }
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new QuranCloudError("Balasan API bukan JSON yang valid", "format");
  }
}

/** Tiga edisi (Arab, terjemahan, audio) untuk satu nomor ayat global. */
async function ambilEdisiAyat(nomor: number): Promise<QuranCloudAyahEdition[]> {
  const edisi = [EDISI_ARAB, EDISI_TERJEMAHAN, QARI.identifier].join(",");
  const data = dataDariRespons(await ambilJson(`${QURAN_API_BASE}/ayah/${nomor}/editions/${edisi}`));
  if (!Array.isArray(data) || !data.every(isAyahEdition)) {
    throw new QuranCloudError(`Format data ayat ${nomor} tidak dikenali`, "format");
  }
  return data;
}

/** Teks Basmalah persis seperti ayat Al-Fatihah: 1 dari API (edisi Arab yang sama). */
async function ambilBasmalah(): Promise<string> {
  const data = dataDariRespons(await ambilJson(`${QURAN_API_BASE}/ayah/1/${EDISI_ARAB}`));
  if (!isAyahEdition(data) || data.number !== 1) {
    throw new QuranCloudError("Format data Al-Fatihah: 1 tidak dikenali", "format");
  }
  return bersihkan(data.text);
}

/* --------------------------------- Normalisasi --------------------------------- */

/** Buang BOM (U+FEFF) yang kadang menempel di awal teks, lalu spasi tepi. Huruf lain tidak diubah. */
function bersihkan(teks: string): string {
  return teks.replace(/^﻿/, "").trim();
}

/** Hanya URL https yang diteruskan ke peramban. */
function urlHttps(nilai: string | null | undefined): string | null {
  return isString(nilai) && /^https:\/\//.test(nilai) ? nilai : null;
}

/** Ayat 1 surat selain Al-Fatihah (1) dan At-Taubah (9) diawali Basmalah di teks API. */
function perluPisahBasmalah(ayah: QuranCloudAyahEdition): boolean {
  return ayah.numberInSurah === 1 && ayah.surah.number !== 1 && ayah.surah.number !== 9;
}

/**
 * Pisahkan awalan Basmalah HANYA bila teks diawali persis teks Al-Fatihah: 1.
 * Bila tidak cocok persis, teks dibiarkan utuh (tidak ada huruf yang diubah).
 */
export function pisahkanBasmalah(
  teks: string,
  basmalah: string | null,
): { basmalah: string | null; teks: string } {
  if (basmalah && teks.startsWith(basmalah) && teks.length > basmalah.length) {
    return { basmalah, teks: teks.slice(basmalah.length).trim() };
  }
  return { basmalah: null, teks };
}

function cariEdisi(daftar: QuranCloudAyahEdition[], identifier: string, nomor: number) {
  const hasil = daftar.find((d) => d.edition.identifier === identifier);
  if (!hasil || hasil.number !== nomor) {
    throw new QuranCloudError(`Edisi ${identifier} untuk ayat ${nomor} tidak ada`, "format");
  }
  return hasil;
}

function normalisasi(
  nomor: number,
  daftar: QuranCloudAyahEdition[],
  basmalah: string | null,
): AyahData {
  const arab = cariEdisi(daftar, EDISI_ARAB, nomor);
  const terjemahan = cariEdisi(daftar, EDISI_TERJEMAHAN, nomor);
  const audio = cariEdisi(daftar, QARI.identifier, nomor);

  const teksArab = bersihkan(arab.text);
  const pisah = perluPisahBasmalah(arab)
    ? pisahkanBasmalah(teksArab, basmalah)
    : { basmalah: null, teks: teksArab };
  const teksTerjemahan = terjemahan.text.trim();
  if (!pisah.teks || !teksTerjemahan) {
    throw new QuranCloudError(`Teks ayat ${nomor} kosong`, "format");
  }

  return {
    nomorGlobal: arab.number,
    surah: {
      nomor: arab.surah.number,
      nama: SURAH_NAMES[arab.surah.number - 1] ?? arab.surah.englishName,
      jumlahAyat: arab.surah.numberOfAyahs,
    },
    nomorAyat: arab.numberInSurah,
    teksArab: pisah.teks,
    basmalah: pisah.basmalah,
    terjemahan: teksTerjemahan,
    audioUrl: urlHttps(audio.audio),
    audioFallbackUrl: urlHttps(audio.audioSecondary?.[0]),
  };
}

/**
 * Kelima ayat pekan ini: 5 panggilan paralel, divalidasi, lalu dinormalisasi.
 * Melempar QuranCloudError bila salah satu gagal (pemanggil memakai data cadangan).
 */
export async function ambilAyatPekan(
  nomor: readonly number[],
): Promise<{ ayat: AyahData[]; terjemahan: EdisiInfo }> {
  const semua = await Promise.all(nomor.map((n) => ambilEdisiAyat(n)));

  // Teks Al-Fatihah: 1 hanya diambil bila ada ayat 1 yang perlu dipisah Basmalahnya.
  const butuhBasmalah = semua.some((daftar) =>
    daftar.some((d) => d.edition.identifier === EDISI_ARAB && perluPisahBasmalah(d)),
  );
  let basmalah: string | null = null;
  if (butuhBasmalah) {
    try {
      basmalah = await ambilBasmalah();
    } catch (error) {
      // Tanpa pembanding, teks ayat 1 ditampilkan utuh apa adanya.
      console.warn("[api/ayat] Basmalah tidak dapat diambil:", error);
    }
  }

  const ayat = nomor.map((n, i) => normalisasi(n, semua[i], basmalah));
  const edisi = semua[0].find((d) => d.edition.identifier === EDISI_TERJEMAHAN)?.edition;
  return {
    ayat,
    terjemahan: { identifier: EDISI_TERJEMAHAN, nama: edisi?.name ?? EDISI_TERJEMAHAN },
  };
}
