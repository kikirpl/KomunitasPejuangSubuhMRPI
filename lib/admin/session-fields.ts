import { MODE_LABEL, sessionForDay } from "@/lib/schedule";
import { isValidDateKey, weekdayOfKey } from "@/lib/time";
import type { SessionMode, StudySession } from "@/types";

/** Isian awal kolom Tempat bila cara mengikuti mencakup masjid. */
export const TEMPAT_AWAL = "Ruang utama masjid";

/** Tiga pilihan "Cara mengikuti" untuk `ChoiceCards`. */
export const CARA = (["masjid", "zoom", "hybrid"] as const).map((value) => ({
  value,
  title: MODE_LABEL[value],
}));

/** Cara mengikuti yang mencakup masjid (Di masjid, atau Di masjid dan Zoom): hanya itu yang punya Tempat. */
export const masjid = (mode: string): boolean => mode === "masjid" || mode === "hybrid";

/** Tempat setelah cara diganti: tempat kosong diisi isian awal bila kini mencakup masjid; selain itu tetap. */
export function tempatSetelahCara(cara: SessionMode, tempat: string): string {
  return masjid(cara) && tempat === "" ? TEMPAT_AWAL : tempat;
}

/** Kolom kajian yang dipakai jadwal tetap dan kajian pengganti. */
export const KOLOM_KAJIAN = ["startTime", "endTime", "ustadz", "topic", "mode", "location"] as const;
export type KolomKajian = (typeof KOLOM_KAJIAN)[number];
export type IsianKajian = Record<KolomKajian, string>;

/**
 * Isian kajian pengganti yang diusulkan untuk sebuah tanggal: jadwal tetap hari pada tanggal itu. Bila hari itu
 * tidak punya jadwal tetap (atau tanggalnya kosong atau tidak sah), isian awal: 05:00 sampai 06:00 dan sisanya kosong.
 */
export function isiDariJadwalTetap(sessions: readonly StudySession[], tanggal: string): IsianKajian {
  const sesi = isValidDateKey(tanggal) ? sessionForDay(sessions, weekdayOfKey(tanggal)) : undefined;
  if (!sesi) {
    return { startTime: "05:00", endTime: "06:00", ustadz: "", topic: "", mode: "", location: TEMPAT_AWAL };
  }
  return {
    startTime: sesi.startTime,
    endTime: sesi.endTime,
    ustadz: sesi.ustadz,
    topic: sesi.topic,
    mode: sesi.mode,
    location: sesi.location ?? "",
  };
}
