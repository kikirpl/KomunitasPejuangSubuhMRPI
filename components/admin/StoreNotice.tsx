import { Database } from "lucide-react";
import { siapkanDatabase } from "@/app/admin/actions/setup";
import { SaveButton } from "@/components/admin/SaveButton";

/**
 * Pemberitahuan di beranda panel bila database belum bisa dipakai:
 * - missing: belum dipasang (tugas pengelola web, bukan pengurus);
 * - not-ready: terpasang tetapi tabel belum dibuat; satu tombol menyiapkannya.
 */
export function StoreNotice({ state }: { state: "missing" | "not-ready" }) {
  return (
    <section
      aria-labelledby="pemberitahuan-database"
      className="mt-6 rounded-2xl border-2 border-gold bg-gold-tint p-6 hc:border-black"
    >
      <h2 id="pemberitahuan-database" className="flex items-start gap-3 text-2xl font-bold text-brand">
        <Database aria-hidden className="mt-0.5 size-8 shrink-0" />
        {state === "missing" ? "Database belum dipasang. Hubungi pengelola web." : "Database belum disiapkan."}
      </h2>
      {state === "missing" ? (
        <p className="mt-3 text-xl text-ink">
          Sampai database dipasang, jadwal dan pengumuman belum bisa diubah dari panel.
        </p>
      ) : (
        <>
          <p className="mt-3 text-xl text-ink">
            Tekan tombol ini sekali saja. Jadwal dan pengumuman yang tampil sekarang akan disalin ke
            database, jadi tampilan web tidak berubah.
          </p>
          <form action={siapkanDatabase} className="mt-5">
            <SaveButton label="Siapkan database" pendingLabel="Menyiapkan..." />
          </form>
        </>
      )}
    </section>
  );
}
