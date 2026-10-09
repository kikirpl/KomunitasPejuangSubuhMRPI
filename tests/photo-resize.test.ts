import { describe, expect, it } from "vitest";
import {
  computeTargetSize,
  encodingPlan,
  FALLBACK_MAX_SIDE,
  JPEG_QUALITY,
  QUALITY_STEPS,
  SOFT_MAX_BYTES,
} from "@/lib/photo/resize";

describe("computeTargetSize", () => {
  it("tidak memperbesar, rasio tetap, sisi terpanjang 1600", () => {
    expect(computeTargetSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(computeTargetSize(3000, 4000)).toEqual({ width: 1200, height: 1600 });
    expect(computeTargetSize(800, 600)).toEqual({ width: 800, height: 600 });
    expect(computeTargetSize(4000, 4000, 1280)).toEqual({ width: 1280, height: 1280 });
  });

  it("tepat di batas tidak berubah; hasil dibulatkan dan tidak pernah nol", () => {
    expect(computeTargetSize(1600, 900)).toEqual({ width: 1600, height: 900 });
    expect(computeTargetSize(3001, 2000)).toEqual({ width: 1600, height: 1066 });
    expect(computeTargetSize(10000, 1)).toEqual({ width: 1600, height: 1 });
  });
});

describe("batas dan urutan percobaan penyandian (spec bagian 10)", () => {
  it("konstanta sesuai spec", () => {
    expect(QUALITY_STEPS).toEqual([0.82, 0.7, 0.6]);
    expect(JPEG_QUALITY).toBe(0.85);
    expect(SOFT_MAX_BYTES).toBe(1_000_000);
    expect(FALLBACK_MAX_SIDE).toBe(1280);
  });

  it("peramban mendukung WebP: WebP 0,82 lalu 0,7 lalu 0,6", () => {
    expect(encodingPlan(true)).toEqual([
      { type: "image/webp", quality: 0.82 },
      { type: "image/webp", quality: 0.7 },
      { type: "image/webp", quality: 0.6 },
    ]);
  });

  it("peramban tidak mendukung WebP (hasil bukan image/webp): JPEG 0,85 lalu 0,7 lalu 0,6", () => {
    expect(encodingPlan(false)).toEqual([
      { type: "image/jpeg", quality: 0.85 },
      { type: "image/jpeg", quality: 0.7 },
      { type: "image/jpeg", quality: 0.6 },
    ]);
  });
});
