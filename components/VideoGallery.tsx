"use client";

import { useState } from "react";
import { Camera, Music2, Play, SquarePlay, Users, type LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { VIDEO } from "@/data/content";

/* ==========================================================================
 * TAUTAN MEDIA SOSIAL DAN GRUP (ubah di sini).
 * Tautan yang belum ada sengaja diisi "#" (jangan diisi tebakan).
 * ========================================================================== */
const SOCIAL_LINKS = {
  // TODO: isi alamat akun TikTok Pejuang Subuh MRPI, contoh "https://www.tiktok.com/@namaakun"
  tiktok: "#",
  // TODO: isi alamat akun Instagram Pejuang Subuh MRPI, contoh "https://www.instagram.com/namaakun"
  instagram: "#",
  youtube: "https://www.youtube.com/@pejuangsubuhmrpi",
  // TODO: isi tautan undangan Grup WhatsApp, contoh "https://chat.whatsapp.com/xxxxxxxx"
  grupWhatsapp: "#",
} as const;

interface SocialButton {
  href: string;
  label: string;
  ariaLabel: string;
  Icon: LucideIcon;
  /** Tombol utama tampil paling menonjol (warna penuh). */
  utama?: boolean;
}

const SOCIAL_BUTTONS: readonly SocialButton[] = [
  {
    href: SOCIAL_LINKS.tiktok,
    label: "TikTok",
    ariaLabel: "TikTok Pejuang Subuh MRPI (buka di tab baru)",
    Icon: Music2,
  },
  {
    href: SOCIAL_LINKS.instagram,
    label: "Instagram",
    ariaLabel: "Instagram Pejuang Subuh MRPI (buka di tab baru)",
    Icon: Camera,
  },
  {
    href: SOCIAL_LINKS.youtube,
    label: "YouTube",
    ariaLabel: "YouTube Pejuang Subuh MRPI (buka di tab baru)",
    Icon: SquarePlay,
  },
  {
    href: SOCIAL_LINKS.grupWhatsapp,
    label: "Gabung Grup WhatsApp",
    ariaLabel: "Gabung Grup WhatsApp Pejuang Subuh MRPI (buka di tab baru)",
    Icon: Users,
    utama: true,
  },
];

/*
 * Gaya tombol sosial (warna sama dengan tombol lain: royal penuh untuk tombol utama,
 * garis royal untuk yang lain). Ponsel/tablet: ikon di atas tulisan agar label panjang
 * tetap rapi di kisi 2x2. Layar lebar: ikon di samping tulisan, satu baris.
 */
const socialBase =
  "flex w-full min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center text-lg font-bold leading-tight transition-colors select-none [&_svg]:shrink-0 huge:[&_svg]:hidden lg:w-auto lg:flex-row lg:gap-3";
const socialUtama =
  "border-primary bg-primary text-on-brand hover:border-primary-hover hover:bg-primary-hover active:bg-primary-hover lg:px-8";
const socialBiasa =
  "border-primary bg-card text-primary hover:border-accent hover:bg-tint active:bg-tint lg:px-6";

/** ID video YouTube selalu 11 karakter (huruf, angka, garis bawah, strip). */
const YOUTUBE_ID = /^[\w-]{11}$/;

/**
 * Rekaman kajian: satu video utama dengan rasio 16:9. Pemutar YouTube baru dimuat
 * setelah tombol putar ditekan (hemat kuota, tidak melacak pengunjung sebelum
 * memilih memutar), lalu empat tombol menuju media sosial dan grup WhatsApp.
 */
export function VideoGallery() {
  const [playing, setPlaying] = useState(false);
  const playable = YOUTUBE_ID.test(VIDEO.youtubeId);

  return (
    <Section
      id="video"
      title="Rekaman Kajian"
      intro="Ketinggalan kajian? Tonton ulang kapan saja, dari rumah."
      isSample={VIDEO.isSample}
    >
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-line bg-card shadow-card hc:border-2">
        {/* Video asli: rasio 16:9. Kotak contoh berisi catatan, jadi tingginya mengikuti isi. */}
        <div className={`relative bg-brand-deep ${playable ? "aspect-video" : ""}`}>
          {playing && playable ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO.youtubeId}?autoplay=1&rel=0`}
              title={`Video kajian: ${VIDEO.title} (YouTube)`}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full"
            />
          ) : playable ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Putar video: ${VIDEO.title}`}
              className="on-dark absolute inset-0 grid place-items-center bg-linear-to-br from-brand-deep to-primary text-on-brand"
            >
              <span aria-hidden className="khatam-pattern absolute inset-0" />
              <span className="relative flex flex-col items-center gap-3 px-6 text-center">
                <span className="grid size-24 place-items-center rounded-full bg-gold text-on-gold shadow-xl">
                  <Play aria-hidden className="ms-1 size-12" fill="currentColor" />
                </span>
                <span className="text-2xl font-bold">Putar Video</span>
              </span>
            </button>
          ) : (
            <div className="on-dark relative grid min-h-80 w-full place-items-center bg-linear-to-br from-brand-deep to-primary py-10 text-on-brand">
              <span aria-hidden className="khatam-pattern absolute inset-0" />
              <div className="relative flex flex-col items-center gap-3 px-6 text-center">
                <span
                  aria-hidden
                  className="grid size-24 place-items-center rounded-full bg-gold text-on-gold shadow-xl"
                >
                  <Play className="ms-1 size-12" fill="currentColor" />
                </span>
                <p className="text-2xl font-bold">Video contoh</p>
                <p className="max-w-sm text-lg text-on-brand-soft">
                  Belum ada video YouTube yang dipasang. Isi youtubeId di
                  data/content.ts.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-5">
          <h3 className="text-2xl font-semibold text-brand">{VIDEO.title}</h3>
          <p className="mt-1 text-lg text-ink-soft">{VIDEO.ustadz}</p>
        </div>
      </div>

      {/* Ponsel dan tablet: kisi 2x2. Layar lebar: satu baris, rata tengah. */}
      <ul
        aria-label="Media sosial dan grup Pejuang Subuh MRPI"
        className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:justify-center lg:gap-4 simple:grid-cols-1 simple:lg:grid"
      >
        {SOCIAL_BUTTONS.map(({ href, label, ariaLabel, Icon, utama }) => (
          <li key={label} className="flex">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className={`${socialBase} ${utama ? socialUtama : socialBiasa}`}
            >
              <Icon aria-hidden className="size-6" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
