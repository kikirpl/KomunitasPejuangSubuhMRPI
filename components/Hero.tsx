import { CalendarDays, Video } from "lucide-react";
import { HeroParallax } from "@/components/hero/HeroParallax";
import { LangitFajar, LatarDepan, Masjid, PepohonanJauh } from "@/components/hero/MasjidScene";
import { StarMark } from "@/components/ui/StarMark";
import { buttonClass } from "@/components/ui/buttonStyles";
import { COMMUNITY } from "@/data/content";

/**
 * Sapaan komunitas: "Fajar di Masjid Biru". Langit beranda adalah kelanjutan langsung dari
 * bilah atas dan kepala halaman (biru malam yang sama), lalu menghangat menjadi cahaya fajar di
 * belakang Masjid Raya Pondok Indah. Masjidnya digambar ulang dari foto asli (components/hero/
 * MasjidScene.tsx) sebagai empat lapis SVG tanpa langit sendiri, jadi tidak ada tepi gambar:
 * yang ada hanya langit halaman, masjid, dan pelataran yang warnanya sama dengan section berikutnya.
 *
 * Tata letak:
 * - Ponsel dan tablet: teks di atas langit gelap, masjid utuh di bawahnya. Padding bawah isi
 *   dihitung dari tinggi adegan (persen lebar), jadi teks tidak pernah menimpa menara atau atap.
 * - Layar lebar (xl): teks di kolom kiri, masjid di kanan; padding bawah hanya setinggi dinding batu.
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

/* Jarak bawah isi = tinggi adegan yang tidak boleh ditimpa teks (lihat .hero-scene di globals.css). */
const RUANG_ADEGAN =
  "pb-[71%] md:pb-[54%] xl:pb-[calc(6.2%+0.75rem)] huge:xl:pb-[34%] hc:pb-12 hc:sm:pb-16 hc:md:pb-16 hc:xl:pb-20 hc:huge:xl:pb-20 simple:pb-12 simple:sm:pb-16 simple:md:pb-16 simple:xl:pb-20 simple:huge:xl:pb-20";

export function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="beranda-judul"
      className="hero-sky on-dark relative isolate overflow-hidden bg-brand-deep text-on-brand xl:min-h-[calc(36.5vw+2rem)] huge:xl:min-h-0 hc:bg-none hc:xl:min-h-0 simple:bg-none simple:xl:min-h-0"
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
      <HeroParallax />

      <div
        className={`relative mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14 md:pt-16 xl:pt-12 simple:max-w-3xl ${RUANG_ADEGAN}`}
      >
        <div className="xl:max-w-[min(37rem,48%)] huge:xl:max-w-none simple:xl:max-w-none">
          <p className="font-display text-xl leading-snug text-gold-soft sm:text-2xl xl:text-[1.375rem]">
            Assalamualaikum warahmatullahi wabarakatuh
          </p>
          <h1 id="beranda-judul" className="mt-4 font-semibold leading-[1.02] tracking-tight">
            {ADA_AWALAN ? (
              <>
                <span className="block text-2xl font-medium tracking-normal text-on-brand-soft sm:text-3xl">
                  Komunitas
                </span>{" "}
              </>
            ) : null}
            <span className="mt-1 block text-[2.9rem] sm:text-7xl xl:text-[4.5rem] huge:max-sm:text-[2.4rem]">
              {NAMA_INTI}
            </span>
          </h1>
          <p className="mt-3 font-display text-2xl leading-snug text-on-brand-soft sm:text-3xl xl:text-[1.75rem]">
            {COMMUNITY.mosque} ({COMMUNITY.mosqueShort})
          </p>
          <Pemisah className="mt-5" />

          {/* Di ponsel, tombol tampil lebih dulu dari paragraf sambutan (order), supaya terlihat tanpa menggulir. */}
          <div className="mt-6 flex flex-col gap-6">
            <p className="max-w-xl text-xl leading-relaxed text-on-brand max-sm:order-2">
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
                  "w-full shadow-[0_14px_30px_-14px_rgb(233_180_76/0.7)] focus-visible:shadow-[0_0_0_11px_var(--brand-deep)] sm:w-auto xl:min-h-16 xl:px-6 xl:text-xl huge:xl:min-h-20 huge:xl:px-4 hc:shadow-none",
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
                  "w-full backdrop-blur-[2px] focus-visible:shadow-[0_0_0_11px_var(--brand-deep)] sm:w-auto xl:min-h-16 xl:px-6 xl:text-xl huge:xl:min-h-20 huge:xl:px-4",
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

/** Pemisah iluminasi rata kiri: garis emas pendek, bintang delapan, garis emas yang memudar. */
function Pemisah({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex items-center gap-3 text-gold ${className}`}>
      <span className="h-px w-8 bg-gold" />
      <StarMark className="size-5" />
      <span className="h-px w-28 bg-linear-to-r from-gold to-transparent" />
    </span>
  );
}
