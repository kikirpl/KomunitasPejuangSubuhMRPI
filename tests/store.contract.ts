import { beforeEach, describe, expect, it } from "vitest";
import type { AnnouncementInput, ContentStore, SessionInput } from "@/lib/store/types";

const SESI: SessionInput = {
  startTime: "05:00",
  endTime: "06:00",
  ustadz: "Ustadz A",
  topic: "Tema",
  mode: "masjid",
  location: "Ruang utama masjid",
  imagePosition: "center",
};

const P: AnnouncementInput = {
  id: "p1",
  type: "pengumuman",
  title: "Judul",
  date: "2026-10-09",
  excerpt: "Ringkasan",
  imagePosition: "center",
};

const GANTI = { startTime: "06:00", endTime: "07:00", ustadz: "U", topic: "T", mode: "zoom" as const };

/**
 * Tes kontrak: dijalankan terhadap setiap isi ContentStore (MemoryStore dan SqlStore di PGlite)
 * supaya perilakunya tidak berbeda. `create()` mengembalikan store yang BELUM setup.
 */
export function runStoreContract(label: string, create: () => Promise<ContentStore>): void {
  describe(`kontrak ContentStore: ${label}`, () => {
    let store: ContentStore;
    beforeEach(async () => {
      store = await create();
    });

    it("isReady false sebelum setup, true sesudahnya; setup idempoten", async () => {
      expect(await store.isReady()).toBe(false);
      await store.setup();
      await store.setup();
      expect(await store.isReady()).toBe(true);
      const sesi = await store.listSessions();
      expect(sesi).toHaveLength(7);
      expect(sesi.map((s) => s.id).sort()).toEqual(["ahad", "jumat", "kamis", "rabu", "sabtu", "selasa", "senin"]);
      expect(await store.listAnnouncements()).toHaveLength(4);
      expect(await store.getSampleFlags()).toEqual({ schedule: true, announcements: true });
    });

    it("setup kedua tidak menimpa data yang sudah diubah pengurus", async () => {
      await store.setup();
      await store.saveSession(4, { ...SESI, topic: "Diubah pengurus" });
      await store.setup();
      expect((await store.getSession(4))?.topic).toBe("Diubah pengurus");
    });

    it("saveSession memperbarui satu hari dan mengembalikan foto lama", async () => {
      await store.setup();
      expect(await store.saveSession(4, { ...SESI, imageUrl: "https://h/a.webp" })).toEqual({ previousImageUrl: null });
      expect(await store.saveSession(4, { ...SESI, topic: "Tema baru", imageUrl: "https://h/b.webp" })).toEqual({
        previousImageUrl: "https://h/a.webp",
      });
      expect(await store.getSession(4)).toMatchObject({
        id: "kamis",
        day: 4,
        topic: "Tema baru",
        imageUrl: "https://h/b.webp",
        imagePosition: "center",
      });
    });

    it("deleteSession menghapus, mengembalikan foto lama, dan aman diulang", async () => {
      await store.setup();
      await store.saveSession(2, { ...SESI, imageUrl: "https://h/s.webp" });
      expect(await store.deleteSession(2)).toEqual({ previousImageUrl: "https://h/s.webp" });
      expect(await store.getSession(2)).toBeNull();
      expect(await store.deleteSession(2)).toEqual({ previousImageUrl: null });
    });

    it("saveSession menolak jam tidak sah dan tidak mengubah data", async () => {
      await store.setup();
      await expect(store.saveSession(1, { ...SESI, startTime: "06:00", endTime: "06:00" })).rejects.toThrow();
      await expect(store.saveSession(1, { ...SESI, startTime: "5:00" })).rejects.toThrow();
      expect((await store.getSession(1))?.topic).toBe("Tafsir Juz 'Amma");
    });

    it("pengecualian: upsert per tanggal; urut naik; disaring dari batas", async () => {
      await store.setup();
      await store.saveOverride({ date: "2026-10-15", kind: "libur", note: "a" });
      await store.saveOverride({ date: "2026-10-15", kind: "ganti", note: "b", session: GANTI });
      const daftar = await store.listOverrides("2026-10-01");
      expect(daftar).toHaveLength(1);
      expect(daftar[0]).toMatchObject({ date: "2026-10-15", kind: "ganti", note: "b", session: { topic: "T", mode: "zoom" } });
      expect(await store.listOverrides("2026-10-16")).toEqual([]);

      await store.saveOverride({ date: "2026-10-12", kind: "libur" });
      expect((await store.listOverrides("2026-10-01")).map((o) => o.date)).toEqual(["2026-10-12", "2026-10-15"]);
      await store.deleteOverride("2026-10-12");
      expect(await store.getOverride("2026-10-12")).toBeNull();
    });

    it("pengecualian: libur sesudah ganti membuang isi pengganti; ganti tanpa isi ditolak", async () => {
      await store.setup();
      await store.saveOverride({ date: "2026-10-15", kind: "ganti", session: GANTI });
      await store.saveOverride({ date: "2026-10-15", kind: "libur" });
      expect((await store.getOverride("2026-10-15"))?.session).toBeUndefined();
      await expect(store.saveOverride({ date: "2026-10-20", kind: "ganti" })).rejects.toThrow();
      await expect(
        store.saveOverride({ date: "2026-10-20", kind: "ganti", session: { ...GANTI, endTime: "06:00" } }),
      ).rejects.toThrow();
    });

    it("listAnnouncements: terbaru lebih dulu", async () => {
      await store.setup();
      expect((await store.listAnnouncements()).map((a) => a.id)).toEqual(["a4", "a3", "a2", "a1"]);
    });

    it("pengumuman: id sama dua kali menjadi satu baris, dan foto lama dikembalikan", async () => {
      await store.setup();
      expect(await store.saveAnnouncement({ ...P, imageUrl: "https://h/p.webp" })).toEqual({ previousImageUrl: null });
      expect(await store.saveAnnouncement({ ...P, imageUrl: "https://h/q.webp" })).toEqual({
        previousImageUrl: "https://h/p.webp",
      });
      expect(await store.listAnnouncements()).toHaveLength(5);
    });

    it("pengumuman: semua kolom terpetakan dan tanggal disusun dari tanggal dan jam", async () => {
      await store.setup();
      await store.saveAnnouncement({ ...P, time: "05:30", href: "https://x.id", imageAlt: "alt", imagePosition: "bottom" });
      expect(await store.getAnnouncement("p1")).toMatchObject({
        id: "p1",
        type: "pengumuman",
        title: "Judul",
        date: "2026-10-09T05:30:00+07:00",
        excerpt: "Ringkasan",
        href: "https://x.id",
        imageAlt: "alt",
        imagePosition: "bottom",
      });
      await store.saveAnnouncement({ ...P });
      expect((await store.getAnnouncement("p1"))?.date).toBe("2026-10-09");
    });

    it("deleteAnnouncement mengembalikan foto lama", async () => {
      await store.setup();
      await store.saveAnnouncement({ ...P, imageUrl: "https://h/z.webp" });
      expect(await store.deleteAnnouncement("p1")).toEqual({ previousImageUrl: "https://h/z.webp" });
      expect(await store.getAnnouncement("p1")).toBeNull();
    });

    it("penanda contoh per bagian", async () => {
      await store.setup();
      await store.setSampleFlag("schedule", false);
      expect(await store.getSampleFlags()).toEqual({ schedule: false, announcements: true });
    });

    it("readPublic: kajian, pengecualian sejak batas, pengumuman, dan penanda contoh", async () => {
      await store.setup();
      await store.saveOverride({ date: "2026-10-14", kind: "libur" });
      await store.saveOverride({ date: "2026-10-16", kind: "libur", note: "x" });
      await store.setSampleFlag("announcements", false);
      const publik = await store.readPublic("2026-10-15");
      expect(publik.schedule.sessions).toHaveLength(7);
      expect(publik.schedule.overrides?.map((o) => o.date)).toEqual(["2026-10-16"]);
      expect(publik.schedule.isSample).toBe(true);
      expect(publik.announcements.items.length).toBeGreaterThanOrEqual(4);
      expect(publik.announcements.isSample).toBe(false);
    });
  });
}
