import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ModeChips } from "@/components/ui/ModeChips";
import { SCHEDULE } from "@/data/content";
import type { StudySession } from "@/types";

const ALAMAT_PANJANG = "https://maps.app.goo.gl/" + "AbCdEfGhIj".repeat(8);
const sesi = (lokasi: string | undefined): StudySession => ({ ...SCHEDULE.sessions[0], mode: "masjid", location: lokasi });

describe("keterangan cara mengikuti kajian (ModeChips)", () => {
  it("Tempat yang panjang tanpa spasi (misalnya tautan peta) boleh menyusut dan membungkus, bukan terpotong di kartu", () => {
    // Tanpa ini chip flex mempertahankan lebar kata utuh (min-width:auto) dan kartu overflow-hidden memotong ujung teksnya.
    const html = renderToStaticMarkup(<ModeChips session={sesi(ALAMAT_PANJANG)} />);
    const pembungkusTeks = html.match(/<(\w+)([^>]*)>https:\/\/maps\.app\.goo\.gl\//);
    expect(pembungkusTeks, "teks Tempat harus berada langsung di dalam sebuah unsur").not.toBeNull();
    expect(pembungkusTeks![1]).not.toBe("li");
    expect(pembungkusTeks![2]).toContain("min-w-0");
    expect(pembungkusTeks![2]).toContain("[overflow-wrap:anywhere]");
    expect(html).toMatch(/<li class="[^"]*\bmax-w-full\b/);
  });

  it("Tempat biasa tetap tampil apa adanya, dan tanpa Tempat memakai 'Di masjid'", () => {
    expect(renderToStaticMarkup(<ModeChips session={sesi("Ruang utama masjid")} />)).toContain("Ruang utama masjid");
    expect(renderToStaticMarkup(<ModeChips session={sesi(undefined)} />)).toContain("Di masjid");
  });
});
