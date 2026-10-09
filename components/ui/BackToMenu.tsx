import { ArrowUp } from "lucide-react";

/**
 * Tautan di akhir setiap bagian. Halaman ini panjang (di ponsel belasan layar),
 * jadi jamaah yang sudah selesai membaca cukup menekan satu tautan untuk kembali
 * ke daftar tujuan, tanpa menggulir jauh ke atas.
 *
 * - Layar kecil dan sedang, serta Tampilan Sederhana: ke kisi "Menu Utama" (#menu-judul).
 * - Layar lebar: menu ada di kepala halaman, jadi kembali ke bagian paling atas (#atas).
 * Hanya satu tautan yang tampil pada satu waktu (yang tersembunyi tidak ikut dibaca).
 */
export function BackToMenu({ dark = false }: { dark?: boolean }) {
  const link = `inline-flex min-h-14 items-center gap-3 text-lg font-bold underline decoration-2 underline-offset-4 [&_svg]:shrink-0 ${
    dark
      ? "text-on-brand decoration-gold hover:text-gold-soft"
      : "text-primary decoration-accent hover:text-brand"
  }`;

  return (
    <div className="mt-8 md:mt-10">
      <div className="xl:hidden simple:block">
        <a href="#menu-judul" className={link}>
          <ArrowUp aria-hidden className="size-6" />
          Kembali ke Menu Utama
        </a>
      </div>
      <div className="hidden xl:block simple:hidden">
        <a href="#atas" className={link}>
          <ArrowUp aria-hidden className="size-6" />
          Kembali ke atas
        </a>
      </div>
    </div>
  );
}
