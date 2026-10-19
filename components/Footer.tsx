import { Logo } from "@/components/ui/Logo";
import { MasjidSiluet } from "@/components/ui/MasjidSiluet";
import { COMMUNITY } from "@/data/content";
import { NAV_ITEMS } from "@/data/nav";

/**
 * Kaki halaman: siluet Masjid Raya Pondok Indah berdiri di tepi atasnya seperti garis cakrawala,
 * berwarna biru malam yang sama dengan badan kaki halaman, jadi masjid "tumbuh" dari kaki halaman
 * ke latar section Hubungi Admin di atasnya (bg-paper-2) tanpa garis sambungan. Pada Kontras Tinggi
 * dan Tampilan Sederhana siluet disembunyikan dan diganti garis emas tipis.
 */
export function Footer() {
  return (
    <footer className="on-dark relative bg-brand-deep text-on-brand">
      <div aria-hidden="true" className="bg-paper-2 hc:hidden simple:hidden">
        <div className="mx-auto flex w-full max-w-6xl justify-end px-5 sm:px-8">
          <MasjidSiluet className="-mb-px h-[clamp(4.75rem,10vw,9rem)] w-auto text-brand-deep" />
        </div>
      </div>
      <div className="relative overflow-hidden">
      <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 hidden h-0.5 bg-gold hc:block simple:block simple:h-px simple:bg-linear-to-r simple:from-transparent simple:via-gold simple:to-transparent"
      />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16 simple:max-w-3xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] simple:md:grid-cols-1">
          <div>
            <div className="flex items-center gap-4">
              <Logo className="size-16" />
              <div className="min-w-0">
                <p className="font-display text-3xl font-semibold leading-tight">{COMMUNITY.name}</p>
                <p className="mt-1 text-xl text-on-brand-soft">
                  {COMMUNITY.mosque} ({COMMUNITY.mosqueShort})
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-lg text-on-brand-soft">
              Semoga setiap langkah menuju masjid di waktu Subuh menjadi keberkahan
              bagi kita semua.
            </p>
          </div>

          <nav aria-label="Menu bawah">
            <h2 className="text-xl font-bold text-gold-soft">Menu</h2>
            <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2 simple:sm:grid-cols-1 huge:sm:grid-cols-1">
              {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={href}
                    className="inline-flex min-h-12 items-center gap-3 text-lg underline-offset-4 transition-colors duration-(--dur-hover) hover:text-gold-soft hover:underline"
                  >
                    <Icon aria-hidden className="size-5 shrink-0 text-gold" />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-line-dark pt-6 text-base text-on-brand-soft">
          Seluruh jam di situs ini memakai Waktu Indonesia Barat (WIB).
        </p>
      </div>
      </div>
    </footer>
  );
}
