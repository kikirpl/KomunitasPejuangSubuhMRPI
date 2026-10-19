/**
 * Kerangka pemuat untuk semua halaman panel. Database gratis yang "tidur" perlu waktu untuk
 * bangun, jadi halaman pertama setelah lama tidak dipakai bisa lebih lambat.
 */
export default function Loading() {
  return (
    <div role="status" className="rounded-card border border-line bg-card p-8 shadow-card hc:border-2">
      <p className="text-xl text-ink-soft">Memuat...</p>
      <div aria-hidden className="mt-5 space-y-3">
        <div className="h-8 w-1/3 animate-pulse rounded bg-paper-2" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-paper-2" />
      </div>
    </div>
  );
}
