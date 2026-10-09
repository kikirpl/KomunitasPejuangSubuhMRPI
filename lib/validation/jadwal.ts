import { z } from "zod";
import type { SessionInput } from "@/lib/store/types";
import { addDaysToKey, isValidDateKey } from "@/lib/time";
import type { SessionOverride } from "@/types";
import { jam, keTeks, kolomFoto, PESAN, POLA_JAM, SELALU, teksOpsional, teksWajib } from "./umum";

const cara = z.preprocess(keTeks, z.enum(["masjid", "zoom", "hybrid"], { error: PESAN.caraKosong }));

/** Kolom kajian yang dipakai jadwal tetap maupun kajian pengganti. */
const kolomInti = {
  startTime: jam(PESAN.jamMulaiKosong),
  endTime: jam(PESAN.jamSelesaiKosong),
  ustadz: teksWajib(PESAN.ustadzKosong, 120, PESAN.ustadzPanjang),
  topic: teksWajib(PESAN.temaKosong, 200, PESAN.temaPanjang),
  mode: cara,
  location: teksOpsional(120, PESAN.tempatPanjang),
};

/** Jam selesai harus setelah jam mulai (hanya diperiksa bila keduanya jam yang sah). */
function urutanJam(
  v: { startTime: string; endTime: string },
  tambah: (kolom: string, pesan: string) => void,
): void {
  if (POLA_JAM.test(v.startTime) && POLA_JAM.test(v.endTime) && v.endTime <= v.startTime) {
    tambah("endTime", PESAN.selesaiSetelahMulai);
  }
}

const inti = z.object(kolomInti).superRefine((v, ctx) => {
  urutanJam(v, (kolom, pesan) => ctx.addIssue({ code: "custom", path: [kolom], message: pesan }));
}, SELALU);

/** Isian satu hari jadwal tetap, termasuk foto. Kolom foto opsional; `fotoMasihDiunggah=1` menahan penyimpanan. */
export function sessionSchema(blobHost: string | undefined): z.ZodType<SessionInput> {
  return z
    .object({
      ...kolomInti,
      ...kolomFoto(blobHost),
    })
    .superRefine((v, ctx) => {
      urutanJam(v, (kolom, pesan) => ctx.addIssue({ code: "custom", path: [kolom], message: pesan }));
      if (v.fotoMasihDiunggah === "1") {
        ctx.addIssue({ code: "custom", path: ["imageUrl"], message: PESAN.fotoMasihDiunggah });
      }
    }, SELALU)
    .transform(
      (v): SessionInput => ({
        startTime: v.startTime,
        endTime: v.endTime,
        ustadz: v.ustadz,
        topic: v.topic,
        mode: v.mode,
        ...(v.location ? { location: v.location } : {}),
        ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
        ...(v.imageAlt ? { imageAlt: v.imageAlt } : {}),
        imagePosition: v.imagePosition,
      }),
    );
}

/**
 * Isian satu pengecualian tanggal. Tanggal baru: hari ini sampai hari ini + 366 hari. Kolom kajian hanya
 * diperiksa bila `kind = "ganti"`; untuk "libur" diabaikan sepenuhnya (bahkan yang rusak).
 */
export function overrideSchema(todayKey: string): z.ZodType<SessionOverride> {
  const batas = addDaysToKey(todayKey, 366);
  const mentah = z.preprocess(keTeks, z.string());
  return z
    .object({
      date: z
        .preprocess(keTeks, z.string().trim())
        .superRefine((tanggal, ctx) => {
          if (!isValidDateKey(tanggal)) ctx.addIssue({ code: "custom", message: PESAN.tanggalKosong });
          else if (tanggal < todayKey) ctx.addIssue({ code: "custom", message: PESAN.tanggalLampau });
          else if (tanggal > batas) ctx.addIssue({ code: "custom", message: PESAN.tanggalTerlaluJauh });
        }),
      kind: z.preprocess(keTeks, z.enum(["libur", "ganti"], { error: PESAN.pilihanKosong })),
      note: teksOpsional(200, PESAN.catatanPanjang),
      startTime: mentah,
      endTime: mentah,
      ustadz: mentah,
      topic: mentah,
      mode: mentah,
      location: mentah,
    })
    .superRefine((v, ctx) => {
      if (v.kind !== "ganti") return;
      const hasil = inti.safeParse(v);
      if (hasil.success) return;
      for (const isu of hasil.error.issues) {
        ctx.addIssue({ code: "custom", path: isu.path, message: isu.message });
      }
    }, SELALU)
    .transform((v): SessionOverride => {
      const dasar = { date: v.date, ...(v.note ? { note: v.note } : {}) };
      if (v.kind === "libur") return { ...dasar, kind: "libur" };
      const s = inti.parse(v);
      return {
        ...dasar,
        kind: "ganti",
        session: {
          startTime: s.startTime,
          endTime: s.endTime,
          ustadz: s.ustadz,
          topic: s.topic,
          mode: s.mode,
          ...(s.location ? { location: s.location } : {}),
        },
      };
    });
}
