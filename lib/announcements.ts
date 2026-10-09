import type { AnnouncementItem, AnnouncementType } from "@/types";

/* ==========================================================================
 * lib/announcements.ts: fungsi murni untuk section Pengumuman
 * (urutan, pengelompokan per tab, dan format tanggal WIB).
 * ========================================================================== */

export const JENIS_PENGUMUMAN: readonly AnnouncementType[] = ["kegiatan", "pengumuman"];

export const LABEL_JENIS: Record<AnnouncementType, string> = {
  kegiatan: "Kegiatan",
  pengumuman: "Pengumuman",
};

export const PESAN_KOSONG: Record<AnnouncementType, string> = {
  kegiatan: "Belum ada kegiatan.",
  pengumuman: "Belum ada pengumuman.",
};

const ZONA = "Asia/Jakarta";

const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", {
  timeZone: ZONA,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const FORMAT_JAM = new Intl.DateTimeFormat("id-ID", {
  timeZone: ZONA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Milidetik dari tanggal ISO. Jam tanpa zona ("2026-10-11T05:30") dianggap WIB,
 * bukan zona waktu server/perangkat. NaN bila tidak sah.
 */
function keMs(iso: string): number {
  const jamTanpaZona = /T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(iso);
  return Date.parse(jamTanpaZona ? `${iso}+07:00` : iso);
}

/** Waktu (ms) untuk pengurutan; tanggal tidak sah dianggap paling lama. */
function waktu(iso: string): number {
  const ms = keMs(iso);
  return Number.isNaN(ms) ? Number.NEGATIVE_INFINITY : ms;
}

/** Terbaru lebih dulu. Tidak mengubah array asal. */
export function urutkanTerbaru(items: readonly AnnouncementItem[]): AnnouncementItem[] {
  return [...items].sort((a, b) => waktu(b.date) - waktu(a.date));
}

/** Kelompokkan per jenis (tab), masing-masing sudah urut terbaru lebih dulu. */
export function kelompokkanPerJenis(
  items: readonly AnnouncementItem[],
): Record<AnnouncementType, AnnouncementItem[]> {
  const urut = urutkanTerbaru(items);
  return {
    kegiatan: urut.filter((item) => item.type === "kegiatan"),
    pengumuman: urut.filter((item) => item.type === "pengumuman"),
  };
}

/**
 * "2026-10-11" -> "Ahad, 11 Oktober 2026"
 * "2026-10-11T05:30:00+07:00" -> "Ahad, 11 Oktober 2026, pukul 05.30 WIB"
 * Format id-ID di zona WIB; "Minggu" ditulis "Ahad". Tanggal tidak sah dikembalikan apa adanya.
 */
export function formatTanggalPengumuman(iso: string): string {
  const ms = keMs(iso);
  if (Number.isNaN(ms)) return iso;
  const tanggal = new Date(ms);
  const teks = FORMAT_TANGGAL.formatToParts(tanggal)
    .map((bagian) =>
      bagian.type === "weekday" && bagian.value === "Minggu" ? "Ahad" : bagian.value,
    )
    .join("");
  // Jam hanya ditampilkan bila tanggal ISO memuat jam ("...T05:30...").
  return iso.includes("T") ? `${teks}, pukul ${FORMAT_JAM.format(tanggal)} WIB` : teks;
}
