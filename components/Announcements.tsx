import { CalendarDays, Megaphone } from "lucide-react";
import { AnnouncementTabs } from "@/components/AnnouncementTabs";
import { CardImage } from "@/components/ui/CardImage";
import { Section } from "@/components/ui/Section";
import {
  formatTanggalPengumuman,
  kelompokkanPerJenis,
  LABEL_JENIS,
  PESAN_KOSONG,
} from "@/lib/announcements";
import type { AnnouncementData, AnnouncementItem, AnnouncementType } from "@/types";

/** Lebar tampil foto kartu: 2 kolom mulai 768px (maks. ~604px), 1 kolom di ponsel. */
const UKURAN_FOTO = "(min-width: 1296px) 604px, (min-width: 768px) 50vw, 100vw";

const lencana: Record<AnnouncementType, string> = {
  kegiatan: "border-line-soft bg-tint",
  pengumuman: "border-gilt bg-gold-tint",
};

/**
 * Section Pengumuman (Server Component). Kartu dirender di server, lalu
 * AnnouncementTabs (client) hanya mengatur tab mana yang tampil.
 */
export function Announcements({ data }: { data: AnnouncementData }) {
  const perJenis = kelompokkanPerJenis(data.items);

  return (
    <Section
      id="pengumuman"
      kepala="ringan"
      title="Pengumuman Kegiatan"
      intro="Kegiatan dan pengumuman terbaru dari Masjid Raya Pondok Indah."
      isSample={data.isSample}
    >
      <AnnouncementTabs
        panels={{
          kegiatan: <DaftarKartu jenis="kegiatan" items={perJenis.kegiatan} />,
          pengumuman: <DaftarKartu jenis="pengumuman" items={perJenis.pengumuman} />,
        }}
      />
    </Section>
  );
}

function DaftarKartu({ jenis, items }: { jenis: AnnouncementType; items: AnnouncementItem[] }) {
  if (items.length === 0) {
    const Ikon = jenis === "kegiatan" ? CalendarDays : Megaphone;
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border-2 border-dashed border-line bg-card px-6 py-12 text-center">
        <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-tint text-accent ring-1 ring-gilt/35 hc:ring-line">
          <Ikon className="size-8" strokeWidth={1.75} />
        </span>
        <p className="text-xl font-bold text-brand">{PESAN_KOSONG[jenis]}</p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 huge:md:grid-cols-1 simple:md:grid-cols-1"
    >
      {items.map((item) => (
        <li key={item.id}>
          <AnnouncementCard item={item} />
        </li>
      ))}
    </ul>
  );
}

/** Kartu satu kegiatan atau pengumuman. Diekspor agar panel pengurus memakainya untuk pratinjau. */
export function AnnouncementCard({ item }: { item: AnnouncementItem }) {
  const eksternal = item.href ? /^https?:\/\//.test(item.href) : false;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-card shadow-card transition-shadow duration-(--dur-state) ease-out-expo hover:shadow-elev-2 hc:border-2">
      <CardImage
        type={item.type}
        imageUrl={item.imageUrl}
        alt={item.imageAlt}
        position={item.imagePosition}
        sizes={UKURAN_FOTO}
      />
      <div className="flex flex-1 flex-col px-6 py-6 md:px-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className={`rounded-full border px-3.5 py-1 text-base font-bold text-brand hc:border-2 hc:border-line ${lencana[item.type]}`}
          >
            {LABEL_JENIS[item.type]}
          </span>
          <time dateTime={item.date} className="text-lg text-ink-soft">
            {formatTanggalPengumuman(item.date)}
          </time>
        </div>

        <h3 className="mt-3 text-2xl font-semibold text-brand [overflow-wrap:anywhere]">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-lg text-ink [overflow-wrap:anywhere] huge:line-clamp-none">{item.excerpt}</p>

        {item.href ? (
          <div className="mt-auto pt-4">
            <a
              href={item.href}
              {...(eksternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex min-h-11 items-center text-lg font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-primary-hover"
            >
              Selengkapnya
              <span className="sr-only">
                {`: ${item.title}`}
                {eksternal ? " (buka di tab baru)" : ""}
              </span>
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}
