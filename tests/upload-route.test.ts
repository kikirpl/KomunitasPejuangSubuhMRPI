import { describe, expect, it, vi } from "vitest";
import { deletePhotos } from "@/lib/photo/blob";
import { handleFotoUpload, uploadTokenOptions } from "@/lib/photo/upload";
import type { AdminSession } from "@/lib/auth/session";

const ADMIN: AdminSession = { email: "rizky@gmail.com", name: "Rizky", sub: "1" };
const minta = (body: string) => new Request("http://x/api/admin/foto", { method: "POST", body });

type UploadFn = Parameters<typeof handleFotoUpload>[1]["handleUpload"];
/** SDK palsu: memanggil `onBeforeGenerateToken` dengan jalur tertentu lalu mengembalikan token. */
const sdkPalsu = (pathname: string, ditangkap: { opsi?: unknown } = {}) =>
  vi.fn(async (opsi: Parameters<UploadFn>[0]) => {
    ditangkap.opsi = await opsi.onBeforeGenerateToken(pathname, null, false);
    return { type: "blob.generate-client-token" as const, clientToken: "token-uji" };
  }) as unknown as UploadFn & ReturnType<typeof vi.fn>;

describe("uploadTokenOptions", () => {
  it("jenis berkas, batas ukuran, dan akhiran acak sesuai spec", () => {
    expect(uploadTokenOptions()).toEqual({
      allowedContentTypes: ["image/webp", "image/jpeg"],
      maximumSizeInBytes: 2 * 1024 * 1024,
      addRandomSuffix: true,
    });
  });
});

describe("handleFotoUpload", () => {
  it("tanpa sesi: 401 dan SDK tidak dipanggil", async () => {
    const handleUpload = vi.fn() as unknown as UploadFn & ReturnType<typeof vi.fn>;
    const res = await handleFotoUpload(minta("{}"), { getAdmin: async () => null, handleUpload });
    expect(res.status).toBe(401);
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it("dengan sesi: izin dibuat dengan opsi unggah yang benar, jawaban dari SDK diteruskan", async () => {
    const ditangkap: { opsi?: unknown } = {};
    const handleUpload = sdkPalsu("kajian/foto.webp", ditangkap);
    const res = await handleFotoUpload(minta(JSON.stringify({ type: "blob.generate-client-token" })), {
      getAdmin: async () => ADMIN,
      handleUpload,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ type: "blob.generate-client-token", clientToken: "token-uji" });
    expect(ditangkap.opsi).toEqual(uploadTokenOptions());
  });

  it("jalur di luar kajian/ dan kegiatan/ ditolak (400) tanpa izin", async () => {
    for (const jalur of ["../rahasia.webp", "lain/foto.webp", "kajian/../x.webp", "/kajian/foto.webp", "kajian/"]) {
      const ditangkap: { opsi?: unknown } = {};
      const res = await handleFotoUpload(minta("{}"), { getAdmin: async () => ADMIN, handleUpload: sdkPalsu(jalur, ditangkap) });
      expect(res.status, jalur).toBe(400);
      expect(ditangkap.opsi, jalur).toBeUndefined();
    }
    const sah = await handleFotoUpload(minta("{}"), { getAdmin: async () => ADMIN, handleUpload: sdkPalsu("kegiatan/foto-1.jpg") });
    expect(sah.status).toBe(200);
  });

  it("sesi dicabut di antara dua pemeriksaan: 401 dan tidak ada izin", async () => {
    const panggilan = vi.fn().mockResolvedValueOnce(ADMIN).mockResolvedValueOnce(null);
    const res = await handleFotoUpload(minta("{}"), { getAdmin: panggilan, handleUpload: sdkPalsu("kajian/foto.webp") });
    expect(res.status).toBe(401);
    expect(panggilan).toHaveBeenCalledTimes(2);
  });

  it("badan bukan JSON: 400 dan SDK tidak dipanggil", async () => {
    const handleUpload = vi.fn() as unknown as UploadFn & ReturnType<typeof vi.fn>;
    const res = await handleFotoUpload(minta("bukan json"), { getAdmin: async () => ADMIN, handleUpload });
    expect(res.status).toBe(400);
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it("galat SDK (mis. token Blob tidak ada) menjadi 400 berpesan ramah dan dicatat", async () => {
    const catat = vi.spyOn(console, "error").mockImplementation(() => {});
    const handleUpload = vi.fn(async () => {
      throw new Error("No token found");
    }) as unknown as UploadFn;
    const res = await handleFotoUpload(minta("{}"), { getAdmin: async () => ADMIN, handleUpload });
    expect(res.status).toBe(400);
    expect(JSON.stringify(await res.json())).not.toContain("No token found");
    expect(catat).toHaveBeenCalled();
    catat.mockRestore();
  });
});

describe("deletePhotos", () => {
  const host = "abc.public.blob.vercel-storage.com";
  const milik = `https://${host}/kajian/a.webp`;

  it("hanya meneruskan URL milik kita ke del dan menelan galat", async () => {
    const catat = vi.spyOn(console, "error").mockImplementation(() => {});
    const del = vi.fn(async () => {
      throw new Error("gagal");
    });
    await expect(deletePhotos([milik, "/kajian/x.jpg", "https://evil.example/x.webp"], host, del)).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith([milik]);
    expect(catat).toHaveBeenCalled();
    catat.mockRestore();
  });

  it("tanpa URL milik kita: del tidak dipanggil", async () => {
    const tidakDipanggil = vi.fn();
    await deletePhotos(["/kajian/x.jpg"], host, tidakDipanggil);
    await deletePhotos([milik], undefined, tidakDipanggil);
    await deletePhotos([], host, tidakDipanggil);
    expect(tidakDipanggil).not.toHaveBeenCalled();
  });
});
