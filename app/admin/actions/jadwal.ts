"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSessionCommand, saveSessionCommand, type CommandDeps } from "@/lib/admin/commands";
import type { FormState } from "@/lib/admin/form-state";
import { requireAdmin } from "@/lib/auth/guard";
import { blobPublicHost } from "@/lib/photo/host";
import { getStore } from "@/lib/store/index";
import { daySlug, todayKey } from "@/lib/time";
import type { RawForm } from "@/lib/validation/umum";
import type { DayIndex } from "@/types";

/** Isian formulir sebagai teks; berkas (bila ada) diabaikan. */
function dariFormData(formData: FormData): RawForm {
  const raw: RawForm = {};
  for (const [nama, nilai] of formData.entries()) {
    if (typeof nilai === "string") raw[nama] = nilai;
  }
  return raw;
}

/** Penyimpanan untuk aksi ini; tanpa database panel kembali ke beranda yang menjelaskannya. */
function bahan(): CommandDeps {
  const store = getStore();
  if (!store) redirect("/admin");
  return { store, blobHost: blobPublicHost(), todayKey: todayKey() };
}

function hariSah(hari: number): hari is DayIndex {
  return Number.isInteger(hari) && hari >= 0 && hari <= 6;
}

/**
 * Simpan jadwal tetap satu hari. Urutan: pagar admin, validasi dan simpan, hasil gagal dikembalikan ke
 * formulir (isian ikut), berhasil: web publik dibuat ulang lalu kembali ke daftar. `redirect` di luar `try`.
 * `deleteImageUrls` diabaikan sampai unggah foto tersedia (belum ada foto yang bisa diganti dari panel).
 */
export async function simpanJadwalHari(hari: DayIndex, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!hariSah(hari)) throw new Error("Hari tidak sah.");
  const hasil = await saveSessionCommand(bahan(), hari, dariFormData(formData));
  if (!hasil.ok) return hasil.state;
  revalidatePath("/");
  redirect("/admin/jadwal?hasil=tersimpan");
}

/** Hapus jadwal tetap satu hari ("Tidak ada kajian di hari ini"). Gagal: kembali ke formulir hari itu dengan pesan. */
export async function hapusJadwalHari(hari: DayIndex): Promise<void> {
  await requireAdmin();
  if (!hariSah(hari)) throw new Error("Hari tidak sah.");
  const hasil = await deleteSessionCommand(bahan(), hari);
  if (!hasil.ok) redirect(`/admin/jadwal/${daySlug(hari)}?galat=hapus`);
  revalidatePath("/");
  redirect("/admin/jadwal?hasil=terhapus");
}
