import { StarMark } from "@/components/ui/StarMark";
import { NAV_ITEMS } from "@/data/nav";

/**
 * "Menu Utama": kisi tombol besar berisi ikon, nama, dan keterangan singkat.
 * Tampil di layar kecil dan sedang, serta di semua layar saat Tampilan Sederhana aktif.
 *
 * Jumlah kolom dihitung dari lebar minimal tile dalam rem: dua kolom di ponsel pada ukuran
 * tulisan Normal (menu tidak memanjang menjadi tujuh layar kartu), dan otomatis satu kolom
 * ketika jamaah memperbesar tulisan.
 */
export function MenuGrid() {
  return (
    <section
      aria-labelledby="menu-judul"
      className="bg-paper pt-10 pb-12 xl:hidden simple:block"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 simple:max-w-3xl">
        {/* Seperti daftar isi mushaf: judul kecil dengan garis daun emas, lalu tujuan-tujuan besar. */}
        <div className="mb-5 flex items-center gap-3">
          <h2 id="menu-judul" className="text-2xl font-semibold text-brand">
            Menu Utama
          </h2>
          <span aria-hidden="true" className="flex flex-1 items-center gap-2 text-gilt">
            <StarMark className="size-4 shrink-0" />
            <span className="h-px flex-1 bg-linear-to-r from-gilt/70 to-transparent" />
          </span>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.25rem),1fr))] gap-4 md:grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] lg:grid-cols-3 simple:grid-cols-1">
          {NAV_ITEMS.map(({ id, label, hint, href, icon: Icon }) => (
            <li key={id}>
              <a
                href={href}
                className="group/menu flex h-full min-h-32 flex-col items-start gap-3 rounded-card border border-line bg-card p-2.5 shadow-elev-1 transition-[border-color,background-color,box-shadow,transform] duration-(--dur-state) ease-out-expo hover:border-primary hover:shadow-elev-2 active:translate-y-px hc:border-2 min-[25rem]:p-3 sm:p-4 simple:min-h-24 simple:flex-row simple:items-center simple:gap-4"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-tint text-accent ring-1 ring-gilt/35 transition-colors duration-(--dur-state) group-hover/menu:bg-primary group-hover/menu:text-on-brand hc:ring-line">
                  <Icon aria-hidden className="size-7" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-base font-bold leading-tight text-primary [overflow-wrap:anywhere] min-[25rem]:text-lg sm:text-xl">
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
