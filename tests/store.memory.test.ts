import { describe, expect, it } from "vitest";
import { MemoryStore } from "@/lib/store/memory";
import { runStoreContract } from "./store.contract";

runStoreContract("MemoryStore", async () => new MemoryStore({ seeded: false }));

describe("MemoryStore", () => {
  it("seeded: true langsung siap dengan data awal", async () => {
    const store = new MemoryStore({ seeded: true });
    expect(await store.isReady()).toBe(true);
    expect(await store.listSessions()).toHaveLength(7);
  });

  it("tidak membagikan objek internal ke pemanggil", async () => {
    const store = new MemoryStore({ seeded: true });
    const kamis = await store.getSession(4);
    if (kamis) kamis.topic = "diubah di luar";
    expect((await store.getSession(4))?.topic).toBe("Akhlak dan Adab Sehari-hari");
  });
});
