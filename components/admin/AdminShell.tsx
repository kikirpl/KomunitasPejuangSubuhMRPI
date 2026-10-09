import { CircleHelp, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { PanelBackLink } from "@/components/admin/PanelBackLink";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/buttonStyles";
import { COMMUNITY } from "@/data/content";
import { keluar } from "@/app/admin/actions/sesi";
import type { AdminSession } from "@/lib/auth/session";

/** Tautan WhatsApp ke pengelola web, atau null bila `ADMIN_HELP_WHATSAPP` belum diisi. */
function tautanBantuan(): string | null {
  const nomor = (process.env.ADMIN_HELP_WHATSAPP ?? "").replace(/\D/g, "");
  if (!nomor) return null;
  const pesan = "Halo, saya butuh bantuan Panel Pengurus Pejuang Subuh.";
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

/**
 * Kerangka semua layar panel: kepala halaman yang sama di setiap halaman (nama panel, tautan
 * Bantuan di tempat yang sama, dan tombol Keluar yang dipisahkan secara visual), lalu isi utama.
 * Bilah pengaturan tampilan (ukuran tulisan, kontras) dipasang oleh layout di atas kerangka ini.
 */
export function AdminShell({ admin, children }: { admin: AdminSession | null; children: ReactNode }) {
  const bantuan = tautanBantuan();

  return (
    <>
      <header className="on-dark border-b border-line-dark bg-brand-deep text-on-brand hc:border-b-2">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8 simple:max-w-3xl">
          <a href="/admin" className="flex w-fit items-center gap-3 rounded-xl">
            <Logo />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-2xl font-semibold text-on-brand">Panel Pengurus</span>
              <span className="text-lg text-on-brand-soft">{COMMUNITY.name}</span>
            </span>
          </a>

          <div className="flex flex-wrap items-center gap-3">
            {bantuan ? (
              <a
                href={bantuan}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("outlineOnDark", "md")}
              >
                <CircleHelp aria-hidden className="size-6" />
                <span>
                  Bantuan<span className="sr-only"> (buka di tab baru)</span>
                </span>
              </a>
            ) : null}
            {admin ? (
              <form action={keluar} className="sm:border-l sm:border-white/30 sm:pl-3">
                <button type="submit" className={buttonClass("outlineOnDark", "md")}>
                  <LogOut aria-hidden className="size-6" />
                  Keluar
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </header>

      <main
        id="utama"
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl px-5 pb-16 pt-6 sm:px-8 simple:max-w-3xl"
      >
        <PanelBackLink />
        {children}
      </main>
    </>
  );
}
