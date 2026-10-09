import { describe, expect, it } from "vitest";
import { announcementSchema } from "@/lib/validation/pengumuman";
import { parseForm, type RawForm } from "@/lib/validation/umum";

const HOST = "abc.public.blob.vercel-storage.com";
const HARI_INI = "2026-10-09";
const skema = announcementSchema({ blobHost: HOST, todayKey: HARI_INI });
const huruf = (n: number) => "a".repeat(n);

const VALID: RawForm = {
  id: "p1",
  type: "kegiatan",
  title: "Kerja bakti",
  date: "2026-10-17",
  time: "",
  excerpt: "Membersihkan masjid",
  href: "",
  imageUrl: "",
  imageAlt: "",
  imagePosition: "center",
};

describe("announcementSchema", () => {
  it("masukan sah: dipangkas, jam dan tautan kosong menjadi tidak ada, posisi bawaan center", () => {
    const hasil = parseForm(skema, { ...VALID, title: "  Kerja bakti  ", excerpt: " Membersihkan masjid ", imagePosition: "" });
    expect(hasil).toEqual({
      ok: true,
      data: { id: "p1", type: "kegiatan", title: "Kerja bakti", date: "2026-10-17", excerpt: "Membersihkan masjid", imagePosition: "center" },
    });
  });

  it("jam, tautan, foto, dan keterangan foto yang diisi ikut tersimpan", () => {
    const url = `https://${HOST}/kegiatan/a.webp`;
    const hasil = parseForm(skema, { ...VALID, type: "pengumuman", time: "19:30", href: "https://contoh.id/info", imageUrl: url, imageAlt: "Jamaah berkumpul", imagePosition: "top" });
    expect(hasil).toEqual({
      ok: true,
      data: {
        id: "p1",
        type: "pengumuman",
        title: "Kerja bakti",
        date: "2026-10-17",
        time: "19:30",
        excerpt: "Membersihkan masjid",
        href: "https://contoh.id/info",
        imageUrl: url,
        imageAlt: "Jamaah berkumpul",
        imagePosition: "top",
      },
    });
  });

  const kasus: [string, RawForm, string, string][] = [
    ["jenis tidak dikenal", { type: "x" }, "type", "Pilih jenis: Kegiatan atau Pengumuman."],
    ["jenis kosong", { type: "" }, "type", "Pilih jenis: Kegiatan atau Pengumuman."],
    ["judul hanya spasi", { title: "   " }, "title", "Judul belum diisi."],
    ["judul 141 huruf", { title: huruf(141) }, "title", "Judul terlalu panjang (maksimal 140 huruf)."],
    ["ringkasan kosong", { excerpt: "" }, "excerpt", "Ringkasan belum diisi."],
    ["ringkasan 401 huruf", { excerpt: huruf(401) }, "excerpt", "Ringkasan terlalu panjang (maksimal 400 huruf)."],
    ["tanggal kosong", { date: "" }, "date", "Tanggal belum diisi."],
    ["tanggal tidak ada di kalender", { date: "2026-02-30" }, "date", "Tanggal belum diisi."],
    ["tahun terlalu jauh ke depan", { date: "2062-10-09" }, "date", "Tanggal tidak masuk akal. Periksa tahunnya."],
    ["tahun terlalu lampau", { date: "2019-12-31" }, "date", "Tanggal tidak masuk akal. Periksa tahunnya."],
    ["tautan skema lain", { href: "ftp://x" }, "href", "Tautan harus diawali https:// atau http://."],
    ["tautan javascript", { href: "javascript:alert(1)" }, "href", "Tautan harus diawali https:// atau http://."],
    ["tautan ke situs lain tanpa skema", { href: "//evil.com/x" }, "href", "Tautan harus diawali https:// atau http://."],
    ["tautan tanpa skema", { href: "contoh.id/info" }, "href", "Tautan harus diawali https:// atau http://."],
    ["jam tidak sah", { time: "25:00" }, "time", "Jam tidak sah. Gunakan format 24 jam, contoh 05.30."],
    ["keterangan foto 201 huruf", { imageAlt: huruf(201) }, "imageAlt", "Keterangan foto terlalu panjang (maksimal 200 huruf)."],
    ["foto dari host lain", { imageUrl: "https://evil.example/x.webp" }, "imageUrl", "Alamat foto tidak dikenal. Unggah ulang fotonya."],
    ["foto masih diunggah", { fotoMasihDiunggah: "1" }, "imageUrl", "Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi."],
    ["posisi foto tidak dikenal", { imagePosition: "kiri" }, "imagePosition", "Pilih bagian foto yang tampil."],
  ];
  it.each(kasus)("galat: %s", (_nama, ubah, kolom, pesan) => {
    const hasil = parseForm(skema, { ...VALID, ...ubah });
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.fieldErrors[kolom]).toBe(pesan);
  });

  it("id kosong atau berbentuk aneh ditolak", () => {
    for (const id of ["", "   ", "a b", "../x", "x".repeat(65)]) {
      const hasil = parseForm(skema, { ...VALID, id });
      expect(hasil.ok, `id ${JSON.stringify(id)}`).toBe(false);
      if (!hasil.ok) expect(hasil.fieldErrors.id).toBeTruthy();
    }
    expect(parseForm(skema, { ...VALID, id: "c1f6a2de-5b1e-4c0e-9d77-0f7f6d9a1b2c" }).ok).toBe(true);
  });

  it("tanggal: tepi rentang (2020-01-01 dan hari ini + 731) sah, satu hari di luarnya tidak", () => {
    expect(parseForm(skema, { ...VALID, date: "2020-01-01" }).ok).toBe(true);
    expect(parseForm(skema, { ...VALID, date: "2026-10-01" }).ok).toBe(true); // lampau boleh
    expect(parseForm(skema, { ...VALID, date: "2028-10-09" }).ok).toBe(true); // 2026-10-09 + 731
    const lewat = parseForm(skema, { ...VALID, date: "2028-10-10" });
    expect(!lewat.ok && lewat.fieldErrors.date).toBe("Tanggal tidak masuk akal. Periksa tahunnya.");
  });

  it("tautan yang sah: https, http, jalur lokal, dan jangkar", () => {
    for (const href of ["https://contoh.id/x", "http://contoh.id", "/", "/kegiatan", "#zoom"]) {
      expect(parseForm(skema, { ...VALID, href }).ok, href).toBe(true);
    }
  });

  it("beberapa galat sekaligus dilaporkan bersama", () => {
    const hasil = parseForm(skema, { ...VALID, title: "", excerpt: "", date: "", type: "" });
    expect(!hasil.ok && Object.keys(hasil.fieldErrors).sort()).toEqual(["date", "excerpt", "title", "type"]);
  });

  it("kolom yang hilang diperlakukan sebagai kosong, bukan galat teknis", () => {
    const hasil = parseForm(skema, {});
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.fieldErrors.title).toBe("Judul belum diisi.");
      expect(hasil.fieldErrors.type).toBe("Pilih jenis: Kegiatan atau Pengumuman.");
    }
  });
});
