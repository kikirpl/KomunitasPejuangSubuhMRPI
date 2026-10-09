import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hapusJadwalHari, simpanJadwalHari } from "@/app/admin/actions/jadwal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SessionForm } from "@/components/admin/SessionForm";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { MESSAGE_DELETE_FAILED } from "@/lib/admin/form-state";
import { loadAdminContext } from "@/lib/admin/context";
import { blobPublicHost } from "@/lib/photo/host";
import { dayFromSlug, dayName } from "@/lib/time";
import type { SessionInput } from "@/lib/store/types";

export const metadata: Metadata = { title: "Ubah jadwal" };

/** Form satu hari jadwal tetap: ubah, tambah (bila hari itu kosong), atau hapus. */
export default async function HalamanHari({
  params,
  searchParams,
}: {
  params: Promise<{ hari: string }>;
  searchParams: Promise<{ galat?: string }>;
}) {
  const { store, ready } = await loadAdminContext();
  const { hari } = await params;
  const day = dayFromSlug(hari);
  if (day === null) notFound();
  const nama = dayName(day);

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Jadwal hari {nama}</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  const [{ galat }, sesi] = await Promise.all([searchParams, store.getSession(day)]);
  const awal: SessionInput | null = sesi
    ? {
        startTime: sesi.startTime,
        endTime: sesi.endTime,
        ustadz: sesi.ustadz,
        topic: sesi.topic,
        mode: sesi.mode,
        ...(sesi.location ? { location: sesi.location } : {}),
        ...(sesi.imageUrl ? { imageUrl: sesi.imageUrl } : {}),
        ...(sesi.imageAlt ? { imageAlt: sesi.imageAlt } : {}),
        imagePosition: sesi.imagePosition ?? "center",
      }
    : null;

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">
        {sesi ? `Ubah jadwal hari ${nama}` : `Tambah kajian hari ${nama}`}
      </h1>
      <p className="mt-2 text-xl text-ink-soft">Setelah disimpan, perubahan langsung tampil di web.</p>

      {galat === "hapus" ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border-2 border-danger bg-danger-tint px-5 py-4 text-xl font-bold text-danger"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-7 shrink-0" />
          {MESSAGE_DELETE_FAILED}
        </p>
      ) : null}

      <div className="mt-8">
        <SessionForm
          day={day}
          initial={awal}
          blobHost={blobPublicHost()}
          action={simpanJadwalHari.bind(null, day)}
        />
      </div>

      {sesi ? (
        <section aria-labelledby="judul-hapus" className="mt-12 border-t-2 border-line pt-8">
          <h2 id="judul-hapus" className="font-display text-2xl font-semibold text-brand">
            Hari {nama} tidak ada kajian?
          </h2>
          <p className="mb-5 mt-2 text-xl text-ink-soft">
            Hapus jadwal hari ini. Web akan menampilkan “Hari ini tidak ada kajian” setiap hari {nama}.
          </p>
          <ConfirmDialog
            triggerLabel="Tidak ada kajian di hari ini"
            title={`Hapus jadwal hari ${nama}?`}
            message={`Web akan menampilkan 'Hari ini tidak ada kajian' setiap ${nama}. Ini tidak bisa dibatalkan.`}
            confirmLabel="Ya, hapus"
            action={hapusJadwalHari.bind(null, day)}
          />
        </section>
      ) : null}
    </div>
  );
}
