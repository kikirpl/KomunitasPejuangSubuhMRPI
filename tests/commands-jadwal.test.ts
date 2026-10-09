import { beforeEach, describe, expect, it, vi } from "vitest";
import { MESSAGE_SAVE_FAILED } from "@/lib/admin/form-state";
import {
  deleteOverrideCommand,
  deleteSessionCommand,
  saveOverrideCommand,
  saveSessionCommand,
  type CommandDeps,
} from "@/lib/admin/commands";
import { MemoryStore } from "@/lib/store/memory";
import type { RawForm } from "@/lib/validation/umum";

const HOST = "abc.public.blob.vercel-storage.com";
const A = `https://${HOST}/kajian/a.webp`;
const B = `https://${HOST}/kajian/b.webp`;

const SESI: RawForm = {
  startTime: "05:00",
  endTime: "06:00",
  ustadz: "Ustadz A",
  topic: "Tema",
  mode: "masjid",
  location: "Ruang utama masjid",
  imageUrl: "",
  imageAlt: "",
  imagePosition: "center",
  fotoMasihDiunggah: "",
};
const GANTI: RawForm = {
  date: "2026-10-15",
  kind: "ganti",
  note: "Pengganti",
  startTime: "06:00",
  endTime: "07:00",
  ustadz: "Ustadz Tamu",
  topic: "Tema Tamu",
  mode: "zoom",
  location: "",
};

let store: MemoryStore;
let deps: CommandDeps;

beforeEach(() => {
  store = new MemoryStore({ seeded: true });
  deps = { store, blobHost: HOST, todayKey: "2026-10-09" };
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("saveSessionCommand", () => {
  it("simpan sah: ok dan data berubah", async () => {
    const hasil = await saveSessionCommand(deps, 4, { ...SESI, topic: "Tema baru", ustadz: "Ustadz Baru" });
    expect(hasil).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await store.getSession(4)).toMatchObject({ topic: "Tema baru", ustadz: "Ustadz Baru", imagePosition: "center" });
  });

  it("foto berubah: hanya URL milik kita yang diminta dihapus", async () => {
    expect(await saveSessionCommand(deps, 4, { ...SESI, imageUrl: A })).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await saveSessionCommand(deps, 4, { ...SESI, imageUrl: B })).toEqual({ ok: true, deleteImageUrls: [A] });
    expect(await saveSessionCommand(deps, 4, { ...SESI, imageUrl: B })).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await saveSessionCommand(deps, 4, { ...SESI, imageUrl: "/kajian/lokal.jpg" })).toEqual({ ok: true, deleteImageUrls: [B] });
    expect(await saveSessionCommand(deps, 4, { ...SESI, imageUrl: "" })).toEqual({ ok: true, deleteImageUrls: [] });
  });

  it("foto dihapus dari kartu: URL milik kita diminta dihapus", async () => {
    await saveSessionCommand(deps, 4, { ...SESI, imageUrl: A });
    expect(await saveSessionCommand(deps, 4, { ...SESI, imageUrl: "" })).toEqual({ ok: true, deleteImageUrls: [A] });
  });

  it("masukan tidak sah: tidak menyimpan; fieldErrors dan values terisi (hanya kolom formulir)", async () => {
    const hasil = await saveSessionCommand(deps, 4, { ...SESI, ustadz: "", $ACTION_ID_abc: "zzz" });
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.state.fieldErrors).toMatchObject({ ustadz: "Nama ustadz belum diisi." });
      expect(hasil.state.values).toMatchObject({ topic: "Tema", ustadz: "" });
      expect(Object.keys(hasil.state.values ?? {})).not.toContain("$ACTION_ID_abc");
    }
    expect((await store.getSession(4))?.ustadz).toBe("Ustadz Fulan A");
  });

  it("penyimpanan melempar: pesan gagal simpan dan isian tetap", async () => {
    vi.spyOn(store, "saveSession").mockRejectedValue(new Error("db mati"));
    const hasil = await saveSessionCommand(deps, 4, { ...SESI, topic: "Tema baru" });
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.state.message).toBe(MESSAGE_SAVE_FAILED);
      expect(hasil.state.values).toMatchObject({ topic: "Tema baru" });
    }
  });
});

describe("deleteSessionCommand", () => {
  it("menghapus jadwal hari itu dan mengembalikan foto lama (milik kita) untuk dihapus", async () => {
    await saveSessionCommand(deps, 2, { ...SESI, imageUrl: A });
    expect(await deleteSessionCommand(deps, 2)).toEqual({ ok: true, deleteImageUrls: [A] });
    expect(await store.getSession(2)).toBeNull();
  });

  it("foto lokal tidak diminta dihapus; penyimpanan melempar menjadi galat", async () => {
    await saveSessionCommand(deps, 2, { ...SESI, imageUrl: "/kajian/lokal.jpg" });
    expect(await deleteSessionCommand(deps, 2)).toEqual({ ok: true, deleteImageUrls: [] });
    vi.spyOn(store, "deleteSession").mockRejectedValue(new Error("db mati"));
    const gagal = await deleteSessionCommand(deps, 3);
    expect(gagal.ok).toBe(false);
  });
});

describe("pengecualian", () => {
  it("ganti disimpan utuh; libur disimpan tanpa kajian pengganti", async () => {
    expect(await saveOverrideCommand(deps, null, GANTI)).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await store.getOverride("2026-10-15")).toMatchObject({ kind: "ganti", session: { topic: "Tema Tamu", mode: "zoom" } });
    await saveOverrideCommand(deps, "2026-10-15", { ...GANTI, kind: "libur" });
    expect((await store.getOverride("2026-10-15"))?.session).toBeUndefined();
  });

  it("memindahkan tanggal menghapus baris tanggal asli dan menyimpan yang baru", async () => {
    await saveOverrideCommand(deps, null, GANTI);
    const hasil = await saveOverrideCommand(deps, "2026-10-15", { ...GANTI, date: "2026-10-22" });
    expect(hasil.ok).toBe(true);
    expect(await store.getOverride("2026-10-15")).toBeNull();
    expect(await store.getOverride("2026-10-22")).toMatchObject({ kind: "ganti" });
  });

  it("tanggal lampau ditolak dan tidak menghapus baris asli", async () => {
    await saveOverrideCommand(deps, null, GANTI);
    const hasil = await saveOverrideCommand(deps, "2026-10-15", { ...GANTI, date: "2026-10-08" });
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.state.fieldErrors?.date).toBe("Tanggal tidak boleh sebelum hari ini.");
    expect(await store.getOverride("2026-10-15")).not.toBeNull();
  });

  it("penyimpanan melempar: pesan gagal simpan", async () => {
    vi.spyOn(store, "saveOverride").mockRejectedValue(new Error("db mati"));
    const hasil = await saveOverrideCommand(deps, null, GANTI);
    expect(!hasil.ok && hasil.state.message).toBe(MESSAGE_SAVE_FAILED);
  });

  it("deleteOverrideCommand menghapus; penyimpanan melempar menjadi galat", async () => {
    await saveOverrideCommand(deps, null, GANTI);
    expect(await deleteOverrideCommand(deps, "2026-10-15")).toEqual({ ok: true, deleteImageUrls: [] });
    expect(await store.getOverride("2026-10-15")).toBeNull();
    vi.spyOn(store, "deleteOverride").mockRejectedValue(new Error("db mati"));
    expect((await deleteOverrideCommand(deps, "2026-10-16")).ok).toBe(false);
  });
});
