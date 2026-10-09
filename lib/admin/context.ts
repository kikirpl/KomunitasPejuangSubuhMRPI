import "server-only";
import { requireAdmin } from "@/lib/auth/guard";
import type { AdminSession } from "@/lib/auth/session";
import { getStore } from "@/lib/store/index";
import type { ContentStore } from "@/lib/store/types";

export interface AdminContext {
  admin: AdminSession;
  /** null bila belum ada database (dan CONTENT_STORE bukan "memory"). */
  store: ContentStore | null;
  /** Tabel sudah ada dan data awal sudah terisi. */
  ready: boolean;
}

/** Bahan awal setiap halaman panel: pengurus yang masuk, penyimpanan, dan kesiapannya. */
export async function loadAdminContext(): Promise<AdminContext> {
  const admin = await requireAdmin();
  const store = getStore();
  const ready = store ? await store.isReady() : false;
  return { admin, store, ready };
}
