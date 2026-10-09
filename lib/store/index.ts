import "server-only";
import type { EnvLike } from "@/lib/env";
import { MemoryStore } from "./memory";
import { createNeonClient, SqlStore } from "./sql";
import type { ContentStore } from "./types";

const KUNCI_MEMORI = Symbol.for("pejuang-subuh.memory-store");

/**
 * Memilih penyimpanan konten:
 * - CONTENT_STORE=memory: MemoryStore tunggal (disimpan di globalThis agar tahan terhadap bundel
 *   terpisah dan HMR). Ditolak di Vercel karena datanya hilang setiap fungsi dimulai ulang.
 * - DATABASE_URL: SqlStore di atas Neon (koneksi baru dibuka saat kueri pertama).
 * - selain itu null: web publik memakai salinan data/content.ts dan panel menolak formulir.
 */
export function getStore(env: EnvLike = process.env): ContentStore | null {
  if (env.CONTENT_STORE === "memory") {
    if (env.VERCEL) {
      throw new Error("CONTENT_STORE=memory tidak boleh dipakai di Vercel: datanya hilang saat fungsi dimulai ulang.");
    }
    const g = globalThis as typeof globalThis & { [KUNCI_MEMORI]?: MemoryStore };
    return (g[KUNCI_MEMORI] ??= new MemoryStore({ seeded: true }));
  }
  if (env.DATABASE_URL) return new SqlStore(createNeonClient(env.DATABASE_URL));
  return null;
}
