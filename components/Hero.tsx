import { CalendarDays, Video } from "lucide-react";
import { HeroParallax } from "@/components/hero/HeroParallax";
import { LangitFajar, LatarDepan, Masjid, PepohonanJauh } from "@/components/hero/MasjidScene";
import { Pemisah } from "@/components/ui/Pemisah";
import { buttonClass } from "@/components/ui/buttonStyles";
import { COMMUNITY } from "@/data/content";

/**
 * Sapaan komunitas: "Fajar di Masjid Biru". Langit beranda adalah kelanjutan langsung dari
 * bilah atas dan kepala halaman (biru malam yang sama), lalu menghangat menjadi cahaya fajar di
 * belakang Masjid Raya Pondok Indah. Masjidnya digambar ulang dari foto asli (components/hero/
 * MasjidScene.tsx) sebagai empat lapis SVG tanpa langit sendiri, jadi tidak ada tepi gambar:
 * yang ada hanya langit halaman, masjid, dan pelataran (.hero-pelataran) yang memudar dari bayang batu
 * di kaki dinding ke warna dasar section berikutnya.
 *
 * Tata letak:
 * - Ponsel dan tablet: teks di atas langit gelap, masjid utuh di bawahnya. Padding bawah isi
 *   dihitung dari tinggi adegan (persen lebar), jadi teks tidak pernah menimpa menara atau atap.
 * - Layar lebar (lg, mulai 1024px): teks di kolom kiri, masjid di kanan; padding bawah hanya setinggi
 *   dinding batu dan pelataran. Laptop berlayar pendek (varian pendek:, mis. 1366x768, 1280x720,
 *   1024x768) dipadatkan agar kedua tombol dan masjid utuh terlihat tanpa menggulir.
 * - Tulisan "Lebih besar"/"Terbesar" di layar lebar: kembali bertumpuk seperti tablet.
 * - Kontras Tinggi dan Tampilan Sederhana: adegan dan hiasan disembunyikan, latar biru malam polos.
 *
 * Gerak (dimatikan oleh "kurangi gerakan"): cahaya fajar menguat dan partikel cahaya berkelip
 * sekali saat halaman dibuka (selesai di bawah 5 detik), lapisan bergeser berbeda saat digulir
 * (CSS scroll-driven) dan mengikuti mouse di desktop (HeroParallax).
 */

/** "Komunitas Pejuang Subuh" ditulis dua tingkat: "Komunitas" kecil di atas, "Pejuang Subuh" besar. */
const AWALAN = /^Komunitas\s+/i;
const NAMA_INTI = COMMUNITY.name.replace(AWALAN, "");
const ADA_AWALAN = NAMA_INTI !== COMMUNITY.name;

/*
 * Jarak bawah isi = tinggi adegan yang tidak boleh ditimpa teks ditambah pita pelataran
 * (lihat .hero-scene dan .hero-pelataran di globals.css).
 */
const RUANG_ADEGAN =
  "pb-[calc(71%+var(--pelataran-h))] md:pb-[calc(43%+var(--pelataran-h))] lg:pb-[calc(5.2%+0.75rem+var(--pelataran-h))] xl:pb-[calc(6.2%+0.75rem+var(--pelataran-h))] huge:lg:pb-[calc(29%+var(--pelataran-h))] huge:xl:pb-[calc(34%+var(--pelataran-h))] hc:pb-12 hc:sm:pb-16 hc:md:pb-16 hc:lg:pb-20 hc:xl:pb-20 hc:huge:lg:pb-20 hc:huge:xl:pb-20 simple:pb-12 simple:sm:pb-16 simple:md:pb-16 simple:lg:pb-20 simple:xl:pb-20 simple:huge:lg:pb-20 simple:huge:xl:pb-20";

export function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="beranda-judul"
      className="hero-sky on-dark relative isolate overflow-hidden bg-brand-deep text-on-brand lg:min-h-[calc(30.4vw+2rem+var(--pelataran-h))] xl:min-h-[calc(36.5vw+2rem+var(--pelataran-h))] pendek:min-h-[calc(28.9vw+var(--pelataran-h))] pendek:xl:min-h-[calc(34.7vw+var(--pelataran-h))] huge:lg:min-h-0 huge:xl:min-h-0 hc:bg-none hc:lg:min-h-0 hc:xl:min-h-0 simple:bg-none simple:lg:min-h-0 simple:xl:min-h-0"
    >
      {/* Pola girih, hanya di langit malam bagian atas, memudar sebelum cakrawala. */}
      <div aria-hidden="true" className="hero-ornament absolute inset-0 hc:hidden simple:hidden">
        <div className="khatam-pattern absolute inset-0" />
      </div>

      <div
        role="img"
        aria-label="Ilustrasi Masjid Raya Pondok Indah saat fajar: menara beton runcing berujung bulan sabit, atap limas bersusun berlapis genteng biru, pohon palem, dan dinding batu bertuliskan nama masjid."
        className="hero-scene hc:hidden simple:hidden"
      >
        <div className="hero-layer hero-layer--langit">
          <div className="hero-drift">
            <LangitFajar />
          </div>
        </div>
        <div className="hero-layer hero-layer--jauh">
          <div className="hero-drift">
            <PepohonanJauh />
          </div>
        </div>
        <div className="hero-layer hero-layer--masjid">
          <div className="hero-drift">
            <Masjid />
          </div>
        </div>
        <div className="hero-layer hero-layer--dekat">
          <LatarDepan />
        </div>
      </div>
      <div aria-hidden="true" className="hero-pelataran hc:hidden simple:hidden" />
      <HeroParallax />

      <div
        className={`relative mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14 md:pt-12 lg:pt-12 pendek:pt-4 simple:max-w-3xl ${RUANG_ADEGAN}`}
      >
        <div className="lg:max-w-[min(37rem,56%)] xl:max-w-[min(37rem,48%)] huge:lg:max-w-none huge:xl:max-w-none simple:lg:max-w-none simple:xl:max-w-none">
          <p className="font-display text-xl leading-snug text-gold-soft sm:text-2xl lg:text-[1.375rem] pendek:text-lg">
            Assalamualaikum warahmatullahi wabarakatuh
          </p>
          <h1 id="beranda-judul" className="mt-4 font-semibold leading-[1.02] tracking-tight pendek:mt-2">
            {ADA_AWALAN ? (
              <>
                <span className="block text-2xl font-medium tracking-normal text-on-brand-soft sm:text-3xl pendek:text-2xl">
                  Komunitas
                </span>{" "}
              </>
            ) : null}
            <span className="mt-1 block text-[2.9rem] sm:text-7xl lg:text-[3.75rem] xl:text-[4.5rem] pendek:text-[3.25rem] huge:max-sm:text-[2.4rem]">
              {NAMA_INTI}
            </span>
          </h1>
          <p className="mt-3 font-display text-2xl leading-snug text-on-brand-soft sm:text-3xl lg:text-[1.75rem] pendek:mt-1 pendek:text-2xl">
            {COMMUNITY.mosque} ({COMMUNITY.mosqueShort})
          </p>
          <Pemisah tone="dark" className="mt-5 pendek:hidden" />

          {/* Di ponsel, tombol tampil lebih dulu dari paragraf sambutan (order), supaya terlihat tanpa menggulir. */}
          <div className="mt-6 flex flex-col gap-6 pendek:mt-4 pendek:gap-4">
            <p className="max-w-xl text-xl leading-relaxed text-on-brand max-sm:order-2 pendek:text-lg">
              Selamat datang, Bapak dan Ibu. Di sini Anda bisa melihat jadwal kajian,
              membaca ayat hari ini, ikut kajian lewat Zoom, dan berinfak untuk masjid.
            </p>
            {/*
              Tombol bisa berada di atas langit yang menghangat, jadi saat fokus papan ketik cincin emasnya
              diberi bingkai biru malam (shadow 11px) agar tetap kontras dengan langit di sekitarnya.
            */}
            <div className="flex flex-col gap-4 max-sm:order-1 sm:flex-row sm:flex-wrap">
              <a
                href="#jadwal-hari-ini"
                className={buttonClass(
                  "gold",
                  "xl",
                  "w-full shadow-glow-emas focus-visible:shadow-[0_0_0_11px_var(--brand-deep)] sm:w-auto lg:min-h-16 lg:px-6 lg:text-xl pendek:min-h-14 pendek:px-4 pendek:py-3 pendek:text-lg huge:lg:min-h-20 huge:lg:px-4 hc:shadow-none",
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
                  "w-full backdrop-blur-[2px] focus-visible:shadow-[0_0_0_11px_var(--brand-deep)] sm:w-auto lg:min-h-16 lg:px-6 lg:text-xl pendek:min-h-14 pendek:px-4 pendek:py-3 pendek:text-lg huge:lg:min-h-20 huge:lg:px-4",
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
