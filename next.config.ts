import type { NextConfig } from "next";
import { blobImagePatterns } from "./lib/photo/rules";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Panel pengurus: jangan diindeks, jangan di-cache, dan jangan boleh dibingkai di situs lain.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  images: {
    /*
     * Foto yang diunggah dari panel pengurus disimpan di toko Vercel Blob. Hanya toko kita yang diizinkan
     * (BLOB_PUBLIC_HOST, mis. "abc.public.blob.vercel-storage.com"), bukan semua host. Foto di folder public/
     * (mis. "/kegiatan/foto.jpg") tidak butuh pengaturan apa pun.
     */
    remotePatterns: blobImagePatterns(process.env.BLOB_PUBLIC_HOST),
  },
};

export default nextConfig;
