import "server-only";
import { del } from "@vercel/blob";
import { onlyOurPhotoUrls } from "@/lib/photo/rules";

/**
 * Menghapus foto lama dari toko Blob setelah penyimpanan berhasil. Hanya URL milik toko kita yang diteruskan
 * (jalur lokal dan host lain tidak disentuh). Kegagalan hanya dicatat, tidak dilempar: foto yatim tidak boleh
 * menggagalkan penyimpanan yang sudah berhasil.
 */
export async function deletePhotos(
  urls: string[],
  blobHost: string | undefined,
  hapus: (urls: string[]) => Promise<void> = (daftar) => del(daftar),
): Promise<void> {
  const milik = onlyOurPhotoUrls(urls, blobHost);
  if (milik.length === 0) return;
  try {
    await hapus(milik);
  } catch (error) {
    console.error("[admin/foto] Gagal menghapus foto lama dari Blob:", error);
  }
}
