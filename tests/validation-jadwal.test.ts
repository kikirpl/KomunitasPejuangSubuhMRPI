import { describe, expect, it } from "vitest";
import { overrideSchema, sessionSchema } from "@/lib/validation/jadwal";
import { parseForm, type RawForm } from "@/lib/validation/umum";

const HOST = "abc.public.blob.vercel-storage.com";
const HARI_INI = "2026-10-09";
const huruf = (n: number) => "a".repeat(n);

const SESI: RawForm = {
  startTime: "05:00",
  endTime: "06:00",
  ustadz: "Ustadz A",
  topic: "Tema",
  mode: "masjid",
  location: "",
  imageUrl: "",
  imageAlt: "",
  imagePosition: "",
  fotoMasihDiunggah: "",
};

describe("sessionSchema", () => {
  it("isian dipangkas; tempat dan foto kosong menjadi tidak ada; posisi foto bawaan center", () => {
    const hasil = parseForm(sessionSchema(HOST), { ...SESI, ustadz: "  Ustadz A  ", topic: " Tema " });
    expect(hasil).toEqual({
      ok: true,
      data: { startTime: "05:00", endTime: "06:00", ustadz: "Ustadz A", topic: "Tema", mode: "masjid", imagePosition: "center" },
    });
  });

  it("foto milik kita dan jalur lokal sah, lengkap dengan keterangan dan posisi", () => {
    const url = `https://${HOST}/kajian/a.webp`;
    const hasil = parseForm(sessionSchema(HOST), { ...SESI, imageUrl: url, imageAlt: "Ustadz di serambi", imagePosition: "top", location: "Ruang utama" });
    expect(hasil).toMatchObject({ ok: true, data: { imageUrl: url, imageAlt: "Ustadz di serambi", imagePosition: "top", location: "Ruang utama" } });
    expect(parseForm(sessionSchema(HOST), { ...SESI, imageUrl: "/kajian/senin.jpg" }).ok).toBe(true);
  });

  const kasus: [string, RawForm, string, string][] = [
    ["jam mulai kosong", { startTime: "" }, "startTime", "Jam mulai belum diisi."],
    ["jam selesai kosong", { endTime: "" }, "endTime", "Jam selesai belum diisi."],
    ["selesai tidak setelah mulai", { endTime: "05:00" }, "endTime", "Jam selesai harus setelah jam mulai."],
    ["jam tidak sah", { startTime: "25:00" }, "startTime", "Jam tidak sah. Gunakan format 24 jam, contoh 05.30."],
    ["ustadz hanya spasi", { ustadz: "   " }, "ustadz", "Nama ustadz belum diisi."],
    ["ustadz terlalu panjang", { ustadz: huruf(121) }, "ustadz", "Nama ustadz terlalu panjang (maksimal 120 huruf)."],
    ["tema kosong", { topic: "" }, "topic", "Tema kajian belum diisi."],
    ["tema terlalu panjang", { topic: huruf(201) }, "topic", "Tema kajian terlalu panjang (maksimal 200 huruf)."],
    ["tempat terlalu panjang", { location: huruf(121) }, "location", "Tempat terlalu panjang (maksimal 120 huruf)."],
    ["cara tidak dikenal", { mode: "x" }, "mode", "Pilih cara mengikuti kajian."],
    ["cara kosong", { mode: "" }, "mode", "Pilih cara mengikuti kajian."],
    ["foto dari host lain", { imageUrl: "https://evil.example/x.webp" }, "imageUrl", "Alamat foto tidak dikenal. Unggah ulang fotonya."],
    ["keterangan foto terlalu panjang", { imageAlt: huruf(201) }, "imageAlt", "Keterangan foto terlalu panjang (maksimal 200 huruf)."],
    ["foto masih diunggah", { fotoMasihDiunggah: "1" }, "imageUrl", "Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi."],
  ];
  it.each(kasus)("galat: %s", (_nama, ubah, kolom, pesan) => {
    const hasil = parseForm(sessionSchema(HOST), { ...SESI, ...ubah });
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.fieldErrors[kolom]).toBe(pesan);
  });

  it("beberapa galat sekaligus, termasuk urutan jam", () => {
    const hasil = parseForm(sessionSchema(HOST), { ...SESI, ustadz: "", endTime: "05:00" });
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.fieldErrors).toMatchObject({
        ustadz: "Nama ustadz belum diisi.",
        endTime: "Jam selesai harus setelah jam mulai.",
      });
    }
  });

  it("urutan jam dan foto yang belum selesai tetap dilaporkan walau pilihan (cara, posisi foto) belum benar", () => {
    const jam = parseForm(sessionSchema(HOST), { ...SESI, mode: "", endTime: "05:00" });
    expect(!jam.ok && jam.fieldErrors).toEqual({
      mode: "Pilih cara mengikuti kajian.",
      endTime: "Jam selesai harus setelah jam mulai.",
    });
    const foto = parseForm(sessionSchema(HOST), { ...SESI, imagePosition: "x", fotoMasihDiunggah: "1" });
    expect(!foto.ok && foto.fieldErrors).toEqual({
      imagePosition: "Pilih bagian foto yang tampil.",
      imageUrl: "Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi.",
    });
  });

  it("kolom yang hilang diperlakukan sebagai kosong, bukan galat teknis", () => {
    const hasil = parseForm(sessionSchema(HOST), {});
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.fieldErrors.startTime).toBe("Jam mulai belum diisi.");
      expect(hasil.fieldErrors.ustadz).toBe("Nama ustadz belum diisi.");
      expect(hasil.fieldErrors.mode).toBe("Pilih cara mengikuti kajian.");
    }
  });
});

describe("overrideSchema", () => {
  const GANTI: RawForm = {
    date: "2026-10-15",
    kind: "ganti",
    note: "Ustadz berhalangan hadir",
    startTime: "06:00",
    endTime: "07:00",
    ustadz: "Ustadz Tamu",
    topic: "Tema Tamu",
    mode: "zoom",
    location: "",
  };
  const skema = overrideSchema(HARI_INI);

  it("ganti yang sah menyimpan kajian pengganti utuh", () => {
    expect(parseForm(skema, GANTI)).toEqual({
      ok: true,
      data: {
        date: "2026-10-15",
        kind: "ganti",
        note: "Ustadz berhalangan hadir",
        session: { startTime: "06:00", endTime: "07:00", ustadz: "Ustadz Tamu", topic: "Tema Tamu", mode: "zoom" },
      },
    });
  });

  it("libur mengabaikan kolom sesi, bahkan yang rusak", () => {
    const hasil = parseForm(skema, { ...GANTI, kind: "libur", startTime: "salah", ustadz: "", topic: "", mode: "x" });
    expect(hasil).toEqual({ ok: true, data: { date: "2026-10-15", kind: "libur", note: "Ustadz berhalangan hadir" } });
  });

  it("rentang tanggal: hari ini sampai hari ini + 366", () => {
    expect(parseForm(skema, { ...GANTI, date: HARI_INI }).ok).toBe(true);
    expect(parseForm(skema, { ...GANTI, date: "2027-10-10" }).ok).toBe(true);
    const lampau = parseForm(skema, { ...GANTI, date: "2026-10-08" });
    const jauh = parseForm(skema, { ...GANTI, date: "2027-10-11" });
    expect(!lampau.ok && lampau.fieldErrors.date).toBe("Tanggal tidak boleh sebelum hari ini.");
    expect(!jauh.ok && jauh.fieldErrors.date).toBe("Tanggal paling jauh satu tahun dari sekarang.");
  });

  it("tanggal kosong atau tidak ada di kalender", () => {
    for (const salah of ["", "2026-02-30", "bukan tanggal"]) {
      const hasil = parseForm(skema, { ...GANTI, date: salah });
      expect(!hasil.ok && hasil.fieldErrors.date).toBe("Tanggal belum diisi.");
    }
  });

  it("ganti yang cara dan urutan jamnya sama-sama salah melaporkan keduanya, bersama tanggal", () => {
    const hasil = parseForm(skema, { ...GANTI, date: "", mode: "", endTime: "06:00", topic: "" });
    expect(!hasil.ok && hasil.fieldErrors).toEqual({
      date: "Tanggal belum diisi.",
      topic: "Tema kajian belum diisi.",
      mode: "Pilih cara mengikuti kajian.",
      endTime: "Jam selesai harus setelah jam mulai.",
    });
  });

  it("pilihan, kolom sesi untuk ganti, urutan jam, dan catatan", () => {
    const kind = parseForm(skema, { ...GANTI, kind: "" });
    expect(!kind.ok && kind.fieldErrors.kind).toBe("Pilih Libur atau Ganti jadwal.");
    const tema = parseForm(skema, { ...GANTI, topic: "" });
    expect(!tema.ok && tema.fieldErrors.topic).toBe("Tema kajian belum diisi.");
    const jam = parseForm(skema, { ...GANTI, endTime: "06:00" });
    expect(!jam.ok && jam.fieldErrors.endTime).toBe("Jam selesai harus setelah jam mulai.");
    const catatan = parseForm(skema, { ...GANTI, note: huruf(201) });
    expect(!catatan.ok && catatan.fieldErrors.note).toBe("Catatan terlalu panjang (maksimal 200 huruf).");
  });
});
