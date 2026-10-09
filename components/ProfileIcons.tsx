import type { PillarIcon } from "@/types";

/*
 * Ikon SVG inline untuk Empat Pilar Pergerakan. Gaya garisnya sama dengan
 * ikon lucide di bagian lain situs (24x24, garis 1,8, ujung membulat),
 * warnanya mengikuti `currentColor`.
 */
const PATHS: Record<PillarIcon, readonly string[]> = {
  // Masjid: kubah, dua menara, pintu lengkung.
  masjid: [
    "M2 21h20",
    "M7 21v-7h10v7",
    "M7 14a5 5 0 0 1 10 0",
    "M12 9V5.5",
    "M10.5 21v-2.5a1.5 1.5 0 0 1 3 0V21",
    "M3 21v-9l1-2 1 2v9",
    "M19 21v-9l1-2 1 2v9",
  ],
  // Mushaf terbuka di atas rehal.
  quran: [
    "M12 6.5C10 5 7 4.5 3.5 5v10.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z",
    "M12 6.5V17",
    "M8 21l8-4",
    "M16 21l-8-4",
  ],
  // Hati di atas telapak tangan terbuka.
  peduli: [
    "M2 13.5v7",
    "M2 14.5h2.8c.9 0 1.7.3 2.3.9l1.4 1.1h4a1.5 1.5 0 0 1 0 3H9",
    "M2 20.5h9.8c1 0 2-.4 2.7-1.1l5.5-5.6a1.6 1.6 0 0 0-2.3-2.3l-3.4 3.2",
    "M14 11c-2.2-1.7-4-3-4-5a2.2 2.2 0 0 1 4-1.3A2.2 2.2 0 0 1 18 6c0 2-1.8 3.3-4 5z",
  ],
  // Bola dunia.
  global: [
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    "M3 12h18",
    "M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z",
  ],
};

export function PillarIconSvg({
  name,
  className = "size-7",
}: {
  name: PillarIcon;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
