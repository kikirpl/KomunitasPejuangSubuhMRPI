import { generateCodeVerifier, generateState } from "arctic";
import { NextResponse } from "next/server";
import {
  googleClient,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  oauthCookieOptions,
} from "@/lib/auth/google";

/**
 * Awal login: membuat `state` dan kunci PKCE, menyimpannya di cookie sementara, lalu mengarahkan
 * ke layar persetujuan Google. Hanya meminta openid, email, dan profil (tanpa refresh token).
 */
export async function GET(request: Request) {
  const google = googleClient();
  if (!google) return NextResponse.redirect(new URL("/admin/masuk?galat=gagal", request.url));

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"]);
  // Selalu tampilkan pemilih akun, supaya pengurus dengan banyak akun Google tidak masuk dengan akun yang salah.
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, state, oauthCookieOptions());
  response.cookies.set(OAUTH_VERIFIER_COOKIE, codeVerifier, oauthCookieOptions());
  return response;
}
