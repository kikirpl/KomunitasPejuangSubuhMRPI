import { StarMark } from "@/components/ui/StarMark";

/**
 * Pemisah iluminasi rata kiri: garis emas pendek, bintang delapan, garis emas yang memudar.
 * Dipakai di bawah judul beranda (di atas langit gelap: `tone="dark"`) dan judul layar panel.
 */
export function Pemisah({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const warna = tone === "dark" ? "text-gold" : "text-gilt";
  const garis = tone === "dark" ? "bg-gold" : "bg-gilt";
  const pudar = tone === "dark" ? "from-gold" : "from-gilt";
  return (
    <span aria-hidden="true" className={`flex items-center gap-3 ${warna} hc:hidden ${className}`}>
      <span className={`h-px w-8 ${garis}`} />
      <StarMark className="size-5" />
      <span className={`h-px w-28 bg-linear-to-r ${pudar} to-transparent`} />
    </span>
  );
}
