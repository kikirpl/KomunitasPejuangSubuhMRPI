import type { Metadata } from "next";
import { simpanPengecualian } from "@/app/admin/actions/pengecualian";
import { OverrideForm } from "@/components/admin/OverrideForm";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { loadAdminContext } from "@/lib/admin/context";
import { todayKey } from "@/lib/time";

export const metadata: Metadata = { title: "Liburkan atau ganti satu tanggal" };

/** Form perubahan baru untuk satu tanggal: Libur atau Ganti jadwal. */
export default async function PengecualianBaru() {
  const { store, ready } = await loadAdminContext();

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Liburkan atau ganti satu tanggal</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  const hariIni = todayKey();
  const [sessions, overrides] = await Promise.all([store.listSessions(), store.listOverrides(hariIni)]);

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Liburkan atau ganti satu tanggal</h1>
      <p className="mt-2 text-xl text-ink-soft">
        Pilih tanggalnya, lalu pilih Libur atau Ganti jadwal. Jadwal tetap tiap pekan tidak ikut berubah.
      </p>
      <div className="mt-8">
        <OverrideForm
          original={null}
          initial={null}
          sessions={sessions}
          todayKey={hariIni}
          takenDates={overrides.map((o) => o.date)}
          action={simpanPengecualian.bind(null, null)}
        />
      </div>
    </div>
  );
}
