import type { NextRequest } from "next/server";
import { ayatCadanganUntuk, PESAN_CADANGAN } from "@/lib/ayatCadangan";
import { bacaTanggal, hitungPekan, tanggalWib } from "@/lib/ayatPekan";
import { ambilAyatPekan } from "@/lib/quranCloud";
import type { AyatPekanErrorResponse, AyatPekanResponse } from "@/types";

/*
 * GET /api/ayat?week=YYYY-MM-DD
 *   Lima ayat pekan yang memuat tanggal itu (biasanya tanggal Senin).
 *   Tanpa `week`: pekan ini menurut tanggal WIB server.
 *
 * Berhasil -> 200 AyatPekanResponse (sumber "api"), boleh di-cache CDN 1 hari.
 * API gagal, pekan ada di data cadangan -> 200 (sumber "cadangan", tanpa cache).
 * API gagal, tanpa cadangan -> 503 { pesan }.
 */

const CACHE_SUKSES = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get("week");
  if (week !== null && !bacaTanggal(week)) {
    return Response.json(
      { pesan: "Parameter week harus berupa tanggal TAHUN-BULAN-TANGGAL." } satisfies AyatPekanErrorResponse,
      { status: 400 },
    );
  }

  const pekan = hitungPekan(week ?? tanggalWib(new Date()));

  try {
    const { ayat, terjemahan } = await ambilAyatPekan(pekan.nomor);
    const isi: AyatPekanResponse = {
      senin: pekan.senin,
      nomor: pekan.nomor,
      sumber: "api",
      ayat,
      terjemahan,
      pesan: null,
    };
    return Response.json(isi, { headers: { "Cache-Control": CACHE_SUKSES } });
  } catch (error) {
    console.error(`[api/ayat] Gagal mengambil ayat ${pekan.nomor.join(",")}:`, error);
    const cadangan = ayatCadanganUntuk(pekan.nomor);
    if (cadangan) {
      const isi: AyatPekanResponse = {
        senin: pekan.senin,
        nomor: pekan.nomor,
        sumber: "cadangan",
        ayat: cadangan,
        terjemahan: null,
        pesan: PESAN_CADANGAN,
      };
      return Response.json(isi, { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json(
      { pesan: "Layanan ayat sedang tidak dapat dihubungi." } satisfies AyatPekanErrorResponse,
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
