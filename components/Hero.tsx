import { CalendarDays, Video } from "lucide-react";
import { MountainBackdrop } from "@/components/MountainBackdrop";
import { buttonClass } from "@/components/ui/buttonStyles";
import { COMMUNITY } from "@/data/content";

/**
 * Sapaan komunitas. Latar navy yang beranjak ke biru royal (langit Subuh), dan
 * elemen yang paling diingat: lengkung mihrab berisi langit biru dengan cahaya
 * fajar keemasan. Satu-satunya gerak otomatis di situs ini, dan berhenti total
 * bila pengguna memilih "kurangi gerakan". Warna lengkung memakai variabel palet
 * di app/globals.css (--c-navy, --c-royal, --c-sky, dst.).
 *
 * Di dasar hero ada pegunungan biru muda (MountainBackdrop) setinggi --mtn-height.
 * Padding bawah konten = 88% tinggi itu (puncak tertinggi berada di 83,5%), jadi
 * teks dan tombol tidak pernah menimpa gunung. Pada Kontras Tinggi dan Tampilan
 * Sederhana gunung disembunyikan dan padding kembali seperti semula.
 */
export function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="beranda-judul"
      className="on-dark relative overflow-hidden bg-brand-deep bg-linear-to-b from-brand-deep from-45% to-primary text-on-brand"
    >
      <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
      {/* Di bawah konten: digambar sebelum konten (urutan DOM), sama seperti pola bintang. */}
      <MountainBackdrop className="absolute inset-x-0 bottom-0 h-(--mtn-height) w-full hc:hidden simple:hidden" />
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 pt-10 pb-[calc(var(--mtn-height)*0.88)] sm:px-8 sm:pt-14 md:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 hc:pb-10 hc:sm:pb-14 hc:md:pb-20 simple:max-w-3xl simple:pb-10 simple:sm:pb-14 simple:md:pb-20 simple:lg:grid-cols-1">
        <div className="flex flex-col">
          <p className="font-display text-xl text-gold-soft sm:text-2xl">
            Assalamualaikum warahmatullahi wabarakatuh
          </p>
          <h1
            id="beranda-judul"
            className="mt-4 text-[2.5rem] font-semibold leading-[1.1] tracking-tight sm:text-6xl"
          >
            {COMMUNITY.name}
          </h1>
          <p className="mt-3 font-display text-2xl text-on-brand-soft sm:text-3xl">
            {COMMUNITY.mosque} ({COMMUNITY.mosqueShort})
          </p>
          {/* Di ponsel, tombol tampil lebih dulu dari paragraf sambutan (order), supaya terlihat tanpa menggulir. */}
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-on-brand-soft max-sm:order-2">
            Selamat datang, Bapak dan Ibu. Di sini Anda bisa melihat jadwal kajian,
            membaca ayat hari ini, ikut kajian lewat Zoom, dan berinfak untuk masjid.
          </p>
          <div className="mt-9 flex flex-col gap-4 max-sm:order-1 sm:flex-row sm:flex-wrap">
            <a href="#jadwal-hari-ini" className={buttonClass("gold", "xl", "w-full sm:w-auto")}>
              <CalendarDays aria-hidden className="size-8" />
              Lihat Jadwal Hari Ini
            </a>
            <a href="#zoom" className={buttonClass("outlineOnDark", "xl", "w-full sm:w-auto")}>
              <Video aria-hidden className="size-8" />
              Buka Zoom
            </a>
          </div>
        </div>

        {/*
          Hiasan, bukan isi: di ponsel dan tablet dibuat kecil (ukuran piksel tetap, tidak ikut
          membesar bersama tulisan) supaya Menu Utama tidak terdorong sampai dua layar ke bawah.
        */}
        <FajrArch className="mx-auto w-full max-w-[220px] drop-shadow-[0_24px_40px_rgba(4,14,40,0.45)] sm:max-w-[260px] lg:max-w-[22rem] simple:hidden" />
      </div>
    </section>
  );
}

const STARS: ReadonlyArray<readonly [number, number, number]> = [
  [84, 150, 2],
  [126, 104, 1.8],
  [152, 72, 1.5],
  [172, 150, 1.4],
  [200, 60, 1.4],
  [256, 128, 1.6],
  [300, 176, 2],
  [118, 196, 1.6],
  [292, 232, 1.5],
  [66, 240, 1.4],
];

function FajrArch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 440"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Langit Subuh: navy, biru royal, biru langit, lalu cahaya fajar keemasan di kaki langit. */}
        <linearGradient id="fajr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--c-navy)" }} />
          <stop offset="0.4" style={{ stopColor: "var(--c-royal)" }} />
          <stop offset="0.7" style={{ stopColor: "var(--c-sky)" }} />
          <stop offset="0.88" style={{ stopColor: "var(--c-ice-strong)" }} />
          <stop offset="1" style={{ stopColor: "var(--c-gold-tint)" }} />
        </linearGradient>
        <radialGradient id="fajr-glow" cx="0.5" cy="1" r="0.75">
          <stop offset="0" style={{ stopColor: "var(--c-gold-soft)", stopOpacity: 0.95 }} />
          <stop offset="0.5" style={{ stopColor: "var(--c-gold)", stopOpacity: 0.4 }} />
          <stop offset="1" style={{ stopColor: "var(--c-gold)", stopOpacity: 0 }} />
        </radialGradient>
        <clipPath id="fajr-clip">
          <path d="M34 430V190a146 146 0 0 1 292 0v240z" />
        </clipPath>
        <mask id="fajr-moon">
          <rect width="360" height="440" fill="#fff" />
          <circle cx="222" cy="93" r="21" fill="#000" />
        </mask>
      </defs>

      <path
        d="M20 430V190a160 160 0 0 1 320 0v240z"
        fill="none"
        style={{ stroke: "var(--c-gold)" }}
        strokeWidth="2"
      />
      <path d="M34 430V190a146 146 0 0 1 292 0v240z" fill="url(#fajr-sky)" />

      <g clipPath="url(#fajr-clip)">
        <g className="dawn-stars" style={{ fill: "var(--c-gold-tint)" }}>
          {STARS.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
          <circle cx="210" cy="100" r="24" mask="url(#fajr-moon)" />
        </g>

        <g className="dawn-rise">
          <ellipse cx="180" cy="430" rx="190" ry="120" fill="url(#fajr-glow)" />
        </g>

        {/* Siluet masjid: kubah biru royal, menara dan lantai navy. */}
        <path d="M116 430v-26a64 64 0 0 1 128 0v26z" style={{ fill: "var(--c-royal)" }} />
        <g style={{ fill: "var(--c-navy)" }}>
          <rect x="178.5" y="322" width="3" height="18" />
          <circle cx="180" cy="319" r="4" />
          <rect x="270" y="352" width="12" height="78" />
          <path d="M268 352h16l-8-22z" />
          <rect x="78" y="372" width="12" height="58" />
          <path d="M76 372h16l-8-20z" />
          <rect x="34" y="412" width="292" height="18" />
        </g>
      </g>
    </svg>
  );
}
