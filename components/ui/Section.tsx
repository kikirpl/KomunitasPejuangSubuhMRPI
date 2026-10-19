import type { ReactNode } from "react";
import { BackToMenu } from "@/components/ui/BackToMenu";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { StarMark } from "@/components/ui/StarMark";

type SectionTone = "paper" | "alt" | "dark";
/** "surat": kepala bagian inti (kartus berujung runcing diapit garis daun emas); "ringan": kepala bagian pendukung. */
type SectionHead = "surat" | "ringan";

interface SectionProps {
  id: string;
  title: ReactNode;
  intro?: string;
  isSample?: boolean;
  tone?: SectionTone;
  /** Pola girih bintang delapan yang sangat halus di latar (hanya untuk beberapa bagian). */
  ornament?: boolean;
  kepala?: SectionHead;
  children: ReactNode;
}

const toneClass: Record<SectionTone, string> = {
  paper: "bg-paper",
  alt: "bg-paper-2",
  dark: "on-dark relative overflow-clip bg-brand-deep text-on-brand",
};

/**
 * Kerangka seragam setiap bagian halaman, dengan dua tingkat kepala agar halaman punya hierarki:
 * - "surat" (bagian inti: jadwal, ayat, Zoom, infak) meniru kepala surat pada mushaf: judul di
 *   dalam kartus berujung runcing, diapit garis daun emas yang meruncing ke luar dengan bintang
 *   delapan di ujung dalamnya. Garis itu "tergambar" dari judul ke luar saat bagian masuk layar
 *   (CSS scroll-driven; tanpa dukungan peramban atau dengan "kurangi gerakan", garis langsung utuh).
 *   Di ponsel hanya kartusnya yang tampil, agar judul tidak terhimpit.
 * - "ringan" (profil, rekaman, pengumuman, kontak): judul rata kiri dengan bintang dan garis emas
 *   yang memudar ke kanan, seperti daftar isi mushaf (sama dengan kepala Menu Utama).
 * Pola girih latar memudar di tepi atas dan bawah bagian, jadi tidak ada garis awal pola.
 */
export function Section({
  id,
  title,
  intro,
  isSample,
  tone = "paper",
  ornament = false,
  kepala = "surat",
  children,
}: SectionProps) {
  const headingId = `${id}-judul`;
  const dark = tone === "dark";
  const surat = kepala === "surat";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${toneClass[tone]} ${
        ornament && !dark ? "relative overflow-clip" : ""
      } pt-(--section-y) pb-[calc(var(--section-y)*0.55)]`}
    >
      {dark ? (
        <>
          <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
          {/* Garis cahaya fajar tipis di tepi atas, sama dengan kaki halaman. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold to-transparent hc:hidden"
          />
        </>
      ) : ornament ? (
        <div aria-hidden="true" className="ornamen-pudar absolute inset-0">
          <div className="khatam-pattern-light absolute inset-0" />
        </div>
      ) : null}
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8 simple:max-w-3xl">
        {surat ? (
          <header className="mb-9 text-center md:mb-12">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span
                aria-hidden="true"
                className={`kepala-garis kepala-garis--kiri max-sm:hidden huge:max-lg:hidden ${dark ? "text-gold" : "text-gilt"}`}
              >
                <span className="kepala-garis__garis" />
                <StarMark className="size-5 shrink-0 sm:size-6" />
              </span>
              <div className={`kartus ${dark ? "kartus--gelap" : ""}`}>
                <h2
                  id={headingId}
                  className={`min-w-0 text-[1.75rem] font-semibold leading-[1.12] sm:text-4xl md:text-[2.75rem] huge:max-sm:text-2xl ${
                    dark ? "text-on-brand" : "text-brand"
                  }`}
                >
                  {title}
                </h2>
              </div>
              <span
                aria-hidden="true"
                className={`kepala-garis kepala-garis--kanan max-sm:hidden huge:max-lg:hidden ${dark ? "text-gold" : "text-gilt"}`}
              >
                <StarMark className="size-5 shrink-0 sm:size-6" />
                <span className="kepala-garis__garis" />
              </span>
            </div>
            {isSample ? <SampleBadge className="mt-4" /> : null}
            {intro ? (
              <p
                className={`mx-auto mt-4 max-w-2xl text-xl leading-relaxed ${dark ? "text-on-brand-soft" : "text-ink-soft"}`}
              >
                {intro}
              </p>
            ) : null}
          </header>
        ) : (
          <header className="mb-8 md:mb-10">
            <div className="flex items-center gap-4">
              <h2
                id={headingId}
                className={`min-w-0 text-[1.75rem] font-semibold leading-[1.15] sm:text-[2rem] md:text-4xl huge:max-sm:text-2xl ${
                  dark ? "text-on-brand" : "text-brand"
                }`}
              >
                {title}
              </h2>
              <span
                aria-hidden="true"
                className={`flex min-w-8 flex-1 items-center gap-2 ${dark ? "text-gold" : "text-gilt"}`}
              >
                <StarMark className="size-5 shrink-0" />
                <span className="h-px flex-1 bg-linear-to-r from-current to-transparent opacity-70" />
              </span>
            </div>
            {isSample ? <SampleBadge className="mt-4" /> : null}
            {intro ? (
              <p className={`mt-3 max-w-2xl text-xl leading-relaxed ${dark ? "text-on-brand-soft" : "text-ink-soft"}`}>
                {intro}
              </p>
            ) : null}
          </header>
        )}
        {children}
        <BackToMenu dark={dark} />
      </div>
    </section>
  );
}
