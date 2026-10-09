"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { commandDeps } from "@/lib/admin/action-helpers";
import { deleteOverrideCommand, saveOverrideCommand } from "@/lib/admin/commands";
import type { FormState } from "@/lib/admin/form-state";
import { requireAdmin } from "@/lib/auth/guard";
import { isValidDateKey } from "@/lib/time";
import { rawFromFormData } from "@/lib/validation/umum";

/**
 * Simpan perubahan satu tanggal (Libur atau Ganti jadwal). `tanggalAsli` adalah tanggal entri yang sedang
 * diubah (null untuk entri baru); bila tanggalnya diganti, entri tanggal asli dihapus oleh perintahnya.
 */
export async function simpanPengecualian(
  tanggalAsli: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (tanggalAsli !== null && !isValidDateKey(tanggalAsli)) throw new Error("Tanggal tidak sah.");
  const hasil = await saveOverrideCommand(commandDeps(), tanggalAsli, rawFromFormData(formData));
  if (!hasil.ok) return hasil.state;
  revalidatePath("/");
  redirect("/admin/jadwal?hasil=tersimpan");
}

/** Hapus perubahan satu tanggal; jadwal tetap hari itu berlaku kembali. Gagal: kembali ke formulirnya dengan pesan. */
export async function hapusPengecualian(tanggal: string): Promise<void> {
  await requireAdmin();
  if (!isValidDateKey(tanggal)) throw new Error("Tanggal tidak sah.");
  const hasil = await deleteOverrideCommand(commandDeps(), tanggal);
  if (!hasil.ok) redirect(`/admin/jadwal/tanggal/${tanggal}?galat=hapus`);
  revalidatePath("/");
  redirect("/admin/jadwal?hasil=terhapus");
}
