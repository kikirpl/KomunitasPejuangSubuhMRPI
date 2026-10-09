import type { ProfileContent } from "@/types";

/* ==========================================================================
 * data/profile.ts: isi section "Tentang Kami" (id="profil").
 *
 * Teks disalin apa adanya dari naskah profil yang dikirim pengurus. Perubahan
 * yang dilakukan hanya:
 *   - "MPRI" ditulis "MRPI" (sesuai poster dan handle channel),
 *   - typo "Memanfatkan" -> "Memanfaatkan",
 *   - "aksi nyata aksi kemanusiaan" -> "aksi nyata kemanusiaan".
 * Butir "Judul: isi" dipecah menjadi { judul, isi } dan judul pilar
 * "Nama (Bidang)" menjadi { judul, bidang } hanya untuk keperluan tata letak;
 * kata-katanya tidak diubah.
 *
 * Angka sorotan HANYA boleh diambil dari teks di bawah ini. Jangan menambah
 * angka lain tanpa sumber resmi.
 * ========================================================================== */

export const PROFILE: ProfileContent = {
  sekilas: {
    judul: "Sekilas Profil",
    paragraf: [
      "Pejuang Subuh Masjid Raya Pondok Indah (MRPI) adalah komunitas dakwah dan sosial yang berdiri pada bulan Ramadan tahun 2018 di bawah naungan Yayasan Pondok Mulia dan Masjid Raya Pondok Indah.",
      "Komunitas ini dibentuk sebagai wadah kolaboratif bagi umat untuk beramai-ramai memakmurkan masjid melalui ibadah sholat berjamaah, khususnya sholat Subuh. Selain fokus pada penguatan spiritual, Pejuang Subuh MRPI berkomitmen meluaskan dampak positif melalui pendidikan Al-Qur'an, aksi kepedulian sosial, serta perluasan wawasan keislaman secara global melalui pemanfaatan teknologi digital.",
    ],
    sorotan: [
      // Sumber: paragraf pertama ("berdiri pada bulan Ramadan tahun 2018").
      { nilai: "2018", keterangan: "Berdiri pada bulan Ramadan" },
      // Sumber: pilar Edukasi ("lebih dari 900 alumni").
      { nilai: "900+", keterangan: "Alumni di berbagai penjuru nusantara dan luar negeri" },
      // Sumber: pilar Inovasi ("lebih dari 120 negara").
      { nilai: "120+", keterangan: "Negara terjangkau melalui program silaturahmi daring" },
    ],
  },

  visi: {
    judul: "Visi",
    poin: [
      "Menjadikan Masjid Raya Pondok Indah sebagai pusat pembelajaran, pengkajian, dan pendalaman ilmu pengetahuan Islam yang terbuka dan inklusif.",
      "Menyiarkan dakwah Islam yang teduh dan membawa kerahmatan bagi seluruh alam (Rahmatan lil 'Alamin) hingga ke mancanegara.",
    ],
  },

  misi: {
    judul: "Misi Utama",
    poin: [
      {
        judul: "Pemberantasan Buta Aksara Al-Qur'an",
        isi: "Menjamin setiap lapisan masyarakat memiliki akses pembelajaran Al-Qur'an dari tingkat dasar hingga mahir.",
      },
      {
        judul: "Pendidikan Keilmuan Terstruktur",
        isi: "Menyelenggarakan program pendidikan keahlian Al-Qur'an secara profesional, berjenjang, dan berkelanjutan baik secara tatap muka (offline) maupun daring (online).",
      },
      {
        judul: "Pemberdayaan Umat & Sosial",
        isi: "Menghubungkan kepedulian jamaah dengan aksi nyata kemanusiaan dan bakti sosial bagi masyarakat yang membutuhkan.",
      },
      {
        judul: "Dakwah Berbasis Teknologi",
        isi: "Memanfaatkan media digital dan teknologi siaran mutakhir untuk menembus batas geografis dakwah.",
      },
    ],
  },

  pilar: {
    judul: "Empat Pilar Pergerakan",
    poin: [
      {
        judul: "Makmurkan Masjid",
        bidang: "Ibadah & Spiritual",
        ikon: "masjid",
        poin: [
          "Menggerakkan sholat Subuh berjamaah serta menjaga konsistensi ibadah sholat 5 waktu di masjid.",
          "Menyelenggarakan kajian keilmuan Islam harian yang mencakup Akidah, Tasawuf, Sirah Nabawiyah, Hadits, Akhlak, dan Tafsir.",
        ],
      },
      {
        judul: "Edukasi & Keahlian Al-Qur'an",
        bidang: "Pendidikan",
        ikon: "quran",
        poin: [
          "Pembinaan Al-Qur'an berjenjang yang meliputi program Tahsin, Tarjim (penerjemahan Al-Qur'an metode sekejap), Tahfiz (menghafal), serta pengajaran Iqro.",
          "Telah meluluskan lebih dari 900 alumni di berbagai penjuru nusantara dan luar negeri.",
        ],
      },
      {
        judul: "Kepedulian & Kemanusiaan",
        bidang: "Sosial",
        ikon: "peduli",
        poin: [
          "Distribusi bantuan sosial (bansos) rutin, santunan dhuafa, bantuan bencana alam, hingga beasiswa pendidikan.",
          "Tanggap terhadap isu kemanusiaan internasional, termasuk penggalangan dana darurat.",
        ],
      },
      {
        judul: "Inovasi & Wawasan Global",
        bidang: "Teknologi & Komunitas",
        ikon: "global",
        poin: [
          "Menjangkau jamaah internasional di lebih dari 120 negara melalui program silaturahmi daring.",
          "Penguatan jejaring keluarga sakinah serta pembinaan generasi muda melalui komunitas Pejuang Subuh Cilik.",
        ],
      },
    ],
  },

  divisi: {
    judul: "Divisi Operasional Komunitas",
    poin: [
      {
        judul: "Divisi Kesekretariatan",
        isi: "Bertanggung jawab atas koordinasi Lintas Divisi, penjadwalan program, dan kelancaran tata kelola organisasi sehari-hari.",
      },
      {
        judul: "Divisi IT & Usaha",
        isi: "Mengelola infrastruktur siaran hibrid (hybrid stream), media digital, website, serta pengembangan kemandirian dana operasional masjid.",
      },
      {
        judul: "Divisi Sosial & Kemanusiaan",
        isi: "Mengelola penyaluran bantuan langsung, tanggap darurat bencana, dan program santunan tepat sasaran.",
      },
      {
        judul: "Divisi Program & Kajian",
        isi: "Merancang dan mengeksekusi kurikulum pendidikan Al-Qur'an, agenda pengajian harian, serta kegiatan kepemudaan.",
      },
    ],
  },
};
