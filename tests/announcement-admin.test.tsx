import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnnouncementAdminList } from "@/components/admin/AnnouncementAdminList";
import { ANNOUNCEMENTS } from "@/data/content";
import { kelompokkanPerJenis, pisahTanggalJam } from "@/lib/announcements";
import type { AnnouncementItem } from "@/types";

/** Teks tampak dari HTML: tanpa tag, entitas kutip dikembalikan, spasi dirapikan. */
function teks(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

describe("pisahTanggalJam", () => {
  it("tanggal saja, atau tanggal dengan jam WIB, dipisah menjadi isian formulir", () => {
    expect(pisahTanggalJam("2026-10-17")).toEqual({ date: "2026-10-17", time: "" });
    expect(pisahTanggalJam("2026-10-17T05:30:00+07:00")).toEqual({ date: "2026-10-17", time: "05:30" });
    expect(pisahTanggalJam("2026-10-17T19:05")).toEqual({ date: "2026-10-17", time: "19:05" });
  });
});

describe("AnnouncementAdminList", () => {
  const { kegiatan } = kelompokkanPerJenis(ANNOUNCEMENTS.items);

  it("tiap butir: judul, tanggal lengkap, dan tautan Ubah ke /admin/pengumuman/{id}, terbaru dulu", () => {
    const html = renderToStaticMarkup(<AnnouncementAdminList jenis="kegiatan" items={kegiatan} />);
    const judul = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1].replace(/&#x27;/g, "'"));
    expect(judul).toEqual(kegiatan.map((k) => k.title));
    expect(judul[0]).toBe("Kerja bakti membersihkan masjid"); // 2026-10-17 paling baru
    const alamat = [...html.matchAll(/href="(\/admin\/pengumuman\/[^"]+)"/g)].map((m) => m[1]);
    expect(alamat).toEqual(kegiatan.map((k) => `/admin/pengumuman/${k.id}`));
    expect(teks(html)).toContain("Sabtu, 17 Oktober 2026");
  });

  it("butir berjam menampilkan 'pukul ... WIB'", () => {
    const item: AnnouncementItem = {
      id: "x1",
      type: "pengumuman",
      title: "Subuh khusus",
      date: "2026-10-12T05:30:00+07:00",
      excerpt: "Ringkas",
    };
    expect(teks(renderToStaticMarkup(<AnnouncementAdminList jenis="pengumuman" items={[item]} />))).toContain("pukul 05.30 WIB");
  });

  it("kosong: kalimat per jenis dengan tombol Tambah ke formulir jenis itu", () => {
    const k = renderToStaticMarkup(<AnnouncementAdminList jenis="kegiatan" items={[]} />);
    expect(teks(k)).toContain("Belum ada kegiatan.");
    expect(teks(k)).toContain("Tambah kegiatan");
    expect(k).toContain('href="/admin/pengumuman/baru?jenis=kegiatan"');
    const p = renderToStaticMarkup(<AnnouncementAdminList jenis="pengumuman" items={[]} />);
    expect(teks(p)).toContain("Belum ada pengumuman.");
    expect(teks(p)).toContain("Tambah pengumuman");
    expect(p).toContain('href="/admin/pengumuman/baru?jenis=pengumuman"');
  });

  it("id berisi karakter khusus dikodekan pada alamat", () => {
    const item: AnnouncementItem = { id: "a b/c", type: "kegiatan", title: "T", date: "2026-10-12", excerpt: "E" };
    expect(renderToStaticMarkup(<AnnouncementAdminList jenis="kegiatan" items={[item]} />)).toContain('href="/admin/pengumuman/a%20b%2Fc"');
  });
});
