import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hapusPengumuman, simpanPengumuman } from "@/app/admin/actions/pengumuman";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { loadAdminContext } from "@/lib/admin/context";
import { MESSAGE_DELETE_FAILED } from "@/lib/admin/form-state";
import { pisahTanggalJam } from "@/lib/announcements";
import { blobPublicHost, photoUploadEnabled } from "@/lib/photo/host";
import { todayKey } from "@/lib/time";

export const metadata: Metadata = { title: "Ubah kegiatan atau pengumuman" };

/** Ubah atau hapus satu kegiatan atau pengumuman yang sudah ada. */
export default async function PengumumanUbah({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ galat?: string }>;
}) {
  const { store, ready } = await loadAdminContext();
  const { id: idMentah } = await params;
  const id = decodeURIComponent(idMentah);

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Ubah kegiatan atau pengumuman</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  const [{ galat }, butir] = await Promise.all([searchParams, store.getAnnouncement(id)]);
  if (!butir) notFound();
  const { date, time } = pisahTanggalJam(butir.date);

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Ubah kegiatan atau pengumuman</h1>
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
        <AnnouncementForm
          initial={{
            id: butir.id,
            type: butir.type,
            title: butir.title,
            date,
            time,
            excerpt: butir.excerpt,
            imageUrl: butir.imageUrl ?? "",
            imageAlt: butir.imageAlt ?? "",
            imagePosition: butir.imagePosition ?? "center",
            href: butir.href ?? "",
          }}
          todayKey={todayKey()}
          blobHost={blobPublicHost()}
          uploadEnabled={photoUploadEnabled()}
          action={simpanPengumuman}
        />
      </div>

      <section aria-labelledby="judul-hapus" className="mt-12 border-t-2 border-line pt-8">
        <h2 id="judul-hapus" className="font-display text-2xl font-semibold text-brand">
          Kartu ini tidak diperlukan lagi?
        </h2>
        <p className="mb-5 mt-2 text-xl text-ink-soft">Hapus kartu ini, maka kartunya hilang dari web.</p>
        <ConfirmDialog
          triggerLabel="Hapus kartu ini"
          title={`Hapus “${butir.title}”?`}
          message="Kartu ini akan hilang dari web. Ini tidak bisa dibatalkan."
          confirmLabel="Ya, hapus"
          action={hapusPengumuman}
          hidden={{ id: butir.id, jenis: butir.type }}
        />
      </section>
    </div>
  );
}
