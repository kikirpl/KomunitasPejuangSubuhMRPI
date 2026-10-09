import { describe, expect, it } from "vitest";
import { isAllowedImageUrl, isOurPhotoUrl, onlyOurPhotoUrls } from "@/lib/photo/rules";

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
