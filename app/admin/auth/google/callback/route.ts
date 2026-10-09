import { decodeIdToken } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseAllowlist } from "@/lib/auth/allowlist";
import {
  googleClient,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  oauthCookieOptions,
  validateGoogleClaims,
  type LoginFailure,
} from "@/lib/auth/google";
import { isSecretUsable, sealSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

/**
 * Tanggapan Google: memeriksa `state`, menukar kode (dengan kunci PKCE), memeriksa klaim dan daftar
 * pengurus, lalu memasang cookie sesi dan mengarahkan ke /admin. Setelah masuk selalu ke /admin
 * (tidak ada parameter pengalihan dari pengguna). Cookie OAuth sementara selalu dihapus.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const state = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(OAUTH_VERIFIER_COOKIE)?.value;

  const selesai = (tujuan: string, session?: string) => {
    const response = NextResponse.redirect(new URL(tujuan, request.url));
    const hapus = { ...oauthCookieOptions(), maxAge: 0 };
    response.cookies.set(OAUTH_STATE_COOKIE, "", hapus);
    response.cookies.set(OAUTH_VERIFIER_COOKIE, "", hapus);
    if (session) response.cookies.set(SESSION_COOKIE, session, sessionCookieOptions());
    return response;
  };
  const gagal = (alasan: LoginFailure) => selesai(`/admin/masuk?galat=${alasan}`);

  if (url.searchParams.get("error")) return gagal("ditolak");

  const code = url.searchParams.get("code");
  const stateGoogle = url.searchParams.get("state");
  if (!code || !stateGoogle || !state || !codeVerifier || stateGoogle !== state) return gagal("gagal");

  const google = googleClient();
  const secret = process.env.SESSION_SECRET;
  if (!google || !isSecretUsable(secret)) return gagal("gagal");

  let claims: Record<string, unknown>;
  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    claims = decodeIdToken(tokens.idToken()) as Record<string, unknown>;
  } catch (error) {
    console.error("[admin/auth/google] Gagal menukar kode Google:", error);
    return gagal("gagal");
  }

  const hasil = validateGoogleClaims(claims, {
    clientId: process.env.AUTH_GOOGLE_ID ?? "",
    allowlist: parseAllowlist(process.env.ADMIN_EMAILS),
  });
  if (!hasil.ok) return gagal(hasil.reason);

  return selesai("/admin", await sealSession(hasil.session, secret));
}
