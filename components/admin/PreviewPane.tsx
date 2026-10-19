import type { ReactNode } from "react";

/** Bingkai pratinjau: kartu asli web ditampilkan di dalamnya, mengikuti isian formulir. */
export function PreviewPane({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="judul-pratinjau"
      className="rounded-card border-2 border-dashed border-ink-soft bg-paper-2 p-5"
    >
      <h2 id="judul-pratinjau" className="font-display text-2xl font-semibold text-brand">
        Pratinjau: begini tampilnya di web
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
