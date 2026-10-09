/**
 * Penanda "data contoh". Muncul selama `isSample: true` di data/content.ts,
 * supaya data sementara tidak pernah dianggap resmi oleh jamaah.
 * Warna latar solid agar terbaca di latar terang maupun gelap.
 */
export function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-[1.25rem] border-2 border-dashed border-gold bg-gold-tint px-3.5 py-1 text-base font-bold text-brand hc:border-black hc:bg-white hc:text-black ${className}`}
      title="Bagian ini masih memakai data contoh. Ganti di data/content.ts lalu ubah isSample menjadi false."
    >
      Contoh data, belum resmi
    </span>
  );
}
