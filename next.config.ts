import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
