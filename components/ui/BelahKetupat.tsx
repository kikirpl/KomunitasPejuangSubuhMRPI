/**
 * Butir daftar berbentuk belah ketupat emas kecil. Rosette dan bintang delapan disimpan untuk
 * kepala bagian dan penanda ayat/nomor; butir daftar cukup memakai tanda yang lebih tenang ini.
 */
export function BelahKetupat({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block size-2 shrink-0 rotate-45 bg-current ${className}`} />;
}
