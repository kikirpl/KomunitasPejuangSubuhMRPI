import { describe, expect, it } from "vitest";
import {
  effectiveSessionOn,
  nextSessionAfterToday,
  overridesFrom,
  weekDateKeys,
} from "@/lib/schedule";
import { daySlug, getWibParts } from "@/lib/time";
import type { DayIndex, SessionOverride, StudySession } from "@/types";

const DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];
const sesi = (day: DayIndex): StudySession => ({
  id: daySlug(day),
  day,
  startTime: "05:00",
  endTime: "06:00",
  ustadz: `Ustadz ${day}`,
  topic: `Tema ${day}`,
  mode: "masjid",
  imageUrl: `/kajian/${day}.jpg`,
});
const SESSIONS = DAYS.map(sesi);
const libur = (date: string, note?: string): SessionOverride => ({ date, kind: "libur", note });
const ganti = (date: string): SessionOverride => ({
  date,
  kind: "ganti",
  note: "Pengganti",
  session: { startTime: "06:00", endTime: "07:00", ustadz: "Ustadz Tamu", topic: "Tema Tamu", mode: "zoom" },
});
const wib = (key: string) => getWibParts(new Date(`${key}T05:00:00+07:00`));

describe("effectiveSessionOn", () => {
  it("libur mengalahkan jadwal tetap", () => {
    expect(
      effectiveSessionOn("2026-10-15", 4, SESSIONS, [libur("2026-10-15", "Ustadz berhalangan hadir")]),
    ).toEqual({ status: "cancelled", session: null, note: "Ustadz berhalangan hadir" });
  });

  it("ganti memakai isi pengganti dan mewarisi foto jadwal tetap", () => {
    const e = effectiveSessionOn("2026-10-15", 4, SESSIONS, [ganti("2026-10-15")]);
    expect(e.status).toBe("changed");
    expect(e.session).toMatchObject({
      day: 4,
      startTime: "06:00",
      ustadz: "Ustadz Tamu",
      mode: "zoom",
      imageUrl: "/kajian/4.jpg",
    });
    expect(e.note).toBe("Pengganti");
  });

  it("ganti pada hari tanpa jadwal tetap menjadi kajian tambahan", () => {
    const e = effectiveSessionOn(
      "2026-10-11",
      0,
      SESSIONS.filter((s) => s.day !== 0),
      [ganti("2026-10-11")],
    );
    expect(e.status).toBe("changed");
    expect(e.session?.imageUrl).toBeUndefined();
  });

  it("tanpa pengecualian: regular atau none; pengecualian tanggal lain diabaikan", () => {
    expect(effectiveSessionOn("2026-10-15", 4, SESSIONS, [libur("2026-10-16")]).status).toBe("regular");
    expect(effectiveSessionOn("2026-10-15", 4, [], []).status).toBe("none");
  });
});

describe("weekDateKeys", () => {
  it("Senin sampai Ahad pekan berjalan", () => {
    const rabu = weekDateKeys(wib("2026-10-07"));
    expect([rabu[1], rabu[3], rabu[0]]).toEqual(["2026-10-05", "2026-10-07", "2026-10-11"]);
    expect(weekDateKeys(wib("2026-10-11"))[1]).toBe("2026-10-05"); // Ahad masih pekan yang sama
    expect(weekDateKeys(wib("2026-10-12"))[1]).toBe("2026-10-12");
    const akhirTahun = weekDateKeys(wib("2026-12-31"));
    expect([akhirTahun[1], akhirTahun[0]]).toEqual(["2026-12-28", "2027-01-03"]);
  });
});

describe("nextSessionAfterToday", () => {
  it("melewati hari libur dan membawa status pengganti", () => {
    const lewat = nextSessionAfterToday(SESSIONS, [libur("2026-10-07")], wib("2026-10-06"));
    expect(lewat).toMatchObject({ daysAhead: 2, dateKey: "2026-10-08", status: "regular" });
    expect(lewat?.session.day).toBe(4);
    expect(nextSessionAfterToday(SESSIONS, [ganti("2026-10-07")], wib("2026-10-06"))).toMatchObject({
      daysAhead: 1,
      status: "changed",
      note: "Pengganti",
    });
  });

  it("Sabtu berlanjut ke Ahad; null bila tak ada kajian", () => {
    expect(nextSessionAfterToday(SESSIONS, [], wib("2026-10-10"))?.session.day).toBe(0);
    expect(nextSessionAfterToday([], [], wib("2026-10-10"))).toBeNull();
  });
});

describe("overridesFrom", () => {
  it("menyaring tanggal sebelum batas", () => {
    expect(
      overridesFrom([libur("2026-10-01"), libur("2026-10-05"), libur("2026-10-09")], "2026-10-05").map(
        (o) => o.date,
      ),
    ).toEqual(["2026-10-05", "2026-10-09"]);
  });
});
