import { z } from "zod";
import { isAllowedImageUrl } from "@/lib/photo/rules";

/** Isian formulir apa adanya: nama kolom -> teks. */
export type RawForm = Record<string, string>;
/** Satu pesan galat per kolom (kunci = nama kolom formulir). */
export type FieldErrors = Record<string, string>;

/** Isian formulir sebagai teks; berkas (bila ada) diabaikan. */
export function rawFromFormData(formData: FormData): RawForm {
  const raw: RawForm = {};
  for (const [nama, nilai] of formData.entries()) {
    if (typeof nilai === "string") raw[nama] = nilai;
  }
  return raw;
}

/** Semua pesan galat bahasa Indonesia untuk formulir panel (spec §8.4), di satu tempat. */
export const PESAN = {
  jamMulaiKosong: "Jam mulai belum diisi.",
  jamSelesaiKosong: "Jam selesai belum diisi.",
  jamTidakSah: "Jam tidak sah. Gunakan format 24 jam, contoh 05.30.",
  selesaiSetelahMulai: "Jam selesai harus setelah jam mulai.",
  ustadzKosong: "Nama ustadz belum diisi.",
  ustadzPanjang: "Nama ustadz terlalu panjang (maksimal 120 huruf).",
  temaKosong: "Tema kajian belum diisi.",
  temaPanjang: "Tema kajian terlalu panjang (maksimal 200 huruf).",
  tempatPanjang: "Tempat terlalu panjang (maksimal 120 huruf).",
  caraKosong: "Pilih cara mengikuti kajian.",
  posisiFoto: "Pilih bagian foto yang tampil.",
  fotoTidakDikenal: "Alamat foto tidak dikenal. Unggah ulang fotonya.",
  fotoMasihDiunggah: "Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi.",
  keteranganFotoPanjang: "Keterangan foto terlalu panjang (maksimal 200 huruf).",
  tanggalKosong: "Tanggal belum diisi.",
  tanggalLampau: "Tanggal tidak boleh sebelum hari ini.",
  tanggalTerlaluJauh: "Tanggal paling jauh satu tahun dari sekarang.",
  pilihanKosong: "Pilih Libur atau Ganti jadwal.",
  catatanPanjang: "Catatan terlalu panjang (maksimal 200 huruf).",
  jenisKosong: "Pilih jenis: Kegiatan atau Pengumuman.",
  judulKosong: "Judul belum diisi.",
  judulPanjang: "Judul terlalu panjang (maksimal 140 huruf).",
  ringkasanKosong: "Ringkasan belum diisi.",
  ringkasanPanjang: "Ringkasan terlalu panjang (maksimal 400 huruf).",
  tanggalTidakMasukAkal: "Tanggal tidak masuk akal. Periksa tahunnya.",
  tautanSalah: "Tautan harus diawali https:// atau http://.",
  tautanPanjang: "Tautan terlalu panjang (maksimal 500 huruf).",
  formulirKedaluwarsa: "Formulir ini sudah tidak berlaku. Muat ulang halaman, lalu coba lagi.",
} as const;

/** Jam 24 jam "HH:mm". */
export const POLA_JAM = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

/** Kolom yang hilang atau bukan teks dianggap kosong (jadi pesan ramah, bukan galat teknis). */
export const keTeks = (nilai: unknown): string => (typeof nilai === "string" ? nilai : "");

/** Teks wajib: dipangkas, tidak boleh kosong, dan dibatasi panjangnya. */
export const teksWajib = (kosong: string, maks: number, panjang: string) =>
  z.preprocess(keTeks, z.string().trim().min(1, { error: kosong }).max(maks, { error: panjang }));

/** Teks opsional: dipangkas; kosong menjadi `undefined`. */
export const teksOpsional = (maks: number, panjang: string) =>
  z.preprocess(
    keTeks,
    z
      .string()
      .trim()
      .max(maks, { error: panjang })
      .transform((nilai) => (nilai === "" ? undefined : nilai)),
  );

/** Jam "HH:mm": kosong dan format salah punya pesan sendiri. */
export const jam = (kosong: string) =>
  z.preprocess(
    keTeks,
    z.string().trim().min(1, { error: kosong }).regex(POLA_JAM, { error: PESAN.jamTidakSah }),
  );

/** Memeriksa isian formulir; hanya pesan galat pertama per kolom yang dikembalikan. */
export function parseForm<T>(
  schema: z.ZodType<T>,
  raw: RawForm,
): { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors } {
  const hasil = schema.safeParse(raw);
  if (hasil.success) return { ok: true, data: hasil.data };
  const fieldErrors: FieldErrors = {};
  for (const isu of hasil.error.issues) {
    const kolom = typeof isu.path[0] === "string" ? isu.path[0] : "_";
    if (!(kolom in fieldErrors)) fieldErrors[kolom] = isu.message;
  }
  return { ok: false, fieldErrors };
}

/**
 * Pemeriksaan lintas kolom dijalankan walau kolom lain sudah bergalat. Tanpa ini zod melewatinya begitu ada
 * galat pilihan (mis. cara belum dipilih), sehingga pengurus baru melihat galat lainnya pada pengiriman berikutnya.
 */
export const SELALU = { when: () => true };

/**
 * Kolom foto yang sama untuk jadwal tetap dan kegiatan/pengumuman: alamat (toko kita atau jalur lokal), keterangan,
 * bagian foto yang tampil (bawaan "center"), dan penanda "foto masih diunggah" (diperiksa oleh pemakainya lewat `SELALU`).
 */
export const kolomFoto = (blobHost: string | undefined) => ({
  imageUrl: z.preprocess(
    keTeks,
    z
      .string()
      .trim()
      .refine((url) => url === "" || isAllowedImageUrl(url, blobHost), { error: PESAN.fotoTidakDikenal }),
  ),
  imageAlt: teksOpsional(200, PESAN.keteranganFotoPanjang),
  imagePosition: z.preprocess(
    (nilai) => (nilai == null || nilai === "" ? "center" : nilai),
    z.enum(["top", "center", "bottom"], { error: PESAN.posisiFoto }),
  ),
  fotoMasihDiunggah: z.preprocess(keTeks, z.string()),
});
