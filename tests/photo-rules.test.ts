import { describe, expect, it } from "vitest";
import {
  blobImagePatterns,
  isAcceptedImageType,
  isAllowedImageUrl,
  isOurPhotoUrl,
  onlyOurPhotoUrls,
  uploadPathname,
} from "@/lib/photo/rules";

const HOST = "abc.public.blob.vercel-storage.com";
const MILIK = `https://${HOST}/kajian/x.webp`;

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
