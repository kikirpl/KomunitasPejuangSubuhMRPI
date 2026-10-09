"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { commandDeps } from "@/lib/admin/action-helpers";
import { deleteSessionCommand, saveSessionCommand } from "@/lib/admin/commands";
import type { FormState } from "@/lib/admin/form-state";
import { requireAdmin } from "@/lib/auth/guard";
import { daySlug } from "@/lib/time";
import { rawFromFormData } from "@/lib/validation/umum";
import type { DayIndex } from "@/types";

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
  const hasil = await saveSessionCommand(commandDeps(), hari, rawFromFormData(formData));
  if (!hasil.ok) return hasil.state;
  revalidatePath("/");
  redirect("/admin/jadwal?hasil=tersimpan");
}

/** Hapus jadwal tetap satu hari ("Tidak ada kajian di hari ini"). Gagal: kembali ke formulir hari itu dengan pesan. */
export async function hapusJadwalHari(hari: DayIndex): Promise<void> {
  await requireAdmin();
  if (!hariSah(hari)) throw new Error("Hari tidak sah.");
  const hasil = await deleteSessionCommand(commandDeps(), hari);
  if (!hasil.ok) redirect(`/admin/jadwal/${daySlug(hari)}?galat=hapus`);
  revalidatePath("/");
  redirect("/admin/jadwal?hasil=terhapus");
}
