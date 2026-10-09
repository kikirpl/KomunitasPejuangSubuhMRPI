# Panel Pengurus: desain

- Tanggal: 2026-10-09
- Status: draf, menunggu tinjauan pemilik repo
- Cakupan: satu rencana implementasi dalam lima fase (bagian 15)
- Catatan: folder ini belum repositori git, jadi berkas ini belum di-commit.

## 1. Latar belakang dan tujuan

Isi dinamis web (jadwal kajian, kegiatan, pengumuman) kini ada di [data/content.ts](../../../data/content.ts). Mengubahnya berarti mengedit kode, build, dan deploy, dan foto harus disalin ke folder `public/`. Pemilik web tidak teknis, sehingga tidak bisa mengoperasikan web sendiri.

Tujuan: 1 sampai 3 pengurus, lewat HP, dapat menambah, mengubah, dan menghapus jadwal kajian, pengecualian per tanggal, kegiatan, dan pengumuman (termasuk foto) tanpa menyentuh kode. Hasilnya tampil di web publik begitu menekan Simpan.

### Kriteria berhasil

1. Pengurus terdaftar masuk dengan Google, mengubah ustadz pada jadwal Kamis, menekan Simpan, lalu "Lihat di web" menampilkan perubahan itu tanpa deploy.
2. Pengurus meliburkan atau mengganti kajian pada satu tanggal. Kajian Hari Ini dan Jadwal Sepekan menampilkannya hanya pada tanggal itu, lalu kembali normal sesudahnya tanpa tindakan apa pun.
3. Kegiatan dan pengumuman, dengan foto dari HP, dapat ditambah, diubah, dan dihapus.
4. Orang yang tidak terdaftar tidak dapat membaca atau mengubah apa pun lewat login, halaman, aksi, maupun endpoint unggah.
5. Halaman utama tetap statis (route `/` tidak menjadi dinamis) dan tampilannya identik sebelum data diubah. axe (wcag2a, wcag2aa, wcag21aa, wcag22aa) tidak menemukan pelanggaran pada bagian web yang berubah dan pada semua layar panel.
6. `npm run typecheck`, `npm run lint`, `npm run build`, dan tes baru lulus.

## 2. Ruang lingkup

**Dalam v1:** jadwal kajian tetap (7 hari), pengecualian per tanggal (libur atau ganti), Kegiatan dan Pengumuman, foto, posisi foto, dan penanda "contoh/resmi" untuk dua bagian itu.

**Di luar v1** (polanya sama, bisa menyusul): Zoom, kontak, donasi, video, profil, dan ayat pekan; mengelola daftar pengurus dari panel; riwayat atau urungkan; draft; batas jumlah kartu di web; penyuntingan bersamaan oleh dua orang (yang terakhir menyimpan menang).

## 3. Keputusan

| # | Keputusan | Alasan | Ditolak |
|---|---|---|---|
| 1 | Panel admin di aplikasi yang sama | Satu proyek dan satu deploy; memakai komponen dan token yang ada; pratinjau pasti sama dengan web | Situs baru; CMS siap pakai (antarmuka generik berbahasa Inggris, ada konsep draft dan publish); Google Sheets (rawan salah ketik, tanpa unggah foto) |
| 2 | Hosting Vercel | Pilihan pemilik repo; README sudah menyebutnya | Netlify; server sendiri |
| 3 | Data di Neon Postgres (Vercel Marketplace) | Paket gratis, SQL standar, tanpa server yang dirawat | Redis; Edge Config; JSON di Blob |
| 4 | Foto di Vercel Blob publik, diunggah langsung dari browser | Menghindari batas badan Server Action (bawaan 1 MB) dan batas badan fungsi (4,5 MB); unggahan klien tanpa biaya transfer | Unggah lewat Server Action; layanan gambar pihak ketiga |
| 5 | Login Google dengan daftar email di variabel lingkungan | Tanpa sandi yang bisa lupa; memenuhi aturan autentikasi aksesibel WCAG 2.2 | Satu sandi bersama; email dan sandi per orang |
| 6 | Sesi berupa cookie terenkripsi (JWE, pustaka `jose`) berlaku 14 hari | Pola panduan Next 16.4; tidak butuh tabel sesi | Sesi di database; Better Auth atau Auth.js (lebih berat untuk 1 sampai 3 pengguna) |
| 7 | Alur OAuth memakai `arctic` | Pustaka kecil yang terawat; menangani PKCE dan pertukaran kode | Menulis seluruh alur sendiri |
| 8 | Jadwal tetap ditambah pengecualian per tanggal, disalin utuh (snapshot) | Hasil tidak berubah diam-diam bila jadwal tetap diubah kemudian | Pengecualian yang "ikut" jadwal tetap |
| 9 | Halaman utama statis dengan `revalidate = 3600` dan `revalidatePath("/")` pada setiap Simpan | Tetap cepat; memakai API stabil, bukan `unstable_cache` (yang disarankan diganti di Next 16) | `force-dynamic`; mengaktifkan Cache Components untuk seluruh web |
| 10 | Penyimpanan memori untuk menjalankan panel di laptop; PGlite hanya di dalam tes | Menjaga paket produksi kecil | PGlite di dalam aplikasi |
| 11 | Menambah Vitest dan PGlite sebagai devDependency | Logika dan SQL baru layak diuji otomatis | Hanya verifikasi manual |
| 12 | Simpan langsung tayang, tanpa draft | Model mental paling sederhana untuk pemilik | Draft dan publish |

## 4. Arsitektur

### Alur

```
Pengurus (HP) -> /admin -> Masuk dengan Google -> formulir -> Server Action
                                                   |- requireAdmin(), validasi zod
                                                   |- simpan ke Neon Postgres
                                                   '- revalidatePath("/") -> halaman utama dibuat ulang
Pengunjung -> halaman utama (statis, cache Vercel, dibuat ulang tiap Simpan atau paling lama 1 jam)
```

### Struktur berkas

Baru (B) dan diubah (U):

```
proxy.ts                                   B  pagar awal /admin/*
next.config.ts                             U  remotePatterns Blob, header /admin
types/index.ts                             U  ImagePosition, SessionOverride, PublicContent, dll.
app/page.tsx                               U  async; memuat konten lalu mengirim props
app/admin/layout.tsx                       B  kerangka panel (AccessibilityBar, header, Bantuan, Keluar)
app/admin/loading.tsx                      B  kerangka pemuat
app/admin/page.tsx                         B  beranda panel
app/admin/masuk/page.tsx                   B  layar masuk
app/admin/auth/google/route.ts             B  mulai OAuth
app/admin/auth/google/callback/route.ts    B  tanggapan OAuth
app/admin/jadwal/page.tsx                  B  daftar jadwal tetap dan pengecualian
app/admin/jadwal/[hari]/page.tsx           B  form jadwal tetap (senin..ahad)
app/admin/jadwal/tanggal/baru/page.tsx     B  form pengecualian baru
app/admin/jadwal/tanggal/[tanggal]/page.tsx B ubah atau hapus pengecualian
app/admin/pengumuman/page.tsx              B  daftar dengan dua tab
app/admin/pengumuman/baru/page.tsx         B  form baru
app/admin/pengumuman/[id]/page.tsx         B  form ubah dan hapus
app/admin/actions/*.ts                     B  Server Actions (jadwal, pengecualian, pengumuman, status, setup, sesi)
app/api/admin/foto/route.ts                B  izin unggah Blob
components/admin/*                         B  komponen panel (bagian 8.6)
components/TodaySchedule.tsx               U  menerima props; mengekspor TodayCard
components/WeeklySchedule.tsx              U  menerima props; mengekspor WeekCard
components/Announcements.tsx               U  menerima props; mengekspor AnnouncementCard
components/ui/CardImage.tsx                U  properti position
components/ui/SampleBadge.tsx              U  teks petunjuk baru
components/ui/buttonStyles.ts              U  varian danger dan dangerSolid
app/globals.css                            U  token warna danger
lib/schedule.ts                            U  jadwal efektif (bagian 6)
lib/time.ts                                U  addDaysToKey, formatDateKeyLong
lib/content.ts                             B  pembaca konten publik
lib/store/{types,schema,sql,memory,seed,index}.ts  B  penyimpanan
lib/auth/{session,google,allowlist,guard}.ts       B  login dan otorisasi
lib/validation/{umum,jadwal,pengumuman}.ts         B  skema zod dan pesan galat
lib/photo/{rules,resize}.ts                B  aturan dan pengecilan foto
tests/**, vitest.config.ts                 B  tes (bagian 13)
package.json                               U  skrip test dan dependensi baru (bagian 17)
.env.example, README.md                    U  variabel baru dan panduan setup
```

### Variabel lingkungan

| Nama | Kapan | Sumber | Dipakai oleh |
|---|---|---|---|
| `DATABASE_URL` | produksi | disuntik Vercel saat Neon dipasang dari Marketplace | lib/store/sql |
| `BLOB_READ_WRITE_TOKEN` | produksi | disuntik Vercel saat toko Blob dihubungkan ke proyek | /api/admin/foto dan penghapusan foto |
| `BLOB_PUBLIC_HOST` | produksi | `<id-toko>.public.blob.vercel-storage.com`, diisi manual setelah toko dibuat | next.config.ts dan validasi URL foto |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | produksi dan lokal bila memakai Google | Google Cloud Console | lib/auth/google |
| `SESSION_SECRET` | semua | 32 byte acak, base64 | lib/auth/session |
| `ADMIN_EMAILS` | semua | email pengurus dipisah koma | lib/auth/allowlist |
| `ADMIN_HELP_WHATSAPP` | opsional | nomor berformat 62..., untuk tautan "Bantuan"; tanpa ini tautannya disembunyikan | components/admin |
| `NEXT_PUBLIC_SITE_URL` | disarankan (sudah ada) | alamat situs | dasar alamat balik OAuth |
| `CONTENT_STORE` | lokal | `memory` untuk menjalankan panel tanpa database; ditolak bila `VERCEL` terisi | lib/store/index |

Alamat balik OAuth: `{asal}/admin/auth/google/callback`. `asal` = `NEXT_PUBLIC_SITE_URL` bila ada, bila tidak `https://{VERCEL_PROJECT_PRODUCTION_URL}`, bila tidak `http://localhost:3000`.

## 5. Model data

### Skema (Postgres)

Satu daftar pernyataan di `lib/store/schema.ts` (`SCHEMA_STATEMENTS: string[]`), dipakai oleh Neon dan oleh PGlite di tes. Semua `CREATE ... IF NOT EXISTS`, sehingga aman dijalankan ulang. Panjang teks dibatasi di lapisan zod, bukan di database.

```sql
CREATE TABLE IF NOT EXISTS sessions (
  day            smallint PRIMARY KEY CHECK (day BETWEEN 0 AND 6),
  start_time     text NOT NULL CHECK (start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  end_time       text NOT NULL CHECK (end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ustadz         text NOT NULL,
  topic          text NOT NULL,
  mode           text NOT NULL CHECK (mode IN ('masjid', 'zoom', 'hybrid')),
  location       text,
  image_url      text,
  image_alt      text,
  image_position text NOT NULL DEFAULT 'center' CHECK (image_position IN ('top', 'center', 'bottom')),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS session_overrides (
  date        date PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('libur', 'ganti')),
  note        text,
  start_time  text CHECK (start_time IS NULL OR start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  end_time    text CHECK (end_time IS NULL OR end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ustadz      text,
  topic       text,
  mode        text CHECK (mode IS NULL OR mode IN ('masjid', 'zoom', 'hybrid')),
  location    text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (
    kind = 'libur'
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND ustadz IS NOT NULL
        AND topic IS NOT NULL AND mode IS NOT NULL AND end_time > start_time)
  )
);

CREATE TABLE IF NOT EXISTS announcements (
  id             text PRIMARY KEY,
  type           text NOT NULL CHECK (type IN ('kegiatan', 'pengumuman')),
  title          text NOT NULL,
  event_date     date NOT NULL,
  event_time     text CHECK (event_time IS NULL OR event_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  excerpt        text NOT NULL,
  image_url      text,
  image_alt      text,
  image_position text NOT NULL DEFAULT 'center' CHECK (image_position IN ('top', 'center', 'bottom')),
  href           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS announcements_event_date_idx ON announcements (event_date DESC);

CREATE TABLE IF NOT EXISTS section_meta (
  section    text PRIMARY KEY CHECK (section IN ('schedule', 'announcements')),
  is_sample  boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

Aturan pembacaan: kolom bertipe `date` selalu dipilih sebagai teks (`date::text`, `event_date::text`) agar tidak ada pergeseran zona waktu pada driver mana pun. Jam disimpan sebagai teks `HH:mm` (sama dengan format `StudySession` sekarang), sehingga perbandingan string sama dengan perbandingan waktu.

### Tipe (tambahan di types/index.ts)

```ts
export type ImagePosition = "top" | "center" | "bottom";

export interface SessionOverride {
  /** Tanggal WIB "YYYY-MM-DD". */
  date: string;
  kind: "libur" | "ganti";
  /** Catatan untuk jamaah, mis. "Ustadz berhalangan hadir". */
  note?: string;
  /** Hanya untuk kind "ganti": kajian pengganti yang lengkap. */
  session?: {
    startTime: string;
    endTime: string;
    ustadz: string;
    topic: string;
    mode: SessionMode;
    location?: string;
  };
}

// StudySession dan AnnouncementItem mendapat: imagePosition?: ImagePosition
// ScheduleData mendapat: overrides?: SessionOverride[]

export type SectionKey = "schedule" | "announcements";

export interface PublicContent {
  schedule: ScheduleData; // overrides terisi
  announcements: AnnouncementData;
  /** ISO, saat halaman dibuat di server. */
  generatedAt: string;
}
```

### Pemetaan baris ke tipe

- `sessions.day` menjadi `StudySession.day`; `id` = slug hari (`ahad`, `senin`, `selasa`, `rabu`, `kamis`, `jumat`, `sabtu` menurut `DayIndex`). Kolom `null` menjadi properti yang tidak diisi.
- `session_overrides` dengan `kind = 'ganti'` menjadi `SessionOverride.session`.
- `announcements.date` (properti `AnnouncementItem.date`) disusun dari `event_date` dan `event_time`: tanpa jam `"2026-10-09"`, dengan jam `"2026-10-09T05:00:00+07:00"`. Dengan begitu [lib/announcements.ts](../../../lib/announcements.ts) tidak perlu diubah.
- `section_meta.is_sample` menjadi `ScheduleData.isSample` dan `AnnouncementData.isSample`.

### Data awal

`store.setup()` menjalankan `SCHEMA_STATEMENTS` dalam satu transaksi, lalu mengisi data awal bila `section_meta` kosong: 7 baris `sessions` dan 4 baris `announcements` dari [data/content.ts](../../../data/content.ts), serta `section_meta` dengan `is_sample = true` untuk dua bagian. Semua `INSERT ... ON CONFLICT DO NOTHING`, jadi idempoten. Tampilan web sebelum pengurus mengubah apa pun sama dengan sekarang.

### Antarmuka penyimpanan (lib/store/types.ts)

```ts
export interface ContentStore {
  isReady(): Promise<boolean>; // tabel ada dan section_meta terisi
  setup(): Promise<void>;
  readPublic(sinceKey: string): Promise<Omit<PublicContent, "generatedAt">>; // satu transaksi baca; pengecualian dengan date >= sinceKey
  listSessions(): Promise<StudySession[]>;
  getSession(day: DayIndex): Promise<StudySession | null>;
  saveSession(day: DayIndex, input: SessionInput): Promise<{ previousImageUrl: string | null }>;
  deleteSession(day: DayIndex): Promise<{ previousImageUrl: string | null }>;
  listOverrides(fromKey: string): Promise<SessionOverride[]>;
  getOverride(date: string): Promise<SessionOverride | null>;
  saveOverride(input: SessionOverride): Promise<void>; // upsert per tanggal
  deleteOverride(date: string): Promise<void>;
  listAnnouncements(): Promise<AnnouncementItem[]>;
  getAnnouncement(id: string): Promise<AnnouncementItem | null>;
  saveAnnouncement(input: AnnouncementInput): Promise<{ id: string; previousImageUrl: string | null }>; // id kosong = baru (crypto.randomUUID)
  deleteAnnouncement(id: string): Promise<{ previousImageUrl: string | null }>;
  getSampleFlags(): Promise<Record<SectionKey, boolean>>;
  setSampleFlag(section: SectionKey, isSample: boolean): Promise<void>;
}
```

`lib/store/index.ts` memilih isi: `CONTENT_STORE=memory` memberi `MemoryStore` (diisi dari content.ts saat mulai, hilang saat server berhenti; melempar galat bila `VERCEL` terisi); bila tidak, `DATABASE_URL` memberi `SqlStore` memakai `@neondatabase/serverless`; bila keduanya tidak ada, hasilnya `null`. `SqlStore` bergantung pada antarmuka kecil `SqlClient` (`query(teks, parameter)` dan `transaction([...])`) supaya tes bisa memasang PGlite.

## 6. Aturan jadwal efektif

Pengecualian tidak pernah mengubah jadwal tetap, dan hanya berlaku untuk satu tanggal WIB.

| Pengecualian di tanggal itu | Jadwal tetap hari itu | Hasil (`status`) |
|---|---|---|
| libur | ada atau tidak | `cancelled`: tidak ada kajian, dengan catatan |
| ganti | ada atau tidak | `changed`: kajian pengganti (kajian tambahan bila tak ada jadwal tetap) |
| tidak ada | ada | `regular` |
| tidak ada | tidak ada | `none` |

Kajian pengganti mewarisi `imageUrl`, `imageAlt`, dan `imagePosition` dari jadwal tetap hari yang sama (bila ada). Pengecualian "ganti" disalin utuh dari jadwal tetap saat dibuat; mengubah jadwal tetap kemudian tidak mengubah pengecualian yang sudah ada. Tetap satu kajian per hari.

### Fungsi murni (lib/schedule.ts, lib/time.ts)

```ts
export type EffectiveStatus = "regular" | "changed" | "cancelled" | "none";
export interface EffectiveSession {
  status: EffectiveStatus;
  session: StudySession | null; // null bila cancelled atau none
  note?: string;
}

effectiveSessionOn(dateKey, weekday, sessions, overrides): EffectiveSession
weekDateKeys(parts: {year, month, day, weekday}): Record<DayIndex, string> // Senin..Ahad pekan berjalan
nextSessionAfterToday(sessions, overrides, now: WibParts):
  { session: StudySession; daysAhead: number; dateKey: string; status: "regular" | "changed"; note?: string } | null
overridesFrom(overrides, fromKey): SessionOverride[]
addDaysToKey(dateKey, days): string          // aritmetika UTC, tanpa zona waktu perangkat
formatDateKeyLong(dateKey): string           // "Kamis, 15 Oktober 2026"
```

`nextSessionAfterToday` melangkah 1 sampai 7 hari ke depan memakai `effectiveSessionOn`, sehingga hari libur dilewati.

### Jendela data

- Web memuat pengecualian dengan tanggal mulai 7 hari sebelum hari ini (WIB) agar kartu hari-hari yang sudah lewat di pekan berjalan tetap benar.
- Panel hanya menampilkan pengecualian mulai hari ini.
- Pengecualian lama tetap tersimpan; tidak ada penghapusan otomatis.

## 7. Perubahan pada web publik

- [app/page.tsx](../../../app/page.tsx) menjadi `async`, mengekspor `revalidate = 3600`, memanggil `loadPublicContent()` (lib/content.ts), dan mengirim `schedule`, `generatedAt`, dan `announcements` sebagai props.
- `loadPublicContent()`: bila `getStore()` bernilai `null` atau `isReady()` bernilai false, mengembalikan salinan dari content.ts (perilaku sekarang). Bila penyimpanan terpasang dan siap tetapi galat, galatnya dilempar (bagian 12).
- [TodaySchedule](../../../components/TodaySchedule.tsx) dan [WeeklySchedule](../../../components/WeeklySchedule.tsx) menerima `schedule` sebagai props, bukan mengimpor `SCHEDULE`. [Announcements](../../../components/Announcements.tsx) menerima `data`. Kartu diekspor (`TodayCard`, `WeekCard`, `AnnouncementCard`) agar panel memakainya untuk pratinjau.
- Kajian Hari Ini:
  - `cancelled`: kartu "Kajian hari ini diliburkan"; bila ada catatan, "Catatan: {catatan}"; lalu kotak "Kajian berikutnya".
  - `changed`: kartu biasa dengan lencana "Ada perubahan hari ini" dan catatan di bawah tema. Status belum mulai, berlangsung, atau selesai memakai jam pengganti.
- Kajian berikutnya memakai `nextSessionAfterToday`; bila `changed`, ditambah "(ada perubahan)".
- Jadwal Sepekan: tujuh hari pekan berjalan (Senin sampai Ahad) lewat `weekDateKeys`. Kartu ditampilkan bila `session` ada atau `status = cancelled`; hari tanpa kajian tetap tidak ditampilkan seperti sekarang. Kartu `cancelled` memakai lencana "Libur", jam diganti "Libur", dan tema "Kajian diliburkan" (catatan di baris ustadz). Kartu `changed` memakai lencana "Ada perubahan". Lencana selalu berupa teks dengan ikon, tidak hanya warna.
- Sebelum JavaScript aktif, `WeeklySchedule` memakai `generatedAt` untuk menentukan pekan, lalu `useWibNow()` mengoreksinya. Render pertama di klien memakai nilai yang sama dengan HTML server, sehingga tidak ada selisih hidrasi. Sorotan "Hari ini" tetap hanya muncul setelah jam peramban diketahui.
- [CardImage](../../../components/ui/CardImage.tsx) mendapat properti `position?: ImagePosition` yang dipetakan ke kelas `object-top`, `object-center`, `object-bottom`.
- [SampleBadge](../../../components/ui/SampleBadge.tsx): `title` menjadi "Bagian ini masih memakai data contoh. Pengurus dapat menandainya resmi di Panel Pengurus." (teks lama menyebut content.ts).
- Bagian lain (Zoom, kontak, donasi, video, profil, ayat) tidak berubah.

## 8. Panel pengurus

### 8.1 Prinsip

Satu layar satu tugas. Kata sehari-hari ("Libur", "Ganti jadwal", bukan "override" atau "CRUD"). Simpan langsung tayang. Pratinjau selalu memakai kartu asli web. Panel mewarisi tema web (token, huruf, bentuk) dan memakai [buttonStyles](../../../components/ui/buttonStyles.ts), [AccessibilityBar](../../../components/AccessibilityBar.tsx), dan [AnnouncementTabs](../../../components/AnnouncementTabs.tsx) yang ada, sehingga ukuran tulisan, kontras tinggi, dan Tampilan Sederhana juga berlaku di panel.

### 8.2 Layar

| URL | Isi |
|---|---|
| `/admin/masuk` | Satu tombol "Masuk dengan Google", kalimat bantuan, dan pesan galat sesuai `?galat=` |
| `/admin` | Dua kartu besar (Jadwal Kajian; Kegiatan dan Pengumuman), tombol "Lihat web", spanduk "Data masih contoh" per bagian, dan spanduk "Database belum disiapkan" dengan tombol "Siapkan database" bila `isReady()` false |
| `/admin/jadwal` | Tujuh kartu hari dengan tombol Ubah (atau "Tambah kajian" bila kosong); di bawahnya "Perubahan untuk tanggal tertentu" dengan tombol "Liburkan atau ganti satu tanggal" |
| `/admin/jadwal/[hari]` | Form jadwal tetap dengan pratinjau kartu sepekan; tombol "Tidak ada kajian di hari ini" untuk menghapus |
| `/admin/jadwal/tanggal/baru` dan `/admin/jadwal/tanggal/[tanggal]` | Form pengecualian dengan pratinjau Kajian Hari Ini |
| `/admin/pengumuman` | Dua tab (Kegiatan, Pengumuman), terbaru dulu, tombol Tambah, tiap butir punya Ubah |
| `/admin/pengumuman/baru` dan `/admin/pengumuman/[id]` | Form dengan pratinjau kartu; tombol Hapus di bagian terpisah |

Semua layar dalam memiliki tautan "Kembali ke Panel" di posisi yang sama. Header yang sama di setiap halaman berisi nama panel, tautan "Bantuan" (WhatsApp pengelola), dan tombol "Keluar" yang dipisahkan secara visual; di `/admin/masuk` header hanya memuat nama panel dan Bantuan. "Lihat di web" membuka `/#jadwal-hari-ini` (untuk jadwal) atau `/#pengumuman` (untuk kegiatan dan pengumuman) di tab yang sama, sehingga tombol Kembali peramban tetap berfungsi.

### 8.3 Kolom formulir

**Jadwal tetap (satu hari)**

| Kolom | Masukan | Wajib | Aturan |
|---|---|---|---|
| Jam mulai, Jam selesai | `type="time"` | ya | `HH:mm`, selesai harus setelah mulai; bantuan "Waktu WIB" |
| Nama ustadz | teks | ya | 1 sampai 120 huruf |
| Tema kajian | teks | ya | 1 sampai 200 huruf |
| Cara mengikuti | tiga kartu pilihan: Di masjid, Lewat Zoom, Di masjid dan Zoom | ya | `masjid`, `zoom`, `hybrid` |
| Tempat | teks | tidak | sampai 120 huruf; hanya tampil bila cara mengikuti mencakup masjid (Di masjid, atau Di masjid dan Zoom); terisi awal "Ruang utama masjid"; bila hanya Zoom, disimpan kosong |
| Foto | PhotoField (bagian 10) | tidak | URL toko Blob kita atau jalur lokal |
| Keterangan foto | teks | tidak | sampai 200 huruf; bantuan "Ceritakan foto ini dalam satu kalimat untuk pembaca layar. Boleh dikosongkan." |
| Bagian foto yang tampil | tiga pilihan: Atas, Tengah, Bawah | ya | bawaan Tengah |

**Pengecualian tanggal**

| Kolom | Masukan | Aturan |
|---|---|---|
| Tanggal | `type="date"`, `min` hari ini, `max` hari ini + 366 | wajib; tanggal lengkap ditulis di bawah isian ("Kamis, 15 Oktober 2026") |
| Pilihan | dua kartu: Libur; Ganti jadwal | wajib |
| (Ganti) Jam, ustadz, tema, cara, tempat | sama dengan jadwal tetap | terisi dari jadwal tetap hari itu saat tanggal atau pilihan berubah, kecuali sudah diubah pengurus |
| Catatan untuk jamaah | teks | opsional, sampai 200 huruf; contoh "Ustadz berhalangan hadir." |

**Kegiatan atau pengumuman**

| Kolom | Masukan | Aturan |
|---|---|---|
| Jenis | dua kartu: Kegiatan ("Acara yang dihadiri jamaah"); Pengumuman ("Informasi atau pemberitahuan") | wajib |
| Judul | teks | 1 sampai 140 huruf |
| Tanggal | `type="date"` | wajib; tanggal lengkap ditulis di bawah isian; boleh lampau |
| Jam | kotak centang "Tampilkan jam" lalu `type="time"` | opsional |
| Ringkasan | area teks 4 baris dengan penghitung huruf | 1 sampai 400 huruf; bantuan "Di kartu tampil sekitar 3 baris." |
| Foto, Keterangan foto, Bagian foto | sama dengan jadwal | |
| Tautan "Selengkapnya" | `type="url"` | opsional; harus diawali `https://`, `http://`, `/`, atau `#` |

### 8.4 Teks galat, konfirmasi, dan status

Pesan galat bersifat spesifik (penyebab dan cara memperbaiki):

- Jam: "Jam mulai belum diisi." / "Jam selesai harus setelah jam mulai."
- Teks: "Nama ustadz belum diisi." / "Tema kajian belum diisi." / "Judul belum diisi." / "Ringkasan belum diisi." / "{Kolom} terlalu panjang (maksimal {n} huruf)."
- Pilihan: "Pilih cara mengikuti kajian." / "Pilih Libur atau Ganti jadwal." / "Pilih jenis: Kegiatan atau Pengumuman."
- Tanggal: "Tanggal belum diisi." / "Tanggal tidak boleh sebelum hari ini." / "Tanggal paling jauh satu tahun dari sekarang."
- Tautan: "Tautan harus diawali https:// atau http://."
- Foto: "Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi."
- Ringkasan di atas formulir: "Ada {n} isian yang perlu diperbaiki."
- Gagal simpan (sambungan atau server): "Belum tersimpan karena sambungan terputus atau server sedang sibuk. Isian Anda tidak hilang." dengan tombol "Coba lagi" dan tautan "Bantuan".
- Sesi habis: "Sesi Anda sudah berakhir. Silakan masuk lagi." (diarahkan ke /admin/masuk).

Konfirmasi memakai `<dialog>` bawaan (`showModal()`; fokus terkunci, Esc menutup), dengan tombol "Tidak jadi" dan tombol merah "Ya, ...":

- Hapus jadwal hari: "Hapus jadwal hari Kamis? Web akan menampilkan 'Hari ini tidak ada kajian' setiap Kamis. Ini tidak bisa dibatalkan."
- Libur: "Liburkan kajian Kamis, 15 Oktober 2026? Web akan menampilkan 'Kajian hari ini diliburkan' pada tanggal itu."
- Hapus pengecualian: "Hapus perubahan untuk Kamis, 15 Oktober 2026? Jadwal tetap hari itu berlaku kembali."
- Hapus butir: "Hapus “{judul}”? Kartu ini akan hilang dari web. Ini tidak bisa dibatalkan."
- Tandai resmi: "Tandai {bagian} sebagai resmi? Lencana 'Contoh data, belum resmi' akan hilang dari web." Tersedia juga "Kembalikan ke status contoh".

Setelah Simpan atau Hapus berhasil, aksi mengarahkan ke daftar dengan `?hasil=tersimpan` atau `?hasil=terhapus`. Daftar menampilkan spanduk tetap yang bisa ditutup (`role="status"`, bukan toast 5 detik karena memuat tombol): "Tersimpan. Sudah tampil di web." atau "Terhapus. Sudah hilang dari web.", masing-masing dengan tombol "Lihat di web". Parameter dibersihkan dengan `router.replace` setelah spanduk tampil.

### 8.5 Aturan aksesibilitas dan UX (ui-ux-pro-max)

Diturunkan dari data panduan ui-ux-pro-max (ux-guidelines.csv, stacks/nextjs.csv, quick-reference.md; skrip pencariannya tidak dapat dijalankan karena Python tidak terpasang):

1. Label terlihat di atas setiap isian, bukan placeholder. Wajib diberi tulisan "(wajib)", bukan hanya tanda bintang.
2. Validasi saat meninggalkan isian dan saat Simpan, bukan tiap ketikan. Pesan per isian ada di bawahnya dan terhubung lewat `aria-describedby`.
3. Setelah gagal simpan, fokus pindah ke ringkasan galat di atas formulir (`tabindex="-1"`); tiap butirnya menaut ke isiannya.
4. Server Action mengembalikan nilai yang dikirim, dan formulir memakainya sebagai `defaultValue`, karena React 19 mereset formulir setelah aksi dan isian tidak boleh hilang.
5. Tombol Simpan dinonaktifkan dan berubah menjadi "Menyimpan..." selama permintaan berjalan (`useFormStatus`).
6. Satu tombol utama per layar ("Simpan"); "Batal" sekunder; tombol hapus berwarna bahaya dan dipisah dari tombol lain. Tombol Simpan berada di akhir formulir, tidak ditempel di bawah layar (WCAG 2.2 focus not obscured).
7. Target sentuh minimal 56 px (tombol dan isian `min-h-14`), jarak antarbutir minimal 8 px.
8. Jenis masukan semantik (`time`, `date`, `url`) agar papan ketik dan pemilih HP sesuai. Tanggal selalu ditulis lengkap di bawah isiannya karena tampilan bawaan peramban bisa membuat hari dan bulan tertukar.
9. Isian tidak diminta dua kali: pengecualian "Ganti" terisi dari jadwal tetap.
10. Tautan "Bantuan" di tempat yang sama pada setiap halaman panel.
11. Layar kosong punya kalimat dan tombol aksi ("Belum ada kegiatan. Tambah kegiatan").
12. Gerak mengikuti `prefers-reduced-motion`; tidak ada gerak yang tidak perlu.
13. Teks tidak boleh terpotong pada ukuran huruf terbesar; tidak ada tinggi tetap pada kotak teks; tidak ada gulir horizontal pada 375 px.
14. Login Google memenuhi aturan autentikasi aksesibel WCAG 2.2 (tidak ada uji mengingat sandi).

### 8.6 Komponen dan token baru

- Token warna `danger` di [app/globals.css](../../../app/globals.css): `--c-danger: #b3261e`, `--danger`, `--danger-tint: #fdecea`, `--on-danger: #ffffff`, dengan nilai pekat khusus mode kontras tinggi; dipetakan ke `--color-danger`, `--color-danger-tint`, `--color-on-danger`. Nilai akhir dipastikan lewat axe (target kontras teks 4,5:1).
- Varian tombol `danger` (garis merah, latar kartu) dan `dangerSolid` (isi merah, untuk "Ya, hapus") di buttonStyles.
- Di `components/admin/`: `AdminShell`, `ErrorSummary`, `Field`, `ChoiceCards` (kartu pilihan radio), `DateField` (dengan tanggal lengkap), `TimeField`, `PhotoField`, `ConfirmDialog`, `SuccessBanner`, `SaveButton`, `PreviewPane`.
- `app/admin/loading.tsx` menampilkan kerangka pemuat beranotasi `role="status"`, karena database gratis yang "tidur" perlu waktu untuk bangun.

### 8.7 Server Action

Berkas di `app/admin/actions/`, semuanya diawali `"use server"`. Bentuk kembalian untuk formulir:

```ts
type FormState =
  | { ok: false; message?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }
  | undefined; // keadaan awal; sukses berakhir dengan redirect sehingga tidak ada keadaan ok
```

| Aksi | Argumen | Efek |
|---|---|---|
| `simpanJadwalHari` | `hari`, `prev`, `formData` | upsert `sessions`; foto lama dihapus bila berubah |
| `hapusJadwalHari` | `hari` | hapus baris `sessions`; foto lama dihapus |
| `simpanPengecualian` | `tanggalAsli` atau null, `prev`, `formData` | upsert `session_overrides`; bila tanggal berubah, baris tanggal asli dihapus |
| `hapusPengecualian` | `tanggal` | hapus baris |
| `simpanPengumuman` | `id` atau null, `prev`, `formData` | insert atau update `announcements`; foto lama dihapus bila berubah |
| `hapusPengumuman` | `id` | hapus baris; foto lama dihapus |
| `ubahStatusContoh` | `section`, `isSample` | ubah `section_meta` |
| `siapkanDatabase` | tidak ada | `store.setup()` |
| `keluar` | tidak ada | hapus cookie sesi |

Urutan di setiap aksi: `requireAdmin()` lalu parse dan validasi zod (galat dikembalikan sebagai `FormState` dengan `values` terisi) lalu panggilan penyimpanan di dalam `try` (galat penyimpanan dipetakan ke pesan gagal simpan) lalu `after()` untuk menghapus foto lama lalu `revalidatePath("/")` lalu `redirect(...)`. `redirect()` dipanggil di luar `try`, karena ia bekerja dengan melempar. Aksi hapus dan aksi tanpa formulir memakai tombol di dalam `<form action={...}>` agar tetap berfungsi tanpa JavaScript tambahan.

## 9. Login dan otorisasi

### Alur masuk

1. `GET /admin/auth/google`: membuat `state` dan `codeVerifier` (`generateState`, `generateCodeVerifier` dari `arctic`), menyimpannya dalam cookie HttpOnly berumur 10 menit dengan `Path=/admin/auth`, lalu mengarahkan ke `google.createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"])`.
2. `GET /admin/auth/google/callback`: memeriksa `state` sama dengan cookie; menolak bila Google mengirim `error` (galat `ditolak`); menukar kode lewat `google.validateAuthorizationCode(code, codeVerifier)`; membaca klaim dengan `decodeIdToken(tokens.idToken())`; memeriksa `iss` (`https://accounts.google.com`), `aud` (= `AUTH_GOOGLE_ID`), `exp`, dan `email_verified === true`; memeriksa email huruf kecilnya ada di `ADMIN_EMAILS` (galat `tidak-terdaftar`); membuat sesi; mengarahkan ke `/admin`. Kegagalan lain: `/admin/masuk?galat=gagal`. Tidak ada refresh token yang diminta atau disimpan.
3. Cookie sementara dihapus pada setiap kesudahan.

### Sesi

- Cookie `ps_admin`: JWE (`EncryptJWT`, `alg: dir`, `enc: A256GCM`; dienkripsi, bukan hanya ditandatangani, karena memuat email) berisi `{ email, name, sub }`, berlaku 14 hari mutlak, `HttpOnly; Secure` (di produksi); `SameSite=Lax; Path=/`.
- Kunci: SHA-256 dari `SESSION_SECRET`. Bila rahasia hilang atau kurang dari 32 karakter, seluruh panel menolak akses dan menampilkan "Panel belum dikonfigurasi".
- `requireAdmin()` (lib/auth/guard.ts) membaca cookie, mendekripsi, memeriksa kedaluwarsa, dan memeriksa email masih ada di `ADMIN_EMAILS`. Halaman dan Server Action yang gagal diarahkan ke `/admin/masuk`; route handler membalas 401. Mencabut akses berarti menghapus email dari `ADMIN_EMAILS` lalu deploy ulang.
- `keluar()` (Server Action) menghapus cookie lalu mengarahkan ke `/admin/masuk`.
- [proxy.ts](../../../proxy.ts) (runtime Node) dengan `matcher: ["/admin/:path*"]` mengarahkan permintaan tanpa cookie sesi yang sah ke `/admin/masuk`, kecuali `/admin/masuk` dan `/admin/auth/*`. Ini pagar awal saja; setiap halaman, Server Action, dan route handler tetap memanggil `requireAdmin()` (panduan Next 16.4: pemeriksaan sebenarnya dekat dengan data).
- Hanya di `next dev` (`process.env.NODE_ENV === "development"`), layar masuk menampilkan tombol "Masuk mode pengembang" yang membuat sesi untuk email pertama di `ADMIN_EMAILS`. Cabang ini hilang dari build produksi. Pengujian peramban terhadap `next start` memakai cookie yang ditandatangani dengan rahasia uji.

## 10. Foto

- **Pengecilan di HP** (`lib/photo/resize.ts`): gambar didekode dengan `createImageBitmap(file, { imageOrientation: "from-image" })` (cadangan: `<img>` dan `decode()`), diperkecil sehingga sisi terpanjang paling besar 1600 px dengan rasio tetap, lalu disimpan ulang lewat `canvas.toBlob` sebagai WebP kualitas 0,82. Bila hasilnya bukan `image/webp`, diulang sebagai JPEG kualitas 0,85. Bila masih lebih dari 1 MB, kualitas diturunkan bertahap (0,7 lalu 0,6) sampai di bawah 1 MB, bila perlu dengan sisi terpanjang 1280 px. Menyimpan ulang lewat canvas membuang metadata EXIF, termasuk lokasi GPS. Perhitungan ukuran dan pemilihan penyandian dibuat sebagai fungsi murni agar bisa diuji.
- **Unggah:** `upload(nama, blob, { access: "public", handleUploadUrl: "/api/admin/foto", onUploadProgress })` dari `@vercel/blob/client`. Jalur berkas `kegiatan/foto.webp` atau `kajian/foto.webp`; akhiran acak ditambahkan SDK lewat `addRandomSuffix`, jadi mengganti foto selalu menghasilkan URL baru (tidak ada masalah cache lama).
- **Endpoint** `POST /api/admin/foto`: `handleUpload` dengan `onBeforeGenerateToken` yang memanggil `requireAdmin()` (gagal berarti 401) lalu mengembalikan `{ allowedContentTypes: ["image/webp", "image/jpeg"], maximumSizeInBytes: 2 * 1024 * 1024, addRandomSuffix: true }`. Tidak memakai `onUploadCompleted`: URL foto diterima Server Action ketika formulir disimpan.
- **Penyimpanan URL:** Server Action menerima `imageUrl` dan memvalidasi bahwa itu diawali `https://{BLOB_PUBLIC_HOST}/` atau berupa jalur lokal yang diawali `/` (bukan `//`).
- **Pembersihan:** setelah penyimpanan berhasil, bila `imageUrl` berubah atau butir dihapus, URL lama dihapus lewat `del()` di dalam `after()`, hanya bila host-nya `BLOB_PUBLIC_HOST`. Kegagalan hanya dicatat. Foto yang terunggah tetapi formulirnya tidak jadi disimpan dibiarkan (paket gratis 1 GB muat ribuan foto sebesar ini).
- **Tampilan:** `next/image` hanya mengizinkan toko kita lewat `images.remotePatterns: [new URL("https://" + BLOB_PUBLIC_HOST + "/**")]` di [next.config.ts](../../../next.config.ts) (bukan wildcard). Bila `BLOB_PUBLIC_HOST` kosong, unggah foto dinonaktifkan dengan pesan "Unggah foto belum disiapkan."
- **Batas paket gratis Blob** (per bulan, dari dokumentasi Vercel): 1 GB penyimpanan, 2.000 operasi lanjutan (unggah dan sejenisnya), 10.000 operasi sederhana (pembacaan tanpa cache). Bila terlewati, Blob terkunci 30 hari. `del()` gratis.

## 11. Keamanan

- Otorisasi di setiap halaman, Server Action, dan route handler (bagian 9). Server Action diperlakukan seperti endpoint publik. Next sudah membandingkan `Origin` dengan `Host` pada setiap Server Action (pengaman CSRF bawaan) dan membatasi badan permintaan 1 MB; keduanya dibiarkan bawaan.
- Semua masukan divalidasi di server dengan zod; panjang, enum, format jam, dan rentang tanggal sesuai bagian 8.3. Tautan hanya `https://`, `http://`, `/`, atau `#`; foto hanya dari toko kita atau jalur lokal. React meng-escape semua teks; tidak ada HTML mentah yang dirender.
- Cookie sesi HttpOnly, Secure, SameSite=Lax; cookie OAuth sementara berumur 10 menit dan dibatasi pada `/admin/auth`. Login memakai `state` dan PKCE, serta mensyaratkan `email_verified`. Tidak ada parameter pengalihan dari pengguna (setelah masuk selalu ke `/admin`).
- Daftar pengurus memakai perbandingan persis pada email berhuruf kecil (varian titik atau plus Gmail tidak dinormalisasi).
- Header untuk `/admin/:path*` di next.config.ts: `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store`, `X-Frame-Options: DENY`. `metadata.robots` pada layout panel juga `index: false`.
- Rahasia hanya di variabel lingkungan Vercel; `.env*` sudah di-gitignore dan `.env.example` hanya berisi nama.
- Login berfungsi hanya di alamat produksi dan localhost, karena Google mewajibkan alamat balik yang terdaftar persis (tidak di URL preview Vercel).
- Layar persetujuan Google hanya meminta `openid`, `email`, `profile`, dan aplikasi tidak memakai refresh token. Apakah mode Testing atau Production menampilkan peringatan "aplikasi belum diverifikasi" belum dipastikan dari halaman resmi Google; diuji saat setup dan hasilnya ditulis di panduan (bagian 16).

## 12. Kegagalan dan ketahanan

| Situasi | Perilaku |
|---|---|
| `DATABASE_URL` dan `CONTENT_STORE` tidak ada | Web publik memakai salinan content.ts; panel menampilkan "Database belum dipasang" dan menonaktifkan formulir |
| Tabel belum ada atau `section_meta` kosong | Web publik memakai salinan; beranda panel menampilkan tombol "Siapkan database" (hanya pengurus; idempoten) |
| Database terpasang tetapi galat saat build atau pembuatan ulang halaman | Galat dilempar dan dicatat: build gagal (deploy tidak terbit), atau cache ISR tetap menyajikan halaman terakhir yang berhasil. Tidak pernah menyajikan data contoh diam-diam. Perilaku ini diuji saat implementasi |
| Database galat saat Simpan | Formulir menampilkan pesan gagal simpan dengan "Coba lagi"; isian tetap |
| Unggah foto gagal | Pesan di PhotoField dengan "Coba lagi"; formulir tetap bisa disimpan tanpa foto |
| Sesi berakhir | Diarahkan ke `/admin/masuk` dengan pesan sesi habis |
| Google menolak atau tidak terjangkau | `/admin/masuk?galat=ditolak` atau `gagal` dengan pesan ramah dan tautan Bantuan |
| `BLOB_READ_WRITE_TOKEN` tidak ada | Unggah foto dinonaktifkan dengan pesan; bagian lain tetap bekerja |
| `SESSION_SECRET` hilang atau pendek | Seluruh panel menolak akses dengan "Panel belum dikonfigurasi" |
| Neon "tidur" (paket gratis, setelah 5 menit tak dipakai) | Halaman panel pertama lebih lambat (kerangka pemuat tampil); halaman publik tidak terpengaruh karena statis |

## 13. Pengujian dan verifikasi

### Tes otomatis (Vitest)

Vitest 5.0.3 butuh Node 22.12 atau 24 ke atas (Node di mesin ini 24.14; web tetap bisa dibuild di Node 20.9 ke atas). Berkas di `tests/`, tanpa global (impor eksplisit), lingkungan `node`, alias `@` ke akar proyek. Dijalankan lewat skrip `npm test`.

- `tests/schedule.test.ts`: tabel jadwal efektif (libur, ganti dengan dan tanpa jadwal tetap, regular, none); `weekDateKeys` pada pergantian pekan (Ahad ke Senin), pergantian bulan dan tahun; `nextSessionAfterToday` melewati hari libur; `addDaysToKey`; `formatDateKeyLong`.
- `tests/validation.test.ts`: batas panjang, jam, selesai setelah mulai, rentang tanggal dengan "hari ini" yang diinjeksi, aturan URL tautan dan foto, pesan galat berbahasa Indonesia.
- `tests/session.test.ts`: enkripsi dan dekripsi sesi; ditolak bila dirusak, kedaluwarsa, rahasia salah atau pendek, atau email sudah tidak ada di `ADMIN_EMAILS`; normalisasi daftar email.
- `tests/upload-route.test.ts`: tanpa sesi 401; dengan sesi mengembalikan opsi token dengan jenis berkas dan batas ukuran yang benar (logika dipisah dari SDK agar bisa diuji).
- `tests/photo.test.ts`: perhitungan ukuran target dan pemilihan penyandian.
- `tests/store.contract.ts`: satu rangkaian tes kontrak yang dijalankan terhadap `MemoryStore` dan terhadap `SqlStore` di atas PGlite: CRUD semua tabel; satu kajian per hari; satu pengecualian per tanggal (upsert menimpa); batasan CHECK (enum, format jam, selesai setelah mulai, pengecualian "ganti" lengkap); pengurutan; jendela `readPublic`; `isReady`; `setup` idempoten; kolom tanggal berbentuk `YYYY-MM-DD`.

### Verifikasi di peramban (sesuai resep di memori proyek)

`npm run typecheck`, `npm run lint`, `npm run build`, lalu `npm run start` dan Edge (`playwright-core` dan `axe-core` dipasang di folder scratchpad, bukan di repo). Jam WIB dipalsukan dengan `page.clock.setFixedTime`. Sesi uji dibuat dengan menandatangani cookie memakai `SESSION_SECRET` uji, sehingga tidak ada kode khusus-tes di aplikasi; `CONTENT_STORE=memory`.

- Fase 1: tangkapan layar dasar sebelum perubahan (`#jadwal-hari-ini`, `#jadwal-mingguan`, `#pengumuman` dengan kedua tab, pada 375 px dan 1280 px, jam dipalsukan), lalu dibandingkan setelah perubahan; harapannya selisih piksel nol.
- Tabel build menampilkan `/` sebagai statis atau ISR (bukan dinamis), juga dengan `SqlStore` aktif. Ini diuji dengan titik akhir tiruan untuk HTTP Neon (`neonConfig.fetchEndpoint`) karena driver HTTP memakai `fetch`.
- Matriks jam dipalsukan: hari ini biasa; hari ini libur; hari ini ganti; besok libur; Ahad malam menuju Senin; hari tanpa kajian dengan pengecualian ganti.
- Semua layar panel pada 375 px dan 1280 px, dengan ukuran huruf terbesar, Tampilan Sederhana, dan kontras tinggi; axe (wcag2a, wcag2aa, wcag21aa, wcag22aa) tanpa pelanggaran; fokus tidak tertutup; ringkasan galat menerima fokus.
- Daftar periksa pra-rilis ui-ux-pro-max (bagian web) dijalankan pada akhir.
- Unggah foto di peramban diuji dengan menyadap `POST /api/admin/foto` dan permintaan PUT ke Blob; hasil pengecilan diperiksa (ukuran, orientasi EXIF, tanpa metadata).

### Yang tidak dapat diuji dari lingkungan pembuat

Login Google asli, Neon asli, dan unggah Blob asli. SQL ditutup oleh PGlite, Blob dan Google oleh stub. Uji ujung ke ujung dilakukan pemilik repo di Vercel mengikuti daftar langkah di akhir fase 5.

## 14. Setup dan deploy (langkah di luar kode)

1. Siapkan repositori Git dan hubungkan ke Vercel (atau deploy lewat CLI Vercel). Folder ini belum repositori git; itu keputusan terpisah.
2. Vercel, Storage: tambahkan **Neon** dari Marketplace dan hubungkan ke proyek (menyuntik `DATABASE_URL`).
3. Vercel, Storage: buat toko **Blob** berakses **Publik** dan hubungkan ke proyek (Production, Preview, dan Development bila ingin dipakai lokal). Catat host `<id-toko>.public.blob.vercel-storage.com` ke `BLOB_PUBLIC_HOST`, lalu deploy ulang (next.config.ts dibaca saat build).
4. Google Cloud Console: buat proyek; layar persetujuan OAuth (eksternal; nama aplikasi; email dukungan; scope `openid`, `email`, `profile`); kredensial "OAuth client ID" jenis Web; alamat balik `https://{domain}/admin/auth/google/callback` dan `http://localhost:3000/admin/auth/google/callback`. Salin ID dan rahasia ke `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET`. Periksa apakah peringatan "belum diverifikasi" muncul pada mode Testing dan Production, lalu catat hasilnya di README.
5. Isi `SESSION_SECRET` (mis. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`), `ADMIN_EMAILS`, `ADMIN_HELP_WHATSAPP`, dan `NEXT_PUBLIC_SITE_URL`.
6. Deploy. Buka `/admin`, masuk dengan Google, tekan "Siapkan database", lalu "Lihat web".
7. Ganti data contoh dengan data resmi; tandai bagian resmi.
8. Mencabut akses pengurus: hapus emailnya dari `ADMIN_EMAILS`, lalu deploy ulang.

Menjalankan panel di laptop tanpa akun apa pun: `.env.local` berisi `CONTENT_STORE=memory`, `SESSION_SECRET`, dan `ADMIN_EMAILS`; lalu `npm run dev` dan gunakan tombol "Masuk mode pengembang".

## 15. Urutan kerja

Tiap fase meninggalkan web dalam keadaan jalan dan lulus typecheck, lint, dan build.

1. **Lapisan data dan komponen publik berbasis props.** types; lib/store (types, schema, sql, memory, seed, index); lib/content; lib/schedule dan lib/time (fungsi jadwal efektif); page.tsx dan tiga komponen menerima props; kartu diekspor; `CardImage.position`; Vitest dan tes jadwal serta kontrak penyimpanan. Selesai bila tampilan identik dengan dasar, `/` tetap statis atau ISR, dan semua tes lulus.
2. **Login dan kerangka panel.** lib/auth, proxy.ts, layar masuk, rute OAuth, layout, loading, beranda panel dengan "Siapkan database", token dan varian `danger`, `keluar`. Selesai bila pengunjung tanpa sesi tidak dapat membuka halaman panel mana pun, masuk dan keluar berfungsi dengan sesi uji, dan tes sesi lulus.
3. **Jadwal.** Skema zod; Server Action; halaman jadwal tetap dan pengecualian dengan pratinjau; tampilan libur dan ganti di web. Selesai bila matriks jam dipalsukan lulus dan axe bersih.
4. **Kegiatan dan Pengumuman dengan foto.** Halaman dan Server Action; PhotoField; `/api/admin/foto`; pembersihan foto lama; `remotePatterns` dan header; posisi foto. Selesai bila tes rute unggah dan tes pengecilan lulus, dan alur foto di peramban lulus dengan sadapan.
5. **Penanda resmi, panduan, dan penyempurnaan.** Sakelar contoh atau resmi; `SampleBadge`; `.env.example`; bagian README "Panel Pengurus" (setup, cabut akses, mode lokal); pemeriksaan aksesibilitas akhir; daftar periksa pra-rilis. Selesai dengan daftar langkah uji ujung ke ujung untuk pemilik repo di Vercel: masuk dengan Google asli, siapkan database, ubah jadwal, buat pengecualian, unggah foto dari HP, tambah dan hapus pengumuman, cabut akses, dan pastikan `/` statis di keluaran build.

## 16. Risiko dan hal yang diverifikasi saat implementasi

- **Syarat Vercel Hobby:** paket gratis hanya untuk pemakaian non-komersial. Permintaan donasi tidak dianggap komersial, tetapi menerima bayaran untuk membuat atau merawat situs dianggap komersial. Pemilik repo memeriksa posisinya sendiri; bila perlu, paket Pro. Rancangan tidak bergantung pada paket.
- **Neon gratis:** komputasi berhenti setelah 5 menit tak dipakai; riwayat pemulihan hanya 6 jam, jadi data yang terhapus salah hanya bisa dipulihkan bila cepat ketahuan (karena itu penghapusan selalu meminta konfirmasi).
- **Blob gratis:** melewati batas bulanan mengunci Blob 30 hari; foto kecil (di bawah sekitar 400 KB) membuat ini sangat jauh dari batas.
- **Peringatan layar persetujuan Google:** belum dipastikan; diuji saat setup (bagian 14, langkah 4).
- **Halaman utama tetap statis dengan driver HTTP Neon:** driver tidak mengatur opsi cache `fetch` sendiri (diperiksa pada paket 1.2.0), tetapi hasil akhirnya dipastikan lewat tabel build dengan titik akhir tiruan.
- **`sql.transaction` dengan `sql.query` pada driver Neon 1.x:** bentuk yang dipakai dipastikan terhadap titik akhir tiruan dan terhadap dokumentasi saat menulis `SqlStore`.
- **`onUploadCompleted` bersifat opsional pada `handleUpload`:** dipastikan terhadap tipe SDK saat menulis endpoint; bila wajib, diisi fungsi kosong yang aman.
- **Hidrasi kartu sepekan** pada tablet lama: kartu memakai `generatedAt` sebelum JavaScript aktif. Bila halaman statis dibuat pada pekan sebelumnya dan dibuka tepat setelah pergantian pekan, kartu bisa sesaat memakai pekan lama sebelum hidrasi; setelah itu dikoreksi.
- **Daftar pengumuman bisa makin panjang** karena belum ada batas jumlah kartu di web. Sengaja di luar v1; ditambahkan bila perlu.
- **Vitest 5 butuh Node 22.12 atau lebih baru** hanya untuk pengembangan; bidang `engines` web (`>=20.9.0`) tidak diubah.
- **Folder belum repositori git.** Perlu repositori (atau CLI) sebelum deploy ke Vercel; tidak menghalangi fase 1 sampai 5.

## 17. Dependensi

Versi terbaru yang diperiksa pada 2026-10-09 lewat registri npm; yang dipasang mengikuti rentang `^`.

| Paket | Jenis | Versi | Untuk |
|---|---|---|---|
| `zod` | runtime | 4.6.5 (sudah ada sebagai dependensi turunan) | validasi |
| `jose` | runtime | 6.2.12 | sesi terenkripsi |
| `arctic` | runtime | 3.7.0 | alur OAuth Google |
| `@neondatabase/serverless` | runtime | 1.2.0 | akses Neon lewat HTTP |
| `@vercel/blob` | runtime | 2.8.1 | unggah dan hapus foto |
| `server-only` | runtime | 0.0.1 | menjaga modul server tak masuk bundel klien (panduan Next 16.4 mensyaratkan paket ini) |
| `vitest` | dev | 5.0.3 | tes |
| `@electric-sql/pglite` | dev | 0.5.8 | menguji SQL tanpa akun Neon |
