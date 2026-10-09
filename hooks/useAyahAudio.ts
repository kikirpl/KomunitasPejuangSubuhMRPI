"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Pemutar murottal untuk kartu "Ayat Pekan Ini".
 * - Satu HTMLAudioElement untuk seluruh kartu (preload="none"): memutar ayat lain
 *   otomatis menghentikan yang sedang berjalan. Tanpa autoplay; hanya mulai karena klik.
 * - Bila URL utama (128 kbps) gagal, URL cadangan (64 kbps) dicoba SEKALI.
 *   Bila tetap gagal, status tombol menjadi "galat".
 * - Audio di-stream langsung dari URL API (tidak diunduh/di-host ulang).
 */

export type StatusAudio = "diam" | "memuat" | "memutar" | "galat";

export interface SumberAudio {
  audioUrl: string | null;
  audioFallbackUrl: string | null;
}

interface Putaran {
  id: string;
  /** URL absolut: utama lalu cadangan. */
  urls: string[];
  indeks: number;
}

interface Aktif {
  id: string;
  status: Exclude<StatusAudio, "galat">;
}

export interface AyahAudio {
  /** Status tombol untuk ayat `id`. */
  statusUntuk: (id: string) => StatusAudio;
  /** Putar, jeda, atau lanjutkan murottal ayat `id`. */
  alihkan: (id: string, sumber: SumberAudio) => void;
  /** Hentikan audio (mis. saat daftar ayat ditutup). */
  hentikan: () => void;
}

function absolut(url: string): string {
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

function kosongkan(audio: HTMLAudioElement) {
  audio.pause();
  audio.removeAttribute("src");
  audio.load(); // putuskan unduhan yang sedang berjalan
}

export function useAyahAudio(): AyahAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const putaranRef = useRef<Putaran | null>(null);
  const [aktif, setAktif] = useState<Aktif | null>(null);
  const [galat, setGalat] = useState<readonly string[]>([]);

  // Audio berhenti saat komponen dilepas.
  useEffect(
    () => () => {
      putaranRef.current = null;
      if (audioRef.current) kosongkan(audioRef.current);
    },
    [],
  );

  /** Putaran yang sedang dimuat elemen audio, atau null bila event milik sumber lama. */
  function milikPutaran(audio: HTMLAudioElement): Putaran | null {
    const p = putaranRef.current;
    return p && audio.src === p.urls[p.indeks] ? p : null;
  }

  function ambilAudio(): HTMLAudioElement {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("playing", () => {
      const p = milikPutaran(audio);
      if (p) setAktif({ id: p.id, status: "memutar" });
    });
    audio.addEventListener("waiting", () => {
      const p = milikPutaran(audio);
      if (p && !audio.paused) setAktif({ id: p.id, status: "memuat" });
    });
    // Jeda dari luar tombol (mis. kontrol media ponsel) atau audio selesai.
    const keDiam = () => {
      const p = milikPutaran(audio);
      if (p && audio.paused) setAktif({ id: p.id, status: "diam" });
    };
    audio.addEventListener("pause", keDiam);
    audio.addEventListener("ended", keDiam);
    audio.addEventListener("error", () => {
      const p = milikPutaran(audio);
      if (p) gagal(p, p.indeks);
    });
    audioRef.current = audio;
    return audio;
  }

  /** Sumber ke-`indeks` gagal: coba sumber berikutnya sekali, lalu tandai galat. */
  function gagal(p: Putaran, indeks: number) {
    // Abaikan laporan ganda (event "error" dan penolakan play() untuk sumber yang sama).
    if (putaranRef.current !== p || p.indeks !== indeks) return;
    if (p.indeks + 1 < p.urls.length) {
      p.indeks += 1;
      mulai(p);
      return;
    }
    putaranRef.current = null;
    if (audioRef.current) kosongkan(audioRef.current);
    setAktif(null);
    setGalat((daftar) => (daftar.includes(p.id) ? daftar : [...daftar, p.id]));
  }

  /** Panggil play() dan tangani promise-nya. */
  function putar(audio: HTMLAudioElement, p: Putaran) {
    const indeks = p.indeks;
    audio.play().catch((error: unknown) => {
      if (putaranRef.current !== p) return; // sudah berganti ayat atau dihentikan
      const nama = error instanceof DOMException ? error.name : "";
      if (nama === "AbortError") return; // dijeda sebelum sempat berbunyi
      if (nama === "NotAllowedError") {
        setAktif({ id: p.id, status: "diam" }); // diblokir peramban; coba tekan lagi
        return;
      }
      gagal(p, indeks);
    });
  }

  function mulai(p: Putaran) {
    const audio = ambilAudio();
    audio.src = p.urls[p.indeks];
    putar(audio, p);
  }

  function alihkan(id: string, sumber: SumberAudio) {
    const urls = [sumber.audioUrl, sumber.audioFallbackUrl]
      .filter((u): u is string => typeof u === "string" && u.length > 0)
      .map(absolut)
      .filter((u, i, semua) => semua.indexOf(u) === i);
    if (urls.length === 0) return;

    const audio = ambilAudio();
    const p = putaranRef.current;

    if (p && p.id === id) {
      if (!audio.paused) {
        audio.pause(); // sedang memutar atau memuat: jeda
        setAktif({ id, status: "diam" });
      } else {
        setAktif({ id, status: "memuat" }); // lanjutkan dari posisi terakhir
        putar(audio, p);
      }
      return;
    }

    audio.pause();
    const baru: Putaran = { id, urls, indeks: 0 };
    putaranRef.current = baru;
    setGalat((daftar) => daftar.filter((x) => x !== id));
    setAktif({ id, status: "memuat" });
    mulai(baru);
  }

  function hentikan() {
    putaranRef.current = null;
    if (audioRef.current) kosongkan(audioRef.current);
    setAktif(null);
  }

  function statusUntuk(id: string): StatusAudio {
    if (aktif?.id === id) return aktif.status;
    return galat.includes(id) ? "galat" : "diam";
  }

  return { statusUntuk, alihkan, hentikan };
}
