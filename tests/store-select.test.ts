import { describe, expect, it } from "vitest";
import { getStore } from "@/lib/store/index";
import { MemoryStore } from "@/lib/store/memory";
import { SqlStore } from "@/lib/store/sql";

describe("getStore", () => {
  it("tanpa pengaturan: null", () => {
    expect(getStore({})).toBeNull();
  });

  it("CONTENT_STORE=memory: MemoryStore tunggal yang sudah siap", async () => {
    const a = getStore({ CONTENT_STORE: "memory" });
    expect(a).toBeInstanceOf(MemoryStore);
    expect(getStore({ CONTENT_STORE: "memory" })).toBe(a);
    expect(await a?.isReady()).toBe(true);
  });

  it("CONTENT_STORE=memory ditolak di Vercel", () => {
    expect(() => getStore({ CONTENT_STORE: "memory", VERCEL: "1" })).toThrow(/Vercel/);
  });

  it("DATABASE_URL: SqlStore tanpa membuka koneksi", () => {
    expect(getStore({ DATABASE_URL: "postgresql://u:p@h/db" })).toBeInstanceOf(SqlStore);
  });

  it("memory menang atas DATABASE_URL", () => {
    expect(getStore({ CONTENT_STORE: "memory", DATABASE_URL: "postgresql://u:p@h/db" })).toBeInstanceOf(MemoryStore);
  });
});
