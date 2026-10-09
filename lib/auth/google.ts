import { Google } from "arctic";
import type { EnvLike } from "@/lib/env";
import { isAllowed } from "./allowlist";
import type { AdminSession } from "./session";

/** Cookie sementara selama pengguna berada di layar Google (state dan kunci PKCE). */
export const OAUTH_STATE_COOKIE = "ps_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "ps_oauth_verifier";

export type LoginFailure = "ditolak" | "tidak-terdaftar" | "gagal";

/** Cookie OAuth: HttpOnly, 10 menit, hanya terkirim ke /admin/auth. */
export function oauthCookieOptions(env: EnvLike = process.env) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/admin/auth",
    maxAge: 600,
  };
}

/** Alamat balik OAuth: `{asal}/admin/auth/google/callback`; harus sama persis dengan yang didaftarkan di Google. */
export function redirectUri(env: EnvLike = process.env): string {
  const situs = env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const asal =
    situs ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return `${asal}/admin/auth/google/callback`;
}

/** Klien OAuth Google, atau null bila `AUTH_GOOGLE_ID` atau `AUTH_GOOGLE_SECRET` belum diisi. */
export function googleClient(env: EnvLike = process.env): Google | null {
  const id = env.AUTH_GOOGLE_ID;
  const rahasia = env.AUTH_GOOGLE_SECRET;
  if (!id || !rahasia) return null;
  return new Google(id, rahasia, redirectUri(env));
}

const ISSUER_GOOGLE = ["https://accounts.google.com", "accounts.google.com"];

/**
 * Memeriksa klaim ID token yang diterima langsung dari titik akhir token Google (lewat TLS, jadi
 * tanda tangan tidak perlu diperiksa ulang): penerbit, audiens, kedaluwarsa, email terverifikasi,
 * lalu email harus ada di daftar pengurus.
 */
export function validateGoogleClaims(
  claims: Record<string, unknown>,
  opts: { clientId: string; allowlist: readonly string[]; now?: Date },
): { ok: true; session: AdminSession } | { ok: false; reason: "tidak-terdaftar" | "gagal" } {
  const sekarang = Math.floor((opts.now ?? new Date()).getTime() / 1000);
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const sah =
    typeof claims.iss === "string" &&
    ISSUER_GOOGLE.includes(claims.iss) &&
    aud.includes(opts.clientId) &&
    typeof claims.exp === "number" &&
    claims.exp > sekarang &&
    (claims.email_verified === true || claims.email_verified === "true") &&
    typeof claims.email === "string" &&
    claims.email.length > 0 &&
    typeof claims.sub === "string" &&
    claims.sub.length > 0;
  if (!sah) return { ok: false, reason: "gagal" };

  const email = (claims.email as string).trim().toLowerCase();
  if (!isAllowed(email, opts.allowlist)) return { ok: false, reason: "tidak-terdaftar" };
  const name = typeof claims.name === "string" && claims.name ? claims.name : undefined;
  return { ok: true, session: { email, sub: claims.sub as string, ...(name ? { name } : {}) } };
}
