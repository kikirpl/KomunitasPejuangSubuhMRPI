"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseAllowlist } from "@/lib/auth/allowlist";
import { isSecretUsable, sealSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

/** Keluar: menghapus cookie sesi lalu kembali ke layar masuk. */
export async function keluar(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/masuk");
}

/**
 * Hanya untuk `next dev`: masuk tanpa Google sebagai email pertama di ADMIN_EMAILS. Tombolnya hanya
 * dirender bila NODE_ENV === "development", dan fungsi ini menolak di mode lain.
 */
export async function masukPengembang(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Masuk mode pengembang hanya tersedia saat next dev.");
  }
  const secret = process.env.SESSION_SECRET;
  const email = parseAllowlist(process.env.ADMIN_EMAILS)[0];
  if (!isSecretUsable(secret) || !email) redirect("/admin/masuk?galat=gagal");

  const token = await sealSession({ email, name: "Pengembang", sub: "pengembang" }, secret);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect("/admin");
}
