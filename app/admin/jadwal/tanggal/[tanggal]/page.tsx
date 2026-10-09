import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hapusPengecualian, simpanPengecualian } from "@/app/admin/actions/pengecualian";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { OverrideForm } from "@/components/admin/OverrideForm";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { loadAdminContext } from "@/lib/admin/context";
import { MESSAGE_DELETE_FAILED } from "@/lib/admin/form-state";
import { formatDateKeyLong, isValidDateKey, todayKey } from "@/lib/time";

export const metadata: Metadata = { title: "Ubah perubahan tanggal" };

/** Ubah atau hapus perubahan yang sudah ada untuk satu tanggal (hari ini dan setelahnya). */
export default async function PengecualianTanggal({
  params,
  searchParams,
}: {
  params: Promise<{ tanggal: string }>;
  searchParams: Promise<{ galat?: string }>;
}) {
  const { store, ready } = await loadAdminContext();
  const { tanggal } = await params;
  const hariIni = todayKey();
  // Tanggal yang sudah lewat tidak tampil di daftar dan tidak bisa disimpan ulang (aturan "tidak boleh sebelum hari ini").
  if (!isValidDateKey(tanggal) || tanggal < hariIni) notFound();
  const lengkap = formatDateKeyLong(tanggal);

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Ubah perubahan untuk {lengkap}</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  const [{ galat }, entri, sessions, overrides] = await Promise.all([
    searchParams,
    store.getOverride(tanggal),
    store.listSessions(),
    store.listOverrides(hariIni),
  ]);
  if (!entri) notFound();

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Ubah perubahan untuk {lengkap}</h1>
      <p className="mt-2 text-xl text-ink-soft">Setelah disimpan, perubahan langsung tampil di web.</p>

      {galat === "hapus" ? <ErrorBanner>{MESSAGE_DELETE_FAILED}</ErrorBanner> : null}

      <div className="mt-8">
        <OverrideForm
          original={tanggal}
          initial={entri}
          sessions={sessions}
          todayKey={hariIni}
          takenDates={overrides.map((o) => o.date)}
          action={simpanPengecualian.bind(null, tanggal)}
        />
      </div>

      <section aria-labelledby="judul-hapus" className="mt-12 border-t-2 border-line pt-8">
        <h2 id="judul-hapus" className="font-display text-2xl font-semibold text-brand">
          Tidak perlu lagi?
        </h2>
        <p className="mb-5 mt-2 text-xl text-ink-soft">
          Hapus perubahan ini, maka jadwal tetap hari itu berlaku kembali.
        </p>
        <ConfirmDialog
          triggerLabel="Hapus perubahan ini"
          title={`Hapus perubahan untuk ${lengkap}?`}
          message="Jadwal tetap hari itu berlaku kembali."
          confirmLabel="Ya, hapus"
          action={hapusPengecualian.bind(null, tanggal)}
        />
      </section>
    </div>
  );
}
