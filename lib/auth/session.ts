import { EncryptJWT, jwtDecrypt } from "jose";
import type { EnvLike } from "@/lib/env";
import { isAllowed } from "./allowlist";

/** Nama cookie sesi pengurus. */
export const SESSION_COOKIE = "ps_admin";
/** Sesi berlaku 14 hari mutlak sejak masuk. */
export const SESSION_MAX_AGE_S = 14 * 24 * 60 * 60;

const PANJANG_RAHASIA_MIN = 32;

export interface AdminSession {
  email: string;
  name?: string;
  sub: string;
}

/** Opsi cookie sesi: HttpOnly, SameSite=Lax, berlaku 14 hari, Secure di produksi. */
export function sessionCookieOptions(env: EnvLike = process.env) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  };
}

/** Rahasia sesi layak bila ada dan paling sedikit 32 karakter. */
export function isSecretUsable(secret: string | undefined): secret is string {
  return typeof secret === "string" && secret.length >= PANJANG_RAHASIA_MIN;
}

/** Kunci AES-256 dari rahasia: SHA-256 (Web Crypto, jalan di runtime Node maupun Edge). */
async function kunciDari(secret: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return new Uint8Array(digest);
}

/**
 * Membuat isi cookie sesi: JWE (`dir` + A256GCM). Dienkripsi, bukan hanya ditandatangani,
 * karena isinya memuat email pengurus.
 */
export async function sealSession(
  session: AdminSession,
  secret: string,
  now: Date = new Date(),
): Promise<string> {
  if (!isSecretUsable(secret)) {
    throw new Error("SESSION_SECRET kosong atau kurang dari 32 karakter");
  }
  const terbit = Math.floor(now.getTime() / 1000);
  return new EncryptJWT({
    email: session.email,
    ...(session.name ? { name: session.name } : {}),
    sub: session.sub,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt(terbit)
    .setExpirationTime(terbit + SESSION_MAX_AGE_S)
    .encrypt(await kunciDari(secret));
}

/**
 * Membuka cookie sesi. Mengembalikan null untuk token kosong, rusak, kedaluwarsa, rahasia salah
 * atau tak layak, atau email yang sudah tidak ada di daftar pengurus (itulah cara mencabut akses).
 */
export async function openSession(
  token: string | undefined,
  secret: string | undefined,
  allowlist: readonly string[],
  now: Date = new Date(),
): Promise<AdminSession | null> {
  if (!token || !isSecretUsable(secret)) return null;
  try {
    const { payload } = await jwtDecrypt(token, await kunciDari(secret), {
      currentDate: now,
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
    });
    const email = typeof payload.email === "string" ? payload.email : "";
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (!email || !sub || !isAllowed(email, allowlist)) return null;
    const name = typeof payload.name === "string" && payload.name ? payload.name : undefined;
    return { email, sub, ...(name ? { name } : {}) };
  } catch {
    return null;
  }
}
