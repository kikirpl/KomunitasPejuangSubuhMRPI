import { PGlite } from "@electric-sql/pglite";
import type { SqlClient } from "@/lib/store/sql";

let bersama: Promise<PGlite> | undefined;

/**
 * Klien SQL di atas PGlite (Postgres di dalam Node) untuk menguji SQL yang sama dengan yang
 * berjalan di Neon. Satu instance dipakai bersama dalam satu berkas tes; tiap panggilan
 * mengosongkan skema `public` sehingga tes mulai dari database kosong.
 */
export async function createPgliteClient(): Promise<SqlClient & { close(): Promise<void> }> {
  bersama ??= PGlite.create();
  const db = await bersama;
  await db.exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  return {
    async query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
      const hasil = await db.query(text, params);
      return hasil.rows as T[];
    },
    async transaction(statements) {
      const semua: Record<string, unknown>[][] = [];
      await db.transaction(async (tx) => {
        for (const s of statements) {
          const hasil = await tx.query(s.text, s.params);
          semua.push(hasil.rows as Record<string, unknown>[]);
        }
      });
      return semua;
    },
    async close() {
      // Instance dipakai bersama; ditutup otomatis saat proses tes selesai.
    },
  };
}
