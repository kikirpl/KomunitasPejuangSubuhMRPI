import { describe, expect, it, vi } from "vitest";
import { loadPublicContent } from "@/lib/content";
import type { ContentStore } from "@/lib/store/types";

// 01:30 WIB pada 10 Oktober 2026, padahal di UTC masih 9 Oktober (server Vercel memakai UTC).
const NOW = new Date("2026-10-09T18:30:00Z");

describe("loadPublicContent", () => {
  it("tanpa penyimpanan: salinan content.ts", async () => {
    const c = await loadPublicContent({ store: null, now: NOW });
    expect(c.schedule.sessions).toHaveLength(7);
    expect(c.announcements.items).toHaveLength(4);
    expect(c.schedule.isSample).toBe(true);
    expect(c.schedule.overrides ?? []).toEqual([]);
    expect(c.generatedAt).toBe(NOW.toISOString());
  });

  it("penyimpanan belum siap: salinan content.ts dan tidak membaca penyimpanan", async () => {
    const readPublic = vi.fn();
    const store = { isReady: async () => false, readPublic } as unknown as ContentStore;
    const c = await loadPublicContent({ store, now: NOW });
    expect(c.schedule.sessions).toHaveLength(7);
    expect(readPublic).not.toHaveBeenCalled();
  });

  it("penyimpanan siap: batas 7 hari ke belakang dihitung dari tanggal WIB", async () => {
    const readPublic = vi.fn(async () => ({
      schedule: { sessions: [], overrides: [] },
      announcements: { items: [] },
    }));
    const store = { isReady: async () => true, readPublic } as unknown as ContentStore;
    const c = await loadPublicContent({ store, now: NOW });
    expect(readPublic).toHaveBeenCalledWith("2026-10-03"); // hari ini WIB 2026-10-10 dikurangi 7
    expect(c.generatedAt).toBe(NOW.toISOString());
    expect(c.schedule.sessions).toEqual([]);
  });

  it("galat penyimpanan tidak ditelan", async () => {
    const dariRead = {
      isReady: async () => true,
      readPublic: async () => {
        throw new Error("db");
      },
    } as unknown as ContentStore;
    await expect(loadPublicContent({ store: dariRead, now: NOW })).rejects.toThrow("db");
    const dariReady = {
      isReady: async () => {
        throw new Error("tidak terjangkau");
      },
    } as unknown as ContentStore;
    await expect(loadPublicContent({ store: dariReady, now: NOW })).rejects.toThrow("tidak terjangkau");
  });
});
