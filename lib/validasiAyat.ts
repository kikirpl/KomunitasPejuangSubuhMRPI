import type { AyahData, AyatPekanResponse, EdisiInfo } from "@/types";

/* ==========================================================================
 * Pemeriksa bentuk data (type guard) tanpa `any`: data dari jaringan
 * diperlakukan sebagai `unknown` sampai lolos pemeriksaan di sini.
 * Dipakai di server (respons Al Quran Cloud) dan di peramban (respons /api/ayat).
 * ========================================================================== */

export function isRecord(nilai: unknown): nilai is Record<string, unknown> {
  return typeof nilai === "object" && nilai !== null && !Array.isArray(nilai);
}

export function isString(nilai: unknown): nilai is string {
  return typeof nilai === "string";
}

export function isInt(nilai: unknown): nilai is number {
  return typeof nilai === "number" && Number.isInteger(nilai);
}

function isStringOrNull(nilai: unknown): nilai is string | null {
  return nilai === null || isString(nilai);
}

function isEdisiInfo(nilai: unknown): nilai is EdisiInfo {
  return isRecord(nilai) && isString(nilai.identifier) && isString(nilai.nama);
}

export function isAyahData(nilai: unknown): nilai is AyahData {
  if (!isRecord(nilai) || !isRecord(nilai.surah)) return false;
  const s = nilai.surah;
  return (
    isInt(nilai.nomorGlobal) &&
    isInt(s.nomor) &&
    isString(s.nama) &&
    isInt(s.jumlahAyat) &&
    isInt(nilai.nomorAyat) &&
    isString(nilai.teksArab) &&
    nilai.teksArab.length > 0 &&
    isStringOrNull(nilai.basmalah) &&
    isString(nilai.terjemahan) &&
    nilai.terjemahan.length > 0 &&
    isStringOrNull(nilai.audioUrl) &&
    isStringOrNull(nilai.audioFallbackUrl)
  );
}

/** Respons /api/ayat yang sah, atau null. */
export function bacaResponsAyatPekan(json: unknown): AyatPekanResponse | null {
  if (!isRecord(json)) return null;
  const { senin, nomor, sumber, ayat, terjemahan, pesan } = json;
  const sah =
    isString(senin) &&
    Array.isArray(nomor) &&
    nomor.every(isInt) &&
    (sumber === "api" || sumber === "cadangan") &&
    Array.isArray(ayat) &&
    ayat.length === nomor.length &&
    ayat.every(isAyahData) &&
    (terjemahan === null || isEdisiInfo(terjemahan)) &&
    isStringOrNull(pesan);
  return sah ? { senin, nomor, sumber, ayat, terjemahan, pesan } : null;
}

/** Ambil `pesan` dari respons galat /api/ayat bila ada. */
export function pesanDariRespons(json: unknown): string | null {
  return isRecord(json) && isString(json.pesan) ? json.pesan : null;
}
