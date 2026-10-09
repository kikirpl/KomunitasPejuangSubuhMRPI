import { NextResponse, type NextRequest } from "next/server";
import { parseAllowlist } from "@/lib/auth/allowlist";
import { openSession, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Pagar awal untuk /admin: permintaan tanpa sesi sah diarahkan ke layar masuk sebelum halaman
 * dirender. Ini hanya lapisan pertama (membaca cookie, tanpa database); setiap halaman, Server
 * Action, dan route handler tetap memeriksa sesi sendiri lewat lib/auth/guard.ts.
 * Layar masuk dan rute OAuth sengaja dikecualikan karena berlangsung sebelum masuk.
 * Yang dialihkan hanya perpindahan halaman (GET dan HEAD). Server Action dikirim sebagai POST ke alamat
 * halaman yang sedang terbuka; pengalihan 307 dari sini diikuti peramban dengan POST ulang ke layar masuk,
 * dan klien Next gagal membaca balasannya (halaman galat, isian yang diketik hilang). Aksi memeriksa
 * sesinya sendiri lewat requireAdmin(), yang mengalihkan ke layar masuk dengan cara yang dipahami klien.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/masuk" || pathname.startsWith("/admin/auth/")) {
    return NextResponse.next();
  }
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const admin = await openSession(token, process.env.SESSION_SECRET, parseAllowlist(process.env.ADMIN_EMAILS));
  if (admin) return NextResponse.next();

  const tujuan = new URL("/admin/masuk", request.url);
  if (token) tujuan.searchParams.set("galat", "sesi-habis");
  return NextResponse.redirect(tujuan);
}

export const config = {
  matcher: ["/admin/:path*"],
};
