"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getWibParts, type WibParts } from "@/lib/time";

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 20_000);
  return () => window.clearInterval(id);
}

/** Menit sejak 1970: berubah tiap menit, sehingga komponen hanya dirender ulang per menit. */
function getSnapshot(): number | null {
  return Math.floor(Date.now() / 60_000);
}

/** Di server waktu belum diketahui, jadi komponen menampilkan kerangka dulu (tanpa selisih tampilan saat hidrasi). */
function getServerSnapshot(): number | null {
  return null;
}

/** Tanggal dan jam saat ini dalam WIB, atau null sebelum halaman aktif di peramban. */
export function useWibNow(): WibParts | null {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(
    () => (minute === null ? null : getWibParts(new Date(minute * 60_000))),
    [minute],
  );
}
