import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteAnnouncementCommand,
  saveAnnouncementCommand,
  type CommandDeps,
} from "@/lib/admin/commands";
import { MESSAGE_DELETE_FAILED, MESSAGE_SAVE_FAILED } from "@/lib/admin/form-state";
import { MemoryStore } from "@/lib/store/memory";
import type { RawForm } from "@/lib/validation/umum";

const HOST = "abc.public.blob.vercel-storage.com";
const A = `https://${HOST}/kegiatan/a.webp`;
const B = `https://${HOST}/kegiatan/b.webp`;

const FORM: RawForm = {
  id: "baru-1",
  type: "kegiatan",
  title: "Kerja bakti",
  date: "2026-10-17",
  time: "",
  excerpt: "Membersihkan masjid",
  href: "",
  imageUrl: "",
  imageAlt: "",
  imagePosition: "center",
  fotoMasihDiunggah: "",
};

let store: MemoryStore;
let deps: CommandDeps;

beforeEach(() => {
  store = new MemoryStore({ seeded: true });
  deps = { store, blobHost: HOST, todayKey: "2026-10-09" };
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("saveAnnouncementCommand", () => {
  it("menyimpan dua kali dengan id yang sama menghasilkan satu butir baru, bukan dua", async () => {
    const awal = (await store.listAnnouncements()).length;
    expect(await saveAnnouncementCommand(deps, FORM)).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await saveAnnouncementCommand(deps, { ...FORM, title: "Kerja bakti besar" })).toEqual({ ok: true, deleteImageUrls: [] });
    const daftar = await store.listAnnouncements();
    expect(daftar).toHaveLength(awal + 1);
    expect(daftar.filter((a) => a.id === "baru-1")).toHaveLength(1);
    expect(await store.getAnnouncement("baru-1")).toMatchObject({ title: "Kerja bakti besar", type: "kegiatan" });
  });

  it("jam yang diisi tersimpan bersama tanggal", async () => {
    await saveAnnouncementCommand(deps, { ...FORM, time: "19:30" });
    const butir = await store.getAnnouncement("baru-1");
    expect(butir?.date).toContain("2026-10-17");
    expect(butir?.date).toContain("19:30");
  });

  it("mengganti foto: hanya URL milik kita yang lama diminta dihapus", async () => {
    expect(await saveAnnouncementCommand(deps, { ...FORM, imageUrl: A })).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await saveAnnouncementCommand(deps, { ...FORM, imageUrl: B })).toEqual({ ok: true, deleteImageUrls: [A] });
    expect(await saveAnnouncementCommand(deps, { ...FORM, imageUrl: B })).toEqual({ ok: true, deleteImageUrls: [] });
    // dari foto kita ke jalur lokal: foto lama dihapus; dari jalur lokal ke foto kita: tidak ada yang dihapus
    expect(await saveAnnouncementCommand(deps, { ...FORM, imageUrl: "/kegiatan/x.jpg" })).toEqual({ ok: true, deleteImageUrls: [B] });
    expect(await saveAnnouncementCommand(deps, { ...FORM, imageUrl: A })).toEqual({ ok: true, deleteImageUrls: [] });
  });

  it("masukan tidak sah: tidak menyimpan, mengembalikan galat per kolom dan isian", async () => {
    const awal = (await store.listAnnouncements()).length;
    const hasil = await saveAnnouncementCommand(deps, { ...FORM, title: "", date: "2062-10-09", ikut: "jangan" });
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.state.fieldErrors).toMatchObject({ title: "Judul belum diisi.", date: "Tanggal tidak masuk akal. Periksa tahunnya." });
      expect(hasil.state.values).toMatchObject({ title: "", date: "2062-10-09", excerpt: "Membersihkan masjid" });
      expect(hasil.state.values).not.toHaveProperty("ikut");
    }
    expect(await store.listAnnouncements()).toHaveLength(awal);
  });

  it("foto yang masih diunggah menahan penyimpanan", async () => {
    const hasil = await saveAnnouncementCommand(deps, { ...FORM, fotoMasihDiunggah: "1" });
    expect(!hasil.ok && hasil.state.fieldErrors?.imageUrl).toBe("Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi.");
    expect(await store.getAnnouncement("baru-1")).toBeNull();
  });

  it("penyimpanan melempar: pesan gagal simpan dan isian tetap", async () => {
    vi.spyOn(store, "saveAnnouncement").mockRejectedValue(new Error("db mati"));
    const hasil = await saveAnnouncementCommand(deps, FORM);
    expect(hasil).toMatchObject({ ok: false, state: { message: MESSAGE_SAVE_FAILED, values: { title: "Kerja bakti" } } });
  });
});

describe("deleteAnnouncementCommand", () => {
  it("menghapus pengumuman berfoto mengembalikan fotonya untuk dihapus", async () => {
    await saveAnnouncementCommand(deps, { ...FORM, imageUrl: A });
    expect(await deleteAnnouncementCommand(deps, "baru-1")).toEqual({ ok: true, deleteImageUrls: [A] });
    expect(await store.getAnnouncement("baru-1")).toBeNull();
  });

  it("foto berjalur lokal tidak diminta dihapus; id yang tidak ada tidak galat", async () => {
    await saveAnnouncementCommand(deps, { ...FORM, imageUrl: "/kegiatan/x.jpg" });
    expect(await deleteAnnouncementCommand(deps, "baru-1")).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await deleteAnnouncementCommand(deps, "tidak-ada")).toEqual({ ok: true, deleteImageUrls: [] });
  });

  it("penyimpanan melempar: pesan gagal hapus", async () => {
    vi.spyOn(store, "deleteAnnouncement").mockRejectedValue(new Error("db mati"));
    expect(await deleteAnnouncementCommand(deps, "baru-1")).toMatchObject({ ok: false, state: { message: MESSAGE_DELETE_FAILED } });
  });
});
