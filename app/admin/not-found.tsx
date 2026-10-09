import { SearchX } from "lucide-react";

/** Halaman yang tidak ada di dalam panel (mis. alamat hari yang salah): kalimat sehari-hari, bukan "404". */
export default function AdminNotFound() {
  return (
    <div className="rounded-2xl border border-line bg-card p-8 shadow-card hc:border-2">
      <h1 className="flex items-start gap-3 font-display text-4xl font-semibold text-brand">
        <SearchX aria-hidden className="mt-1 size-9 shrink-0 huge:hidden" />
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 text-xl text-ink-soft">
        Alamat yang dibuka tidak ada di panel. Gunakan tautan “Kembali ke Panel” di atas untuk memilih yang ingin diubah.
      </p>
    </div>
  );
}
