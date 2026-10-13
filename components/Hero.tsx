import Image from "next/image";
import { CalendarDays, Video } from "lucide-react";
import { StarMark } from "@/components/ui/StarMark";
import { buttonClass } from "@/components/ui/buttonStyles";
import { COMMUNITY } from "@/data/content";
import lukisanMasjid from "@/public/beranda/masjid-raya-pondok-indah.jpg";

/**
 * Sapaan komunitas: "Fajar di MRPI". Langit beranda menyambung dari kepala halaman
 * (biru malam) lalu memudar ke biru langit lukisan Masjid Raya Pondok Indah di
 * dasarnya, jadi kepala halaman, sapaan, dan lukisan terbaca sebagai satu langit Subuh.
 *
 * Teks selalu berada di atas langit gelap buatan CSS (kontras terjamin), bukan di atas
 * lukisan: pita lukisan setinggi --hero-art-h (app/globals.css) dan padding bawah isi
 * dihitung dari angka itu. Mulai layar 640px (tombol menjadi isi terakhir) pucuk langit
 * lukisan (15% teratas, tanpa menara) boleh berada di bawah tombol; di ponsel paragraf
 * sambutan menjadi isi terakhir, jadi seluruh isi tetap di atas lukisan.
 *
 * Satu-satunya gerak otomatis di situs ini: tirai malam di atas lukisan memudar pelan
 * (fajar menyingsing), sekali saat halaman dibuka. Berhenti total
 * bila pengguna memilih "kurangi gerakan". Pada Kontras Tinggi dan Tampilan Sederhana
 * lukisan dan hiasan disembunyikan, latar menjadi biru malam polos.
 */
/** "Komunitas Pejuang Subuh" ditulis dua tingkat: "Komunitas" kecil di atas, "Pejuang Subuh" besar. */
const AWALAN = /^Komunitas\s+/i;
const NAMA_INTI = COMMUNITY.name.replace(AWALAN, "");
const ADA_AWALAN = NAMA_INTI !== COMMUNITY.name;

export function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="beranda-judul"
      className="hero-sky on-dark relative isolate overflow-hidden bg-brand-deep text-on-brand hc:bg-none simple:bg-none"
    >
      {/* Pola bintang delapan, hanya di langit malam bagian atas (memudar sebelum lukisan). */}
      <div aria-hidden="true" className="hero-ornament absolute inset-0 hc:hidden simple:hidden">
        <div className="khatam-pattern absolute inset-0" />
      </div>

      <div className="hero-art absolute inset-x-0 bottom-0 h-(--hero-art-h) hc:hidden simple:hidden">
        <Image
          src={lukisanMasjid}
          alt="Lukisan Masjid Raya Pondok Indah: atap limas biru bersusun tiga dan menara runcing, berlatar langit fajar."
          fill
          preload
          placeholder="blur"
          sizes="(max-width: 640px) 125vw, 100vw"
          className="object-cover object-[60%_52%]"
        />
        {/* Tirai malam yang memudar saat halaman dibuka: fajar menyingsing di atas masjid. */}
        <div aria-hidden="true" className="fajar-veil absolute inset-0" />
        {/* Kabut pagi di pelataran: memudar tepat ke warna latar section berikutnya. */}
        <div aria-hidden="true" className="hero-mist absolute inset-x-0 bottom-0 h-[24%]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-10 pb-[calc(var(--hero-art-h)+1.25rem)] sm:px-8 sm:pt-14 sm:pb-[calc(var(--hero-art-h)*0.85)] md:pt-16 xl:pt-12 xl:pb-(--hero-art-h) huge:xl:pt-16 huge:xl:pb-[calc(var(--hero-art-h)*0.85)] hc:pb-12 hc:sm:pb-16 hc:lg:pb-20 hc:xl:pb-20 simple:max-w-3xl simple:pb-12 simple:sm:pb-16 simple:lg:pb-20 simple:xl:pb-20">
        <div className="grid grid-cols-1 gap-y-7 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-end xl:gap-x-14 huge:xl:grid-cols-1 simple:xl:grid-cols-1">
          <div>
            <p className="font-display text-xl text-gold-soft sm:text-2xl">
              Assalamualaikum warahmatullahi wabarakatuh
            </p>
            <h1
              id="beranda-judul"
              className="mt-5 font-semibold leading-[1.02] tracking-tight"
            >
              {ADA_AWALAN ? (
                <>
                  <span className="block text-2xl font-medium tracking-normal text-on-brand-soft sm:text-3xl">
                    Komunitas
                  </span>{" "}
                </>
              ) : null}
              <span className="mt-1 block text-[2.9rem] sm:text-7xl xl:text-[4.6rem] huge:max-sm:text-[2.4rem]">
                {NAMA_INTI}
              </span>
            </h1>
            <p className="mt-4 font-display text-2xl text-on-brand-soft sm:text-3xl">
              {COMMUNITY.mosque} ({COMMUNITY.mosqueShort})
            </p>
            <Pemisah className="mt-6" />
          </div>

          {/*
            Di ponsel, tombol tampil lebih dulu dari paragraf sambutan (order), supaya terlihat tanpa menggulir.
            Layar lebar (dua kolom): margin bawah negatif membuat hanya kolom ini (tombol) yang turun ke pucuk
            langit lukisan; kolom judul tetap berakhir tepat di tepi atas lukisan.
          */}
          <div className="flex flex-col gap-7 xl:-mb-[calc(var(--hero-art-h)*0.15)] huge:xl:mb-0 hc:xl:mb-0 simple:xl:mb-0">
            <p className="max-w-xl text-xl leading-relaxed text-on-brand max-sm:order-2">
              Selamat datang, Bapak dan Ibu. Di sini Anda bisa melihat jadwal kajian,
              membaca ayat hari ini, ikut kajian lewat Zoom, dan berinfak untuk masjid.
            </p>
            <div className="flex flex-col gap-4 max-sm:order-1 sm:flex-row sm:flex-wrap xl:max-w-md xl:flex-col xl:flex-nowrap huge:xl:max-w-none huge:xl:flex-row huge:xl:flex-wrap simple:xl:max-w-none simple:xl:flex-row">
              <a
                href="#jadwal-hari-ini"
                className={buttonClass(
                  "gold",
                  "xl",
                  "w-full shadow-[0_14px_30px_-14px_rgb(232_173_64/0.75)] sm:w-auto xl:w-full huge:xl:w-auto hc:shadow-none simple:xl:w-auto",
                )}
              >
                <CalendarDays aria-hidden className="size-8" />
                Lihat Jadwal Hari Ini
              </a>
              <a
                href="#zoom"
                className={buttonClass(
                  "outlineOnDark",
                  "xl",
                  "w-full backdrop-blur-[2px] sm:w-auto xl:w-full huge:xl:w-auto simple:xl:w-auto",
                )}
              >
                <Video aria-hidden className="size-8" />
                Buka Zoom
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pemisah hias rata kiri: garis emas pendek, bintang delapan, garis emas yang memudar. */
function Pemisah({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex items-center gap-3 text-gold ${className}`}>
      <span className="h-px w-8 bg-gold" />
      <StarMark className="size-5" />
      <span className="h-px w-28 bg-linear-to-r from-gold to-transparent" />
    </span>
  );
}
