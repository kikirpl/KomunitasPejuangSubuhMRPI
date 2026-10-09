"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ayatCadanganUntuk, PESAN_CADANGAN } from "@/lib/ayatCadangan";
import { bacaTanggal, hitungPekan, kunciNomor, tanggalWib, type PekanTadabbur } from "@/lib/ayatPekan";
import { bacaResponsAyatPekan, pesanDariRespons } from "@/lib/validasiAyat";
import type { AyahData, AyatPekanResponse, EdisiInfo, SumberAyat } from "@/types";

/*
 * KHUSUS PENGEMBANGAN: tambahkan ?tanggal=2026-10-07 di alamat halaman untuk melihat
 * kartu seolah-olah hari ini tanggal itu (tanpa mengubah jam perangkat).
 * Hanya aktif saat `next dev` (NODE_ENV bukan "production"); di situs yang
 * diterbitkan parameter ini diabaikan.
 */
const PARAMETER_UJI: string | null = process.env.NODE_ENV !== "production" ? "tanggal" : null;

const BATAS_WAKTU_MS = 15_000;

function tanggalUji(): string | null {
  if (!PARAMETER_UJI) return null;
  const nilai = new URLSearchParams(window.location.search).get(PARAMETER_UJI);
  return nilai && bacaTanggal(nilai) ? nilai : null;
}

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 30_000); // ganti hari tepat pukul 00.00 WIB
  window.addEventListener("popstate", onChange);
  return () => {
    window.clearInterval(id);
    window.removeEventListener("popstate", onChange);
  };
}

/** "uji:2026-10-07" saat memakai parameter uji, selain itu tanggal WIB hari ini. */
function getSnapshot(): string {
  const uji = tanggalUji();
  return uji ? `uji:${uji}` : tanggalWib(new Date());
}

/** Di server tanggal pengunjung belum diketahui: tampilkan kerangka dulu. */
function getServerSnapshot(): string | null {
  return null;
}

class GagalMuat extends Error {}

/**
 * Ambil kelima ayat lewat Route Handler /api/ayat. Bila situs tidak dapat
 * dihubungi sama sekali (mis. sinyal putus) dan pekan ini ada di data cadangan,
 * pakai data cadangan dari kode.
 */
async function muatAyat(pekan: PekanTadabbur, signal: AbortSignal): Promise<AyatPekanResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/ayat?week=${pekan.senin}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch {
    // Sambungan gagal atau waktu tunggu habis (bila dibatalkan karena pekan
    // berganti, hasilnya diabaikan oleh pemanggil).
    const cadangan = ayatCadanganUntuk(pekan.nomor);
    if (cadangan) {
      return {
        senin: pekan.senin,
        nomor: pekan.nomor,
        sumber: "cadangan",
        ayat: cadangan,
        terjemahan: null,
        pesan: PESAN_CADANGAN,
      };
    }
    throw new GagalMuat("Perangkat sedang tidak tersambung ke internet.");
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    // ditangani di bawah
  }
  if (!response.ok) {
    throw new GagalMuat(pesanDariRespons(json) ?? "Layanan ayat sedang tidak dapat dihubungi.");
  }
  const data = bacaResponsAyatPekan(json);
  if (!data) throw new GagalMuat("Data ayat yang diterima tidak lengkap.");
  return data;
}

export type StatusAyatPekan = "memuat" | "siap" | "gagal";

interface HasilMuat {
  kunci: string;
  data?: AyatPekanResponse;
  pesan?: string;
}

export interface AyatPekanState {
  status: StatusAyatPekan;
  pekan: PekanTadabbur | null;
  ayat: AyahData[] | null;
  sumber: SumberAyat | null;
  terjemahan: EdisiInfo | null;
  /** Pesan sopan: alasan gagal, atau keterangan saat memakai data cadangan. */
  pesan: string | null;
  /** Tanggal dari parameter ?tanggal= (mode uji, hanya development), atau null. */
  tanggalUji: string | null;
  cobaLagi: () => void;
}

/** Pekan tadabbur hari ini (WIB) beserta kelima ayatnya dari /api/ayat. */
export function useAyatPekan(): AyatPekanState {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const modeUji = snapshot?.startsWith("uji:") ?? false;
  const tanggal = snapshot ? snapshot.replace(/^uji:/, "") : null;

  const pekan = useMemo(() => (tanggal ? hitungPekan(tanggal) : null), [tanggal]);

  const [percobaan, setPercobaan] = useState(0);
  const [hasil, setHasil] = useState<HasilMuat | null>(null);
  const kunci = pekan ? `${pekan.senin}|${kunciNomor(pekan.nomor)}#${percobaan}` : null;

  useEffect(() => {
    if (!pekan || !kunci) return;
    const controller = new AbortController();
    let waktuHabis = false;
    const timer = window.setTimeout(() => {
      waktuHabis = true;
      controller.abort();
    }, BATAS_WAKTU_MS);

    muatAyat(pekan, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted || waktuHabis) setHasil({ kunci, data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted && !waktuHabis) return;
        const pesan =
          error instanceof GagalMuat
            ? error.message
            : waktuHabis
              ? "Sinyal internet sedang lambat."
              : "Layanan ayat sedang tidak dapat dihubungi.";
        setHasil({ kunci, pesan });
      })
      .finally(() => window.clearTimeout(timer));

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [pekan, kunci]);

  const cobaLagi = useCallback(() => setPercobaan((n) => n + 1), []);

  let status: StatusAyatPekan = "memuat";
  let data: AyatPekanResponse | null = null;
  let pesan: string | null = null;
  if (hasil && hasil.kunci === kunci) {
    if (hasil.data) {
      status = "siap";
      data = hasil.data;
      pesan = hasil.data.pesan;
    } else {
      status = "gagal";
      pesan = hasil.pesan ?? null;
    }
  }

  return {
    status,
    pekan,
    ayat: data?.ayat ?? null,
    sumber: data?.sumber ?? null,
    terjemahan: data?.terjemahan ?? null,
    pesan,
    tanggalUji: modeUji ? tanggal : null,
    cobaLagi,
  };
}
