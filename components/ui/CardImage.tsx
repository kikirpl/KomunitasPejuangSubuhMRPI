import Image from "next/image";
import { BookOpen, CalendarDays, Megaphone } from "lucide-react";
import type { AnnouncementType } from "@/types";

/** Jenis kartu bergambar: dua jenis Pengumuman, ditambah "kajian" untuk Jadwal Sepekan dan Kajian Hari Ini. */
export type CardImageType = AnnouncementType | "kajian";

const IKON: Record<CardImageType, typeof CalendarDays> = {
  kegiatan: CalendarDays,
  pengumuman: Megaphone,
  kajian: BookOpen,
};

interface CardImageProps {
  type: CardImageType;
  /** Lokal ("/kegiatan/foto.jpg" di folder public) atau URL remote yang diizinkan di next.config.ts. */
  imageUrl?: string;
  /** Teks alternatif; kosong = foto dianggap hiasan (judul kartu sudah menjelaskan). */
  alt?: string;
  /** Lebar tampil gambar per breakpoint, untuk srcset next/image. */
  sizes: string;
  /** Kelas tambahan untuk slot gambar, mis. batas tinggi pada kartu satu kolom yang sangat lebar. */
  className?: string;
}

/**
 * Slot gambar kartu, rasio 16:9. Ruangnya selalu dipesan (aspect-video), jadi
 * tidak ada pergeseran tata letak saat foto dimuat.
 * - Ada imageUrl: foto lewat next/image (fill + object-cover, lazy load bawaan).
 * - Tidak ada: gambar pengganti berupa gradien navy -> biru royal, pola bintang
 *   delapan yang sangat halus, dan ikon sesuai jenis (kalender / pengeras suara / buku).
 */
export function CardImage({ type, imageUrl, alt = "", sizes, className = "" }: CardImageProps) {
  const Ikon = IKON[type];

  return (
    <div className={`relative aspect-video overflow-hidden bg-brand-deep ${className}`}>
      {imageUrl ? (
        <Image src={imageUrl} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="on-dark absolute inset-0 grid place-items-center bg-linear-to-br from-brand-deep to-primary"
        >
          <div className="khatam-pattern absolute inset-0" />
          <span className="relative grid size-20 place-items-center rounded-full border border-gold/60 bg-brand-deep/40 sm:size-24 hc:border-2 hc:border-gold">
            <Ikon className="size-10 text-gold-soft sm:size-12" strokeWidth={1.5} />
          </span>
        </div>
      )}
    </div>
  );
}
