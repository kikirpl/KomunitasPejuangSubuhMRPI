import { z } from "zod";
import type { AnnouncementInput } from "@/lib/store/types";
import { addDaysToKey, isValidDateKey } from "@/lib/time";
import { keTeks, kolomFoto, PESAN, POLA_JAM, SELALU, teksWajib } from "./umum";

/** Batas bawah tanggal kegiatan atau pengumuman: sebelum ini dianggap salah ketik tahun. */
const TANGGAL_TERAWAL = "2020-01-01";
/** Batas atas: paling jauh dua tahun (731 hari) dari hari ini. */
const HARI_KE_DEPAN = 731;
/** Id dari halaman "baru" (UUID) atau id data awal ("a1"): huruf, angka, garis, paling banyak 64. */
const POLA_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

/** Tautan "Selengkapnya": https, http, jalur lokal ("/..." bukan "//..."), atau jangkar ("#..."). Kosong boleh. */
function tautanSah(nilai: string): boolean {
  if (nilai === "" || nilai.startsWith("#")) return true;
  if (nilai.startsWith("/")) return !nilai.startsWith("//") && !nilai.startsWith("/\\");
  if (!/^https?:\/\//i.test(nilai)) return false;
  try {
    new URL(nilai);
    return true;
  } catch {
    return false;
  }
}

/**
 * Isian satu kegiatan atau pengumuman. `id` datang dari isian tersembunyi (UUID yang dibuat halaman "baru"), jadi
 * menyimpan dua kali menghasilkan satu butir. Tanggal boleh lampau (dari 2020-01-01) sampai dua tahun ke depan;
 * jam, tautan, dan foto boleh kosong (menjadi tidak ada).
 */
export function announcementSchema(opts: { blobHost?: string; todayKey: string }): z.ZodType<AnnouncementInput> {
  const terjauh = addDaysToKey(opts.todayKey, HARI_KE_DEPAN);
  return z
    .object({
      id: z.preprocess(keTeks, z.string().trim().regex(POLA_ID, { error: PESAN.formulirKedaluwarsa })),
      type: z.preprocess(keTeks, z.enum(["kegiatan", "pengumuman"], { error: PESAN.jenisKosong })),
      title: teksWajib(PESAN.judulKosong, 140, PESAN.judulPanjang),
      date: z.preprocess(keTeks, z.string().trim()).superRefine((tanggal, ctx) => {
        if (!isValidDateKey(tanggal)) ctx.addIssue({ code: "custom", message: PESAN.tanggalKosong });
        else if (tanggal < TANGGAL_TERAWAL || tanggal > terjauh) {
          ctx.addIssue({ code: "custom", message: PESAN.tanggalTidakMasukAkal });
        }
      }),
      time: z.preprocess(
        keTeks,
        z
          .string()
          .trim()
          .refine((jam) => jam === "" || POLA_JAM.test(jam), { error: PESAN.jamTidakSah })
          .transform((jam) => (jam === "" ? undefined : jam)),
      ),
      excerpt: teksWajib(PESAN.ringkasanKosong, 400, PESAN.ringkasanPanjang),
      href: z.preprocess(
        keTeks,
        z
          .string()
          .trim()
          .max(500, { error: PESAN.tautanPanjang })
          .refine(tautanSah, { error: PESAN.tautanSalah })
          .transform((tautan) => (tautan === "" ? undefined : tautan)),
      ),
      ...kolomFoto(opts.blobHost),
    })
    .superRefine((v, ctx) => {
      if (v.fotoMasihDiunggah === "1") {
        ctx.addIssue({ code: "custom", path: ["imageUrl"], message: PESAN.fotoMasihDiunggah });
      }
    }, SELALU)
    .transform(
      (v): AnnouncementInput => ({
        id: v.id,
        type: v.type,
        title: v.title,
        date: v.date,
        ...(v.time ? { time: v.time } : {}),
        excerpt: v.excerpt,
        ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
        ...(v.imageAlt ? { imageAlt: v.imageAlt } : {}),
        imagePosition: v.imagePosition,
        ...(v.href ? { href: v.href } : {}),
      }),
    );
}
