import { describe, expect, it } from "vitest";
import { SCHEDULE } from "@/data/content";
import { isiDariJadwalTetap, masjid, TEMPAT_AWAL, tempatSetelahCara } from "@/lib/admin/session-fields";
import { rawFromFormData } from "@/lib/validation/umum";
import type { StudySession } from "@/types";

describe("masjid dan tempatSetelahCara", () => {
  it("cara yang mencakup masjid: Di masjid dan Di masjid dan Zoom", () => {
    expect(masjid("masjid")).toBe(true);
    expect(masjid("hybrid")).toBe(true);
    expect(masjid("zoom")).toBe(false);
    expect(masjid("")).toBe(false);
  });

  it("memilih cara berisi masjid mengisi tempat kosong dengan isian awal; tempat yang sudah ada tidak diubah", () => {
    expect(tempatSetelahCara("masjid", "")).toBe(TEMPAT_AWAL);
    expect(tempatSetelahCara("hybrid", "")).toBe(TEMPAT_AWAL);
    expect(tempatSetelahCara("masjid", "Serambi")).toBe("Serambi");
    expect(tempatSetelahCara("zoom", "")).toBe("");
    expect(tempatSetelahCara("zoom", "Serambi")).toBe("Serambi");
  });
});

describe("isiDariJadwalTetap", () => {
  it("mengambil jam, ustadz, tema, cara, dan tempat dari jadwal tetap hari pada tanggal itu", () => {
    // 2026-10-15 adalah hari Kamis.
    expect(isiDariJadwalTetap(SCHEDULE.sessions, "2026-10-15")).toEqual({
      startTime: "05:00",
      endTime: "06:00",
      ustadz: "Ustadz Fulan A",
      topic: "Akhlak dan Adab Sehari-hari",
      mode: "masjid",
      location: "Ruang utama masjid",
    });
    // 2026-10-11 adalah Ahad dengan jam yang berbeda.
    expect(isiDariJadwalTetap(SCHEDULE.sessions, "2026-10-11")).toMatchObject({ startTime: "05:30", endTime: "06:30", topic: "Keluarga Sakinah" });
  });

  it("hari tanpa jadwal tetap, tanggal kosong, atau tanggal tidak sah: isian awal", () => {
    const tanpaKamis: StudySession[] = SCHEDULE.sessions.filter((s) => s.day !== 4);
    const awal = { startTime: "05:00", endTime: "06:00", ustadz: "", topic: "", mode: "", location: TEMPAT_AWAL };
    expect(isiDariJadwalTetap(tanpaKamis, "2026-10-15")).toEqual(awal);
    expect(isiDariJadwalTetap(SCHEDULE.sessions, "")).toEqual(awal);
    expect(isiDariJadwalTetap(SCHEDULE.sessions, "2026-02-30")).toEqual(awal);
  });

  it("jadwal Zoom tanpa tempat memberi tempat kosong, bukan tempat awal", () => {
    const zoom: StudySession[] = [{ id: "kamis", day: 4, startTime: "05:00", endTime: "06:00", ustadz: "A", topic: "T", mode: "zoom" }];
    expect(isiDariJadwalTetap(zoom, "2026-10-15")).toMatchObject({ mode: "zoom", location: "" });
  });
});

describe("rawFromFormData", () => {
  it("mengambil isian teks dan mengabaikan berkas", () => {
    const form = new FormData();
    form.set("date", "2026-10-15");
    form.set("note", "Catatan");
    form.set("berkas", new File(["x"], "x.txt"));
    expect(rawFromFormData(form)).toEqual({ date: "2026-10-15", note: "Catatan" });
  });
});
