"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/store/index";

/**
 * Menyiapkan database sekali: membuat tabel dan menyalin isi data/content.ts sebagai data awal.
 * Aman ditekan berulang (idempoten, tidak menimpa perubahan pengurus).
 */
export async function siapkanDatabase(): Promise<void> {
  await requireAdmin();
  const store = getStore();
  if (!store) redirect("/admin");

  let berhasil = true;
  try {
    await store.setup();
  } catch (error) {
    console.error("[admin/setup] Gagal menyiapkan database:", error);
    berhasil = false;
  }
  if (!berhasil) redirect("/admin?galat=setup");

  revalidatePath("/");
  redirect("/admin?hasil=siap");
}
