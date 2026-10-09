import type { SectionKey } from "@/types";

/** Layar panel tempat penanda contoh atau resmi diubah; hanya ini yang boleh menjadi tujuan kembali. */
export const KEMBALI_STATUS = ["/admin", "/admin/jadwal", "/admin/pengumuman"] as const;
export type KembaliStatus = (typeof KEMBALI_STATUS)[number];

export function isKembaliStatus(nilai: unknown): nilai is KembaliStatus {
  return typeof nilai === "string" && (KEMBALI_STATUS as readonly string[]).includes(nilai);
}

export function isSectionKey(nilai: unknown): nilai is SectionKey {
  return nilai === "schedule" || nilai === "announcements";
}

/** Nama bagian web yang dikelola panel, dalam bahasa pengurus. */
export const LABEL_BAGIAN: Record<SectionKey, string> = {
  schedule: "Jadwal Kajian",
  announcements: "Kegiatan dan Pengumuman",
};
