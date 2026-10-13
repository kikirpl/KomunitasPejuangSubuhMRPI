import type { ReactNode } from "react";
import { BackToMenu } from "@/components/ui/BackToMenu";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { StarMark } from "@/components/ui/StarMark";

type SectionTone = "paper" | "alt" | "dark";

interface SectionProps {
  id: string;
  title: ReactNode;
  /** Label kecil di atas judul, mis. "Profil" di atas "Tentang Kami". */
  label?: string;
  intro?: string;
  isSample?: boolean;
  tone?: SectionTone;
  /** Pola bintang delapan yang sangat halus di latar (hanya untuk beberapa bagian). */
  ornament?: boolean;
  children: ReactNode;
}

const toneClass: Record<SectionTone, string> = {
  paper: "",
  alt: "bg-paper-2",
  dark: "on-dark relative overflow-hidden bg-brand-deep text-on-brand",
};

/** Kerangka seragam setiap bagian halaman: judul besar, penjelasan singkat, isi. */
export function Section({
  id,
  title,
  label,
  intro,
  isSample,
  tone = "paper",
  ornament = false,
  children,
}: SectionProps) {
  const headingId = `${id}-judul`;
  const dark = tone === "dark";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${toneClass[tone]} ${
        ornament && !dark ? "relative overflow-hidden" : ""
      } pb-8 pt-14 md:pb-10 md:pt-20`}
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
        <div aria-hidden="true" className="khatam-pattern-light absolute inset-0" />
      ) : null}
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8 simple:max-w-3xl">
        <header className="mb-8 max-w-3xl md:mb-10">
          {label ? (
            <p
              className={`mb-2 text-lg font-bold ${dark ? "text-gold-soft" : "text-primary"}`}
            >
              {label}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StarMark className="size-8 shrink-0 text-gold" />
            <h2
              id={headingId}
              className={`min-w-0 text-3xl font-semibold sm:text-4xl huge:max-sm:text-2xl ${
                dark ? "text-on-brand" : "text-brand"
              }`}
            >
              {title}
            </h2>
            {isSample ? <SampleBadge /> : null}
          </div>
          {/* Garis emas tipis di bawah judul. */}
          <span aria-hidden="true" className="mt-4 block h-0.5 w-16 rounded-full bg-gold" />
          {intro ? (
            <p
              className={`mt-3 text-xl ${dark ? "text-on-brand-soft" : "text-ink-soft"}`}
            >
              {intro}
            </p>
          ) : null}
        </header>
        {children}
        <BackToMenu dark={dark} />
      </div>
    </section>
  );
}
