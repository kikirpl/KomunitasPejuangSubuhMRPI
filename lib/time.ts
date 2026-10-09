import type { DayIndex } from "@/types";

/**
 * Semua tanggal dan jam di situs ini memakai WIB (UTC+7, tanpa waktu musim
 * panas). Dengan menggeser 7 jam lalu membaca komponen UTC, hasilnya selalu
 * benar di perangkat mana pun, tanpa bergantung pada Intl atau zona waktu
 * perangkat (penting untuk tablet lama milik jamaah).
 */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Nama hari, indeks sama dengan Date.getDay(). Hari ke-0 ditulis "Ahad". */
const DAY_NAMES = [
  "Ahad",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export interface WibParts {
  year: number;
  /** 1 sampai 12 */
  month: number;
  day: number;
  weekday: DayIndex;
  hour: number;
  minute: number;
}

export function getWibParts(date: Date): WibParts {
  const shifted = new Date(date.getTime() + WIB_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay() as DayIndex,
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

export function dayName(day: DayIndex): string {
  return DAY_NAMES[day];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-10-07" */
export function toDateKey(parts: Pick<WibParts, "year" | "month" | "day">): string {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

/** "Rabu, 7 Oktober 2026" */
export function formatLongDate(
  parts: Pick<WibParts, "year" | "month" | "day" | "weekday">,
): string {
  return `${DAY_NAMES[parts.weekday]}, ${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
}

/** "05:00" -> "05.00" (penulisan jam yang lazim di Indonesia) */
export function formatTime(hhmm: string): string {
  return hhmm.replace(":", ".");
}

/** "05:00" -> 300 (menit sejak tengah malam) */
export function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function greetingForHour(hour: number): string {
  if (hour < 3) return "Selamat malam";
  if (hour < 6) return "Selamat Subuh";
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/* ------------------------------------------------------------------------
 * Kunci tanggal "YYYY-MM-DD" (WIB). Semua aritmetika memakai UTC murni agar
 * hasilnya sama di server (UTC) dan di perangkat mana pun.
 * ---------------------------------------------------------------------- */

/** Slug hari untuk alamat panel dan id kajian. Indeks = DayIndex (0 = Ahad). */
export const DAY_SLUGS = ["ahad", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"] as const;

export function daySlug(day: DayIndex): string {
  return DAY_SLUGS[day];
}

/** Kebalikan daySlug; null bila bukan slug hari (mis. "minggu"). */
export function dayFromSlug(slug: string): DayIndex | null {
  const index = (DAY_SLUGS as readonly string[]).indexOf(slug);
  return index === -1 ? null : (index as DayIndex);
}

/** Tanggal WIB dari `date` (bawaan: sekarang) sebagai "2026-10-07". */
export function todayKey(date: Date = new Date()): string {
  return toDateKey(getWibParts(date));
}

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Memecah "YYYY-MM-DD"; null bila bentuknya salah atau tanggalnya tidak ada di kalender. */
function parseDateKey(value: string): { year: number; month: number; day: number } | null {
  const match = DATE_KEY.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  const nyata =
    check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
  return nyata ? { year, month, day } : null;
}

export function isValidDateKey(value: string): boolean {
  return parseDateKey(value) !== null;
}

function requireDateKey(dateKey: string): { year: number; month: number; day: number } {
  const parts = parseDateKey(dateKey);
  if (!parts) throw new RangeError(`Kunci tanggal tidak sah: "${dateKey}"`);
  return parts;
}

/** Menggeser tanggal kalender sebanyak `days` hari (negatif = mundur). */
export function addDaysToKey(dateKey: string, days: number): string {
  const { year, month, day } = requireDateKey(dateKey);
  const moved = new Date(Date.UTC(year, month - 1, day + days));
  return toDateKey({
    year: moved.getUTCFullYear(),
    month: moved.getUTCMonth() + 1,
    day: moved.getUTCDate(),
  });
}

export function weekdayOfKey(dateKey: string): DayIndex {
  const { year, month, day } = requireDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() as DayIndex;
}

/** "2026-10-15" -> "Kamis, 15 Oktober 2026" */
export function formatDateKeyLong(dateKey: string): string {
  const { year, month, day } = requireDateKey(dateKey);
  return formatLongDate({ year, month, day, weekday: weekdayOfKey(dateKey) });
}
