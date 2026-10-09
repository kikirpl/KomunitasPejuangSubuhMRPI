import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";
import { sealSession } from "@/lib/auth/session";

const SECRET = "x".repeat(40);
const EMAIL = "pengurus@example.com";
const BASE = "http://localhost:3000";

const permintaan = (path: string, { method = "GET", cookie, headers }: { method?: string; cookie?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(BASE + path, {
    method,
    headers: { ...(cookie ? { cookie: `ps_admin=${cookie}` } : {}), ...headers },
  });
const diteruskan = (r: Response) => r.headers.get("x-middleware-next") === "1" && !r.headers.get("location");

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", SECRET);
  vi.stubEnv("ADMIN_EMAILS", EMAIL);
});
afterEach(() => vi.unstubAllEnvs());

describe("proxy /admin (pagar awal)", () => {
  it("halaman tanpa cookie diarahkan ke layar masuk tanpa pesan", async () => {
    const r = await proxy(permintaan("/admin/jadwal/kamis"));
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toBe(`${BASE}/admin/masuk`);
  });

  it("halaman dengan cookie rusak diarahkan ke layar masuk dengan pesan sesi habis", async () => {
    const r = await proxy(permintaan("/admin/jadwal/kamis", { cookie: "rusak" }));
    expect(r.headers.get("location")).toBe(`${BASE}/admin/masuk?galat=sesi-habis`);
  });

  it("halaman dengan sesi sah dan email terdaftar diteruskan", async () => {
    const token = await sealSession({ email: EMAIL, sub: "1" }, SECRET);
    expect(diteruskan(await proxy(permintaan("/admin/jadwal/kamis", { cookie: token })))).toBe(true);
  });

  it("sesi sah milik email yang sudah dicabut dari ADMIN_EMAILS diarahkan dengan pesan sesi habis", async () => {
    const token = await sealSession({ email: "dicabut@example.com", sub: "2" }, SECRET);
    const r = await proxy(permintaan("/admin/jadwal/kamis", { cookie: token }));
    expect(r.headers.get("location")).toBe(`${BASE}/admin/masuk?galat=sesi-habis`);
  });

  it("layar masuk dan rute OAuth tidak dipagari (berlangsung sebelum masuk)", async () => {
    for (const path of ["/admin/masuk", "/admin/auth/google", "/admin/auth/google/callback"]) {
      expect(diteruskan(await proxy(permintaan(path))), path).toBe(true);
    }
  });

  it("Server Action (POST ke alamat halaman) tidak dialihkan: aksi memeriksa sesinya sendiri", async () => {
    // Pengalihan 307 dari proxy diikuti peramban dengan POST ulang ke layar masuk, dan klien Next gagal
    // membaca balasannya: pengurus melihat halaman galat dan isian yang diketik hilang.
    for (const cookie of [undefined, "rusak"]) {
      const r = await proxy(permintaan("/admin/jadwal/kamis", { method: "POST", cookie, headers: { "next-action": "abc123" } }));
      expect(diteruskan(r), `cookie ${cookie ?? "kosong"}`).toBe(true);
    }
  });

  it("kiriman formulir biasa (POST tanpa header Next-Action, misalnya sebelum JavaScript selesai dimuat) juga tidak dialihkan", async () => {
    const r = await proxy(permintaan("/admin/jadwal/kamis", { method: "POST", cookie: "rusak" }));
    expect(diteruskan(r)).toBe(true);
  });

  it("HEAD tanpa sesi tetap dipagari seperti GET", async () => {
    const r = await proxy(permintaan("/admin/jadwal/kamis", { method: "HEAD" }));
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toBe(`${BASE}/admin/masuk`);
  });
});
