import { describe, expect, it } from "vitest";
import {
  googleClient,
  oauthCookieOptions,
  redirectUri,
  validateGoogleClaims,
} from "@/lib/auth/google";

const NOW = new Date("2026-10-09T05:00:00Z");
const detik = (d: Date) => Math.floor(d.getTime() / 1000);
const BASE = {
  iss: "https://accounts.google.com",
  aud: "klien-id",
  exp: detik(NOW) + 3600,
  email: "Rizky@Gmail.com",
  email_verified: true,
  name: "Rizky",
  sub: "123",
};
const OPTS = { clientId: "klien-id", allowlist: ["rizky@gmail.com"], now: NOW };

describe("validateGoogleClaims", () => {
  it("klaim sah menjadi sesi dengan email huruf kecil", () => {
    expect(validateGoogleClaims(BASE, OPTS)).toEqual({
      ok: true,
      session: { email: "rizky@gmail.com", name: "Rizky", sub: "123" },
    });
  });

  it("iss dengan atau tanpa https:// sah, iss lain gagal", () => {
    expect(validateGoogleClaims({ ...BASE, iss: "accounts.google.com" }, OPTS).ok).toBe(true);
    expect(validateGoogleClaims({ ...BASE, iss: "https://evil.example" }, OPTS)).toEqual({
      ok: false,
      reason: "gagal",
    });
  });

  it("aud salah, exp lewat, atau email belum terverifikasi gagal", () => {
    for (const salah of [{ aud: "lain" }, { exp: detik(NOW) - 1 }, { email_verified: false }]) {
      expect(validateGoogleClaims({ ...BASE, ...salah }, OPTS)).toEqual({ ok: false, reason: "gagal" });
    }
  });

  it("aud berupa daftar yang memuat klien kita sah", () => {
    expect(validateGoogleClaims({ ...BASE, aud: ["lain", "klien-id"] }, OPTS).ok).toBe(true);
  });

  it("klaim tidak lengkap gagal (tanpa email, tanpa sub)", () => {
    expect(validateGoogleClaims({ ...BASE, email: undefined }, OPTS)).toEqual({ ok: false, reason: "gagal" });
    expect(validateGoogleClaims({ ...BASE, sub: undefined }, OPTS)).toEqual({ ok: false, reason: "gagal" });
  });

  it("email tidak terdaftar", () => {
    expect(validateGoogleClaims({ ...BASE, email: "lain@x.id" }, OPTS)).toEqual({
      ok: false,
      reason: "tidak-terdaftar",
    });
  });

  it("nama boleh kosong", () => {
    expect(validateGoogleClaims({ ...BASE, name: undefined }, OPTS)).toEqual({
      ok: true,
      session: { email: "rizky@gmail.com", sub: "123" },
    });
  });
});

describe("redirectUri", () => {
  it("NEXT_PUBLIC_SITE_URL, lalu VERCEL_PROJECT_PRODUCTION_URL, lalu localhost", () => {
    expect(redirectUri({ NEXT_PUBLIC_SITE_URL: "https://situs.id/" })).toBe(
      "https://situs.id/admin/auth/google/callback",
    );
    expect(redirectUri({ VERCEL_PROJECT_PRODUCTION_URL: "ps.vercel.app" })).toBe(
      "https://ps.vercel.app/admin/auth/google/callback",
    );
    expect(redirectUri({})).toBe("http://localhost:3000/admin/auth/google/callback");
  });
});

describe("googleClient dan cookie OAuth", () => {
  it("googleClient null bila kredensial kosong", () => {
    expect(googleClient({})).toBeNull();
    expect(googleClient({ AUTH_GOOGLE_ID: "id" })).toBeNull();
    expect(googleClient({ AUTH_GOOGLE_ID: "id", AUTH_GOOGLE_SECRET: "rahasia" })).not.toBeNull();
  });

  it("cookie OAuth: HttpOnly, 10 menit, hanya untuk /admin/auth", () => {
    expect(oauthCookieOptions({ NODE_ENV: "production" })).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/admin/auth",
      maxAge: 600,
    });
    expect(oauthCookieOptions({ NODE_ENV: "development" }).secure).toBe(false);
  });
});
