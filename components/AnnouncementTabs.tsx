"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { JENIS_PENGUMUMAN, LABEL_JENIS } from "@/lib/announcements";
import type { AnnouncementType } from "@/types";

interface AnnouncementTabsProps {
  /** Isi tiap tab (daftar kartu), sudah dirender di server. */
  panels: Record<AnnouncementType, ReactNode>;
  /** Tab yang terbuka lebih dulu. Bawaan "kegiatan"; panel pengurus membuka jenis yang baru disimpan. */
  initial?: AnnouncementType;
}

/*
 * Di ponsel tulisan tab sedikit lebih kecil dan kolom grid minimal 8,5rem: dua tab
 * sejajar bila muat, bertumpuk bila tulisan diperbesar, tanpa label yang meluber.
 */
const tabBase =
  "inline-flex min-h-14 min-w-0 select-none items-center justify-center rounded-xl border-2 px-3 py-3 text-center text-base font-bold leading-tight transition-colors sm:min-w-44 sm:px-5 sm:text-lg";
const tabAktif =
  "border-primary bg-primary text-on-brand hover:border-primary-hover hover:bg-primary-hover";
const tabLain = "border-primary bg-card text-primary hover:border-accent hover:bg-tint";

const tabId = (jenis: AnnouncementType) => `pengumuman-tab-${jenis}`;
const panelId = (jenis: AnnouncementType) => `pengumuman-panel-${jenis}`;

/**
 * Tab "Kegiatan" / "Pengumuman" mengikuti pola tabs WAI-ARIA:
 * role tablist/tab/tabpanel, aria-selected, aria-controls, roving tabindex,
 * panah kiri/kanan (berputar) serta Home/End untuk berpindah tab.
 * Tab terpilih: isi biru royal, teks putih. Tab lain: garis tepi.
 * Pergantian tab memakai fade 180 ms (mati otomatis bila "kurangi gerakan").
 */
export function AnnouncementTabs({ panels, initial = "kegiatan" }: AnnouncementTabsProps) {
  const [aktif, setAktif] = useState<AnnouncementType>(initial);
  // Fade hanya setelah pengguna berpindah tab, bukan saat halaman pertama dimuat.
  const [sudahPindah, setSudahPindah] = useState(false);
  const tabRefs = useRef<Partial<Record<AnnouncementType, HTMLButtonElement | null>>>({});

  function pilih(jenis: AnnouncementType, fokuskan: boolean) {
    if (jenis !== aktif) {
      setAktif(jenis);
      setSudahPindah(true);
    }
    if (fokuskan) tabRefs.current[jenis]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, jenis: AnnouncementType) {
    const jumlah = JENIS_PENGUMUMAN.length;
    const i = JENIS_PENGUMUMAN.indexOf(jenis);
    let tujuan: number;
    switch (event.key) {
      case "ArrowRight":
        tujuan = (i + 1) % jumlah;
        break;
      case "ArrowLeft":
        tujuan = (i - 1 + jumlah) % jumlah;
        break;
      case "Home":
        tujuan = 0;
        break;
      case "End":
        tujuan = jumlah - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    pilih(JENIS_PENGUMUMAN[tujuan], true);
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Pilih jenis informasi"
        className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))] gap-3 sm:flex sm:flex-wrap"
      >
        {JENIS_PENGUMUMAN.map((jenis) => {
          const terpilih = jenis === aktif;
          return (
            <button
              key={jenis}
              ref={(el) => {
                tabRefs.current[jenis] = el;
              }}
              type="button"
              role="tab"
              id={tabId(jenis)}
              aria-selected={terpilih}
              aria-controls={panelId(jenis)}
              tabIndex={terpilih ? 0 : -1}
              onClick={() => pilih(jenis, false)}
              onKeyDown={(event) => onKeyDown(event, jenis)}
              className={`${tabBase} ${terpilih ? tabAktif : tabLain}`}
            >
              {LABEL_JENIS[jenis]}
            </button>
          );
        })}
      </div>

      {JENIS_PENGUMUMAN.map((jenis) => (
        <div
          key={jenis}
          role="tabpanel"
          id={panelId(jenis)}
          aria-labelledby={tabId(jenis)}
          tabIndex={0}
          hidden={jenis !== aktif}
          className={`mt-8 rounded-2xl ${sudahPindah ? "tab-fade" : ""}`}
        >
          {panels[jenis]}
        </div>
      ))}
    </div>
  );
}
