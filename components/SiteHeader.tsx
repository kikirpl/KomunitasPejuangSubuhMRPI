import { Logo } from "@/components/ui/Logo";
import { COMMUNITY } from "@/data/content";
import { NAV_ITEMS } from "@/data/nav";

/**
 * Kepala halaman (navy): nama komunitas, lalu menu datar (semua tujuan terlihat
 * langsung, tanpa hamburger atau menu bertingkat). Di layar kecil dan sedang,
 * menu tampil sebagai kisi besar "Menu Utama" tepat di bawah sapaan (MenuGrid).
 *
 * Menu atas memakai tujuh kolom selebar tulisannya (ikon di atas tulisan), dibagi rata
 * di sepanjang kepala halaman, sehingga nama menu muat satu baris. Bila ruang sempit,
 * tulisan turun satu baris dan tidak pernah terpotong. Pada ukuran tulisan
 * "Lebih besar" ke atas kisinya menjadi tiga kolom sama lebar.
 */
export function SiteHeader() {
  return (
    <header className="on-dark border-b border-line-dark bg-brand-deep text-on-brand hc:border-b-2">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 simple:max-w-3xl">
        <a href="#beranda" className="flex w-fit items-center gap-3 rounded-xl py-4">
          <Logo />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-2xl font-semibold text-on-brand">
              {COMMUNITY.name}
            </span>
            <span className="text-lg text-on-brand-soft">{COMMUNITY.mosque}</span>
          </span>
        </a>

        <nav
          aria-label="Menu utama"
          className="hidden border-t border-white/15 py-2 xl:block simple:hidden hc:border-t-2 hc:border-white"
        >
          <ul className="grid grid-cols-[repeat(7,auto)] justify-between gap-1 huge:grid-cols-3">
            {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => (
              <li key={id}>
                <a
                  href={href}
                  className="flex h-full min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-center text-lg font-bold leading-tight text-on-brand hover:bg-white/10 active:bg-white/15"
                >
                  <Icon aria-hidden className="size-6 text-gold" />
                  <span className="[overflow-wrap:anywhere]">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
