import { ChevronRight } from "lucide-react";
import { StarMark } from "@/components/ui/StarMark";
import { NAV_ITEMS } from "@/data/nav";

/**
 * "Menu Utama": daftar isi bergaris emas, seperti daftar isi mushaf. Tiap baris adalah satu
 * tautan besar (minimal 72px) berisi ikon, nama, keterangan singkat, dan panah. Tampil di layar
 * kecil dan sedang, serta di semua layar saat Tampilan Sederhana aktif. Satu kolom di ponsel
 * (tanpa kata yang terpotong dan tanpa kartu yatim), dua kolom di tablet, tiga di layar sedang.
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
        <ul
          role="list"
          className="grid grid-cols-1 border-b border-gilt/35 md:grid-cols-2 md:gap-x-10 lg:grid-cols-3 simple:md:grid-cols-1 hc:border-line"
        >
          {NAV_ITEMS.map(({ id, label, hint, href, icon: Icon }) => (
            <li key={id} className="border-t border-gilt/35 hc:border-line">
              <a
                href={href}
                className="group/menu flex min-h-18 items-center gap-4 rounded-control px-2 py-3 transition-colors duration-(--dur-hover) hover:bg-tint active:bg-tint simple:min-h-20"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-tint text-accent ring-1 ring-gilt/35 transition-colors duration-(--dur-state) group-hover/menu:bg-primary group-hover/menu:text-on-brand hc:ring-line">
                  <Icon aria-hidden className="size-7" strokeWidth={1.75} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-lg font-bold leading-tight text-primary [overflow-wrap:anywhere] sm:text-xl">
                    {label}
                  </span>
                  <span className="text-base text-ink-soft">{hint}</span>
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-6 shrink-0 text-gilt transition-transform duration-(--dur-state) ease-out-expo group-hover/menu:translate-x-0.5 hc:text-ink"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
