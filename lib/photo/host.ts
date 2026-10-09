import "server-only";
import type { EnvLike } from "@/lib/env";

/**
 * Host publik toko Blob, mis. "abc.public.blob.vercel-storage.com" (`BLOB_PUBLIC_HOST`), atau undefined bila
 * belum diisi. Hanya dibaca di server; klien menerimanya sebagai prop.
 */
export function blobPublicHost(env: EnvLike = process.env): string | undefined {
  const host = env.BLOB_PUBLIC_HOST?.trim().toLowerCase();
  return host ? host : undefined;
}

/** Unggah foto hanya tersedia bila host publik toko Blob dan token baca-tulisnya sama-sama sudah diisi. */
export function photoUploadEnabled(env: EnvLike = process.env): boolean {
  return Boolean(blobPublicHost(env) && env.BLOB_READ_WRITE_TOKEN?.trim());
}
