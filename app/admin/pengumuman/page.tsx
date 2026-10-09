import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementTabs } from "@/components/AnnouncementTabs";
import { AnnouncementAdminList } from "@/components/admin/AnnouncementAdminList";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { SampleStatus } from "@/components/admin/SampleStatus";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { SuccessBanner } from "@/components/admin/SuccessBanner";
import { buttonClass } from "@/components/ui/buttonStyles";
import { loadAdminContext } from "@/lib/admin/context";
import { MESSAGE_STATUS_FAILED } from "@/lib/admin/form-state";
import { LABEL_BAGIAN } from "@/lib/admin/status";
import { kelompokkanPerJenis } from "@/lib/announcements";

export const metadata: Metadata = { title: "Kegiatan dan Pengumuman" };

/** Daftar kegiatan dan pengumuman dalam dua tab seperti di web, terbaru dulu, dengan tombol Ubah dan Tambah. */
export default async function PengumumanAdmin({
  searchParams,
}: {
  searchParams: Promise<{ hasil?: string; jenis?: string; galat?: string }>;
}) {
  const { store, ready } = await loadAdminContext();
  const { hasil, jenis, galat } = await searchParams;

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Kegiatan dan Pengumuman</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  const [butir, bendera] = await Promise.all([store.listAnnouncements(), store.getSampleFlags()]);
  const perJenis = kelompokkanPerJenis(butir);

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

      {galat === "status" ? <ErrorBanner>{MESSAGE_STATUS_FAILED}</ErrorBanner> : null}
      <SampleStatus
        section="announcements"
        isSample={bendera.announcements}
        label={LABEL_BAGIAN.announcements}
        kembali="/admin/pengumuman"
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
