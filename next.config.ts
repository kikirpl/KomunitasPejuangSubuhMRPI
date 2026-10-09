import type { NextConfig } from "next";

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
  /*
   * Foto kartu Kegiatan/Pengumuman yang disimpan di public/ (mis. "/kegiatan/foto.jpg")
   * tidak perlu pengaturan apa pun. Bila memakai foto dari situs lain (URL https://...),
   * izinkan alamatnya di sini dulu, contoh:
   *
   * images: {
   *   remotePatterns: [new URL("https://contoh-penyimpanan.id/foto-kegiatan/**")],
   * },
   */
};

export default nextConfig;
