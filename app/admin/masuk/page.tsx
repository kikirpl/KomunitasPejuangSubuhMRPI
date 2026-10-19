import { CircleAlert, LogIn } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { masukPengembang } from "@/app/admin/actions/sesi";
import { Pemisah } from "@/components/ui/Pemisah";
import { buttonClass } from "@/components/ui/buttonStyles";
import { getAdmin, isAuthConfigured } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Masuk" };

const PESAN_GALAT: Record<string, string> = {
  "tidak-terdaftar": "Email ini belum terdaftar sebagai pengurus. Hubungi pengelola web untuk didaftarkan.",
  ditolak: "Masuk dibatalkan. Silakan coba lagi.",
  gagal: "Masuk belum berhasil. Silakan coba lagi; bila terulang, hubungi pengelola web.",
  "sesi-habis": "Sesi Anda sudah berakhir. Silakan masuk lagi.",
};

/** Layar masuk: satu tombol "Masuk dengan Google". Pengurus yang sudah masuk langsung ke panel. */
export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  if (await getAdmin()) redirect("/admin");

  const { galat } = await searchParams;
  const pesan = galat ? PESAN_GALAT[galat] : undefined;
  const siap = isAuthConfigured();

  return (
    <div className="mx-auto max-w-xl rounded-card border border-line bg-card p-8 shadow-card hc:border-2">
      <h1 className="font-display text-4xl font-semibold text-brand">Panel Pengurus</h1>
      <Pemisah className="mt-4" />

      {pesan ? (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-control border-2 border-gold bg-gold-tint px-5 py-4 text-lg text-ink hc:border-black"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-7 shrink-0 text-brand" />
          <p className="font-bold">{pesan}</p>
        </div>
      ) : null}

      {siap ? (
        <>
          <p className="mt-6 text-xl text-ink-soft">
            Gunakan akun Google yang sudah didaftarkan sebagai pengurus.
          </p>
          <a href="/admin/auth/google" className={buttonClass("primary", "xl", "mt-6 w-full sm:w-auto")}>
            <LogIn aria-hidden className="size-7" />
            Masuk dengan Google
          </a>
        </>
      ) : (
        <>
          <p className="mt-6 text-2xl font-bold text-brand">Panel belum dikonfigurasi.</p>
          <p className="mt-2 text-xl text-ink-soft">Hubungi pengelola web.</p>
        </>
      )}

      {process.env.NODE_ENV === "development" ? (
        <form action={masukPengembang} className="mt-8 border-t-2 border-dashed border-line pt-6">
          <p className="text-lg text-ink-soft">
            Mode pengembangan: masuk tanpa Google sebagai email pertama di ADMIN_EMAILS.
          </p>
          <button type="submit" className={buttonClass("outline", "md", "mt-3 w-full sm:w-auto")}>
            Masuk mode pengembang
          </button>
        </form>
      ) : null}
    </div>
  );
}
