import { describe, expect, it } from "vitest";
import {
  blobImagePatterns,
  isAcceptedImageType,
  isAllowedImageUrl,
  isOurPhotoUrl,
  normalizeBlobHost,
  onlyOurPhotoUrls,
  uploadPathname,
} from "@/lib/photo/rules";
import { blobPublicHost, photoUploadEnabled } from "@/lib/photo/host";

const HOST = "abc.public.blob.vercel-storage.com";
const MILIK = `https://${HOST}/kajian/x.webp`;

describe("normalizeBlobHost", () => {
  it("menerima nilai yang ditempel apa adanya: spasi, huruf besar, https://, garis miring, jalur, dan sisa kalimat", () => {
    // Alamat dasar yang disalin dari Vercel biasanya lengkap dengan https://; satu salah tempel tidak boleh
    // membuat setiap foto ditolak dengan "Alamat foto tidak dikenal".
    const tempelan = [HOST, `  ${HOST.toUpperCase()}  `, `https://${HOST}`, `https://${HOST}/`, `HTTPS://${HOST}/kajian/x.webp`, `${HOST}/`, `${HOST} salinan`, `https://${HOST}?a=1`];
    for (const mentah of tempelan) expect(normalizeBlobHost(mentah), mentah).toBe(HOST);
  });

  it("nilai yang bukan nama host dianggap belum diisi (unggah mati dengan pesan jelas), bukan membuat build gagal", () => {
    for (const mentah of [undefined, "", "   ", "https://", "///", "?a=1", "host:3000", "abc_def.com", "<script>", "-abc.com"]) {
      expect(normalizeBlobHost(mentah), String(mentah)).toBeUndefined();
    }
  });
});

describe("BLOB_PUBLIC_HOST yang ditempel lengkap", () => {
  const tempelan = `https://${HOST.toUpperCase()}/`;

  it("pola gambar, pemeriksaan foto, dan pembacaan env semuanya memakai host yang sudah dirapikan", () => {
    expect(blobImagePatterns(tempelan).map(String)).toEqual([`https://${HOST}/**`]);
    expect(isOurPhotoUrl(MILIK, tempelan)).toBe(true);
    expect(isAllowedImageUrl(MILIK, tempelan)).toBe(true);
    expect(onlyOurPhotoUrls([MILIK, "https://evil.example/x.webp"], tempelan)).toEqual([MILIK]);
    expect(blobPublicHost({ BLOB_PUBLIC_HOST: tempelan })).toBe(HOST);
    expect(photoUploadEnabled({ BLOB_PUBLIC_HOST: tempelan, BLOB_READ_WRITE_TOKEN: "token" })).toBe(true);
  });

  it("nilai yang tak bisa dipakai mematikan unggah foto dan tidak membuat pembuatan pola gagal", () => {
    expect(() => blobImagePatterns("host:3000")).not.toThrow();
    expect(blobImagePatterns("host:3000")).toEqual([]);
    expect(blobPublicHost({ BLOB_PUBLIC_HOST: "host:3000" })).toBeUndefined();
    expect(photoUploadEnabled({ BLOB_PUBLIC_HOST: "host:3000", BLOB_READ_WRITE_TOKEN: "token" })).toBe(false);
  });
});

describe("isOurPhotoUrl", () => {
  it("hanya https dengan host toko kita persis", () => {
    expect(isOurPhotoUrl(MILIK, HOST)).toBe(true);
    expect(isOurPhotoUrl("https://evil.example/kajian/x.webp", HOST)).toBe(false);
    expect(isOurPhotoUrl(`https://${HOST}.evil.com/x`, HOST)).toBe(false);
    expect(isOurPhotoUrl(`https://${HOST}@evil.com/x`, HOST)).toBe(false);
    expect(isOurPhotoUrl(`http://${HOST}/x.webp`, HOST)).toBe(false);
    expect(isOurPhotoUrl("bukan url", HOST)).toBe(false);
  });

  it("tanpa host toko, tidak ada URL yang dianggap milik kita", () => {
    expect(isOurPhotoUrl(MILIK, undefined)).toBe(false);
  });
});

describe("isAllowedImageUrl", () => {
  it("toko kita atau jalur lokal", () => {
    expect(isAllowedImageUrl(MILIK, HOST)).toBe(true);
    expect(isAllowedImageUrl("/kajian/senin.jpg", HOST)).toBe(true);
  });

  it("menolak jalur yang bisa keluar ke situs lain, skema berbahaya, dan host lain", () => {
    for (const salah of ["//evil.com/x.jpg", "/\\evil.com/x.jpg", "javascript:alert(1)", "data:text/html,x", "https://evil.example/x.webp"]) {
      expect(isAllowedImageUrl(salah, HOST)).toBe(false);
    }
  });

  it("URL milik kita ditolak bila host toko belum diatur", () => {
    expect(isAllowedImageUrl(MILIK, undefined)).toBe(false);
    expect(isAllowedImageUrl("/kajian/senin.jpg", undefined)).toBe(true);
  });
});

describe("onlyOurPhotoUrls", () => {
  it("menyaring URL milik kita saja", () => {
    expect(onlyOurPhotoUrls([MILIK, "/kajian/x.jpg", null, undefined, "https://evil.example/x.webp"], HOST)).toEqual([MILIK]);
    expect(onlyOurPhotoUrls([MILIK], undefined)).toEqual([]);
  });
});

describe("blobImagePatterns", () => {
  it("satu pola untuk toko kita (bukan wildcard host), atau tidak ada bila host kosong", () => {
    expect(blobImagePatterns(HOST).map(String)).toEqual([`https://${HOST}/**`]);
    expect(blobImagePatterns(` ${HOST.toUpperCase()} `).map(String)).toEqual([`https://${HOST}/**`]);
    expect(blobImagePatterns(undefined)).toEqual([]);
    expect(blobImagePatterns("   ")).toEqual([]);
  });
});

describe("isAcceptedImageType", () => {
  it("JPG, PNG, dan WebP saja; PDF, GIF, dan jenis kosong ditolak", () => {
    for (const sah of ["image/jpeg", "image/png", "image/webp"]) expect(isAcceptedImageType(sah)).toBe(true);
    for (const salah of ["application/pdf", "image/gif", "image/svg+xml", "text/html", ""]) expect(isAcceptedImageType(salah)).toBe(false);
  });
});

describe("uploadPathname", () => {
  it("folder kajian atau kegiatan; akhiran mengikuti jenis hasil pengecilan", () => {
    expect(uploadPathname("kajian", "image/webp")).toBe("kajian/foto.webp");
    expect(uploadPathname("kegiatan", "image/jpeg")).toBe("kegiatan/foto.jpg");
  });
});
