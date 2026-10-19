import type { ReactNode } from "react";

/**
 * Rosette penanda, meniru penanda akhir ayat pada mushaf: bintang delapan dalam lingkaran
 * bergaris daun emas, dengan angka atau ikon di tengahnya. Dipakai untuk urutan yang memang
 * bermakna (langkah bergabung Zoom, butir misi) dan sebagai butir daftar.
 */
export function Rosette({
  children,
  className = "size-12",
  dark = false,
}: {
  children?: ReactNode;
  className?: string;
  /** Di atas latar gelap: garis emas terang dan angka putih. */
  dark?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center font-display font-semibold leading-none tabular-nums ${
        dark ? "text-on-brand" : "text-brand"
      } ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        focusable="false"
        className={`absolute inset-0 size-full ${dark ? "text-gold-soft" : "text-gilt"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <circle cx="24" cy="24" r="22.25" strokeOpacity="0.55" />
        <rect x="11" y="11" width="26" height="26" />
        <rect x="11" y="11" width="26" height="26" transform="rotate(45 24 24)" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}
