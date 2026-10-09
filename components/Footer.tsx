import { COMMUNITY } from "@/data/content";
import { NAV_ITEMS } from "@/data/nav";

export function Footer() {
  return (
    <footer className="on-dark bg-brand-deep text-on-brand">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 simple:max-w-3xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] simple:md:grid-cols-1">
          <div>
            <p className="font-display text-3xl font-semibold">{COMMUNITY.name}</p>
            <p className="mt-1 text-xl text-on-brand-soft">
              {COMMUNITY.mosque} ({COMMUNITY.mosqueShort})
            </p>
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
                    className="inline-flex min-h-12 items-center gap-3 text-lg underline-offset-4 hover:underline"
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
    </footer>
  );
}
