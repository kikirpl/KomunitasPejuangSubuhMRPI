/**
 * Penanda "data contoh". Muncul selama bagian itu bertanda contoh (`isSample`;
 * pengurus menandainya resmi di Panel Pengurus), supaya data sementara tidak pernah dianggap resmi oleh jamaah.
 * Warna latar solid agar terbaca di latar terang maupun gelap.
 */
export function SampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-dashed border-gilt bg-gold-tint px-3.5 py-1 text-base font-bold text-brand hc:border-black hc:bg-white hc:text-black ${className}`}
      title="Bagian ini masih memakai data contoh. Pengurus dapat menandainya resmi di Panel Pengurus."
    >
      Contoh data, belum resmi
    </span>
  );
}
