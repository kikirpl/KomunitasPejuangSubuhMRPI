/** Aturan foto bersama (spec §10): dipakai server (validasi, penghapusan) dan klien (pengecilan, unggah). */

/** Batas ukuran berkas yang diizinkan di endpoint izin unggah Blob. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
/** Jenis berkas yang diterima endpoint izin unggah; klien selalu menyimpan ulang sebagai salah satunya. */
export const ALLOWED_UPLOAD_TYPES = ["image/webp", "image/jpeg"] as const;
/** Sisi terpanjang foto setelah diperkecil di HP. */
export const MAX_SIDE_PX = 1600;

/** Jenis berkas yang boleh dipilih pengurus (sebelum diperkecil dan disimpan ulang sebagai WebP atau JPEG). */
export const ACCEPTED_INPUT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAcceptedImageType(type: string): boolean {
  return (ACCEPTED_INPUT_TYPES as readonly string[]).includes(type);
}

/** Jalur berkas di toko Blob: folder "kajian" atau "kegiatan"; akhiran mengikuti jenis hasil pengecilan (SDK menambah akhiran acak). */
export function uploadPathname(folder: "kajian" | "kegiatan", blobType: string): string {
  return `${folder}/foto.${blobType === "image/webp" ? "webp" : "jpg"}`;
}

const NAMA_HOST = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

/**
 * Merapikan nilai `BLOB_PUBLIC_HOST` yang ditempel orang: huruf kecil, tanpa spasi, tanpa "https://", dan
 * tanpa garis miring atau jalur di belakangnya (alamat dasar yang disalin dari Vercel biasanya lengkap dengan
 * "https://"). Nilai yang bukan nama host dianggap belum diisi, sehingga unggah foto mati dengan pesan yang
 * jelas dan pembuatan pola gambar di next.config.ts tidak membuat build gagal.
 */
export function normalizeBlobHost(mentah: string | undefined): string | undefined {
  const awal = (mentah ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").split(/[\s/?#]/)[0];
  return NAMA_HOST.test(awal) ? awal : undefined;
}

/** Foto milik toko Blob kita: https dan host persis sama dengan `BLOB_PUBLIC_HOST`. */
export function isOurPhotoUrl(url: string, blobHost: string | undefined): boolean {
  const host = normalizeBlobHost(blobHost);
  if (!host) return false;
  try {
    const alamat = new URL(url);
    return alamat.protocol === "https:" && alamat.host === host;
  } catch {
    return false;
  }
}

/**
 * Alamat gambar yang boleh disimpan: foto milik toko kita, atau jalur lokal ("/kajian/senin.jpg").
 * Jalur yang diawali "//" atau "/\" ditolak karena peramban menafsirkannya sebagai situs lain.
 */
export function isAllowedImageUrl(url: string, blobHost: string | undefined): boolean {
  if (url.startsWith("/")) return !url.startsWith("//") && !url.startsWith("/\\");
  return isOurPhotoUrl(url, blobHost);
}

/** Menyaring URL yang boleh dihapus dari Blob: hanya milik toko kita (jalur lokal dan host lain tidak disentuh). */
export function onlyOurPhotoUrls(urls: (string | null | undefined)[], blobHost: string | undefined): string[] {
  return urls.filter((url): url is string => typeof url === "string" && isOurPhotoUrl(url, blobHost));
}

/**
 * Pola gambar jarak jauh untuk `images.remotePatterns` di next.config.ts: hanya toko Blob kita (bukan wildcard
 * host), atau kosong bila `BLOB_PUBLIC_HOST` belum diisi.
 */
export function blobImagePatterns(host: string | undefined): URL[] {
  const bersih = normalizeBlobHost(host);
  return bersih ? [new URL(`https://${bersih}/**`)] : [];
}
