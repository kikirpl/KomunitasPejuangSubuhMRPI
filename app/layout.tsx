import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/atkinson-hyperlegible-next/wght.css";
import "@fontsource/amiri/arabic-400.css";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ACCESSIBILITY_INIT_SCRIPT } from "@/lib/accessibility";

/**
 * Huruf judul: Playfair Display (Google Fonts, lisensi SIL OFL, lihat app/fonts/OFL-PlayfairDisplay.txt).
 * Berkasnya disimpan di proyek dan disajikan dari situs sendiri lewat next/font,
 * jadi tidak menambah paket dan tidak ada permintaan ke server Google.
 */
const playfair = localFont({
  src: "./fonts/PlayfairDisplay-wght.woff2",
  weight: "400 900",
  style: "normal",
  variable: "--font-playfair",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Alamat situs (mis. https://pejuangsubuh.id) dipakai untuk membuat alamat lengkap gambar
 * pratinjau tautan di WhatsApp dan media sosial. Isi lewat NEXT_PUBLIC_SITE_URL (lihat
 * .env.example). Di Vercel, bila kosong, Next.js memakai alamat proyek secara otomatis.
 */
function siteUrl(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Pejuang Subuh | Masjid Raya Pondok Indah",
    template: "%s | Pejuang Subuh MRPI",
  },
  description:
    "Komunitas Pejuang Subuh Masjid Raya Pondok Indah (MRPI): jadwal kajian, ayat Al-Qur'an harian, kajian lewat Zoom, rekaman ceramah, info donasi, dan pengumuman kegiatan.",
  applicationName: "Pejuang Subuh MRPI",
  // Gambar pratinjau: app/opengraph-image.jpg (dipasang otomatis oleh Next.js).
  openGraph: {
    title: "Pejuang Subuh | Masjid Raya Pondok Indah",
    description:
      "Jadwal kajian, ayat Al-Qur'an harian, Zoom, rekaman ceramah, dan info donasi.",
    siteName: "Pejuang Subuh MRPI",
    locale: "id_ID",
    type: "website",
  },
};

// Zoom pada peramban sengaja tidak dibatasi (jangan isi maximumScale / userScalable).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B2559",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={playfair.variable}
      data-text-scale="1"
      data-contrast="normal"
      data-simple="false"
      suppressHydrationWarning
    >
      <head>
        {/* Menerapkan pilihan ukuran teks/kontras sebelum halaman digambar (tanpa berkedip). */}
        <script dangerouslySetInnerHTML={{ __html: ACCESSIBILITY_INIT_SCRIPT }} />
      </head>
      <body>
        <a
          href="#utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-gold focus:px-6 focus:py-4 focus:text-xl focus:font-bold focus:text-on-gold"
        >
          Langsung ke isi halaman
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
