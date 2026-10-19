import { CalendarDays, Megaphone, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { CardImage } from "@/components/ui/CardImage";
import { buttonClass } from "@/components/ui/buttonStyles";
import { formatTanggalPengumuman, PESAN_KOSONG } from "@/lib/announcements";
import type { AnnouncementItem, AnnouncementType } from "@/types";

/**
 * Daftar kegiatan atau pengumuman satu jenis (satu tab), sudah terurut terbaru dulu: miniatur, judul, tanggal
 * lengkap (dengan jam bila ada), dan tombol Ubah. Tanpa butir: kalimat dan tombol Tambah untuk jenis itu.
 */
export function AnnouncementAdminList({
  jenis,
  items,
}: {
  jenis: AnnouncementType;
  items: readonly AnnouncementItem[];
}) {
  if (items.length === 0) {
    const Ikon = jenis === "kegiatan" ? CalendarDays : Megaphone;
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border-2 border-dashed border-line bg-card px-6 py-10 text-center">
        <Ikon aria-hidden className="size-10 text-accent" strokeWidth={1.75} />
        <p className="text-xl font-bold text-brand">{PESAN_KOSONG[jenis]}</p>
        <Link href={`/admin/pengumuman/baru?jenis=${jenis}`} className={buttonClass("outline", "lg", "w-full sm:w-auto")}>
          <Plus aria-hidden className="size-6" />
          Tambah {jenis}
        </Link>
      </div>
    );
  }

  return (
    <ul role="list" className="grid grid-cols-1 gap-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-4 rounded-card border border-line bg-card p-4 shadow-card hc:border-2"
        >
          <div className="flex gap-4">
            <div className="w-28 shrink-0 huge:hidden simple:hidden">
              <CardImage
                type={item.type}
                imageUrl={item.imageUrl}
                alt=""
                position={item.imagePosition}
                sizes="112px"
                className="rounded-control"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-semibold text-brand [overflow-wrap:anywhere]">{item.title}</h3>
              <p className="mt-1 text-lg text-ink-soft">
                <time dateTime={item.date}>{formatTanggalPengumuman(item.date)}</time>
              </p>
            </div>
          </div>
          <Link
            href={`/admin/pengumuman/${encodeURIComponent(item.id)}`}
            className={buttonClass("outline", "md", "w-full sm:w-auto sm:self-start")}
          >
            <Pencil aria-hidden className="size-6" />
            <span>
              Ubah<span className="sr-only">{`: ${item.title}`}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
