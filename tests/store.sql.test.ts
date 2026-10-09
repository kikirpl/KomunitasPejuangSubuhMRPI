import { describe, expect, it } from "vitest";
import { SCHEMA_STATEMENTS } from "@/lib/store/schema";
import { SqlStore } from "@/lib/store/sql";
import { createPgliteClient } from "./helpers/pglite-client";
import { runStoreContract } from "./store.contract";

runStoreContract("SqlStore (PGlite)", async () => new SqlStore(await createPgliteClient()));

describe("SqlStore di atas PGlite", () => {
  it("isReady bernilai false pada database kosong tanpa melempar", async () => {
    const store = new SqlStore(await createPgliteClient());
    await expect(store.isReady()).resolves.toBe(false);
  });

  it("isReady tetap false bila tabel ada tetapi data awal belum terisi", async () => {
    const client = await createPgliteClient();
    await client.transaction(SCHEMA_STATEMENTS.map((text) => ({ text })));
    await expect(new SqlStore(client).isReady()).resolves.toBe(false);
  });

  it("kolom tanggal pengumuman terbaca sebagai YYYY-MM-DD", async () => {
    const store = new SqlStore(await createPgliteClient());
    await store.setup();
    expect((await store.getAnnouncement("a1"))?.date).toBe("2026-10-09");
    expect((await store.listOverrides("2000-01-01")).length).toBe(0);
  });

  describe("batasan CHECK pada skema", () => {
    const sisipSesi = (
      client: Awaited<ReturnType<typeof createPgliteClient>>,
      v: { day?: number; mode?: string; posisi?: string; mulai?: string; selesai?: string },
    ) =>
      client.query(
        "INSERT INTO sessions (day, start_time, end_time, ustadz, topic, mode, image_position) VALUES ($1, $2, $3, 'U', 'T', $4, $5)",
        [v.day ?? 1, v.mulai ?? "05:00", v.selesai ?? "06:00", v.mode ?? "masjid", v.posisi ?? "center"],
      );

    async function skemaKosong() {
      const client = await createPgliteClient();
      await client.transaction(SCHEMA_STATEMENTS.map((text) => ({ text })));
      return client;
    }

    it("menolak hari, cara, posisi foto, dan rentang jam yang salah", async () => {
      const client = await skemaKosong();
      await expect(sisipSesi(client, { day: 7 })).rejects.toThrow(/check constraint/i);
      await expect(sisipSesi(client, { mode: "x" })).rejects.toThrow(/check constraint/i);
      await expect(sisipSesi(client, { posisi: "left" })).rejects.toThrow(/check constraint/i);
      await expect(sisipSesi(client, { mulai: "06:00", selesai: "06:00" })).rejects.toThrow(/check constraint/i);
      await expect(sisipSesi(client, {})).resolves.toBeDefined();
    });

    it("menolak pengecualian ganti tanpa tema", async () => {
      const client = await skemaKosong();
      await expect(
        client.query(
          "INSERT INTO session_overrides (date, kind, start_time, end_time, ustadz, mode) VALUES ('2026-10-15', 'ganti', '06:00', '07:00', 'U', 'zoom')",
        ),
      ).rejects.toThrow(/check constraint/i);
      await expect(
        client.query("INSERT INTO session_overrides (date, kind) VALUES ('2026-10-15', 'libur')"),
      ).resolves.toBeDefined();
    });
  });
});
