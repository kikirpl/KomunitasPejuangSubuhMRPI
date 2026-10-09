import { requireAdmin } from "@/lib/auth/guard";

/** Sementara: kerangka beranda panel. Tugas 10 menggantinya dengan kartu Jadwal dan Pengumuman. */
export default async function AdminHome() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Panel Pengurus</h1>
      <p className="mt-3 text-xl text-ink-soft">Selamat datang.</p>
    </div>
  );
}
