import { AYAT_CADANGAN } from "@/data/ayatPekan";
import { namaSurat } from "@/lib/ayatPekan";
import { SURAH_AYAT_COUNTS } from "@/lib/quranMeta";
import type { AyahData } from "@/types";

/** Pesan sopan saat kartu memakai data cadangan. */
export const PESAN_CADANGAN =
  "Layanan Al-Qur'an sedang tidak dapat dihubungi, jadi ayat ditampilkan dari data cadangan.";

/**
 * Kelima ayat dari data cadangan (data/ayatPekan.ts), dalam bentuk AyahData,
 * bila SEMUA nomor tersedia di sana; jika tidak, null.
 */
export function ayatCadanganUntuk(nomor: readonly number[]): AyahData[] | null {
  const hasil: AyahData[] = [];
  for (const n of nomor) {
    const a = AYAT_CADANGAN.find((item) => item.nomorGlobal === n);
    if (!a) return null;
    hasil.push({
      nomorGlobal: a.nomorGlobal,
      surah: { nomor: a.surah, nama: namaSurat(a.surah), jumlahAyat: SURAH_AYAT_COUNTS[a.surah - 1] },
      nomorAyat: a.ayat,
      teksArab: a.arab,
      basmalah: null,
      terjemahan: a.terjemahan,
      audioUrl: a.audioUrl ?? null,
      audioFallbackUrl: a.audioFallbackUrl ?? null,
    });
  }
  return hasil;
}
