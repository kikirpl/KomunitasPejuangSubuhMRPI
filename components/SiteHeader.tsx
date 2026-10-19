import { Logo } from "@/components/ui/Logo";
import { COMMUNITY } from "@/data/content";
import { NAV_ITEMS } from "@/data/nav";

/**
 * Kepala halaman (biru malam, menyambung ke langit beranda): nama komunitas, lalu menu datar (semua tujuan terlihat
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
    <header className="on-dark bg-brand-deep text-on-brand hc:border-b-2 hc:border-line-dark">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 simple:max-w-3xl">
        <a href="#beranda" className="flex w-fit items-center gap-3 rounded-control py-3">
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
          className="hidden border-t border-line-dark py-1.5 xl:block simple:hidden hc:border-t-2 hc:border-white"
        >
          <ul className="grid grid-cols-[repeat(7,auto)] justify-between gap-1 huge:grid-cols-3">
            {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => (
              <li key={id}>
                <a
                  href={href}
                  className="group/nav relative flex h-full min-h-14 flex-col items-center justify-center gap-1 rounded-control px-3 py-1.5 text-center text-lg font-bold leading-tight text-on-brand transition-colors duration-(--dur-hover) hover:bg-white/8 active:bg-white/12"
                >
                  <Icon aria-hidden className="size-6 text-gold" />
                  <span className="[overflow-wrap:anywhere]">{label}</span>
                  {/* Garis emas tipis yang tumbuh dari tengah saat disorot. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-gold transition-transform duration-(--dur-state) ease-out-expo group-hover/nav:scale-x-100 group-focus-visible/nav:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
