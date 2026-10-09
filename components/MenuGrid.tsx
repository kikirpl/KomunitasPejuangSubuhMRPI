import { NAV_ITEMS } from "@/data/nav";

/**
 * "Menu Utama": kisi tombol besar berisi ikon, nama, dan keterangan singkat.
 * Tampil di layar kecil dan sedang, serta di semua layar saat Tampilan Sederhana aktif.
 *
 * Jumlah kolom dihitung dari lebar minimal tile dalam rem, jadi otomatis
 * berkurang (dua, lalu satu kolom) ketika jamaah memperbesar tulisan.
 */
export function MenuGrid() {
  return (
    <section
      aria-labelledby="menu-judul"
      className="bg-paper py-10 xl:hidden simple:block"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 simple:max-w-3xl">
        <h2 id="menu-judul" className="mb-5 text-2xl font-semibold text-brand">
          Menu Utama
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-4 md:grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] lg:grid-cols-3 simple:grid-cols-1">
          {NAV_ITEMS.map(({ id, label, hint, href, icon: Icon }) => (
            <li key={id}>
              <a
                href={href}
                className="flex h-full min-h-32 flex-col items-start gap-2 rounded-2xl border border-line bg-card p-3 shadow-card hover:border-primary hover:bg-tint hc:border-2 sm:p-4 simple:min-h-24 simple:flex-row simple:items-center simple:gap-4"
              >
                <Icon aria-hidden className="size-10 shrink-0 text-accent" strokeWidth={1.75} />
                <span className="flex min-w-0 flex-col">
                  <span className="text-lg font-bold leading-tight text-primary [overflow-wrap:anywhere] sm:text-xl">
                    {label}
                  </span>
                  <span className="text-base text-ink-soft">{hint}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
