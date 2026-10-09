/** Daftar email pengurus dari `ADMIN_EMAILS`: huruf kecil, dipisah koma atau spasi, tanpa duplikat dan butir kosong. */
export function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  const unik = new Set<string>();
  for (const bagian of raw.split(/[\s,]+/)) {
    const email = bagian.trim().toLowerCase();
    if (email) unik.add(email);
  }
  return [...unik];
}

/** Perbandingan persis pada huruf kecil; varian titik atau plus Gmail sengaja tidak dinormalisasi. */
export function isAllowed(email: string, allowlist: readonly string[]): boolean {
  return allowlist.includes(email.trim().toLowerCase());
}
