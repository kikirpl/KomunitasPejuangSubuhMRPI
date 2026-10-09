# Panel Pengurus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pengurus mengelola jadwal kajian, pengecualian per tanggal, kegiatan, dan pengumuman (dengan foto) lewat panel `/admin` di web yang sama, tanpa menyentuh kode.

**Architecture:** Halaman utama tetap statis (ISR 1 jam, dibuat ulang lewat `revalidatePath("/")`) dan membaca konten lewat `lib/content.ts`. Penyimpanan berupa antarmuka `ContentStore` dengan dua isi: `SqlStore` (Neon Postgres) dan `MemoryStore` (lokal). Panel memakai login Google dan cookie sesi terenkripsi; Server Action tipis memanggil perintah teruji di `lib/admin/commands.ts`; foto diunggah langsung dari HP ke Vercel Blob.

**Tech Stack:** Next.js 16.4 (App Router, `proxy.ts`), React 19.3, TypeScript strict, Tailwind 4.3, zod, jose, arctic, @neondatabase/serverless, @vercel/blob; Vitest dan PGlite untuk tes.

**Spec:** [docs/superpowers/specs/2026-10-09-panel-pengurus-design.md](../specs/2026-10-09-panel-pengurus-design.md). Tanda "§" di bawah merujuk ke spec itu; pelaksana membaca keduanya.

## Global Constraints

Setiap tugas wajib mematuhi butir berikut (nilai disalin dari spec).

1. Terpasang: Next 16.4.0 (`proxy.ts` pengganti middleware, runtime Node), React 19.3.0, Tailwind 4.3.3, TypeScript ~5.9.3 `strict`, alias `@/*` ke akar proyek. Jangan menebak API Next: baca `node_modules/next/dist/docs/` (AGENTS.md paket itu memperingatkan versi ini berbeda dari pengetahuan umum).
2. Build web tetap `>=20.9.0` (`engines` tidak diubah). Vitest 5 hanya untuk pengembangan dan butuh Node 22.12 atau 24 ke atas (mesin ini 24.14).
3. Dependensi baru hanya: runtime `zod ^4.6.5`, `jose ^6.2.12`, `arctic ^3.7.0`, `@neondatabase/serverless ^1.2.0`, `@vercel/blob ^2.8.1`, `server-only ^0.0.1`; dev `vitest ^5.0.3`, `@electric-sql/pglite ^0.5.8`. Tidak ada ORM, pustaka auth, atau testing-library.
4. Semua teks UI berbahasa Indonesia; hari ditulis "Ahad" (bukan "Minggu"); jam ditampilkan "05.00" lewat `formatTime`; komentar kode berbahasa Indonesia seperti berkas yang ada; ikon dari `lucide-react`, tanpa emoji.
5. Semua tanggal dan jam WIB lewat helper `lib/time.ts`; jangan memakai zona waktu server atau perangkat. Kolom `date` Postgres selalu dibaca sebagai teks (`::text`).
6. Cookie sesi `ps_admin`: JWE (`EncryptJWT`, `alg: "dir"`, `enc: "A256GCM"`) berisi `{ email, name, sub }`; kunci = SHA-256 dari `SESSION_SECRET`; berlaku 14 hari mutlak; `HttpOnly`, `Secure` di produksi, `SameSite=Lax`, `Path=/`. Rahasia kosong atau kurang dari 32 karakter: panel menolak semua akses ("Panel belum dikonfigurasi.").
7. Cookie OAuth sementara `ps_oauth_state` dan `ps_oauth_verifier`: HttpOnly, 10 menit, `Path=/admin/auth`. Scope hanya `openid email profile`; tanpa refresh token.
8. Unggah foto: toko Blob publik; `allowedContentTypes: ["image/webp", "image/jpeg"]`; `maximumSizeInBytes: 2 * 1024 * 1024`; `addRandomSuffix: true`. Pengecilan di klien: sisi terpanjang 1600 px; WebP kualitas 0,82; cadangan JPEG 0,85 bila hasilnya bukan `image/webp`; kualitas 0,7 lalu 0,6 bila di atas 1.000.000 byte; lalu sisi terpanjang 1280 px.
9. Halaman utama: `export const revalidate = 3600`; setiap perubahan yang berhasil memanggil `revalidatePath("/")`. Web memuat pengecualian dengan tanggal mulai hari ini dikurangi 7 hari.
10. Batas isian: ustadz 1–120; tema 1–200; tempat ≤120; keterangan foto ≤200; catatan ≤200; judul 1–140; ringkasan 1–400. Tanggal pengecualian baru: hari ini sampai hari ini + 366 hari. Tautan diawali `https://`, `http://`, `/`, atau `#`. Foto: `https://{BLOB_PUBLIC_HOST}/...` atau jalur lokal `/...` (bukan `//`).
11. Pesan galat, konfirmasi, dan spanduk persis seperti §8.4 (ditambah pesan di bagian "Keputusan pelaksanaan"); parameter hasil `?hasil=tersimpan` atau `?hasil=terhapus`.
12. Header `/admin/:path*`: `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store`, `X-Frame-Options: DENY`. `proxy.ts` hanya pagar awal (`matcher: ["/admin/:path*"]`, kecuali `/admin/masuk` dan `/admin/auth/*`); setiap halaman, Server Action, dan route handler, kecuali `/admin/masuk` dan `/admin/auth/*` (yang memang sebelum login), memanggil `requireAdmin()` atau `getAdmin()` sendiri.
13. Tidak ada kode khusus-tes di aplikasi. Tombol "Masuk mode pengembang" hanya bila `process.env.NODE_ENV === "development"`. `MemoryStore` (dipilih dengan `CONTENT_STORE=memory`, disimpan di `globalThis`) melempar galat bila `VERCEL` terisi.
14. Aksesibilitas §8.5: isian dan tombol `min-h-14`; label terlihat; galat per isian terhubung `aria-describedby` ditambah ringkasan yang menerima fokus setelah simpan gagal; satu tombol utama per layar; tombol Simpan tidak menempel di bawah layar; keberhasilan berupa spanduk (bukan toast); tanggal ditulis lengkap di bawah isian tanggal; tanpa gulir horizontal pada 375 px; hormati `prefers-reduced-motion`. axe (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa) nol pelanggaran. Setiap tugas UI merujuk ke §8.5 dan data panduan ui-ux-pro-max (dibaca langsung dari CSV karena Python tidak tersedia).
15. Bagian web lain (Zoom, kontak, donasi, video, profil, ayat) tidak diubah. Di Fase 1 tampilan web harus identik piksel demi piksel.
16. Gerbang standar setiap tugas: `npm run typecheck`, `npm run lint`, `npm test` (sesudah Tugas 1), dan `npm run build` bila tugas menyentuh halaman atau komponen. Pesan commit diakhiri baris `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; tidak ada `git push`.

### Keputusan pelaksanaan yang melengkapi spec

Hal-hal yang spec belum menetapkan; ditetapkan di sini supaya tugas-tugas konsisten.

- **ID pengumuman dibuat sebelum Simpan.** Halaman "baru" membuat `crypto.randomUUID()` saat dirender dan mengirimkannya sebagai isian tersembunyi `id`; `saveAnnouncement` selalu upsert pada id itu. Simpan ganda menghasilkan satu kartu, bukan dua. (Spec §5 menulis "id kosong = baru"; perilaku yang terlihat pengguna sama.)
- **Penyimpanan memori** disimpan di `globalThis` agar tahan terhadap bundel terpisah dan HMR.
- **`iss` Google** dianggap sah bila `https://accounts.google.com` atau `accounts.google.com` (keduanya sah menurut Google).
- **Rentang tanggal pengumuman:** `2020-01-01` sampai hari ini + 731 hari; di luar itu: "Tanggal tidak masuk akal. Periksa tahunnya."
- **Pesan tambahan:** jam tidak sah: "Jam tidak sah. Gunakan format 24 jam, contoh 05.30."; alamat foto tidak dikenal: "Alamat foto tidak dikenal. Unggah ulang fotonya."; berkas bukan gambar: "Pilih foto berformat JPG, PNG, atau WebP."; unggah gagal: "Foto belum berhasil diunggah. Periksa sambungan, lalu coba lagi."; keterangan foto panjang: "Keterangan foto terlalu panjang (maksimal 200 huruf)."; catatan panjang: "Catatan terlalu panjang (maksimal 200 huruf)."
- **Teks layar masuk:** judul "Panel Pengurus"; tombol "Masuk dengan Google"; bantuan "Gunakan akun Google yang sudah didaftarkan sebagai pengurus."; `?galat=tidak-terdaftar`: "Email ini belum terdaftar sebagai pengurus. Hubungi pengelola web untuk didaftarkan."; `?galat=ditolak`: "Masuk dibatalkan. Silakan coba lagi."; `?galat=gagal`: "Masuk belum berhasil. Silakan coba lagi; bila terulang, hubungi pengelola web."; `?galat=sesi-habis`: "Sesi Anda sudah berakhir. Silakan masuk lagi." (dipakai bila cookie ada tetapi tidak sah, kedaluwarsa, atau emailnya sudah dicabut).
- **Jadwal sepekan kosong** (semua hari dihapus) menampilkan "Jadwal kajian belum tersedia." sebagai ganti daftar kosong.
- **Catatan git:** repositori Git lokal dibuat di Tugas 0 hanya bila pemilik repo setuju. Bila tidak, lewati semua langkah "Commit"; gerbang standar menjadi titik periksa.

## Review Focus

Masukan dan kondisi yang tersirat dari spec tetapi mudah terlewat; tiap baris punya tes di tugas pemiliknya.

1. **Server di UTC antara 00:00 dan 07:00 WIB:** "hari ini" harus tanggal WIB, bukan tanggal UTC. (Tugas 1, 5)
2. **Simpan ditekan dua kali atau permintaan terkirim ulang:** hasilnya satu kartu pengumuman, bukan dua. (Tugas 3, 19, 20)
3. **Foto HP sangat besar atau tegak (EXIF):** hasil tegak, sisi terpanjang paling besar 1600 px, di bawah 1.000.000 byte, tanpa metadata GPS. (Tugas 17, 18)
4. **Teks panjang tanpa spasi** (judul 140 huruf, tema 200 huruf, URL sebagai teks): membungkus tanpa gulir horizontal pada 375 px di web dan di panel. (Tugas 14, 20)
5. **Semua hari jadwal dihapus:** web menampilkan "Hari ini tidak ada kajian" dan "Jadwal kajian belum tersedia."; panel menawarkan "Tambah kajian" di setiap hari. (Tugas 16)

---

## Fase 1: Lapisan data dan komponen publik berbasis props

### Task 0: Titik awal (git lokal, perkakas verifikasi, tangkapan layar dasar)

**Files:**
- Git: membuat `.git` (hanya bila disetujui).
- Di scratchpad sesi, di luar repo: `pw-tools/` (paket), `verify/lib.mjs`, `verify/capture-baseline.mjs`, `baseline/*.png`.

**Interfaces:**
- Produces `verify/lib.mjs` (dipakai semua tugas verifikasi; jalur Edge dan caranya mengikuti memori `ui-verification-recipe`):
  - `startApp({ env, port = 3100 }): Promise<{ url: string; stop(): Promise<void> }>` menjalankan `npm run start` (butuh `npm run build` sebelumnya).
  - `launch(): Promise<Browser>`; `newPage(browser, { width, height, clock?, a11y?, cookies? }): Promise<Page>` (`a11y` ditulis ke `localStorage["ps:a11y:v1"]`, `clock` lewat `page.clock.setFixedTime`).
  - `signIn(context, { email, secret, url }): Promise<void>` memasang cookie `ps_admin` dengan format §9 (JWE `jose`, kunci SHA-256 dari rahasia).
  - `runAxe(page, { include? }): Promise<Violation[]>` (tag wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa); `noHorizontalScroll(page): Promise<boolean>`; `diffPng(a, b): number` (jumlah piksel berbeda, pixelmatch).

- [ ] **Step 1: (butuh persetujuan pemilik repo)** `git init`; pastikan `.gitignore` memuat `node_modules`, `.next`, `.env*`; `git add -A`; commit "chore: baseline sebelum panel pengurus"; `git switch -c fitur/panel-pengurus`.
- [ ] **Step 2:** Pasang `playwright-core axe-core jose pixelmatch pngjs` di `pw-tools` scratchpad (`npm --prefix <scratchpad>/pw-tools install ...`), tidak di repo.
- [ ] **Step 3:** Tulis `verify/lib.mjs` sesuai antarmuka di atas.
- [ ] **Step 4:** `npm run build`, lalu `capture-baseline.mjs` (memakai `startApp`): tangkapan layar elemen `#jadwal-hari-ini`, `#jadwal-mingguan`, `#pengumuman` (tab Kegiatan), dan `#pengumuman` (tab Pengumuman, setelah menekan tab) pada 375×812 dan 1280×900, jam dipalsukan `2026-10-06T05:30:00+07:00`, `reducedMotion: "reduce"`, `animations: "disabled"`. Hasil: 8 PNG di `baseline/`.
- [ ] **Step 5:** Jalankan `capture-baseline.mjs` sekali lagi ke folder lain. `diffPng` tiap pasangan harus 0; bila tidak, hilangkan sumber ketidakstabilan (misalnya tunggu `document.fonts.ready`) sampai 0.

### Task 1: Waktu WIB dan perkakas tes

**Files:**
- Modify: `lib/time.ts` (tambahan di akhir), `package.json` (skrip `test`, devDependency)
- Create: `vitest.config.ts`, `tests/helpers/empty.ts`, `tests/time.test.ts`

**Interfaces:**
- Produces (di `lib/time.ts`):
  ```ts
  export const DAY_SLUGS: readonly string[]; // indeks = DayIndex: ahad, senin, selasa, rabu, kamis, jumat, sabtu
  export function daySlug(day: DayIndex): string;
  export function dayFromSlug(slug: string): DayIndex | null;
  export function todayKey(date?: Date): string; // tanggal WIB "YYYY-MM-DD"
  export function addDaysToKey(dateKey: string, days: number): string;
  export function weekdayOfKey(dateKey: string): DayIndex;
  export function isValidDateKey(value: string): boolean; // tanggal kalender nyata, bentuk YYYY-MM-DD
  export function formatDateKeyLong(dateKey: string): string; // "Kamis, 15 Oktober 2026"
  ```

- [ ] **Step 1:** `npm i -D vitest@^5.0.3`; tambah skrip `"test": "vitest run"`; buat `vitest.config.ts` (lingkungan `node`, `include: ["tests/**/*.test.ts"]`, alias `@` ke akar proyek dan `server-only` ke `tests/helpers/empty.ts` yang berisi `export {};`).
- [ ] **Step 2: Tulis tes yang gagal** di `tests/time.test.ts`:
  ```ts
  it("todayKey memakai tanggal WIB, bukan UTC", () => {
    expect(todayKey(new Date("2026-10-09T16:59:59Z"))).toBe("2026-10-09");
    expect(todayKey(new Date("2026-10-09T17:00:00Z"))).toBe("2026-10-10"); // 00:00 WIB
  });
  it("addDaysToKey melewati batas bulan, tahun, dan kabisat", () => {
    expect(addDaysToKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToKey("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysToKey("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("weekdayOfKey dan formatDateKeyLong", () => {
    expect(weekdayOfKey("2026-10-11")).toBe(0); // Ahad
    expect(formatDateKeyLong("2026-10-15")).toBe("Kamis, 15 Oktober 2026");
  });
  it("isValidDateKey menolak tanggal yang tidak ada", () => {
    for (const salah of ["2026-02-30", "2026-13-01", "2026-1-5", ""]) expect(isValidDateKey(salah)).toBe(false);
    expect(isValidDateKey("2028-02-29")).toBe(true);
  });
  it("slug hari", () => {
    expect(daySlug(0)).toBe("ahad");
    expect(dayFromSlug("jumat")).toBe(5);
    expect(dayFromSlug("minggu")).toBeNull();
  });
  ```
- [ ] **Step 3:** `npm test` → gagal (fungsi belum ada).
- [ ] **Step 4:** Implementasikan fungsi di atas di `lib/time.ts`; aritmetika memakai `Date.UTC` (bukan `Intl`), `todayKey` memakai `getWibParts` dan `toDateKey` yang ada.
- [ ] **Step 5:** `npm test` lulus, lalu gerbang standar.
- [ ] **Step 6: Commit** "feat(waktu): kunci tanggal WIB, slug hari, dan perkakas tes".

### Task 2: Tipe dan jadwal efektif

**Files:**
- Modify: `types/index.ts`, `lib/schedule.ts`, `components/TodaySchedule.tsx` (hanya pemanggilan `nextSessionAfterToday` di `TodayContent`)
- Test: `tests/schedule.test.ts`

**Interfaces:**
- Consumes: `addDaysToKey`, `daySlug`, `getWibParts` (Tugas 1).
- Produces:
  ```ts
  // types/index.ts
  export type ImagePosition = "top" | "center" | "bottom";
  export interface SessionOverride { date: string; kind: "libur" | "ganti"; note?: string;
    session?: { startTime: string; endTime: string; ustadz: string; topic: string; mode: SessionMode; location?: string } }
  export type SectionKey = "schedule" | "announcements";
  export interface PublicContent { schedule: ScheduleData; announcements: AnnouncementData; generatedAt: string }
  // StudySession dan AnnouncementItem: imagePosition?: ImagePosition; ScheduleData: overrides?: SessionOverride[]

  // lib/schedule.ts
  export type EffectiveStatus = "regular" | "changed" | "cancelled" | "none";
  export interface EffectiveSession { status: EffectiveStatus; session: StudySession | null; note?: string }
  export function effectiveSessionOn(dateKey: string, weekday: DayIndex, sessions: readonly StudySession[], overrides: readonly SessionOverride[]): EffectiveSession;
  export function weekDateKeys(parts: Pick<WibParts, "year" | "month" | "day" | "weekday">): Record<DayIndex, string>;
  export function nextSessionAfterToday(sessions: readonly StudySession[], overrides: readonly SessionOverride[], now: WibParts):
    { session: StudySession; daysAhead: number; dateKey: string; status: "regular" | "changed"; note?: string } | null;
  export function overridesFrom(overrides: readonly SessionOverride[], fromKey: string): SessionOverride[];
  ```
  Kajian "ganti" mendapat `id: "ganti-" + dateKey`, `day: weekday`, dan mewarisi `imageUrl`, `imageAlt`, `imagePosition` dari jadwal tetap hari yang sama.

- [ ] **Step 1: Tulis tes yang gagal** di `tests/schedule.test.ts` (fixture di atas tes):
  ```ts
  const DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];
  const sesi = (day: DayIndex): StudySession => ({ id: daySlug(day), day, startTime: "05:00", endTime: "06:00",
    ustadz: `Ustadz ${day}`, topic: `Tema ${day}`, mode: "masjid", imageUrl: `/kajian/${day}.jpg` });
  const SESSIONS = DAYS.map(sesi);
  const libur = (date: string, note?: string): SessionOverride => ({ date, kind: "libur", note });
  const ganti = (date: string): SessionOverride => ({ date, kind: "ganti", note: "Pengganti",
    session: { startTime: "06:00", endTime: "07:00", ustadz: "Ustadz Tamu", topic: "Tema Tamu", mode: "zoom" } });
  const wib = (key: string) => getWibParts(new Date(`${key}T05:00:00+07:00`));

  it("libur mengalahkan jadwal tetap", () => {
    expect(effectiveSessionOn("2026-10-15", 4, SESSIONS, [libur("2026-10-15", "Ustadz berhalangan hadir")]))
      .toEqual({ status: "cancelled", session: null, note: "Ustadz berhalangan hadir" });
  });
  it("ganti memakai isi pengganti dan mewarisi foto jadwal tetap", () => {
    const e = effectiveSessionOn("2026-10-15", 4, SESSIONS, [ganti("2026-10-15")]);
    expect(e.status).toBe("changed");
    expect(e.session).toMatchObject({ day: 4, startTime: "06:00", ustadz: "Ustadz Tamu", mode: "zoom", imageUrl: "/kajian/4.jpg" });
    expect(e.note).toBe("Pengganti");
  });
  it("ganti pada hari tanpa jadwal tetap menjadi kajian tambahan", () => {
    const e = effectiveSessionOn("2026-10-11", 0, SESSIONS.filter((s) => s.day !== 0), [ganti("2026-10-11")]);
    expect(e.status).toBe("changed");
    expect(e.session?.imageUrl).toBeUndefined();
  });
  it("tanpa pengecualian: regular atau none; pengecualian tanggal lain diabaikan", () => {
    expect(effectiveSessionOn("2026-10-15", 4, SESSIONS, [libur("2026-10-16")]).status).toBe("regular");
    expect(effectiveSessionOn("2026-10-15", 4, [], []).status).toBe("none");
  });
  it("weekDateKeys: Senin sampai Ahad pekan berjalan", () => {
    const rabu = weekDateKeys(wib("2026-10-07"));
    expect([rabu[1], rabu[3], rabu[0]]).toEqual(["2026-10-05", "2026-10-07", "2026-10-11"]);
    expect(weekDateKeys(wib("2026-10-11"))[1]).toBe("2026-10-05"); // Ahad masih pekan yang sama
    expect(weekDateKeys(wib("2026-10-12"))[1]).toBe("2026-10-12");
    const akhirTahun = weekDateKeys(wib("2026-12-31"));
    expect([akhirTahun[1], akhirTahun[0]]).toEqual(["2026-12-28", "2027-01-03"]);
  });
  it("nextSessionAfterToday melewati hari libur dan membawa status pengganti", () => {
    const lewat = nextSessionAfterToday(SESSIONS, [libur("2026-10-07")], wib("2026-10-06"));
    expect(lewat).toMatchObject({ daysAhead: 2, dateKey: "2026-10-08", status: "regular" });
    expect(lewat?.session.day).toBe(4);
    expect(nextSessionAfterToday(SESSIONS, [ganti("2026-10-07")], wib("2026-10-06")))
      .toMatchObject({ daysAhead: 1, status: "changed", note: "Pengganti" });
  });
  it("nextSessionAfterToday: Sabtu ke Ahad; null bila tak ada kajian", () => {
    expect(nextSessionAfterToday(SESSIONS, [], wib("2026-10-10"))?.session.day).toBe(0);
    expect(nextSessionAfterToday([], [], wib("2026-10-10"))).toBeNull();
  });
  it("overridesFrom menyaring tanggal sebelum batas", () => {
    expect(overridesFrom([libur("2026-10-01"), libur("2026-10-05"), libur("2026-10-09")], "2026-10-05").map((o) => o.date))
      .toEqual(["2026-10-05", "2026-10-09"]);
  });
  ```
- [ ] **Step 2:** `npm test -- tests/schedule.test.ts` → gagal.
- [ ] **Step 3:** Tambahkan tipe di `types/index.ts`; implementasikan fungsi di `lib/schedule.ts`. `nextSessionAfterToday` berganti urutan argumen, jadi ubah pemanggilannya di `TodayContent` menjadi `nextSessionAfterToday(SCHEDULE.sessions, [], now)` agar web tetap terbangun.
- [ ] **Step 4:** `npm test` lulus, lalu gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(jadwal): jadwal efektif dengan pengecualian per tanggal".

### Task 3: Penyimpanan konten: tipe, data awal, MemoryStore, tes kontrak

**Files:**
- Create: `lib/store/types.ts`, `lib/store/seed.ts`, `lib/store/memory.ts`, `tests/store.contract.ts`, `tests/store.memory.test.ts`

**Interfaces:**
- Consumes: tipe Tugas 2; `SCHEDULE`, `ANNOUNCEMENTS` dari `data/content.ts`; `daySlug`.
- Produces:
  ```ts
  // lib/store/types.ts
  export interface SessionInput { startTime: string; endTime: string; ustadz: string; topic: string; mode: SessionMode;
    location?: string; imageUrl?: string; imageAlt?: string; imagePosition: ImagePosition }
  export interface AnnouncementInput { id: string; type: AnnouncementType; title: string; date: string; /* YYYY-MM-DD */
    time?: string; /* HH:mm */ excerpt: string; imageUrl?: string; imageAlt?: string; imagePosition: ImagePosition; href?: string }
  export interface ContentStore {
    isReady(): Promise<boolean>;
    setup(): Promise<void>;
    readPublic(sinceKey: string): Promise<Omit<PublicContent, "generatedAt">>;
    listSessions(): Promise<StudySession[]>;
    getSession(day: DayIndex): Promise<StudySession | null>;
    saveSession(day: DayIndex, input: SessionInput): Promise<{ previousImageUrl: string | null }>;
    deleteSession(day: DayIndex): Promise<{ previousImageUrl: string | null }>;
    listOverrides(fromKey: string): Promise<SessionOverride[]>; // urut tanggal naik
    getOverride(date: string): Promise<SessionOverride | null>;
    saveOverride(input: SessionOverride): Promise<void>; // upsert per tanggal; "ganti" tanpa session ditolak
    deleteOverride(date: string): Promise<void>;
    listAnnouncements(): Promise<AnnouncementItem[]>;
    getAnnouncement(id: string): Promise<AnnouncementItem | null>;
    saveAnnouncement(input: AnnouncementInput): Promise<{ previousImageUrl: string | null }>; // upsert per id
    deleteAnnouncement(id: string): Promise<{ previousImageUrl: string | null }>;
    getSampleFlags(): Promise<Record<SectionKey, boolean>>;
    setSampleFlag(section: SectionKey, isSample: boolean): Promise<void>;
  }
  // lib/store/seed.ts
  export interface SeedData { sessions: { day: DayIndex; input: SessionInput }[]; announcements: AnnouncementInput[]; flags: Record<SectionKey, boolean> }
  export function buildSeed(): SeedData; // dari data/content.ts; tanggal "…T05:00:00+07:00" dipecah menjadi date dan time
  // lib/store/memory.ts
  export class MemoryStore implements ContentStore { constructor(opts?: { seeded?: boolean }) } // seeded=true: sudah ready
  // tests/store.contract.ts
  export function runStoreContract(label: string, create: () => Promise<ContentStore>): void; // create() mengembalikan store yang BELUM setup
  ```
  Kajian dan pengumuman dari store memakai bentuk `StudySession` (id = slug hari) dan `AnnouncementItem` (`date` = `"YYYY-MM-DD"` atau `"YYYY-MM-DDTHH:mm:00+07:00"`). `saveSession` menolak `endTime <= startTime` dan jam bukan `HH:mm` (galat `Error`), sama seperti batasan CHECK di SQL.

- [ ] **Step 1: Tulis tes kontrak yang gagal** di `tests/store.contract.ts` dan `tests/store.memory.test.ts` (`runStoreContract("MemoryStore", async () => new MemoryStore({ seeded: false }))`). Fixture: `SESI: SessionInput` (05:00–06:00, "Ustadz A", masjid, `imagePosition: "center"`) dan `P: AnnouncementInput` (`id: "p1"`, `type: "pengumuman"`, `date: "2026-10-09"`). Tes:
  - isReady false sebelum `setup()`, true sesudahnya; `setup()` dua kali tetap menghasilkan 7 kajian (id `senin`..`ahad`), 4 pengumuman, flag `{ schedule: true, announcements: true }`.
  - `saveSession(4, { ...SESI, imageUrl: "https://h/a.webp" })` mengembalikan `previousImageUrl: null`; simpan lagi dengan `https://h/b.webp` mengembalikan `"https://h/a.webp"`; `getSession(4)` memuat topik dan `imagePosition`. `deleteSession(2)` menghapus dan mengembalikan foto lama; `getSession(2)` null.
  - `saveSession(1, { ...SESI, startTime: "06:00", endTime: "06:00" })` ditolak; `startTime: "5:00"` ditolak.
  - Pengecualian: simpan `libur` lalu `ganti` pada tanggal sama → `listOverrides("2026-10-01")` berisi satu butir berjenis `ganti`; `ganti` tanpa `session` ditolak; `listOverrides("2026-10-16")` tidak memuat tanggal 15; hasil urut naik; `deleteOverride` menghapus.
  - Pengumuman: `saveAnnouncement(P)` dua kali → `listAnnouncements()` berisi 5 butir (4 awal + 1), bukan 6; panggilan kedua mengembalikan foto lama; dengan `time: "05:30"` → `getAnnouncement("p1")?.date` sama dengan `"2026-10-09T05:30:00+07:00"`, tanpa jam `"2026-10-09"`; `deleteAnnouncement` mengembalikan foto lama.
  - `setSampleFlag("schedule", false)` → `getSampleFlags()` memberi `{ schedule: false, announcements: true }`.
  - `readPublic("2026-10-15")` memuat 7 kajian, hanya pengecualian ≥ batas, 4+ pengumuman, dan `isSample` sesuai flag.
- [ ] **Step 2:** `npm test -- tests/store.memory.test.ts` → gagal (modul belum ada).
- [ ] **Step 3:** Implementasikan `types.ts`, `seed.ts`, `memory.ts` (Map di dalam kelas; `setup()` mengisi dari `buildSeed()` bila belum terisi).
- [ ] **Step 4:** Tes lulus; gerbang standar.
- [ ] **Step 5: Commit** "feat(penyimpanan): antarmuka ContentStore, data awal, dan MemoryStore".

### Task 4: SqlStore, klien Neon, dan pemilih penyimpanan

**Files:**
- Create: `lib/store/schema.ts`, `lib/store/sql.ts`, `lib/store/index.ts`, `tests/helpers/pglite-client.ts`, `tests/store.sql.test.ts`, `tests/store-select.test.ts`
- Modify: `package.json` (`@neondatabase/serverless`, `server-only`; dev `@electric-sql/pglite`)

**Interfaces:**
- Consumes: `ContentStore`, `SessionInput`, `AnnouncementInput`, `buildSeed`, `MemoryStore` (Tugas 3); `runStoreContract`.
- Produces:
  ```ts
  // lib/store/schema.ts
  export const SCHEMA_STATEMENTS: string[]; // persis DDL §5 (empat tabel + indeks), semua IF NOT EXISTS
  // lib/store/sql.ts
  export interface SqlClient {
    query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
    transaction(statements: { text: string; params?: unknown[] }[]): Promise<Record<string, unknown>[][]>;
  }
  export class SqlStore implements ContentStore { constructor(client: SqlClient) }
  export function createNeonClient(connectionString: string): SqlClient; // neon(); sql.query dan sql.transaction
  // lib/store/index.ts
  export function getStore(env?: NodeJS.ProcessEnv): ContentStore | null; // import "server-only"
  // tests/helpers/pglite-client.ts
  export async function createPgliteClient(): Promise<SqlClient & { close(): Promise<void> }>;
  ```
  Aturan `getStore`: `CONTENT_STORE=memory` memberi `MemoryStore({ seeded: true })` tunggal di `globalThis` (galat bila `VERCEL` terisi); jika tidak, `DATABASE_URL` memberi `SqlStore(createNeonClient(url))` (tanpa membuka koneksi saat dibuat); jika tidak ada keduanya, `null`. Semua kolom `date` dipilih sebagai teks (`date::text`, `event_date::text`). `isReady()` memakai `to_regclass('public.section_meta')` lalu memeriksa isi tabel, dan tidak melempar bila tabel belum ada.

- [ ] **Step 1:** `npm i @neondatabase/serverless@^1.2.0 server-only@^0.0.1` dan `npm i -D @electric-sql/pglite@^0.5.8`.
- [ ] **Step 2: Tulis tes yang gagal:**
  - `tests/store.sql.test.ts`: `runStoreContract("SqlStore (PGlite)", async () => new SqlStore(await createPgliteClient()))` ditambah: `isReady()` bernilai false pada database kosong tanpa melempar; kolom tanggal pengumuman terbaca `YYYY-MM-DD`; langsung lewat `client.query`, `INSERT` ke `sessions` dengan `day = 7`, `mode = 'x'`, `image_position = 'left'`, atau `end_time <= start_time` ditolak CHECK; `INSERT` ke `session_overrides` dengan `kind = 'ganti'` tanpa `topic` ditolak.
  - `tests/store-select.test.ts`: `getStore({})` null; `getStore({ CONTENT_STORE: "memory" })` instance `MemoryStore` dan dua panggilan mengembalikan objek yang sama; `getStore({ CONTENT_STORE: "memory", VERCEL: "1" })` melempar; `getStore({ DATABASE_URL: "postgresql://u:p@h/db" })` instance `SqlStore`; bila keduanya ada, `memory` menang.
- [ ] **Step 3:** `npm test` → gagal.
- [ ] **Step 4:** Implementasikan `schema.ts`, `sql.ts`, `index.ts`, dan `pglite-client.ts` (PGlite dalam memori; `transaction` memakai `db.transaction`).
- [ ] **Step 5:** `npm test` lulus; gerbang standar.
- [ ] **Step 6: Commit** "feat(penyimpanan): SqlStore untuk Neon, skema, dan pemilih penyimpanan".

### Task 5: Pembaca konten publik

**Files:**
- Create: `lib/content.ts`, `tests/content.test.ts`

**Interfaces:**
- Consumes: `getStore`, `ContentStore` (Tugas 3 dan 4); `todayKey`, `addDaysToKey` (Tugas 1); `SCHEDULE`, `ANNOUNCEMENTS`.
- Produces:
  ```ts
  export function snapshotContent(now: Date): PublicContent; // salinan content.ts, overrides [], generatedAt = now.toISOString()
  export async function loadPublicContent(deps?: { store?: ContentStore | null; now?: Date }): Promise<PublicContent>;
  ```
  Perilaku: tanpa penyimpanan (`null`) atau `isReady()` false → `snapshotContent`; selain itu `readPublic(addDaysToKey(todayKey(now), -7))` lalu `generatedAt`. Galat dari penyimpanan dilempar, tidak ditelan. Bila `deps.store` tidak diberikan, memakai `getStore()`.

- [ ] **Step 1: Tulis tes yang gagal** (`NOW = new Date("2026-10-09T18:30:00Z")`, yaitu 01:30 WIB tanggal 10 Oktober):
  ```ts
  it("tanpa penyimpanan: salinan content.ts", async () => {
    const c = await loadPublicContent({ store: null, now: NOW });
    expect(c.schedule.sessions).toHaveLength(7); expect(c.announcements.items).toHaveLength(4);
    expect(c.schedule.isSample).toBe(true); expect(c.schedule.overrides ?? []).toEqual([]);
    expect(c.generatedAt).toBe(NOW.toISOString());
  });
  it("penyimpanan belum siap: salinan content.ts", async () => { /* isReady: async () => false */ });
  it("penyimpanan siap: batas 7 hari ke belakang dihitung dari tanggal WIB", async () => {
    const readPublic = vi.fn(async () => ({ schedule: { sessions: [], overrides: [] }, announcements: { items: [] } }));
    await loadPublicContent({ store: { isReady: async () => true, readPublic } as unknown as ContentStore, now: NOW });
    expect(readPublic).toHaveBeenCalledWith("2026-10-03");
  });
  it("galat penyimpanan tidak ditelan", async () => {
    const store = { isReady: async () => true, readPublic: async () => { throw new Error("db"); } } as unknown as ContentStore;
    await expect(loadPublicContent({ store, now: NOW })).rejects.toThrow("db");
  });
  ```
- [ ] **Step 2:** `npm test -- tests/content.test.ts` → gagal.
- [ ] **Step 3:** Implementasikan `lib/content.ts`.
- [ ] **Step 4:** Tes lulus; gerbang standar.
- [ ] **Step 5: Commit** "feat(konten): pembaca konten publik dengan cadangan content.ts".

### Task 6: Komponen publik menerima props (tampilan identik)

**Files:**
- Modify: `app/page.tsx`, `components/TodaySchedule.tsx`, `components/WeeklySchedule.tsx`, `components/Announcements.tsx`, `components/ui/CardImage.tsx`

**Interfaces:**
- Consumes: `loadPublicContent` (Tugas 5), `ImagePosition` (Tugas 2).
- Produces:
  ```tsx
  export function TodaySchedule(props: { schedule: ScheduleData }): JSX.Element;
  export function TodayCard(props: { session: StudySession; status: SessionStatus }): JSX.Element;   // dari TodaySchedule.tsx
  export function WeeklySchedule(props: { schedule: ScheduleData }): JSX.Element;
  export function WeekCard(props: { session: StudySession; isToday: boolean; as?: "li" | "div" }): JSX.Element; // dari WeeklySchedule.tsx; default "li"
  export function Announcements(props: { data: AnnouncementData }): JSX.Element;
  export function AnnouncementCard(props: { item: AnnouncementItem }): JSX.Element;               // sebelumnya Kartu
  // CardImage: properti baru position?: ImagePosition -> kelas object-top | object-center | object-bottom (bawaan center)
  ```

- [ ] **Step 1:** Ubah `TodaySchedule`, `WeeklySchedule`, dan `Announcements` menerima data lewat props dan hapus impor `SCHEDULE` dan `ANNOUNCEMENTS` dari komponen. Di `WeeklySchedule`, `WEEK` dihitung di dalam komponen dari `schedule.sessions`; ekstrak isi `<li>` menjadi `WeekCard` (elemen, kelas, dan `aria-current` identik).
- [ ] **Step 2:** Tambahkan `[overflow-wrap:anywhere]` pada judul, ringkasan, tema, dan nama ustadz di keempat kartu (tidak mengubah teks biasa); tambahkan properti `position` pada `CardImage`.
- [ ] **Step 3:** `app/page.tsx` menjadi `async`, mengekspor `export const revalidate = 3600`, memanggil `loadPublicContent()`, dan mengirim `schedule` dan `data`.
- [ ] **Step 4:** Gerbang standar. Tabel keluaran `npm run build` menampilkan `/` sebagai statis (`○`) dengan revalidasi 1 jam.
- [ ] **Step 5: Verifikasi piksel.** Jalankan `capture-baseline.mjs` lagi ke folder baru; `diffPng` terhadap `baseline/` harus 0 untuk kedelapan gambar. Bila ada selisih, perbaiki sampai 0.
- [ ] **Step 6: Commit** "refactor(web): komponen jadwal dan pengumuman menerima data lewat props".

---

## Fase 2: Login dan kerangka panel

### Task 7: Inti login: daftar email dan sesi terenkripsi

**Files:**
- Create: `lib/auth/allowlist.ts`, `lib/auth/session.ts`, `tests/session.test.ts`
- Modify: `package.json` (`jose`)

**Interfaces:**
- Produces:
  ```ts
  // allowlist.ts
  export function parseAllowlist(raw: string | undefined): string[]; // huruf kecil, pisah koma atau spasi, tanpa duplikat dan kosong
  export function isAllowed(email: string, allowlist: readonly string[]): boolean; // persis, huruf kecil
  // session.ts
  export const SESSION_COOKIE = "ps_admin";
  export const SESSION_MAX_AGE_S: number; // 14 * 24 * 60 * 60
  export interface AdminSession { email: string; name?: string; sub: string }
  export function isSecretUsable(secret: string | undefined): boolean; // panjang >= 32
  export async function sealSession(session: AdminSession, secret: string, now?: Date): Promise<string>; // melempar bila rahasia tak layak
  export async function openSession(token: string | undefined, secret: string | undefined, allowlist: readonly string[], now?: Date): Promise<AdminSession | null>;
  ```

- [ ] **Step 1:** `npm i jose@^6.2.12`.
- [ ] **Step 2: Tulis tes yang gagal:**
  ```ts
  const SECRET = "x".repeat(32); const ADMIN = { email: "rizky@gmail.com", name: "Rizky", sub: "123" };
  const NOW = new Date("2026-10-09T05:00:00Z");
  it("seal lalu open mengembalikan sesi yang sama", async () => {
    const token = await sealSession(ADMIN, SECRET, NOW);
    expect(await openSession(token, SECRET, ["rizky@gmail.com"], NOW)).toMatchObject(ADMIN);
  });
  it("menolak token rusak, rahasia salah, kedaluwarsa, email dicabut, atau token kosong", async () => {
    const token = await sealSession(ADMIN, SECRET, NOW);
    const ok = ["rizky@gmail.com"];
    expect(await openSession(token.slice(0, -2) + "xx", SECRET, ok, NOW)).toBeNull();
    expect(await openSession(token, "y".repeat(32), ok, NOW)).toBeNull();
    expect(await openSession(token, SECRET, ok, new Date(NOW.getTime() + (14 * 24 * 3600 + 1) * 1000))).toBeNull();
    expect(await openSession(token, SECRET, ["lain@gmail.com"], NOW)).toBeNull();
    expect(await openSession(undefined, SECRET, ok, NOW)).toBeNull();
  });
  it("rahasia pendek ditolak", async () => {
    await expect(sealSession(ADMIN, "pendek", NOW)).rejects.toThrow();
    expect(await openSession("apa-saja", "pendek", ["rizky@gmail.com"], NOW)).toBeNull();
    expect([isSecretUsable("x".repeat(31)), isSecretUsable(SECRET)]).toEqual([false, true]);
  });
  it("parseAllowlist dan isAllowed", () => {
    expect(parseAllowlist(" Rizky@Gmail.com, lain@x.id  rizky@gmail.com ,, ")).toEqual(["rizky@gmail.com", "lain@x.id"]);
    expect(parseAllowlist(undefined)).toEqual([]);
    expect(isAllowed("RIZKY@gmail.com", ["rizky@gmail.com"])).toBe(true);
  });
  ```
- [ ] **Step 3:** `npm test -- tests/session.test.ts` → gagal.
- [ ] **Step 4:** Implementasikan kedua berkas. Kedaluwarsa memakai klaim `exp` (`now` + `SESSION_MAX_AGE_S`); `openSession` memakai opsi `currentDate: now` pada `jwtDecrypt`; email dibandingkan dengan `isAllowed`.
- [ ] **Step 5:** Tes lulus; gerbang standar.
- [ ] **Step 6: Commit** "feat(auth): daftar email dan sesi terenkripsi".

### Task 8: Login Google (klaim, alamat balik, rute OAuth)

**Files:**
- Create: `lib/auth/google.ts`, `app/admin/auth/google/route.ts`, `app/admin/auth/google/callback/route.ts`, `tests/google.test.ts`
- Modify: `package.json` (`arctic`)

**Interfaces:**
- Consumes: `AdminSession`, `isAllowed`, `parseAllowlist`, `sealSession`, `SESSION_COOKIE`, `SESSION_MAX_AGE_S` (Tugas 7).
- Produces:
  ```ts
  export const OAUTH_STATE_COOKIE = "ps_oauth_state"; export const OAUTH_VERIFIER_COOKIE = "ps_oauth_verifier";
  export function redirectUri(env?: NodeJS.ProcessEnv): string; // {asal}/admin/auth/google/callback
  export function googleClient(env?: NodeJS.ProcessEnv): Google | null; // null bila AUTH_GOOGLE_ID atau AUTH_GOOGLE_SECRET kosong
  export function validateGoogleClaims(claims: Record<string, unknown>, opts: { clientId: string; allowlist: readonly string[]; now?: Date }):
    { ok: true; session: AdminSession } | { ok: false; reason: "tidak-terdaftar" | "gagal" };
  ```
  Rute `GET /admin/auth/google` membuat `state` dan `codeVerifier` (`generateState`, `generateCodeVerifier`), menaruhnya di cookie OAuth, lalu mengarahkan ke `createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"])`. Rute callback: `error` dari Google → `/admin/masuk?galat=ditolak`; `state` tidak cocok atau pertukaran gagal → `?galat=gagal`; klaim ditolak → `?galat=` sesuai alasan; sukses → pasang cookie `ps_admin` lalu ke `/admin`. Cookie OAuth selalu dihapus.

- [ ] **Step 1:** `npm i arctic@^3.7.0`.
- [ ] **Step 2: Tulis tes yang gagal** di `tests/google.test.ts` (`NOW`, `BASE = { iss: "https://accounts.google.com", aud: "klien-id", exp: detik(NOW) + 3600, email: "Rizky@Gmail.com", email_verified: true, name: "Rizky", sub: "123" }`, `OPTS = { clientId: "klien-id", allowlist: ["rizky@gmail.com"], now: NOW }`):
  ```ts
  it("klaim sah menjadi sesi dengan email huruf kecil", () => {
    expect(validateGoogleClaims(BASE, OPTS)).toEqual({ ok: true, session: { email: "rizky@gmail.com", name: "Rizky", sub: "123" } });
  });
  it("iss dengan atau tanpa https:// sah, iss lain gagal", () => {
    expect(validateGoogleClaims({ ...BASE, iss: "accounts.google.com" }, OPTS).ok).toBe(true);
    expect(validateGoogleClaims({ ...BASE, iss: "https://evil.example" }, OPTS)).toEqual({ ok: false, reason: "gagal" });
  });
  it("aud salah, exp lewat, atau email belum terverifikasi gagal", () => {
    for (const salah of [{ aud: "lain" }, { exp: detik(NOW) - 1 }, { email_verified: false }])
      expect(validateGoogleClaims({ ...BASE, ...salah }, OPTS)).toEqual({ ok: false, reason: "gagal" });
  });
  it("email tidak terdaftar", () => {
    expect(validateGoogleClaims({ ...BASE, email: "lain@x.id" }, OPTS)).toEqual({ ok: false, reason: "tidak-terdaftar" });
  });
  it("redirectUri: NEXT_PUBLIC_SITE_URL, lalu VERCEL_PROJECT_PRODUCTION_URL, lalu localhost", () => {
    expect(redirectUri({ NEXT_PUBLIC_SITE_URL: "https://situs.id/" })).toBe("https://situs.id/admin/auth/google/callback");
    expect(redirectUri({ VERCEL_PROJECT_PRODUCTION_URL: "ps.vercel.app" })).toBe("https://ps.vercel.app/admin/auth/google/callback");
    expect(redirectUri({})).toBe("http://localhost:3000/admin/auth/google/callback");
  });
  ```
- [ ] **Step 3:** `npm test -- tests/google.test.ts` → gagal.
- [ ] **Step 4:** Implementasikan `lib/auth/google.ts` dan kedua rute (cookie OAuth: HttpOnly, `maxAge` 600, `path: "/admin/auth"`, `secure` di produksi, `sameSite: "lax"`).
- [ ] **Step 5:** Tes lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 6: Verifikasi rute (harness, tanpa Google):** dengan `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET` palsu, `GET /admin/auth/google` (tanpa mengikuti redirect) membalas 302 ke `https://accounts.google.com/...` yang memuat `code_challenge_method=S256` dan `scope=openid email profile`, dengan dua cookie OAuth HttpOnly `Max-Age=600; Path=/admin/auth`. Callback dengan `?error=access_denied` → `/admin/masuk?galat=ditolak`; callback dengan `state` tidak cocok → `?galat=gagal`. Tanpa kredensial, `GET /admin/auth/google` → `?galat=gagal`.
- [ ] **Step 7: Commit** "feat(auth): login Google dengan PKCE dan daftar email".

### Task 9: Penjaga akses, proxy, kerangka panel, layar masuk

**Files:**
- Create: `lib/auth/guard.ts`, `proxy.ts`, `app/admin/layout.tsx`, `app/admin/loading.tsx`, `app/admin/masuk/page.tsx`, `components/admin/AdminShell.tsx`, `app/admin/actions/sesi.ts`
- Modify: `next.config.ts` (header `/admin/:path*` sesuai kendala 12)

**Interfaces:**
- Consumes: `openSession`, `parseAllowlist`, `isSecretUsable`, `SESSION_COOKIE` (Tugas 7); `AccessibilityBar` yang ada.
- Produces:
  ```ts
  // lib/auth/guard.ts (import "server-only")
  export function isAuthConfigured(): boolean; // SESSION_SECRET layak pakai
  export async function getAdmin(): Promise<AdminSession | null>;
  export async function requireAdmin(): Promise<AdminSession>; // redirect ke /admin/masuk, atau /admin/masuk?galat=sesi-habis bila cookie ada tetapi tak sah
  // app/admin/actions/sesi.ts ("use server")
  export async function keluar(): Promise<void>; // hapus cookie, redirect /admin/masuk
  export async function masukPengembang(): Promise<void>; // hanya NODE_ENV === "development": sesi untuk email pertama ADMIN_EMAILS
  ```
  `AdminShell` menampilkan header (nama panel, tautan "Bantuan" ke `https://wa.me/{ADMIN_HELP_WHATSAPP}?text=...` bila variabel ada, tombol "Keluar" berbentuk `<form>` yang terpisah secara visual), tautan "Kembali ke Panel" pada layar dalam, dan `<main id="utama" tabIndex={-1}>`. Layout memasang `AccessibilityBar`, `metadata.robots = { index: false, follow: false }`, dan judul "Panel Pengurus". `app/admin/loading.tsx`: kerangka dengan `role="status"` dan teks "Memuat...".

- [ ] **Step 1: Tulis skenario verifikasi yang gagal** `verify/scenarios/auth.mjs` (env: `SESSION_SECRET` 32+ karakter, `ADMIN_EMAILS=rizky@gmail.com`, `CONTENT_STORE=memory`, `ADMIN_HELP_WHATSAPP=6281200000000`; `npm run build` lalu `startApp`):
  - `GET /admin` tanpa cookie → redirect ke `/admin/masuk`; halaman memuat tombol "Masuk dengan Google" dan kalimat bantuan; keempat nilai `?galat=` menampilkan teks persis dari bagian "Keputusan pelaksanaan".
  - Dengan `signIn` sah → `/admin` 200 dan header memuat "Bantuan" (tautan wa.me) serta tombol "Keluar"; menekan "Keluar" menghapus cookie dan kembali ke `/admin/masuk`.
  - Cookie dengan rahasia salah, atau email yang tidak ada di `ADMIN_EMAILS` → redirect ke `/admin/masuk?galat=sesi-habis`.
  - Tanpa `SESSION_SECRET` → `/admin/masuk` menampilkan "Panel belum dikonfigurasi." tanpa tombol masuk.
  - Header respons `/admin/masuk`: `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store`, `X-Frame-Options: DENY`.
  - axe nol pelanggaran pada `/admin/masuk` dan `/admin` pada 375 dan 1280 px, juga dengan ukuran huruf 4, kontras tinggi, dan Tampilan Sederhana.
- [ ] **Step 2:** Jalankan → gagal (halaman belum ada).
- [ ] **Step 3:** Implementasikan `guard.ts`, `proxy.ts` (matcher dan pengecualian sesuai kendala 12), layout, loading, halaman masuk, `AdminShell`, `sesi.ts`, dan header di `next.config.ts`. Tombol "Masuk mode pengembang" hanya dirender bila `process.env.NODE_ENV === "development"`.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(panel): penjaga akses, proxy, kerangka panel, dan layar masuk".

### Task 10: Beranda panel dan "Siapkan database"

**Files:**
- Create: `app/admin/page.tsx`, `lib/admin/context.ts`, `app/admin/actions/setup.ts`, `components/admin/StoreNotice.tsx`

**Interfaces:**
- Consumes: `requireAdmin` (Tugas 9), `getStore`, `ContentStore` (Tugas 3 dan 4), `buttonClass` yang ada.
- Produces:
  ```ts
  // lib/admin/context.ts
  export interface AdminContext { admin: AdminSession; store: ContentStore | null; ready: boolean }
  export async function loadAdminContext(): Promise<AdminContext>; // requireAdmin() + getStore() + store.isReady()
  // app/admin/actions/setup.ts ("use server")
  export async function siapkanDatabase(): Promise<void>; // requireAdmin, store.setup(), revalidatePath("/"), redirect("/admin?hasil=tersimpan")
  // components/admin/StoreNotice.tsx
  export function StoreNotice(props: { state: "missing" | "not-ready" }): JSX.Element; // missing: "Database belum dipasang. Hubungi pengelola web."; not-ready: "Database belum disiapkan." + tombol "Siapkan database"
  ```
  Beranda: dua kartu besar ("Jadwal Kajian" ke `/admin/jadwal`: "Ubah jam, ustadz, tema; liburkan atau ganti satu tanggal"; "Kegiatan dan Pengumuman" ke `/admin/pengumuman`: "Tambah, ubah, atau hapus"), tombol "Lihat web" ke `/`. Saat `store` null atau belum siap, kartu menjadi elemen nonaktif (`aria-disabled`, bukan tautan) dan `StoreNotice` tampil.

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/beranda.mjs`): (a) `CONTENT_STORE=memory` + sesi sah: dua kartu berupa tautan ke `/admin/jadwal` dan `/admin/pengumuman`, tombol "Lihat web"; tanpa `StoreNotice`. (b) Tanpa `CONTENT_STORE` dan `DATABASE_URL`: "Database belum dipasang. Hubungi pengelola web." dan kartu nonaktif. (c) axe nol pelanggaran pada 375 dan 1280 px (huruf 4, kontras tinggi, Tampilan Sederhana). Skenario "Siapkan database" yang sebenarnya diuji di Tugas 11.
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan ketiga berkas dan `StoreNotice`.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(panel): beranda panel dan penyiapan database".

### Task 11: Bukti Neon tiruan: database kosong, penyiapan, dan halaman utama tetap statis

**Files:**
- Hanya di scratchpad: `verify/neon-mock.mjs`, `verify/scenarios/neon.mjs`. Tidak ada perubahan di repo.

**Interfaces:**
- Consumes: `SqlStore`, `createNeonClient` (Tugas 4), `siapkanDatabase` dan beranda (Tugas 10), `signIn`, `startApp` (Tugas 0).
- Produces: bukti bahwa jalur produksi (driver HTTP Neon) menjaga `/` tetap statis dan mengisi data dari SQL yang sama dengan tes.

- [ ] **Step 1:** Tulis `neon-mock.mjs`: server HTTPS di `localhost` (sertifikat swatandatangani) yang menjawab protokol HTTP driver Neon (`POST /sql`, satu kueri dan transaksi; baca format dari `node_modules/@neondatabase/serverless/index.mjs`) dengan menjalankan SQL di PGlite dalam memori (impor `@electric-sql/pglite` dari `node_modules` repo). Aplikasi dijalankan dengan `DATABASE_URL=postgresql://u:p@localhost:{port}/db` dan `NODE_TLS_REJECT_UNAUTHORIZED=0` (hanya untuk proses verifikasi; tidak ada kode khusus-tes di aplikasi).
- [ ] **Step 2: Skenario `neon.mjs`:**
  1. Database kosong: `npm run build` berhasil (cadangan content.ts) dan `/` statis; di `/admin` muncul "Database belum disiapkan." dan tombol "Siapkan database".
  2. Tekan tombol → kartu beranda menjadi tautan; tekan lagi (muat ulang lalu kirim ulang) tidak menggandakan data (7 kajian, 4 pengumuman di PGlite).
  3. `npm run build` ulang: tabel rute menampilkan `/` sebagai statis (`○`) dengan revalidasi 1 jam; HTML `/` memuat "Tafsir Juz 'Amma" yang berasal dari database.
  4. Matikan mock lalu `npm run start`: halaman `/` tetap disajikan dari cache build.
  5. Dengan mock mati, `npm run build` gagal dengan galat koneksi yang jelas (kode keluar bukan 0); halaman tidak pernah dibangun dari data contoh secara diam-diam. Pembuatan ulang ISR yang gagal (butuh menunggu 1 jam) tidak dapat diuji dalam waktu wajar; catat sebagai perilaku yang bersandar pada dokumentasi Next, bukan terverifikasi.
- [ ] **Step 3:** Jalankan skenario. Bila gagal karena `/` berubah menjadi dinamis, perbaiki di `lib/content.ts` atau `lib/store/sql.ts` sebelum lanjut. Bila protokol tiruan tidak bisa dibuat setia dalam usaha yang wajar, hentikan dan laporkan kepada pemilik repo, jangan menyatakan terverifikasi.
- [ ] **Step 4:** Tulis hasil (perintah dan keluaran kunci) di ringkasan tugas; tidak ada commit.

---

## Fase 3: Jadwal

### Task 12: Validasi dan perintah untuk jadwal dan pengecualian

**Files:**
- Create: `lib/photo/rules.ts`, `lib/validation/umum.ts`, `lib/validation/jadwal.ts`, `lib/admin/form-state.ts`, `lib/admin/commands.ts`, `tests/photo-rules.test.ts`, `tests/validation-jadwal.test.ts`, `tests/commands-jadwal.test.ts`
- Modify: `package.json` (`zod`)

**Interfaces:**
- Consumes: `ContentStore`, `SessionInput`, `MemoryStore` (Tugas 3); `todayKey`, `addDaysToKey`, `isValidDateKey` (Tugas 1); `SessionOverride`.
- Produces:
  ```ts
  // lib/photo/rules.ts
  export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; export const ALLOWED_UPLOAD_TYPES = ["image/webp", "image/jpeg"] as const; export const MAX_SIDE_PX = 1600;
  export function isOurPhotoUrl(url: string, blobHost: string | undefined): boolean; // protokol https dan url.host === blobHost
  export function isAllowedImageUrl(url: string, blobHost: string | undefined): boolean; // milik kita, atau jalur lokal "/..." bukan "//..."
  export function onlyOurPhotoUrls(urls: (string | null | undefined)[], blobHost: string | undefined): string[];
  // lib/validation/umum.ts
  export type RawForm = Record<string, string>; export type FieldErrors = Record<string, string>;
  export function parseForm<T>(schema: z.ZodType<T>, raw: RawForm): { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors }; // satu pesan pertama per kolom
  // lib/validation/jadwal.ts
  export function sessionSchema(blobHost: string | undefined): z.ZodType<SessionInput>;
  export function overrideSchema(todayKey: string, blobHost?: string): z.ZodType<SessionOverride>;
  // lib/admin/form-state.ts
  export type FormState = { ok: false; message?: string; fieldErrors?: FieldErrors; values?: RawForm } | undefined;
  export const MESSAGE_SAVE_FAILED = "Belum tersimpan karena sambungan terputus atau server sedang sibuk. Isian Anda tidak hilang.";
  // lib/admin/commands.ts
  export interface CommandDeps { store: ContentStore; blobHost?: string; todayKey: string }
  export type CommandResult = { ok: true; deleteImageUrls: string[] } | { ok: false; state: NonNullable<FormState> };
  export function saveSessionCommand(deps: CommandDeps, day: DayIndex, raw: RawForm): Promise<CommandResult>;
  export function deleteSessionCommand(deps: CommandDeps, day: DayIndex): Promise<CommandResult>;
  export function saveOverrideCommand(deps: CommandDeps, originalDate: string | null, raw: RawForm): Promise<CommandResult>;
  export function deleteOverrideCommand(deps: CommandDeps, date: string): Promise<CommandResult>;
  ```
  Kolom formulir jadwal: `startTime, endTime, ustadz, topic, mode, location, imageUrl, imageAlt, imagePosition, fotoMasihDiunggah`; pengecualian: `date, kind, note` ditambah kolom sesi di atas (tanpa foto). Isian dipangkas; kolom kosong menjadi tidak ada; `imagePosition` kosong menjadi `center`; `fotoMasihDiunggah = "1"` menghasilkan galat pada `imageUrl`. `kind = "libur"` mengabaikan kolom sesi. Galat penyimpanan dipetakan ke `MESSAGE_SAVE_FAILED`; `values` hanya berisi kolom formulir yang dikenal.

- [ ] **Step 1:** `npm i zod@^4.6.5`.
- [ ] **Step 2: Tulis tes yang gagal:**
  - `photo-rules.test.ts` (`HOST = "abc.public.blob.vercel-storage.com"`): `isOurPhotoUrl("https://abc.public.blob.vercel-storage.com/kajian/x.webp", HOST)` true; host lain, `https://abc.public.blob.vercel-storage.com.evil.com/x`, dan `http://` false; `isAllowedImageUrl("/kajian/senin.jpg", HOST)` true; `"//evil.com/x.jpg"`, `"javascript:alert(1)"`, dan URL milik kita saat host `undefined` false; `onlyOurPhotoUrls([ours, "/kajian/x.jpg", null, other], HOST)` hanya `[ours]`.
  - `validation-jadwal.test.ts` (`HARI_INI = "2026-10-09"`): tabel kasus sesi (kolom, nilai, pesan persis): `startTime ""` → `startTime` "Jam mulai belum diisi."; `endTime "05:00"` dengan mulai 05:00 → `endTime` "Jam selesai harus setelah jam mulai."; `ustadz "   "` → "Nama ustadz belum diisi."; `ustadz` 121 huruf → "Nama ustadz terlalu panjang (maksimal 120 huruf)."; `topic` 201 huruf → "Tema kajian terlalu panjang (maksimal 200 huruf)."; `location` 121 huruf → "Tempat terlalu panjang (maksimal 120 huruf)."; `mode "x"` → "Pilih cara mengikuti kajian."; `imageUrl "https://evil.example/x.webp"` → "Alamat foto tidak dikenal. Unggah ulang fotonya."; `fotoMasihDiunggah "1"` → "Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi."; `startTime "25:00"` → "Jam tidak sah. Gunakan format 24 jam, contoh 05.30.". Kasus sah: nilai dipangkas, `location ""` menjadi tidak ada, `imagePosition ""` menjadi `"center"`. Pengecualian: `date` di bawah hari ini → "Tanggal tidak boleh sebelum hari ini."; `2027-10-10` (hari ini + 366) sah; `2027-10-11` → "Tanggal paling jauh satu tahun dari sekarang."; `date ""` atau `"2026-02-30"` → "Tanggal belum diisi."; `kind ""` → "Pilih Libur atau Ganti jadwal."; `kind "ganti"` tanpa `topic` → "Tema kajian belum diisi."; `kind "libur"` dengan kolom sesi rusak tetap sah; `note` 201 huruf → "Catatan terlalu panjang (maksimal 200 huruf).".
  - `commands-jadwal.test.ts` (memakai `MemoryStore({ seeded: true })`, `deps = { store, blobHost: HOST, todayKey: "2026-10-09" }`): simpan sah → `ok` dan `getSession` berubah; foto berubah dari URL milik kita A ke B → `deleteImageUrls` `[A]`, dari jalur lokal atau host lain → `[]`; masukan tidak sah → `ok: false`, penyimpanan tidak berubah, `state.fieldErrors` dan `state.values` terisi; penyimpanan melempar → `state.message === MESSAGE_SAVE_FAILED` dan `values` tetap; `deleteSessionCommand` mengembalikan foto lama untuk dihapus; `saveOverrideCommand` dengan `originalDate` berbeda dari tanggal baru menghapus baris lama dan menyimpan yang baru; "libur" menyimpan tanpa `session`, "ganti" menyimpan utuh.
- [ ] **Step 3:** `npm test` → gagal.
- [ ] **Step 4:** Implementasikan semua berkas; pesan Indonesia disimpan di satu objek konstan dalam `umum.ts`.
- [ ] **Step 5:** Tes lulus; gerbang standar.
- [ ] **Step 6: Commit** "feat(admin): validasi dan perintah jadwal serta pengecualian".

### Task 13: Daftar jadwal di panel, token `danger`, dan spanduk hasil

**Files:**
- Modify: `app/globals.css`, `components/ui/buttonStyles.ts`
- Create: `components/admin/SuccessBanner.tsx`, `app/admin/jadwal/page.tsx`

**Interfaces:**
- Consumes: `loadAdminContext`, `StoreNotice` (Tugas 10); `WEEK_ORDER`, `sortWeek` (lib/schedule); `formatDateKeyLong`, `daySlug` (Tugas 1); `todayKey`.
- Produces:
  ```ts
  // buttonStyles.ts: ButtonVariant bertambah "danger" (garis merah, latar kartu) dan "dangerSolid" (isi merah, teks putih)
  // globals.css: --c-danger #b3261e, --danger, --danger-tint #fdecea, --on-danger #ffffff (nilai pekat khusus [data-contrast="high"]);
  //              --color-danger, --color-danger-tint, --color-on-danger di @theme inline
  // components/admin/SuccessBanner.tsx (client)
  export function SuccessBanner(props: { hasil: "tersimpan" | "terhapus" | undefined; viewHref: string }): JSX.Element | null;
  ```
  `SuccessBanner`: `role="status"`, bisa ditutup, teks "Tersimpan. Sudah tampil di web." atau "Terhapus. Sudah hilang dari web." dengan tombol "Lihat di web" ke `viewHref`; setelah tampil membersihkan parameter dengan `router.replace`. Halaman `/admin/jadwal`: tujuh kartu hari berurutan Senin sampai Ahad (jam, tema, ustadz, tombol "Ubah" ke `/admin/jadwal/{slug}`, atau "Tidak ada kajian" dengan tombol "Tambah kajian"); di bawahnya "Perubahan untuk tanggal tertentu": daftar pengecualian dari hari ini (tanggal lengkap, "Libur" atau "Diganti: {tema}", catatan, "Ubah" ke `/admin/jadwal/tanggal/{tanggal}`), keadaan kosong "Belum ada perubahan tanggal. Gunakan tombol di bawah bila kajian libur atau diganti pada tanggal tertentu.", dan tombol utama "Liburkan atau ganti satu tanggal" ke `/admin/jadwal/tanggal/baru`.

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/jadwal-daftar.mjs`, memakai `CONTENT_STORE=memory`): tujuh kartu berurutan dengan teks seed (Senin "05.00 – 06.00", "Tafsir Juz 'Amma", "Ustadz Fulan A") dan tautan Ubah; `?hasil=tersimpan` menampilkan spanduk dengan tautan "Lihat di web" ke `/#jadwal-hari-ini`; keadaan kosong pengecualian dan tombol utama; navigasi klien dari `/admin` ke `/admin/jadwal` dengan respons RSC ditunda 1,5 detik menampilkan "Memuat..." (kerangka `loading.tsx`); axe nol pelanggaran pada 375 dan 1280 px (huruf 4, kontras tinggi, Tampilan Sederhana); kontras `text-danger` pada latar kartu dan `text-on-danger` pada `bg-danger` masing-masing paling sedikit 4,5:1 (diperiksa dengan elemen uji sementara di skenario).
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan token, varian tombol, `SuccessBanner`, dan halaman.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(panel): daftar jadwal, token danger, dan spanduk hasil".

### Task 14: Form jadwal tetap

**Files:**
- Create: `components/admin/{Field,ErrorSummary,ChoiceCards,SaveButton,ConfirmDialog,PreviewPane,SessionForm}.tsx`, `app/admin/jadwal/[hari]/page.tsx`, `app/admin/actions/jadwal.ts`

**Interfaces:**
- Consumes: `saveSessionCommand`, `deleteSessionCommand`, `FormState` (Tugas 12); `WeekCard` (Tugas 6); `dayFromSlug` (Tugas 1); `SuccessBanner` dan varian `danger` (Tugas 13).
- Produces (dipakai Tugas 15, 18, 20):
  ```tsx
  // Field.tsx
  export function Field(props: { id: string; label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }): JSX.Element;
  export function describedBy(id: string, parts: { hint?: boolean; error?: string }): string | undefined; // untuk aria-describedby kontrol
  // ErrorSummary.tsx
  export function ErrorSummary(props: { errors: Record<string, string>; labels: Record<string, string>; message?: string }): JSX.Element | null; // tabindex=-1, fokus saat errors/message berubah dari kosong ke terisi; butir menaut ke #field-{nama}
  // ChoiceCards.tsx
  export function ChoiceCards<T extends string>(props: { name: string; legend: string; options: { value: T; title: string; hint?: string }[]; value: T | ""; onChange: (v: T) => void; error?: string; required?: boolean }): JSX.Element;
  // SaveButton.tsx
  export function SaveButton(props: { label?: string }): JSX.Element; // useFormStatus: "Menyimpan..." dan nonaktif saat pending; satu-satunya tombol utama
  // ConfirmDialog.tsx
  export function ConfirmDialog(props: { triggerLabel: string; title: string; message: string; confirmLabel: string; action: (formData: FormData) => void | Promise<void>; hidden?: Record<string, string> }): JSX.Element; // <dialog> showModal; "Tidak jadi" dan tombol dangerSolid
  // PreviewPane.tsx
  export function PreviewPane(props: { children: ReactNode }): JSX.Element; // bingkai "Pratinjau: begini tampilnya di web"
  // actions/jadwal.ts ("use server")
  export async function simpanJadwalHari(hari: DayIndex, prev: FormState, formData: FormData): Promise<FormState>;
  export async function hapusJadwalHari(hari: DayIndex): Promise<void>;
  ```
  `SessionForm` (klien, terkendali) menerima `{ day: DayIndex; initial: SessionInput | null; blobHost?: string; action }`; kolom §8.3 tanpa foto (kolom `imageUrl`, `imageAlt`, `imagePosition` dibawa sebagai isian tersembunyi agar foto yang sudah ada tidak terhapus; Tugas 18 menggantinya). Urutan aksi: `requireAdmin()` → `saveSessionCommand` → `revalidatePath("/")` → `redirect("/admin/jadwal?hasil=tersimpan")`; `redirect` di luar `try`. `deleteImageUrls` diabaikan sampai Tugas 18 (belum ada foto yang bisa diunggah). Validasi juga berjalan saat pengguna meninggalkan sebuah kolom: `parseForm(sessionSchema(blobHost), nilaiSaatIni)` yang sama, dan hanya galat kolom yang sudah disentuh yang ditampilkan. Pratinjau memakai `WeekCard` dengan `as="div"`. Aksi hapus lewat `ConfirmDialog` dengan teks "Hapus jadwal hari {Nama hari}? Web akan menampilkan 'Hari ini tidak ada kajian' setiap {Nama hari}. Ini tidak bisa dibatalkan." dan tombol "Ya, hapus" → `?hasil=terhapus`.

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/jadwal-hari.mjs`, `CONTENT_STORE=memory`, jam dipalsukan 2026-10-06T05:30+07:00):
  1. Ubah tema Kamis lalu Simpan → kembali ke `/admin/jadwal?hasil=tersimpan` dan `GET /` (setelah revalidasi) memuat tema baru.
  2. Kosongkan ustadz dan set selesai ≤ mulai lalu Simpan → tetap di halaman; `document.activeElement` adalah ringkasan galat (`tabindex="-1"`) berisi dua butir yang menaut ke `#field-ustadz` dan `#field-endTime`; tiap isian punya pesan sendiri terhubung `aria-describedby`; nilai yang diketik tidak hilang.
  2b. Meninggalkan kolom Ustadz yang kosong menampilkan "Nama ustadz belum diisi." di bawah kolom tanpa menekan Simpan.
  3. Dengan permintaan ditunda, tombol Simpan berubah "Menyimpan..." dan nonaktif; sesudahnya normal.
  4. Hapus lewat dialog (teks persis di atas; Esc menutup; fokus terkunci); sesudahnya jadwal hari itu hilang di `/admin/jadwal` ("Tambah kajian") dan web menampilkan "Hari ini tidak ada kajian" pada hari itu.
  5. Tema 200 huruf tanpa spasi dan ustadz 120 huruf tanpa spasi: tidak ada gulir horizontal pada 375 px di formulir, pratinjau, dan `GET /` (`noHorizontalScroll`).
  6. Semua isian dan tombol setinggi minimal 56 px; urutan Tab sesuai urutan visual; axe nol pelanggaran pada 375 dan 1280 px (huruf 4, kontras tinggi, Tampilan Sederhana); `/admin/jadwal/tidak-ada` menghasilkan 404.
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan semua berkas di atas.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(panel): form jadwal tetap dengan pratinjau dan hapus".

### Task 15: Form pengecualian tanggal

**Files:**
- Create: `components/admin/DateField.tsx`, `components/admin/OverrideForm.tsx`, `app/admin/jadwal/tanggal/baru/page.tsx`, `app/admin/jadwal/tanggal/[tanggal]/page.tsx`, `app/admin/actions/pengecualian.ts`

**Interfaces:**
- Consumes: primitif Tugas 14; `saveOverrideCommand`, `deleteOverrideCommand` (Tugas 12); `TodayCard` (Tugas 6); `formatDateKeyLong`, `weekdayOfKey`, `todayKey`, `addDaysToKey` (Tugas 1).
- Produces:
  ```tsx
  // DateField.tsx (dipakai juga Tugas 20)
  export function DateField(props: { id: string; name: string; label: string; value: string; onChange: (v: string) => void; min?: string; max?: string; error?: string; required?: boolean }): JSX.Element; // <input type="date"> + formatDateKeyLong(value) di bawahnya
  // actions/pengecualian.ts ("use server")
  export async function simpanPengecualian(tanggalAsli: string | null, prev: FormState, formData: FormData): Promise<FormState>;
  export async function hapusPengecualian(tanggal: string): Promise<void>;
  ```
  `OverrideForm`: `DateField` (`min` = hari ini, `max` = hari ini + 366), `ChoiceCards` "Libur" / "Ganti jadwal", kolom sesi hanya untuk "Ganti" (terisi dari jadwal tetap hari yang dipilih saat tanggal atau pilihan berubah, kecuali sudah diubah pengurus), "Catatan untuk jamaah" (bantuan "Contoh: Ustadz berhalangan hadir."), pratinjau `TodayCard`; validasi saat meninggalkan kolom seperti Tugas 14 (memakai `overrideSchema`). Memilih "Libur" lalu Simpan membuka `ConfirmDialog`: "Liburkan kajian {tanggal lengkap}? Web akan menampilkan 'Kajian hari ini diliburkan' pada tanggal itu." Hapus: "Hapus perubahan untuk {tanggal lengkap}? Jadwal tetap hari itu berlaku kembali."

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/pengecualian.mjs`, jam 2026-10-09): memilih 2026-10-15 menampilkan "Kamis, 15 Oktober 2026" di bawah isian dan atribut `min="2026-10-09"`; memilih "Ganti jadwal" mengisi kolom dari jadwal tetap Kamis dan mengubah satu kolom tidak ditimpa saat tanggal diganti; Simpan "Libur" melewati dialog (teks persis) lalu daftar menampilkan "Kamis, 15 Oktober 2026" dengan "Libur" dan catatan; mengubah tanggal entri itu menghapus entri lama; hapus lewat dialog mengembalikan keadaan kosong; POST yang dibuat manual dengan tanggal 2026-10-08 ditolak dengan "Tanggal tidak boleh sebelum hari ini."; axe nol pelanggaran pada 375 dan 1280 px (huruf 4, kontras tinggi, Tampilan Sederhana).
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan semua berkas.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(panel): form pengecualian tanggal (libur atau ganti)".

### Task 16: Tampilan libur dan ganti di web publik

**Files:**
- Modify: `components/TodaySchedule.tsx`, `components/WeeklySchedule.tsx`, `app/page.tsx`

**Interfaces:**
- Consumes: `effectiveSessionOn`, `weekDateKeys`, `nextSessionAfterToday`, `EffectiveSession` (Tugas 2); `toDateKey`, `getWibParts` (lib/time); `generatedAt` dari `loadPublicContent` (Tugas 5); `TodayCard`, `WeekCard` (Tugas 6).
- Produces: `WeeklySchedule(props: { schedule: ScheduleData; generatedAt: string })`; `WeekCard` dan `TodayCard` menerima `changed?: "libur" | "ganti"` dan `note?: string`. Perilaku §7: Kajian Hari Ini `cancelled`: kartu "Kajian hari ini diliburkan", "Catatan: {catatan}" bila ada, lalu "Kajian berikutnya"; `changed`: kartu biasa dengan lencana "Ada perubahan hari ini" dan catatan di bawah tema, status memakai jam pengganti. "Kajian berikutnya" memakai `nextSessionAfterToday` dan menambahkan "(ada perubahan)" bila `changed`. Jadwal Sepekan: tujuh hari pekan berjalan; kartu tampil bila `session` ada atau `status === "cancelled"`; `cancelled` memakai lencana "Libur", jam diganti "Libur", tema "Kajian diliburkan", catatan di baris ustadz; `changed` memakai lencana "Ada perubahan"; lencana berupa ikon dan teks. Sebelum `useWibNow()` terisi, pekan ditentukan dari `generatedAt`; sorotan "Hari ini" tetap hanya setelah jam peramban diketahui. Bila tidak ada kartu: "Jadwal kajian belum tersedia."

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/libur-ganti.mjs`; pengecualian dibuat lewat UI Tugas 15 dengan sesi sah; jam dipalsukan per kasus; `GET /` setelah revalidasi):
  1. Selasa 2026-10-06 05:30, tanpa pengecualian: sama dengan baseline (selisih piksel 0 terhadap `baseline/`).
  2. Libur hari ini (catatan "Ustadz berhalangan hadir"): kartu hari ini menampilkan "Kajian hari ini diliburkan" dan "Catatan: Ustadz berhalangan hadir"; kotak "Kajian berikutnya: Besok"; kartu Selasa di sepekan berlencana "Libur", jam "Libur", tema "Kajian diliburkan".
  3. Ganti hari ini (mulai 06:00): lencana "Ada perubahan hari ini", tema dan ustadz pengganti, status "Belum dimulai" pada 05:30.
  4. Besok libur: "Kajian berikutnya" melewati besok ke hari berikutnya.
  5. Ahad 2026-10-11 22:00 dengan pengecualian untuk Senin 2026-10-12: kartu sepekan masih pekan 5–11 Oktober tanpa pengecualian itu; "Kajian berikutnya: Besok" adalah Senin biasa.
  6. "Ganti" pada hari tanpa jadwal tetap: kartu tambahan muncul di pekan itu.
  7. Semua tujuh hari jadwal dihapus: kartu hari ini "Hari ini tidak ada kajian", tanpa kotak "Kajian berikutnya", sepekan menampilkan "Jadwal kajian belum tersedia."; `/admin/jadwal` menampilkan "Tambah kajian" di ketujuh hari.
  8. HTML mentah dari server (tanpa JavaScript) memuat kartu sepekan sesuai `generatedAt`, bukan kerangka.
  9. axe nol pelanggaran pada bagian yang berubah (375 dan 1280 px; huruf 4, kontras tinggi, Tampilan Sederhana); tidak ada gulir horizontal.
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan perubahan komponen dan `generatedAt` di `app/page.tsx`.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`; ulangi verifikasi piksel Tugas 6 (kasus 1).
- [ ] **Step 5: Commit** "feat(web): tampilkan libur dan ganti jadwal pada kajian hari ini dan sepekan".

---

## Fase 4: Kegiatan dan Pengumuman dengan foto

### Task 17: Foto: pengecilan, izin unggah, dan alamat foto di next.config

**Files:**
- Create: `lib/photo/resize.ts`, `lib/photo/upload.ts`, `lib/photo/blob.ts`, `app/api/admin/foto/route.ts`, `tests/photo-resize.test.ts`, `tests/upload-route.test.ts`
- Modify: `lib/photo/rules.ts`, `next.config.ts`, `package.json` (`@vercel/blob`)

**Interfaces:**
- Consumes: `getAdmin`, `AdminSession` (Tugas 7 dan 9); konstanta dan fungsi `lib/photo/rules.ts` (Tugas 12).
- Produces:
  ```ts
  // rules.ts (tambahan)
  export function blobImagePatterns(host: string | undefined): URL[]; // [new URL("https://{host}/**")] atau []
  // resize.ts
  export function computeTargetSize(width: number, height: number, maxSide?: number): { width: number; height: number }; // tanpa memperbesar, rasio tetap, dibulatkan
  export const QUALITY_STEPS: readonly number[]; // [0.82, 0.7, 0.6]
  export const JPEG_QUALITY = 0.85; export const SOFT_MAX_BYTES = 1_000_000; export const FALLBACK_MAX_SIDE = 1280;
  export async function resizeImage(file: File): Promise<Blob>; // hanya peramban: createImageBitmap({ imageOrientation: "from-image" }) lalu canvas.toBlob
  // upload.ts
  export function uploadTokenOptions(): { allowedContentTypes: string[]; maximumSizeInBytes: number; addRandomSuffix: true };
  export async function handleFotoUpload(request: Request, deps: { getAdmin: () => Promise<AdminSession | null>; handleUpload: typeof handleUpload }): Promise<Response>;
  // blob.ts (server)
  export async function deletePhotos(urls: string[], blobHost: string | undefined, del?: (urls: string[]) => Promise<void>): Promise<void>; // del bawaan = del() dari @vercel/blob; hanya meneruskan onlyOurPhotoUrls; galat dicatat, tidak dilempar
  ```
  `app/api/admin/foto/route.ts` mengekspor `POST` yang memanggil `handleFotoUpload(request, { getAdmin, handleUpload })`. `next.config.ts`: `images.remotePatterns: blobImagePatterns(process.env.BLOB_PUBLIC_HOST)`.

- [ ] **Step 1:** `npm i @vercel/blob@^2.8.1`.
- [ ] **Step 2: Tulis tes yang gagal:**
  ```ts
  it("computeTargetSize: tidak memperbesar, rasio tetap, sisi terpanjang 1600", () => {
    expect(computeTargetSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(computeTargetSize(3000, 4000)).toEqual({ width: 1200, height: 1600 });
    expect(computeTargetSize(800, 600)).toEqual({ width: 800, height: 600 });
    expect(computeTargetSize(4000, 4000, 1280)).toEqual({ width: 1280, height: 1280 });
  });
  it("blobImagePatterns", () => {
    expect(blobImagePatterns("abc.public.blob.vercel-storage.com").map(String)).toEqual(["https://abc.public.blob.vercel-storage.com/**"]);
    expect(blobImagePatterns(undefined)).toEqual([]);
  });
  it("uploadTokenOptions sesuai spec", () => {
    expect(uploadTokenOptions()).toEqual({ allowedContentTypes: ["image/webp", "image/jpeg"], maximumSizeInBytes: 2 * 1024 * 1024, addRandomSuffix: true });
  });
  it("tanpa sesi: 401 dan handleUpload tidak dipanggil", async () => {
    const handleUpload = vi.fn();
    const res = await handleFotoUpload(new Request("http://x/api/admin/foto", { method: "POST", body: "{}" }), { getAdmin: async () => null, handleUpload });
    expect(res.status).toBe(401); expect(handleUpload).not.toHaveBeenCalled();
  });
  it("dengan sesi: onBeforeGenerateToken mengembalikan uploadTokenOptions; galat SDK menjadi 400", async () => { /* handleUpload palsu memanggil callback; satu versi melempar */ });
  it("deletePhotos hanya meneruskan URL milik kita ke del dan menelan galat", async () => {
    const host = "abc.public.blob.vercel-storage.com"; const milik = `https://${host}/kajian/a.webp`;
    const del = vi.fn(async () => { throw new Error("gagal"); });
    await expect(deletePhotos([milik, "/kajian/x.jpg", "https://evil.example/x.webp"], host, del)).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith([milik]);
    const tidakDipanggil = vi.fn(); await deletePhotos(["/kajian/x.jpg"], host, tidakDipanggil);
    expect(tidakDipanggil).not.toHaveBeenCalled();
  });
  ```
- [ ] **Step 3:** `npm test` → gagal.
- [ ] **Step 4:** Implementasikan berkas di atas; `handleFotoUpload` memeriksa `getAdmin()` sebelum `handleUpload`, dan `onBeforeGenerateToken` memeriksanya lagi; `resizeImage` mengikuti kendala 8 (WebP → JPEG bila `blob.type !== "image/webp"`; turunkan kualitas bertahap sampai di bawah `SOFT_MAX_BYTES`; lalu `FALLBACK_MAX_SIDE`). Pastikan `onUploadCompleted` memang opsional pada tipe SDK; bila wajib, isi dengan fungsi kosong.
- [ ] **Step 5:** Tes lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 6: Commit** "feat(foto): pengecilan, izin unggah Blob, dan alamat foto yang diizinkan".

### Task 18: PhotoField dan posisi foto

**Files:**
- Create: `components/admin/PhotoField.tsx`
- Modify: `components/admin/SessionForm.tsx`, `app/admin/actions/jadwal.ts`, `components/ui/CardImage.tsx` (bila belum memakai `position` di semua pemanggil), `components/TodaySchedule.tsx` dan `components/WeeklySchedule.tsx` (meneruskan `imagePosition` ke `CardImage`)

**Interfaces:**
- Consumes: `resizeImage` (Tugas 17), `upload` dari `@vercel/blob/client`, primitif Tugas 14, `ImagePosition`.
- Produces:
  ```tsx
  export function PhotoField(props: { name: string; value: string; onChange: (url: string) => void; folder: "kajian" | "kegiatan"; uploadEnabled: boolean; error?: string }): JSX.Element;
  ```
  `PhotoField`: `<input type="file" accept="image/jpeg,image/png,image/webp">` (galeri atau kamera), keadaan idle → "Memperkecil foto..." → "Mengunggah {n}%" → selesai (miniatur dan tombol "Ganti foto" / "Hapus foto"); isian tersembunyi `name` berisi URL dan `fotoMasihDiunggah=1` selama proses; berkas bukan gambar: "Pilih foto berformat JPG, PNG, atau WebP."; kegagalan: "Foto belum berhasil diunggah. Periksa sambungan, lalu coba lagi." dengan tombol "Coba lagi"; `uploadEnabled=false` menampilkan "Unggah foto belum disiapkan." `SessionForm` memakai `PhotoField` (mengganti isian tersembunyi Tugas 14) ditambah `Field` "Keterangan foto" dan `ChoiceCards` "Bagian foto yang tampil" (Atas, Tengah, Bawah), dan pratinjau memakai posisi itu. `uploadEnabled` dihitung di server sebagai `Boolean(process.env.BLOB_PUBLIC_HOST && process.env.BLOB_READ_WRITE_TOKEN)` dan diteruskan lewat props halaman. `simpanJadwalHari` dan `hapusJadwalHari` kini memanggil `after(() => deletePhotos(deleteImageUrls, blobHost))` setelah penyimpanan berhasil.

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/foto.mjs`; `CONTENT_STORE=memory`, `BLOB_PUBLIC_HOST=abc.public.blob.vercel-storage.com`; permintaan `POST /api/admin/foto` dan permintaan unggah SDK ke Vercel disadap dengan `page.route` dan dijawab sesuai format SDK; baca sumber `@vercel/blob/client` untuk bentuk jawaban):
  1. Berkas uji JPEG 4000×3000 dengan EXIF Orientation=6 (dibuat skrip kecil dengan menyisipkan segmen APP1): blob yang dikirim memiliki `max(lebar, tinggi) <= 1600`, ukuran di bawah 1.000.000 byte, tidak memuat petunjuk `Exif`, dan miniatur tampil tegak (tinggi > lebar).
  2. Indikator "Memperkecil foto..." lalu "Mengunggah {n}%"; sesudah selesai, Simpan menyimpan URL toko tiruan dan `GET /` memuatnya lewat `/_next/image` (host sudah diizinkan).
  3. Simpan saat unggah belum selesai ditolak dengan "Foto belum selesai diunggah. Tunggu sebentar lalu simpan lagi."
  4. Jawaban 500 dari endpoint token: pesan gagal unggah dan tombol "Coba lagi"; formulir tetap bisa disimpan tanpa foto.
  5. Berkas PDF: "Pilih foto berformat JPG, PNG, atau WebP."
  6. Memilih posisi "Atas" mengubah `object-position` pada pratinjau dan di web (`object-top`).
  7. Tanpa `BLOB_PUBLIC_HOST`, atau tanpa `BLOB_READ_WRITE_TOKEN`: "Unggah foto belum disiapkan."; bagian lain formulir tetap bisa disimpan.
  8. axe nol pelanggaran; tombol dan isian minimal 56 px.
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan `PhotoField` dan integrasinya.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(foto): PhotoField dengan pengecilan di HP dan posisi foto".

### Task 19: Validasi dan perintah pengumuman

**Files:**
- Create: `lib/validation/pengumuman.ts`, `tests/validation-pengumuman.test.ts`, `tests/commands-pengumuman.test.ts`
- Modify: `lib/admin/commands.ts`

**Interfaces:**
- Consumes: `parseForm`, `FormState`, `CommandDeps`, `CommandResult` (Tugas 12); `AnnouncementInput` (Tugas 3); `onlyOurPhotoUrls`.
- Produces:
  ```ts
  export function announcementSchema(opts: { blobHost?: string; todayKey: string }): z.ZodType<AnnouncementInput>;
  export function saveAnnouncementCommand(deps: CommandDeps, raw: RawForm): Promise<CommandResult>; // raw.id wajib (UUID dari halaman "baru")
  export function deleteAnnouncementCommand(deps: CommandDeps, id: string): Promise<CommandResult>;
  ```
  Kolom: `id, type, title, date, time, excerpt, imageUrl, imageAlt, imagePosition, href, fotoMasihDiunggah`. `time` kosong menjadi tidak ada.

- [ ] **Step 1: Tulis tes yang gagal:**
  - Validasi (`VALID = { id: "p1", type: "kegiatan", title: "Kerja bakti", date: "2026-10-17", time: "", excerpt: "Membersihkan masjid", href: "", imageUrl: "", imageAlt: "", imagePosition: "center" }`, `todayKey: "2026-10-09"`): `type "x"` → "Pilih jenis: Kegiatan atau Pengumuman."; `title "   "` → "Judul belum diisi."; `title` 141 huruf → "Judul terlalu panjang (maksimal 140 huruf)."; `excerpt ""` → "Ringkasan belum diisi."; `excerpt` 401 huruf → "Ringkasan terlalu panjang (maksimal 400 huruf)."; `date ""` → "Tanggal belum diisi."; `date "2062-10-09"` dan `"2019-12-31"` → "Tanggal tidak masuk akal. Periksa tahunnya."; `date "2026-10-01"` sah; `href "ftp://x"` → "Tautan harus diawali https:// atau http://."; `href "#zoom"` dan `"/"` sah; `time "25:00"` → "Jam tidak sah. Gunakan format 24 jam, contoh 05.30."; `imageAlt` 201 huruf → "Keterangan foto terlalu panjang (maksimal 200 huruf)."; `imageUrl` host lain → "Alamat foto tidak dikenal. Unggah ulang fotonya."; `id ""` ditolak.
  - Perintah (`MemoryStore({ seeded: true })`): menyimpan dua kali dengan `id` sama menghasilkan 5 butir, bukan 6; mengganti foto dari URL kita A ke B → `deleteImageUrls [A]`; menghapus pengumuman berfoto mengembalikan fotonya untuk dihapus; masukan tidak sah tidak menyimpan dan mengembalikan `fieldErrors` serta `values`; penyimpanan melempar → `MESSAGE_SAVE_FAILED`.
- [ ] **Step 2:** `npm test` → gagal.
- [ ] **Step 3:** Implementasikan skema dan perintah.
- [ ] **Step 4:** Tes lulus; gerbang standar.
- [ ] **Step 5: Commit** "feat(admin): validasi dan perintah kegiatan dan pengumuman".

### Task 20: Halaman admin Kegiatan dan Pengumuman

**Files:**
- Create: `components/admin/AnnouncementForm.tsx`, `components/admin/AnnouncementAdminList.tsx`, `app/admin/pengumuman/page.tsx`, `app/admin/pengumuman/baru/page.tsx`, `app/admin/pengumuman/[id]/page.tsx`, `app/admin/actions/pengumuman.ts`
- Modify: `components/Announcements.tsx` (`AnnouncementCard` meneruskan `item.imagePosition` ke `CardImage`)

**Interfaces:**
- Consumes: primitif Tugas 14; `DateField` (Tugas 15); `PhotoField` (Tugas 18); `saveAnnouncementCommand`, `deleteAnnouncementCommand` (Tugas 19); `AnnouncementCard`, `AnnouncementTabs`, `urutkanTerbaru` (lib/announcements); `deletePhotos` (Tugas 17).
- Produces:
  ```ts
  // actions/pengumuman.ts ("use server")
  export async function simpanPengumuman(prev: FormState, formData: FormData): Promise<FormState>; // id dari isian tersembunyi
  export async function hapusPengumuman(formData: FormData): Promise<void>; // isian tersembunyi id
  ```
  Daftar: dua tab seperti di web (`AnnouncementTabs` dengan `panels` berisi daftar admin), terbaru dulu, tiap butir menampilkan miniatur, judul, tanggal lengkap, dan "Ubah"; keadaan kosong dengan tombol ("Belum ada kegiatan. Tambah kegiatan." / "Belum ada pengumuman. Tambah pengumuman."); tombol utama "Tambah". Form §8.3 dengan `ChoiceCards` jenis, kotak centang "Tampilkan jam" yang membuka `type="time"`, penghitung huruf pada ringkasan (bantuan "Di kartu tampil sekitar 3 baris."), pratinjau `AnnouncementCard`, dan tombol hapus terpisah di bawah (dialog "Hapus “{judul}”? Kartu ini akan hilang dari web. Ini tidak bisa dibatalkan."). Validasi saat meninggalkan kolom seperti Tugas 14 (memakai `announcementSchema`); daftar menampilkan `SuccessBanner`; aksi memanggil `after(() => deletePhotos(deleteImageUrls, blobHost))` seperti Tugas 18. Halaman "baru" membuat `crypto.randomUUID()` saat dirender dan menaruhnya di isian `id`; Simpan → `?hasil=tersimpan` dengan "Lihat di web" ke `/#pengumuman`.

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/pengumuman.mjs`, `CONTENT_STORE=memory`):
  1. Daftar: tab Kegiatan berisi 4 butir seed terbaru lebih dulu; tab Pengumuman menampilkan keadaan kosong dengan tombol.
  2. Tambah Pengumuman dengan tanggal dan jam 05.30 → web, tab Pengumuman, menampilkan kartu dengan "... pukul 05.30 WIB".
  3. ID: isian `id` berisi UUID dan nilainya sama setelah simpan gagal; mengirim formulir dua kali berturut-turut menghasilkan satu kartu di web.
  4. Ubah dan hapus (dialog persis di atas, "Ya, hapus"); kartu hilang dari web.
  5. Judul 140 huruf tanpa spasi: tidak ada gulir horizontal pada 375 px di daftar admin, formulir, pratinjau, dan web.
  6. Validasi: tanggal tahun 2062 menghasilkan ringkasan galat terfokus dengan "Tanggal tidak masuk akal. Periksa tahunnya."; isian tidak hilang.
  6b. Foto dengan posisi "Bawah" (toko Blob disadap seperti Tugas 18): gambar kartu pengumuman di web memakai `object-bottom`.
  7. axe nol pelanggaran pada 375 dan 1280 px (huruf 4, kontras tinggi, Tampilan Sederhana); isian dan tombol minimal 56 px.
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan semua berkas; urutan aksi sama dengan Tugas 14 (`requireAdmin` → perintah → `after(deletePhotos)` → `revalidatePath("/")` → `redirect`).
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(panel): kelola kegiatan dan pengumuman dengan foto".

---

## Fase 5: Penanda resmi, panduan, dan penyempurnaan

### Task 21: Penanda "contoh/resmi"

**Files:**
- Create: `app/admin/actions/status.ts`, `components/admin/SampleStatus.tsx`
- Modify: `app/admin/page.tsx`, `app/admin/jadwal/page.tsx`, `app/admin/pengumuman/page.tsx`, `components/ui/SampleBadge.tsx`

**Interfaces:**
- Consumes: `ContentStore.getSampleFlags`, `setSampleFlag` (Tugas 3); `ConfirmDialog` (Tugas 14).
- Produces:
  ```ts
  // actions/status.ts ("use server")
  export async function ubahStatusContoh(section: SectionKey, isSample: boolean, kembali: "/admin" | "/admin/jadwal" | "/admin/pengumuman"): Promise<void>; // requireAdmin, setSampleFlag, revalidatePath("/"), redirect(`${kembali}?hasil=tersimpan`); nilai kembali di luar daftar ditolak
  // SampleStatus.tsx
  export function SampleStatus(props: { section: SectionKey; isSample: boolean; label: string; kembali: "/admin" | "/admin/jadwal" | "/admin/pengumuman" }): JSX.Element;
  ```
  Saat `isSample`: spanduk "Data masih contoh. Setelah semuanya diganti dengan data resmi, tandai resmi." dengan tombol "Tandai sudah resmi" (dialog: "Tandai {label} sebagai resmi? Lencana 'Contoh data, belum resmi' akan hilang dari web."). Saat resmi: tautan kecil "Kembalikan ke status contoh". `SampleBadge.title` menjadi "Bagian ini masih memakai data contoh. Pengurus dapat menandainya resmi di Panel Pengurus."

- [ ] **Step 1: Tulis skenario yang gagal** (`verify/scenarios/status.mjs`): beranda, `/admin/jadwal`, dan `/admin/pengumuman` menampilkan spanduk contoh; menandai jadwal resmi (lewat dialog) menghilangkan lencana "Contoh data, belum resmi" di `#jadwal-hari-ini` dan `#jadwal-mingguan` pada `GET /` tetapi tidak di `#pengumuman`; "Kembalikan ke status contoh" memulihkannya; `title` lencana berisi teks baru; axe nol pelanggaran.
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Implementasikan.
- [ ] **Step 4:** Skenario lulus; gerbang standar termasuk `npm run build`.
- [ ] **Step 5: Commit** "feat(panel): penanda data contoh atau resmi".

### Task 22: Dokumentasi dan contoh variabel lingkungan

**Files:**
- Modify: `README.md`, `.env.example`, `data/content.ts` (komentar di atas `SCHEDULE` dan `ANNOUNCEMENTS` dan di kepala berkas; data tidak diubah)

**Interfaces:**
- Consumes: tabel variabel lingkungan §4 dan langkah setup §14.
- Produces: bagian README "Panel Pengurus" (apa itu; menjalankan lokal dengan `CONTENT_STORE=memory`, `SESSION_SECRET`, `ADMIN_EMAILS` dan tombol "Masuk mode pengembang"; setup Neon, Blob publik, Google OAuth, variabel lingkungan; pertama kali: masuk, "Siapkan database", ganti data contoh, tandai resmi; mencabut akses; langkah memeriksa peringatan "belum diverifikasi" pada layar persetujuan Google dan mencatat hasilnya; daftar uji ujung ke ujung di Vercel; catatan syarat Vercel Hobby (non-komersial: meminta donasi tidak dihitung komersial, menerima bayaran untuk membuat atau merawat situs dihitung komersial) serta batas paket gratis Neon (1 GB, tidur setelah 5 menit, pemulihan 6 jam) dan Blob (1 GB, 2.000 operasi lanjutan, 10.000 operasi sederhana per bulan)).

- [ ] **Step 1: Tulis pemeriksaan yang gagal** (skrip kecil di scratchpad): setiap nama variabel pada tabel §4 (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `BLOB_PUBLIC_HOST`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `SESSION_SECRET`, `ADMIN_EMAILS`, `ADMIN_HELP_WHATSAPP`, `NEXT_PUBLIC_SITE_URL`, `CONTENT_STORE`) muncul di `.env.example` (dikomentari, tanpa nilai rahasia) dan di README; README memuat judul "Panel Pengurus".
- [ ] **Step 2:** Jalankan → gagal.
- [ ] **Step 3:** Tulis dokumentasi; perbarui komentar `data/content.ts` bahwa `SCHEDULE` dan `ANNOUNCEMENTS` kini data awal dan cadangan yang diubah lewat panel; perbarui daftar "Sebelum diterbitkan" di README yang menyebut mengedit `SCHEDULE` dan `ANNOUNCEMENTS` agar merujuk ke panel.
- [ ] **Step 4:** Pemeriksaan lulus; `npm run typecheck && npm run lint && npm run build`.
- [ ] **Step 5: Commit** "docs: panduan Panel Pengurus dan contoh variabel lingkungan".

### Task 23: Verifikasi akhir

**Files:**
- Hanya scratchpad; perbaikan temuan masuk ke berkas tugas pemiliknya.

**Interfaces:**
- Consumes: semua tugas.
- Produces: laporan akhir untuk pemilik repo.

- [ ] **Step 1: Gerbang penuh:** `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; tabel rute menampilkan `/` statis (`○`) dengan revalidasi 1 jam; semua tes lulus.
- [ ] **Step 2: Sapuan aksesibilitas:** `verify/scenarios/sapuan.mjs` membuka setiap layar panel (`/admin/masuk`, `/admin`, `/admin/jadwal`, `/admin/jadwal/senin`, `/admin/jadwal/tanggal/baru`, `/admin/pengumuman`, `/admin/pengumuman/baru`) dan bagian web yang berubah, pada 375 dan 1280 px, dengan kombinasi ukuran huruf 1 dan 4, kontras tinggi, dan Tampilan Sederhana: axe nol pelanggaran, tanpa gulir horizontal, tanpa teks terpotong, dengan jam dipalsukan.
- [ ] **Step 3: Daftar periksa pra-rilis ui-ux-pro-max (bagian web)** dari `references/pro-rules.md` dan `quick-reference.md`: fokus tidak tertutup, ringkasan galat menerima fokus, ukuran sentuh, gerak berkurang, ukuran huruf terbesar, ikon dekoratif `aria-hidden`, tombol ikon bernama. Catat tiap butir lulus atau temuan.
- [ ] **Step 4: Pemeriksaan keamanan:** skrip memeriksa (a) setiap fungsi yang diekspor di `app/admin/actions/*.ts` memanggil `requireAdmin(` sebelum baris lain yang memakai penyimpanan; (b) `POST /api/admin/foto` tanpa cookie → 401; (c) setiap halaman `/admin/*` tanpa cookie, kecuali `/admin/masuk` dan `/admin/auth/*`, → redirect ke `/admin/masuk`; (d) cookie dengan email yang sudah dicabut → `?galat=sesi-habis`; (e) pencarian teks: "Masuk mode pengembang" hanya di dalam cabang `NODE_ENV === "development"`, dan `MemoryStore` melempar bila `VERCEL` terisi; (f) tidak ada rahasia di berkas yang akan di-commit (`git grep` pada pola kunci).
- [ ] **Step 5: Peninjauan akhir:** minta satu penelaah segar memeriksa seluruh cabang terhadap spec dengan perhatian khusus pada login, sesi, otorisasi Server Action, dan unggah foto; perbaiki temuan.
- [ ] **Step 6: Laporan untuk pemilik repo:** ringkasan hasil tiap gerbang; daftar yang **tidak** dapat diuji dari lingkungan ini (login Google asli, Neon asli, Blob asli) beserta langkah uji ujung ke ujung di Vercel (masuk dengan Google asli, siapkan database, ubah jadwal, buat libur, unggah foto dari HP, tambah dan hapus pengumuman, tandai resmi, cabut akses, pastikan `/` statis di keluaran build); catatan syarat Vercel Hobby (§16).
- [ ] **Step 7: Commit** perbaikan yang tersisa: "chore: perbaikan hasil verifikasi akhir".

---

## Cakupan spec

| Bagian spec | Tugas |
|---|---|
| §1 Tujuan dan kriteria berhasil | 23 (kriteria 1–6), semua tugas |
| §2 Ruang lingkup | seluruh rencana (v1 saja) |
| §3 Keputusan | 3, 4, 7, 8, 14, 17 |
| §4 Arsitektur, berkas, variabel lingkungan | 3–6, 9, 17, 22 |
| §5 Model data, antarmuka penyimpanan | 3, 4, 10, 11 |
| §6 Aturan jadwal efektif | 1, 2, 16 |
| §7 Perubahan web publik | 6, 16, 21 |
| §8 Panel (layar, kolom, teks, aksesibilitas, komponen, Server Action) | 9, 10, 13, 14, 15, 18, 20, 21 |
| §9 Login dan otorisasi | 7, 8, 9 |
| §10 Foto | 12, 17, 18, 20 |
| §11 Keamanan | 8, 9, 12, 17, 23 |
| §12 Kegagalan dan ketahanan | 5, 9, 10, 11, 12, 18 |
| §13 Pengujian dan verifikasi | 0, 1–5, 7, 8, 12, 17, 19 (tes); 6, 9–11, 13–16, 18, 20, 21, 23 (peramban) |
| §14 Setup dan deploy | 22, 23 |
| §15 Urutan kerja | struktur Fase 1–5 |
| §16 Risiko | 11, 17, 22, 23 |
| §17 Dependensi | 1, 4, 7, 8, 12, 17 |
