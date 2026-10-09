import type { FieldErrors, RawForm } from "@/lib/validation/umum";

/**
 * Keadaan formulir panel sesudah aksi gagal. `values` mengembalikan isian yang dikirim (React 19
 * mereset formulir setelah aksi, dan isian pengurus tidak boleh hilang). Aksi yang berhasil berakhir
 * dengan redirect, jadi tidak ada keadaan "ok".
 */
export type FormState =
  | { ok: false; message?: string; fieldErrors?: FieldErrors; values?: RawForm }
  | undefined;

export const MESSAGE_SAVE_FAILED =
  "Belum tersimpan karena sambungan terputus atau server sedang sibuk. Isian Anda tidak hilang.";

export const MESSAGE_DELETE_FAILED =
  "Belum terhapus karena sambungan terputus atau server sedang sibuk. Coba lagi.";

export const MESSAGE_STATUS_FAILED =
  "Belum berhasil mengubah status. Periksa sambungan, lalu coba lagi.";
