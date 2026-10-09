import { describe, expect, it } from "vitest";
import { buildSeed, splitAnnouncementDate } from "@/lib/store/seed";

describe("splitAnnouncementDate", () => {
  it("memecah tanggal dan jam WIB", () => {
    expect(splitAnnouncementDate("2026-10-09")).toEqual({ date: "2026-10-09" });
    expect(splitAnnouncementDate("2026-10-09T05:00:00+07:00")).toEqual({ date: "2026-10-09", time: "05:00" });
    expect(splitAnnouncementDate("2026-10-09T05:30")).toEqual({ date: "2026-10-09", time: "05:30" });
  });
});

describe("buildSeed", () => {
  it("menyalin jadwal dan pengumuman dari data/content.ts", () => {
    const seed = buildSeed();
    expect(seed.sessions).toHaveLength(7);
    expect(seed.sessions.find((s) => s.day === 1)?.input).toMatchObject({
      startTime: "05:00",
      endTime: "06:00",
      ustadz: "Ustadz Fulan A",
      topic: "Tafsir Juz 'Amma",
      mode: "hybrid",
      imagePosition: "center",
    });
    expect(seed.announcements.map((a) => a.id)).toEqual(["a1", "a2", "a3", "a4"]);
    expect(seed.announcements[0]).toMatchObject({ type: "kegiatan", date: "2026-10-09", imagePosition: "center" });
    expect(seed.flags).toEqual({ schedule: true, announcements: true });
  });
});
