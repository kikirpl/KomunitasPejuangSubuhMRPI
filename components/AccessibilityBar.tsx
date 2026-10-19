"use client";

import { Check, Contrast, LayoutList, SlidersHorizontal } from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";
import {
  MAX_TEXT_SCALE,
  MIN_TEXT_SCALE,
  TEXT_SCALES,
} from "@/lib/accessibility";

/*
 * Ukuran di bilah ini sengaja memakai px (bukan rem): bilah ini adalah alat untuk
 * mengatur ukuran tulisan, jadi ia tetap berukuran sama (tombol setinggi 56px,
 * huruf 18px) dan tidak ikut membesar sampai memakan separuh layar ponsel.
 */
const control =
  "inline-flex min-h-[56px] items-center justify-center gap-[8px] rounded-[12px] border-2 py-[6px] text-[18px] font-bold leading-tight transition-colors disabled:opacity-45";
const idle = "border-on-brand/70 bg-transparent text-on-brand hover:bg-white/15";
/* Terpilih: isi putih bertulisan gelap. Isi emas disimpan untuk tombol tindakan (Lihat Jadwal, Buka Zoom). */
const active = "border-on-brand bg-on-brand text-brand-deep";

/**
 * Bilah pengaturan tampilan di bagian paling atas halaman, selalu terlihat:
 * ukuran tulisan (A- / Normal / A+), kontras tinggi, dan tampilan sederhana.
 * Pilihan disimpan di peramban sehingga diingat pada kunjungan berikutnya.
 */
export function AccessibilityBar() {
  const {
    settings,
    decreaseText,
    resetText,
    increaseText,
    toggleContrast,
    toggleSimple,
  } = useAccessibility();

  const scale = TEXT_SCALES[settings.textScale];
  const atMin = settings.textScale <= MIN_TEXT_SCALE;
  const atMax = settings.textScale >= MAX_TEXT_SCALE;

  return (
    <section
      id="atas"
      aria-label="Pengaturan tampilan"
      className="on-dark border-b border-line-dark bg-toolbar text-on-brand hc:border-b-2"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-[24px] gap-y-[12px] px-5 py-[12px] sm:px-8 simple:max-w-3xl">
        <div className="flex w-full flex-wrap items-center gap-x-[24px] gap-y-[12px] sm:w-auto">
          <p className="hidden items-center gap-[8px] text-[18px] font-bold sm:flex">
            <SlidersHorizontal aria-hidden className="size-[24px]" />
            Atur tampilan
          </p>

          <div
            role="group"
            aria-label="Ukuran tulisan"
            className="flex w-full items-stretch gap-[8px] sm:w-auto"
          >
            <button
              type="button"
              onClick={decreaseText}
              disabled={atMin}
              aria-label="A− Perkecil tulisan"
              className={`${control} ${idle} flex-1 px-[10px] sm:flex-none sm:px-[16px]`}
            >
              <span aria-hidden className="text-[22px]">A&minus;</span>
            </button>
            <button
              type="button"
              onClick={resetText}
              aria-label="Kembalikan ukuran tulisan ke normal"
              aria-pressed={settings.textScale === 1}
              className={`${control} ${settings.textScale === 1 ? active : idle} flex-1 px-[10px] sm:flex-none sm:px-[16px]`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={increaseText}
              disabled={atMax}
              aria-label="A+ Perbesar tulisan"
              className={`${control} ${idle} flex-1 px-[10px] sm:flex-none sm:px-[16px]`}
            >
              <span aria-hidden className="text-[26px]">A+</span>
            </button>
          </div>

          <p className="text-[16px] text-on-brand-soft" aria-live="polite">
            Ukuran tulisan: <strong className="text-on-brand">{scale.label}</strong>
          </p>
        </div>

        <div className="flex w-full gap-[8px] sm:w-auto">
          <ToggleButton on={settings.highContrast} onClick={toggleContrast} Icon={Contrast}>
            Kontras Tinggi
          </ToggleButton>
          <ToggleButton on={settings.simpleLayout} onClick={toggleSimple} Icon={LayoutList}>
            Tampilan Sederhana
          </ToggleButton>
        </div>
      </div>
    </section>
  );
}

interface ToggleButtonProps {
  on: boolean;
  onClick: () => void;
  Icon: typeof Contrast;
  /** Label lengkap yang terlihat; juga menjadi nama tombol bagi pembaca layar. */
  children: string;
}

/**
 * Tombol hidup/mati: ikon centang, warna emas, dan tulisan "Hidup"/"Mati" (tidak hanya warna).
 * Namanya diambil dari tulisan yang terlihat (label + status), sesuai WCAG 2.5.3.
 */
function ToggleButton({ on, onClick, Icon, children }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`${control} ${on ? active : idle} min-w-0 flex-1 justify-start px-[8px] sm:flex-none sm:px-[16px]`}
    >
      {on ? (
        <Check aria-hidden className="size-[24px] shrink-0" strokeWidth={3} />
      ) : (
        <Icon aria-hidden className="size-[24px] shrink-0" />
      )}
      <span className="flex min-w-0 flex-col text-left">
        <span>{children}</span> <span className="text-[16px] font-normal">{on ? "Hidup" : "Mati"}</span>
      </span>
    </button>
  );
}
