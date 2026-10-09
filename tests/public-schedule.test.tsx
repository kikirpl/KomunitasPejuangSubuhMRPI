import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TodayContent } from "@/components/TodaySchedule";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { SCHEDULE } from "@/data/content";
import { getWibParts } from "@/lib/time";
import type { ScheduleData, SessionOverride } from "@/types";

/** Teks tampak dari HTML: tanpa tag, entitas kutip dikembalikan, spasi dirapikan. */
function teks(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const jadwal = (overrides: SessionOverride[], tanpaHari: number[] = []): ScheduleData => ({
  sessions: SCHEDULE.sessions.filter((s) => !tanpaHari.includes(s.day)),
  overrides,
});
const hariIni = (iso: string, schedule: ScheduleData) =>
  teks(renderToStaticMarkup(<TodayContent now={getWibParts(new Date(iso))} schedule={schedule} />));
const sepekan = (iso: string, schedule: ScheduleData) =>
  renderToStaticMarkup(<WeeklySchedule schedule={schedule} generatedAt={new Date(iso).toISOString()} />);

/** Teks tiap kartu hari di Jadwal Sepekan (dari pembuka kartu sampai kartu berikutnya), menurut nama hari pada judulnya. */
function kartu(html: string): Record<string, string> {
  const hasil: Record<string, string> = {};
  for (const bagian of html.split('<li class="flex flex-col overflow-hidden').slice(1)) {
    const nama = /<h3[^>]*>([^<]+)</.exec(bagian)?.[1];
    if (nama) hasil[nama] = teks(bagian);
  }
  return hasil;
}

const SELASA = "2026-10-06T05:30:00+07:00"; // Selasa
const LIBUR_SELASA: SessionOverride = { date: "2026-10-06", kind: "libur", note: "Ustadz berhalangan hadir" };
const GANTI_SELASA: SessionOverride = {
  date: "2026-10-06",
  kind: "ganti",
  note: "Ustadz tamu hari ini",
  session: { startTime: "06:00", endTime: "07:00", ustadz: "Ustadz Pengganti", topic: "Tema Pengganti", mode: "zoom" },
};

describe("Kajian Hari Ini", () => {
  it("tanpa pengecualian: kajian biasa tanpa tanda perubahan", () => {
    const isi = hariIni(SELASA, jadwal([]));
    expect(isi).toContain("Fiqih Ibadah Sehari-hari");
    expect(isi).toContain("Sedang berlangsung");
    expect(isi).not.toContain("diliburkan");
    expect(isi).not.toContain("Ada perubahan");
  });

  it("libur hari ini: kartu 'Kajian hari ini diliburkan', catatan, lalu Kajian berikutnya", () => {
    const isi = hariIni(SELASA, jadwal([LIBUR_SELASA]));
    expect(isi).toContain("Kajian hari ini diliburkan");
    expect(isi).toContain("Catatan: Ustadz berhalangan hadir");
    expect(isi).toContain("Kajian berikutnya: Besok");
    expect(isi).toContain("Hadits Arba'in");
    expect(isi).not.toContain("Fiqih Ibadah Sehari-hari");
  });

  it("libur tanpa catatan: tidak ada baris catatan", () => {
    const isi = hariIni(SELASA, jadwal([{ date: "2026-10-06", kind: "libur" }]));
    expect(isi).toContain("Kajian hari ini diliburkan");
    expect(isi).not.toContain("Catatan:");
  });

  it("ganti hari ini: lencana, tema dan ustadz pengganti, status dari jam pengganti, catatan", () => {
    const isi = hariIni(SELASA, jadwal([GANTI_SELASA]));
    expect(isi).toContain("Ada perubahan hari ini");
    expect(isi).toContain("Tema Pengganti");
    expect(isi).toContain("Ustadz Pengganti");
    expect(isi).toContain("Belum dimulai"); // 05:30 sebelum 06:00 pengganti, padahal jam biasa 05:00 sudah lewat
    expect(isi).toContain("06.00");
    expect(isi).toContain("Catatan: Ustadz tamu hari ini");
    expect(isi).not.toContain("Fiqih Ibadah Sehari-hari");
  });

  it("besok libur dan kajian hari ini sudah selesai: Kajian berikutnya melewati besok", () => {
    const rabuLibur: SessionOverride = { date: "2026-10-07", kind: "libur" };
    const isi = hariIni("2026-10-06T07:00:00+07:00", jadwal([rabuLibur]));
    expect(isi).toContain("Sudah selesai");
    expect(isi).toContain("Kajian berikutnya: Kamis");
    expect(isi).not.toContain("Kajian berikutnya: Besok");
  });

  it("kajian berikutnya yang berubah ditandai '(ada perubahan)'", () => {
    const rabuGanti: SessionOverride = {
      date: "2026-10-07",
      kind: "ganti",
      session: { startTime: "06:00", endTime: "07:00", ustadz: "Ustadz Tamu", topic: "Tema Rabu Baru", mode: "masjid" },
    };
    const isi = hariIni("2026-10-06T07:00:00+07:00", jadwal([rabuGanti]));
    expect(isi).toContain("Kajian berikutnya: Besok");
    expect(isi).toContain("(ada perubahan)");
    expect(isi).toContain("Tema Rabu Baru");
  });

  it("hari tanpa jadwal tetap: 'Hari ini tidak ada kajian' dan Kajian berikutnya", () => {
    const isi = hariIni(SELASA, jadwal([], [2]));
    expect(isi).toContain("Hari ini tidak ada kajian");
    expect(isi).toContain("Kajian berikutnya: Besok");
  });

  it("ganti pada hari tanpa jadwal tetap: menjadi kajian tambahan hari itu", () => {
    const isi = hariIni(SELASA, jadwal([GANTI_SELASA], [2]));
    expect(isi).toContain("Ada perubahan hari ini");
    expect(isi).toContain("Tema Pengganti");
    expect(isi).not.toContain("Hari ini tidak ada kajian");
  });

  it("semua jadwal dihapus: tidak ada kajian dan tidak ada kotak Kajian berikutnya", () => {
    const isi = hariIni(SELASA, { sessions: [], overrides: [] });
    expect(isi).toContain("Hari ini tidak ada kajian");
    expect(isi).not.toContain("Kajian berikutnya");
  });
});

describe("Jadwal Sepekan", () => {
  it("tanpa pengecualian: tujuh kartu Senin sampai Ahad tanpa tanda perubahan", () => {
    const html = sepekan(SELASA, jadwal([]));
    expect(Object.keys(kartu(html))).toEqual(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"]);
    expect(teks(html)).not.toContain("Libur");
    expect(teks(html)).not.toContain("Ada perubahan");
  });

  it("libur: lencana 'Libur', jam 'Libur', tema 'Kajian diliburkan', catatan di baris ustadz", () => {
    const selasa = kartu(sepekan(SELASA, jadwal([LIBUR_SELASA]))).Selasa;
    expect(selasa).toContain("Kajian diliburkan");
    expect(selasa.match(/Libur/g)?.length).toBeGreaterThanOrEqual(2); // lencana dan pengganti jam
    expect(selasa).toContain("Catatan: Ustadz berhalangan hadir");
    expect(selasa).not.toContain("Fiqih Ibadah Sehari-hari");
    expect(selasa).not.toContain("05.00");
  });

  it("ganti: lencana 'Ada perubahan', tema dan jam pengganti", () => {
    const selasa = kartu(sepekan(SELASA, jadwal([GANTI_SELASA]))).Selasa;
    expect(selasa).toContain("Ada perubahan");
    expect(selasa).toContain("Tema Pengganti");
    expect(selasa).toContain("06.00");
    expect(selasa).not.toContain("Fiqih Ibadah Sehari-hari");
  });

  it("hanya pekan berjalan menurut generatedAt: pengecualian pekan depan tidak tampil", () => {
    // Ahad malam: pekan 5-11 Oktober. Pengecualian Senin 12 Oktober termasuk pekan berikutnya.
    const senin12: SessionOverride = { date: "2026-10-12", kind: "libur" };
    const ahad11: SessionOverride = { date: "2026-10-11", kind: "libur" };
    const kartuAhad = kartu(sepekan("2026-10-11T22:00:00+07:00", jadwal([senin12, ahad11])));
    expect(kartuAhad.Senin).toContain("Tafsir Juz 'Amma");
    expect(kartuAhad.Senin).not.toContain("Libur");
    expect(kartuAhad.Ahad).toContain("Kajian diliburkan");
  });

  it("pekan berganti setelah Ahad malam: Senin pagi memakai pekan baru", () => {
    const senin12: SessionOverride = { date: "2026-10-12", kind: "libur" };
    const kartuSenin = kartu(sepekan("2026-10-12T05:00:00+07:00", jadwal([senin12])));
    expect(kartuSenin.Senin).toContain("Kajian diliburkan");
  });

  it("ganti pada hari tanpa jadwal tetap: kartu tambahan muncul di pekan itu", () => {
    const tanpa = kartu(sepekan(SELASA, jadwal([], [2])));
    expect(Object.keys(tanpa)).not.toContain("Selasa");
    const dengan = kartu(sepekan(SELASA, jadwal([GANTI_SELASA], [2])));
    expect(Object.keys(dengan)).toContain("Selasa");
    expect(dengan.Selasa).toContain("Ada perubahan");
  });

  it("libur pada hari tanpa jadwal tetap: kartu 'Libur' tetap tampil", () => {
    const kartuLibur = kartu(sepekan(SELASA, jadwal([LIBUR_SELASA], [2])));
    expect(kartuLibur.Selasa).toContain("Kajian diliburkan");
  });

  it("tanpa satu pun kartu: kalimat 'Jadwal kajian belum tersedia.' dan tidak ada daftar", () => {
    const html = sepekan(SELASA, { sessions: [], overrides: [] });
    expect(teks(html)).toContain("Jadwal kajian belum tersedia.");
    expect(html).not.toContain("<ul");
  });

  it("HTML dari server (tanpa JavaScript) sudah memuat kartu sepekan, bukan kerangka, dan tanpa sorotan 'Hari ini'", () => {
    const html = sepekan(SELASA, jadwal([LIBUR_SELASA]));
    expect(teks(html)).toContain("Tafsir Juz 'Amma");
    expect(teks(html)).toContain("Kajian diliburkan");
    expect(teks(html)).not.toContain("Hari ini");
  });
});
