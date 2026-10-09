import "server-only";
import type { EnvLike } from "@/lib/env";
import { normalizeBlobHost } from "@/lib/photo/rules";

/**
 * Host publik toko Blob, mis. "abc.public.blob.vercel-storage.com" (`BLOB_PUBLIC_HOST`), atau undefined bila
 * belum diisi atau bukan nama host. Dirapikan seperti di next.config.ts. Hanya dibaca di server; klien
 * menerimanya sebagai prop.
 */
export function blobPublicHost(env: EnvLike = process.env): string | undefined {
  return normalizeBlobHost(env.BLOB_PUBLIC_HOST);
}

/** Unggah foto hanya tersedia bila host publik toko Blob dan token baca-tulisnya sama-sama sudah diisi. */
export function photoUploadEnabled(env: EnvLike = process.env): boolean {
  return Boolean(blobPublicHost(env) && env.BLOB_READ_WRITE_TOKEN?.trim());
}
