import { describe, expect, it } from "vitest";
import { isAllowed, parseAllowlist } from "@/lib/auth/allowlist";
import {
  isSecretUsable,
  openSession,
  sealSession,
  SESSION_MAX_AGE_S,
  sessionCookieOptions,
} from "@/lib/auth/session";

const SECRET = "x".repeat(32);
const ADMIN = { email: "rizky@gmail.com", name: "Rizky", sub: "123" };
const NOW = new Date("2026-10-09T05:00:00Z");

describe("sesi terenkripsi", () => {
  it("seal lalu open mengembalikan sesi yang sama", async () => {
    const token = await sealSession(ADMIN, SECRET, NOW);
    expect(await openSession(token, SECRET, ["rizky@gmail.com"], NOW)).toMatchObject(ADMIN);
  });

  it("isi sesi tidak terbaca dari token (terenkripsi, bukan hanya ditandatangani)", async () => {
    const token = await sealSession(ADMIN, SECRET, NOW);
    expect(token.split(".")).toHaveLength(5); // JWE compact
    expect(Buffer.from(token, "base64url").toString("utf8")).not.toContain("rizky");
  });

  it("menolak token rusak, rahasia salah, kedaluwarsa, email dicabut, atau token kosong", async () => {
    const token = await sealSession(ADMIN, SECRET, NOW);
    const ok = ["rizky@gmail.com"];
    expect(await openSession(token.slice(0, -2) + "xx", SECRET, ok, NOW)).toBeNull();
    expect(await openSession(token, "y".repeat(32), ok, NOW)).toBeNull();
    expect(await openSession(token, SECRET, ok, new Date(NOW.getTime() + (14 * 24 * 3600 + 1) * 1000))).toBeNull();
    expect(await openSession(token, SECRET, ["lain@gmail.com"], NOW)).toBeNull();
    expect(await openSession(undefined, SECRET, ok, NOW)).toBeNull();
  });

  it("masih sah tepat sebelum 14 hari berakhir", async () => {
    const token = await sealSession(ADMIN, SECRET, NOW);
    const hampirHabis = new Date(NOW.getTime() + (14 * 24 * 3600 - 1) * 1000);
    expect(await openSession(token, SECRET, ["rizky@gmail.com"], hampirHabis)).toMatchObject(ADMIN);
  });

  it("rahasia pendek ditolak", async () => {
    await expect(sealSession(ADMIN, "pendek", NOW)).rejects.toThrow();
    expect(await openSession("apa-saja", "pendek", ["rizky@gmail.com"], NOW)).toBeNull();
    expect([isSecretUsable("x".repeat(31)), isSecretUsable(SECRET), isSecretUsable(undefined)]).toEqual([
      false,
      true,
      false,
    ]);
  });
});

describe("cookie sesi", () => {
  it("HttpOnly, SameSite=Lax, 14 hari, Secure hanya di produksi", () => {
    expect(sessionCookieOptions({ NODE_ENV: "production" })).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_S,
    });
    expect(SESSION_MAX_AGE_S).toBe(14 * 24 * 60 * 60);
    expect(sessionCookieOptions({ NODE_ENV: "development" }).secure).toBe(false);
  });
});

describe("daftar email pengurus", () => {
  it("parseAllowlist dan isAllowed", () => {
    expect(parseAllowlist(" Rizky@Gmail.com, lain@x.id  rizky@gmail.com ,, ")).toEqual([
      "rizky@gmail.com",
      "lain@x.id",
    ]);
    expect(parseAllowlist(undefined)).toEqual([]);
    expect(isAllowed("RIZKY@gmail.com", ["rizky@gmail.com"])).toBe(true);
    expect(isAllowed("rizky+x@gmail.com", ["rizky@gmail.com"])).toBe(false);
  });
});
