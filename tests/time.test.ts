import { describe, expect, it } from "vitest";
import {
  addDaysToKey,
  dayFromSlug,
  daySlug,
  formatDateKeyLong,
  isValidDateKey,
  todayKey,
  weekdayOfKey,
} from "@/lib/time";

describe("kunci tanggal WIB", () => {
  it("todayKey memakai tanggal WIB, bukan UTC", () => {
    expect(todayKey(new Date("2026-10-09T16:59:59Z"))).toBe("2026-10-09");
    expect(todayKey(new Date("2026-10-09T17:00:00Z"))).toBe("2026-10-10"); // 00:00 WIB
  });

  it("addDaysToKey melewati batas bulan, tahun, dan kabisat", () => {
    expect(addDaysToKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToKey("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysToKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("weekdayOfKey dan formatDateKeyLong", () => {
    expect(weekdayOfKey("2026-10-11")).toBe(0); // Ahad
    expect(formatDateKeyLong("2026-10-15")).toBe("Kamis, 15 Oktober 2026");
  });

  it("isValidDateKey menolak tanggal yang tidak ada", () => {
    for (const salah of ["2026-02-30", "2026-13-01", "2026-1-5", ""]) {
      expect(isValidDateKey(salah)).toBe(false);
    }
    expect(isValidDateKey("2028-02-29")).toBe(true);
  });

  it("slug hari", () => {
    expect(daySlug(0)).toBe("ahad");
    expect(dayFromSlug("jumat")).toBe(5);
    expect(dayFromSlug("minggu")).toBeNull();
  });
});
