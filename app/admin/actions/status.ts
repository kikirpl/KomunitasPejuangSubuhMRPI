"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isKembaliStatus, isSectionKey } from "@/lib/admin/status";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/store/index";
import type { SectionKey } from "@/types";

/**
 * Menandai satu bagian web sebagai resmi (`isSample = false`) atau mengembalikannya ke contoh. Hanya tiga alamat
 * panel yang diterima sebagai tujuan kembali, jadi tidak ada pengalihan terbuka. Gagal menyimpan: kembali dengan `?galat=status`.
 */
export async function ubahStatusContoh(section: SectionKey, isSample: boolean, kembali: string): Promise<void> {
  await requireAdmin();
  if (!isSectionKey(section) || typeof isSample !== "boolean" || !isKembaliStatus(kembali)) {
    throw new Error("Permintaan ubah status tidak sah.");
  }
  const store = getStore();
  if (!store) redirect("/admin");

  let berhasil = true;
  try {
    await store.setSampleFlag(section, isSample);
  } catch (error) {
    console.error("[admin/status] Gagal mengubah status contoh:", section, error);
    berhasil = false;
  }
  if (!berhasil) redirect(`${kembali}?galat=status`);

  revalidatePath("/");
  redirect(`${kembali}?hasil=tersimpan`);
}
