import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OverrideList } from "@/components/admin/OverrideList";
import { WeekDayList } from "@/components/admin/WeekDayList";
import { SCHEDULE } from "@/data/content";
import type { SessionOverride } from "@/types";

/** Teks tampak dari HTML: tanpa tag, entitas kutip dikembalikan, spasi dirapikan. */
function teks(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

describe("WeekDayList", () => {
  it("tujuh kartu berurutan Senin sampai Ahad dengan tautan Ubah ke alamat hari", () => {
    const html = renderToStaticMarkup(<WeekDayList sessions={SCHEDULE.sessions} />);
    const nama = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
    expect(nama).toEqual(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"]);
    const alamat = [...html.matchAll(/href="(\/admin\/jadwal\/[a-z]+)"/g)].map((m) => m[1]);
    expect(alamat).toEqual(
      ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "ahad"].map((slug) => `/admin/jadwal/${slug}`),
    );
    const senin = teks(html).split("Selasa")[0];
    expect(senin).toContain("05.00 – 06.00");
    expect(senin).toContain("Tafsir Juz 'Amma");
    expect(senin).toContain("Ustadz Fulan A");
    expect(senin).toContain("Ubah");
  });

  it("hari tanpa kajian menampilkan 'Tidak ada kajian' dan tombol Tambah kajian", () => {
    const tanpaSelasa = SCHEDULE.sessions.filter((s) => s.day !== 2);
    const html = renderToStaticMarkup(<WeekDayList sessions={tanpaSelasa} />);
    const bagian = teks(html);
    expect(bagian).toContain("Tidak ada kajian");
    expect(bagian).toContain("Tambah kajian");
    expect(html).toContain('href="/admin/jadwal/selasa"');
    expect((bagian.match(/Tidak ada kajian/g) ?? []).length).toBe(1);
  });
});

describe("OverrideList", () => {
  it("tanpa pengecualian: kalimat kosong dengan petunjuk tombol", () => {
    expect(teks(renderToStaticMarkup(<OverrideList overrides={[]} />))).toBe(
      "Belum ada perubahan tanggal. Gunakan tombol di bawah bila kajian libur atau diganti pada tanggal tertentu.",
    );
  });

  it("libur dan ganti: tanggal lengkap, status, catatan, dan tautan Ubah ke tanggalnya", () => {
    const overrides: SessionOverride[] = [
      { date: "2026-10-15", kind: "libur", note: "Ustadz berhalangan hadir" },
      {
        date: "2026-10-22",
        kind: "ganti",
        session: { startTime: "06:00", endTime: "07:00", ustadz: "Ustadz Tamu", topic: "Tema Tamu", mode: "zoom" },
      },
    ];
    const html = renderToStaticMarkup(<OverrideList overrides={overrides} />);
    const bagian = teks(html);
    expect(bagian).toContain("Kamis, 15 Oktober 2026");
    expect(bagian).toContain("Libur");
    expect(bagian).toContain("Ustadz berhalangan hadir");
    expect(bagian).toContain("Kamis, 22 Oktober 2026");
    expect(bagian).toContain("Diganti: Tema Tamu");
    expect(html).toContain('href="/admin/jadwal/tanggal/2026-10-15"');
    expect(html).toContain('href="/admin/jadwal/tanggal/2026-10-22"');
    expect(bagian).not.toContain("Belum ada perubahan tanggal");
  });
});
