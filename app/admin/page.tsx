import { CalendarDays, ChevronRight, CircleAlert, CircleCheck, Globe, Megaphone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { SampleStatus } from "@/components/admin/SampleStatus";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { SuccessBanner } from "@/components/admin/SuccessBanner";
import { buttonClass } from "@/components/ui/buttonStyles";
import { loadAdminContext } from "@/lib/admin/context";
import { MESSAGE_STATUS_FAILED } from "@/lib/admin/form-state";
import { LABEL_BAGIAN } from "@/lib/admin/status";

type Ikon = typeof CalendarDays;

/** Kartu besar menuju satu bagian panel. Bila database belum siap, menjadi elemen nonaktif (bukan tautan). */
function KartuMenu({
  href,
  Ikon: IkonKartu,
  judul,
  keterangan,
  aktif,
}: {
  href: string;
  Ikon: Ikon;
  judul: string;
  keterangan: string;
  aktif: boolean;
}) {
  const isi: ReactNode = (
    <>
      <span className="grid size-16 shrink-0 place-items-center rounded-control bg-brand-deep text-gold huge:hidden">
        <IkonKartu aria-hidden className="size-9" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-3xl font-semibold text-brand [overflow-wrap:anywhere]">
          {judul}
        </span>
        <span className="mt-1 block text-xl text-ink-soft">{keterangan}</span>
      </span>
      {aktif ? <ChevronRight aria-hidden className="size-8 shrink-0 text-primary huge:hidden" /> : null}
    </>
  );
  const dasar = "flex items-center gap-5 rounded-card border-2 bg-card p-6 shadow-card hc:border-black";

  // next/link (bukan <a>): perpindahan terjadi di peramban dan kerangka pemuat (loading.tsx) tampil seketika.
  return aktif ? (
    <Link href={href} className={`${dasar} border-primary hover:border-accent hover:bg-tint`}>
      {isi}
    </Link>
  ) : (
    <div aria-disabled="true" className={`${dasar} border-line opacity-60`}>
      {isi}
    </div>
  );
}

/** Beranda panel: dua pilihan besar, tombol Lihat web, dan pemberitahuan bila database belum siap. */
export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ hasil?: string; galat?: string }>;
}) {
  const { admin, store, ready } = await loadAdminContext();
  const { hasil, galat } = await searchParams;
  const aktif = Boolean(store) && ready;
  const bendera = store && ready ? await store.getSampleFlags() : null;

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Panel Pengurus</h1>
      <p className="mt-2 text-lg text-ink-soft [overflow-wrap:anywhere]">Masuk sebagai {admin.email}</p>

      {hasil === "siap" && aktif ? (
        <p
          role="status"
          className="mt-6 flex items-center gap-3 rounded-control border-2 border-primary bg-tint px-5 py-4 text-xl font-bold text-brand hc:border-black"
        >
          <CircleCheck aria-hidden className="size-7 shrink-0" />
          Database sudah disiapkan. Silakan pilih yang ingin diubah.
        </p>
      ) : null}
      <SuccessBanner
        hasil={aktif && (hasil === "tersimpan" || hasil === "terhapus") ? hasil : undefined}
        viewHref="/"
      />
      {galat === "status" ? <ErrorBanner>{MESSAGE_STATUS_FAILED}</ErrorBanner> : null}
      {galat === "setup" ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-control border-2 border-gold bg-gold-tint px-5 py-4 text-xl font-bold text-ink hc:border-black"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-7 shrink-0 text-brand" />
          Database belum berhasil disiapkan. Periksa sambungan, lalu coba lagi; bila terulang, hubungi pengelola web.
        </p>
      ) : null}
      {!store ? <StoreNotice state="missing" /> : !ready ? <StoreNotice state="not-ready" /> : null}

      <ul role="list" className="mt-8 grid grid-cols-1 gap-5">
        <li>
          <KartuMenu
            href="/admin/jadwal"
            Ikon={CalendarDays}
            judul="Jadwal Kajian"
            keterangan="Ubah jam, ustadz, tema; liburkan atau ganti satu tanggal"
            aktif={aktif}
          />
        </li>
        <li>
          <KartuMenu
            href="/admin/pengumuman"
            Ikon={Megaphone}
            judul="Kegiatan dan Pengumuman"
            keterangan="Tambah, ubah, atau hapus"
            aktif={aktif}
          />
        </li>
      </ul>

      {bendera ? (
        <>
          <SampleStatus section="schedule" isSample={bendera.schedule} label={LABEL_BAGIAN.schedule} kembali="/admin" />
          <SampleStatus
            section="announcements"
            isSample={bendera.announcements}
            label={LABEL_BAGIAN.announcements}
            kembali="/admin"
          />
        </>
      ) : null}

      {/* prefetch dimatikan: web publik dibuat ulang setiap Simpan, jangan tampilkan salinan lama. */}
      <Link href="/" prefetch={false} className={buttonClass("outline", "lg", "mt-8")}>
        <Globe aria-hidden className="size-7" />
        Lihat web
      </Link>
    </div>
  );
}
