import { ANNOUNCEMENTS, SCHEDULE } from "@/data/content";
import { getStore } from "@/lib/store/index";
import type { ContentStore } from "@/lib/store/types";
import { addDaysToKey, todayKey } from "@/lib/time";
import type { PublicContent } from "@/types";

/** Berapa hari ke belakang pengecualian jadwal dimuat (agar kartu hari yang sudah lewat di pekan berjalan tetap benar). */
const HARI_KE_BELAKANG = 7;

/** Salinan data/content.ts: dipakai selama penyimpanan belum dipasang atau belum disiapkan. */
export function snapshotContent(now: Date): PublicContent {
  return {
    schedule: { isSample: SCHEDULE.isSample, sessions: [...SCHEDULE.sessions], overrides: [] },
    announcements: { isSample: ANNOUNCEMENTS.isSample, items: [...ANNOUNCEMENTS.items] },
    generatedAt: now.toISOString(),
  };
}

/**
 * Isi halaman utama. Tanpa penyimpanan (null) atau sebelum database disiapkan, memakai salinan
 * content.ts. Bila penyimpanan terpasang dan siap tetapi galat, galatnya dilempar: build gagal,
 * atau cache ISR mempertahankan halaman terakhir yang berhasil. Data contoh tidak pernah
 * disajikan diam-diam sebagai pengganti data yang gagal dibaca.
 */
export async function loadPublicContent(
  deps: { store?: ContentStore | null; now?: Date } = {},
): Promise<PublicContent> {
  const now = deps.now ?? new Date();
  const store = deps.store === undefined ? getStore() : deps.store;
  if (!store || !(await store.isReady())) return snapshotContent(now);

  const isi = await store.readPublic(addDaysToKey(todayKey(now), -HARI_KE_BELAKANG));
  return { ...isi, generatedAt: now.toISOString() };
}
