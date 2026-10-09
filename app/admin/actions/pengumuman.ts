"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { commandDeps } from "@/lib/admin/action-helpers";
import { deleteAnnouncementCommand, saveAnnouncementCommand } from "@/lib/admin/commands";
import type { FormState } from "@/lib/admin/form-state";
import { requireAdmin } from "@/lib/auth/guard";
import { deletePhotos } from "@/lib/photo/blob";
import { rawFromFormData } from "@/lib/validation/umum";

/** Parameter `jenis` agar daftar membuka tab jenis yang baru disimpan atau dihapus; nilai lain diabaikan. */
const parameterJenis = (jenis: unknown): string =>
  jenis === "kegiatan" || jenis === "pengumuman" ? `&jenis=${jenis}` : "";

/**
 * Simpan kegiatan atau pengumuman (baru atau ubahan). `id` datang dari isian tersembunyi; menyimpan dua kali dengan id
 * yang sama tetap satu kartu. Urutan seperti jadwal: pagar admin, validasi dan simpan, foto lama dihapus sesudah
 * respons, web publik dibuat ulang, lalu kembali ke daftar.
 */
export async function simpanPengumuman(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = rawFromFormData(formData);
  const deps = commandDeps();
  const hasil = await saveAnnouncementCommand(deps, raw);
  if (!hasil.ok) return hasil.state;
  after(() => deletePhotos(hasil.deleteImageUrls, deps.blobHost));
  revalidatePath("/");
  redirect(`/admin/pengumuman?hasil=tersimpan${parameterJenis(raw.type)}`);
}

/** Hapus satu kegiatan atau pengumuman (isian tersembunyi `id` dan `jenis`). Gagal: kembali ke formulirnya dengan pesan. */
export async function hapusPengumuman(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id");
  const jenis = formData.get("jenis");
  if (typeof id !== "string" || id === "") throw new Error("Id kegiatan atau pengumuman tidak ada.");
  const deps = commandDeps();
  const hasil = await deleteAnnouncementCommand(deps, id);
  if (!hasil.ok) redirect(`/admin/pengumuman/${encodeURIComponent(id)}?galat=hapus`);
  after(() => deletePhotos(hasil.deleteImageUrls, deps.blobHost));
  revalidatePath("/");
  redirect(`/admin/pengumuman?hasil=terhapus${parameterJenis(jenis)}`);
}
