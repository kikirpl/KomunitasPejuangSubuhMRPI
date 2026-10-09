import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { parseAllowlist } from "./allowlist";
import { isSecretUsable, openSession, SESSION_COOKIE, type AdminSession } from "./session";

/** Panel hanya berjalan bila `SESSION_SECRET` ada dan paling sedikit 32 karakter. */
export function isAuthConfigured(): boolean {
  return isSecretUsable(process.env.SESSION_SECRET);
}

/** Membaca dan membuka cookie sesi (sekali per permintaan). */
const bacaSesi = cache(async (): Promise<{ admin: AdminSession | null; adaCookie: boolean }> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const admin = await openSession(token, process.env.SESSION_SECRET, parseAllowlist(process.env.ADMIN_EMAILS));
  return { admin, adaCookie: Boolean(token) };
});

/** Pengurus yang sedang masuk, atau null. Untuk route handler yang membalas 401 sendiri. */
export async function getAdmin(): Promise<AdminSession | null> {
  return (await bacaSesi()).admin;
}

/**
 * Pagar sebenarnya: dipanggil di setiap halaman admin, Server Action, dan route handler yang bukan
 * layar masuk. Tanpa sesi sah diarahkan ke /admin/masuk; bila cookie ada tetapi tidak sah
 * (kedaluwarsa, rusak, atau emailnya sudah dicabut) pesan "sesi habis" ikut ditampilkan.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const { admin, adaCookie } = await bacaSesi();
  if (admin) return admin;
  redirect(adaCookie ? "/admin/masuk?galat=sesi-habis" : "/admin/masuk");
}
