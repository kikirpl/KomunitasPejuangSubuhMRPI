import { onlyOurPhotoUrls } from "@/lib/photo/rules";
import type { ContentStore } from "@/lib/store/types";
import { overrideSchema, sessionSchema } from "@/lib/validation/jadwal";
import { announcementSchema } from "@/lib/validation/pengumuman";
import { parseForm, type RawForm } from "@/lib/validation/umum";
import type { DayIndex } from "@/types";
import { MESSAGE_DELETE_FAILED, MESSAGE_SAVE_FAILED, type FormState } from "./form-state";

/**
 * Perintah panel: validasi lalu simpan, tanpa bergantung pada Next.js. Server Action hanya membungkusnya
 * (otorisasi, hapus foto, revalidatePath, redirect), jadi logika ini bisa diuji langsung.
 */
export interface CommandDeps {
  store: ContentStore;
  /** `BLOB_PUBLIC_HOST`; tanpa ini, tidak ada URL foto yang dianggap milik kita. */
  blobHost?: string;
  /** Tanggal WIB hari ini ("YYYY-MM-DD"); diberikan pemanggil agar mudah diuji. */
  todayKey: string;
}

export type CommandResult =
  | { ok: true; deleteImageUrls: string[] }
  | { ok: false; state: NonNullable<FormState> };

const KOLOM_SESI = [
  "startTime",
  "endTime",
  "ustadz",
  "topic",
  "mode",
  "location",
  "imageUrl",
  "imageAlt",
  "imagePosition",
  "fotoMasihDiunggah",
] as const;
const KOLOM_PENGUMUMAN = [
  "id",
  "type",
  "title",
  "date",
  "time",
  "excerpt",
  "imageUrl",
  "imageAlt",
  "imagePosition",
  "href",
  "fotoMasihDiunggah",
] as const;
const KOLOM_PENGECUALIAN = ["date", "kind", "note", "startTime", "endTime", "ustadz", "topic", "mode", "location"] as const;

/** Hanya kolom formulir yang dikenal (tanpa kunci teknis seperti $ACTION_ID_*). */
function ambilKolom(raw: RawForm, kolom: readonly string[]): RawForm {
  const hasil: RawForm = {};
  for (const nama of kolom) {
    if (typeof raw[nama] === "string") hasil[nama] = raw[nama];
  }
  return hasil;
}

function gagal(pesan: string, values: RawForm): CommandResult {
  return { ok: false, state: { ok: false, message: pesan, values } };
}

/** Foto lama yang harus dihapus dari Blob: hanya bila milik kita dan sudah diganti atau dibuang. */
function fotoUntukDihapus(lama: string | null, baru: string | undefined, blobHost: string | undefined): string[] {
  return lama && lama !== (baru ?? null) ? onlyOurPhotoUrls([lama], blobHost) : [];
}

export async function saveSessionCommand(deps: CommandDeps, day: DayIndex, raw: RawForm): Promise<CommandResult> {
  const kolom = ambilKolom(raw, KOLOM_SESI);
  const hasil = parseForm(sessionSchema(deps.blobHost), kolom);
  if (!hasil.ok) return { ok: false, state: { ok: false, fieldErrors: hasil.fieldErrors, values: kolom } };
  try {
    const { previousImageUrl } = await deps.store.saveSession(day, hasil.data);
    return { ok: true, deleteImageUrls: fotoUntukDihapus(previousImageUrl, hasil.data.imageUrl, deps.blobHost) };
  } catch (error) {
    console.error("[admin] Gagal menyimpan jadwal hari", day, error);
    return gagal(MESSAGE_SAVE_FAILED, kolom);
  }
}

export async function deleteSessionCommand(deps: CommandDeps, day: DayIndex): Promise<CommandResult> {
  try {
    const { previousImageUrl } = await deps.store.deleteSession(day);
    return { ok: true, deleteImageUrls: fotoUntukDihapus(previousImageUrl, undefined, deps.blobHost) };
  } catch (error) {
    console.error("[admin] Gagal menghapus jadwal hari", day, error);
    return gagal(MESSAGE_DELETE_FAILED, {});
  }
}

/**
 * Menyimpan pengecualian satu tanggal. Bila `originalDate` ada dan berbeda dari tanggal baru, baris tanggal
 * asli dihapus setelah yang baru berhasil disimpan (gagal di tengah tidak menghilangkan yang lama).
 */
export async function saveOverrideCommand(
  deps: CommandDeps,
  originalDate: string | null,
  raw: RawForm,
): Promise<CommandResult> {
  const kolom = ambilKolom(raw, KOLOM_PENGECUALIAN);
  const hasil = parseForm(overrideSchema(deps.todayKey), kolom);
  if (!hasil.ok) return { ok: false, state: { ok: false, fieldErrors: hasil.fieldErrors, values: kolom } };
  try {
    await deps.store.saveOverride(hasil.data);
    if (originalDate && originalDate !== hasil.data.date) await deps.store.deleteOverride(originalDate);
    return { ok: true, deleteImageUrls: [] };
  } catch (error) {
    console.error("[admin] Gagal menyimpan pengecualian", hasil.data.date, error);
    return gagal(MESSAGE_SAVE_FAILED, kolom);
  }
}

export async function deleteOverrideCommand(deps: CommandDeps, date: string): Promise<CommandResult> {
  try {
    await deps.store.deleteOverride(date);
    return { ok: true, deleteImageUrls: [] };
  } catch (error) {
    console.error("[admin] Gagal menghapus pengecualian", date, error);
    return gagal(MESSAGE_DELETE_FAILED, {});
  }
}

/**
 * Menyimpan satu kegiatan atau pengumuman. `id` wajib dan datang dari formulir (UUID dari halaman "baru"):
 * menyimpan dua kali dengan id yang sama tetap satu butir.
 */
export async function saveAnnouncementCommand(deps: CommandDeps, raw: RawForm): Promise<CommandResult> {
  const kolom = ambilKolom(raw, KOLOM_PENGUMUMAN);
  const hasil = parseForm(announcementSchema({ blobHost: deps.blobHost, todayKey: deps.todayKey }), kolom);
  if (!hasil.ok) return { ok: false, state: { ok: false, fieldErrors: hasil.fieldErrors, values: kolom } };
  try {
    const { previousImageUrl } = await deps.store.saveAnnouncement(hasil.data);
    return { ok: true, deleteImageUrls: fotoUntukDihapus(previousImageUrl, hasil.data.imageUrl, deps.blobHost) };
  } catch (error) {
    console.error("[admin] Gagal menyimpan kegiatan atau pengumuman", hasil.data.id, error);
    return gagal(MESSAGE_SAVE_FAILED, kolom);
  }
}

export async function deleteAnnouncementCommand(deps: CommandDeps, id: string): Promise<CommandResult> {
  try {
    const { previousImageUrl } = await deps.store.deleteAnnouncement(id);
    return { ok: true, deleteImageUrls: fotoUntukDihapus(previousImageUrl, undefined, deps.blobHost) };
  } catch (error) {
    console.error("[admin] Gagal menghapus kegiatan atau pengumuman", id, error);
    return gagal(MESSAGE_DELETE_FAILED, {});
  }
}
