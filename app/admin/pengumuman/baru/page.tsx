import type { Metadata } from "next";
import { simpanPengumuman } from "@/app/admin/actions/pengumuman";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { loadAdminContext } from "@/lib/admin/context";
import { blobPublicHost, photoUploadEnabled } from "@/lib/photo/host";
import { todayKey } from "@/lib/time";

export const metadata: Metadata = { title: "Tambah kegiatan atau pengumuman" };

/**
 * Form kegiatan atau pengumuman baru. `id` dibuat di sini (UUID) dan dikirim sebagai isian tersembunyi, jadi menekan
 * Simpan dua kali atau mengirim ulang permintaan tetap menghasilkan satu kartu. `?jenis=` memilih jenisnya lebih dulu.
 */
export default async function PengumumanBaru({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const { store, ready } = await loadAdminContext();
  const { jenis } = await searchParams;

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Tambah kegiatan atau pengumuman</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Tambah kegiatan atau pengumuman</h1>
      <p className="mt-2 text-xl text-ink-soft">Setelah disimpan, kartunya langsung tampil di web.</p>
      <div className="mt-8">
        <AnnouncementForm
          initial={{
            id: crypto.randomUUID(),
            type: jenis === "kegiatan" || jenis === "pengumuman" ? jenis : "",
            title: "",
            date: "",
            time: "",
            excerpt: "",
            imageUrl: "",
            imageAlt: "",
            imagePosition: "center",
            href: "",
          }}
          todayKey={todayKey()}
          blobHost={blobPublicHost()}
          uploadEnabled={photoUploadEnabled()}
          action={simpanPengumuman}
        />
      </div>
    </div>
  );
}
