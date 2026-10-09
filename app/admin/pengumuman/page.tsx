import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementTabs } from "@/components/AnnouncementTabs";
import { AnnouncementAdminList } from "@/components/admin/AnnouncementAdminList";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { SuccessBanner } from "@/components/admin/SuccessBanner";
import { buttonClass } from "@/components/ui/buttonStyles";
import { loadAdminContext } from "@/lib/admin/context";
import { kelompokkanPerJenis } from "@/lib/announcements";

export const metadata: Metadata = { title: "Kegiatan dan Pengumuman" };

/** Daftar kegiatan dan pengumuman dalam dua tab seperti di web, terbaru dulu, dengan tombol Ubah dan Tambah. */
export default async function PengumumanAdmin({
  searchParams,
}: {
  searchParams: Promise<{ hasil?: string; jenis?: string }>;
}) {
  const { store, ready } = await loadAdminContext();
  const { hasil, jenis } = await searchParams;

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Kegiatan dan Pengumuman</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  const perJenis = kelompokkanPerJenis(await store.listAnnouncements());

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Kegiatan dan Pengumuman</h1>
      <p className="mt-2 text-xl text-ink-soft">
        Pilih kartu yang ingin diubah, atau tambah yang baru. Setelah disimpan, perubahan langsung tampil di web.
      </p>

      <SuccessBanner
        hasil={hasil === "tersimpan" || hasil === "terhapus" ? hasil : undefined}
        viewHref="/#pengumuman"
      />

      <Link href="/admin/pengumuman/baru" className={buttonClass("primary", "xl", "mt-6 w-full sm:w-auto")}>
        <Plus aria-hidden className="size-7" />
        Tambah kegiatan atau pengumuman
      </Link>

      <div className="mt-10">
        <AnnouncementTabs
          initial={jenis === "pengumuman" ? "pengumuman" : "kegiatan"}
          panels={{
            kegiatan: <AnnouncementAdminList jenis="kegiatan" items={perJenis.kegiatan} />,
            pengumuman: <AnnouncementAdminList jenis="pengumuman" items={perJenis.pengumuman} />,
          }}
        />
      </div>
    </div>
  );
}
