import { describe, expect, it } from "vitest";
import { isKembaliStatus, isSectionKey, LABEL_BAGIAN } from "@/lib/admin/status";

describe("isKembaliStatus", () => {
  it("hanya tiga alamat panel yang boleh menjadi tujuan kembali", () => {
    for (const sah of ["/admin", "/admin/jadwal", "/admin/pengumuman"]) expect(isKembaliStatus(sah)).toBe(true);
  });

  it("menolak alamat lain, termasuk yang bisa mengalihkan ke situs lain", () => {
    for (const salah of ["", "/", "/admin/", "/admin/jadwal/senin", "//evil.com", "https://evil.example", "/admin?x=1", "/admin/../x", "javascript:alert(1)", undefined, null, 7]) {
      expect(isKembaliStatus(salah), String(salah)).toBe(false);
    }
  });
});

describe("isSectionKey dan LABEL_BAGIAN", () => {
  it("dua bagian yang dikelola, masing-masing dengan nama sehari-hari", () => {
    expect(isSectionKey("schedule")).toBe(true);
    expect(isSectionKey("announcements")).toBe(true);
    for (const salah of ["zoom", "", undefined, null, "Schedule"]) expect(isSectionKey(salah)).toBe(false);
    expect(LABEL_BAGIAN).toEqual({ schedule: "Jadwal Kajian", announcements: "Kegiatan dan Pengumuman" });
  });
});
