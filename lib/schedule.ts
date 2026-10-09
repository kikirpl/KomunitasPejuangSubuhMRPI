import type { DayIndex, SessionMode, SessionOverride, StudySession } from "@/types";
import { addDaysToKey, minutesOfDay, toDateKey, type WibParts } from "@/lib/time";

/** Pekan dimulai Senin (kebiasaan di Indonesia), Ahad di akhir. */
export const WEEK_ORDER: readonly DayIndex[] = [1, 2, 3, 4, 5, 6, 0];

export type SessionStatus = "upcoming" | "ongoing" | "finished";

export const MODE_LABEL: Record<SessionMode, string> = {
  masjid: "Di masjid",
  zoom: "Lewat Zoom",
  hybrid: "Di masjid dan Zoom",
};

export function hasZoom(session: StudySession): boolean {
  return session.mode === "zoom" || session.mode === "hybrid";
}

export function sessionForDay(
  sessions: readonly StudySession[],
  day: DayIndex,
): StudySession | undefined {
  return sessions.find((session) => session.day === day);
}

/** Jadwal diurutkan Senin sampai Ahad. */
export function sortWeek(sessions: readonly StudySession[]): StudySession[] {
  return [...sessions].sort(
    (a, b) => WEEK_ORDER.indexOf(a.day) - WEEK_ORDER.indexOf(b.day),
  );
}

export function sessionStatus(session: StudySession, now: WibParts): SessionStatus {
  const current = now.hour * 60 + now.minute;
  if (current < minutesOfDay(session.startTime)) return "upcoming";
  if (current < minutesOfDay(session.endTime)) return "ongoing";
  return "finished";
}

export type EffectiveStatus = "regular" | "changed" | "cancelled" | "none";

export interface EffectiveSession {
  status: EffectiveStatus;
  /** Kajian yang berlaku pada tanggal itu; null bila libur atau tidak ada kajian. */
  session: StudySession | null;
  /** Catatan untuk jamaah dari pengecualian (jika ada). */
  note?: string;
}

/**
 * Jadwal yang berlaku pada satu tanggal WIB: pengecualian tanggal itu (libur atau
 * ganti) mengalahkan jadwal tetap hari yang sama. Kajian pengganti mewarisi foto
 * jadwal tetap hari itu; bila hari itu tak punya jadwal tetap, ia menjadi kajian tambahan.
 */
export function effectiveSessionOn(
  dateKey: string,
  weekday: DayIndex,
  sessions: readonly StudySession[],
  overrides: readonly SessionOverride[],
): EffectiveSession {
  const weekly = sessionForDay(sessions, weekday);
  const override = overrides.find((o) => o.date === dateKey);
  const note = override?.note ? { note: override.note } : {};

  if (override?.kind === "libur") {
    return { status: "cancelled", session: null, ...note };
  }
  // "ganti" tanpa isi pengganti dianggap rusak dan diabaikan (jadwal tetap berlaku).
  if (override?.kind === "ganti" && override.session) {
    const pengganti = override.session;
    const session: StudySession = {
      id: `ganti-${dateKey}`,
      day: weekday,
      startTime: pengganti.startTime,
      endTime: pengganti.endTime,
      ustadz: pengganti.ustadz,
      topic: pengganti.topic,
      mode: pengganti.mode,
      ...(pengganti.location ? { location: pengganti.location } : {}),
      ...(weekly?.imageUrl ? { imageUrl: weekly.imageUrl } : {}),
      ...(weekly?.imageAlt ? { imageAlt: weekly.imageAlt } : {}),
      ...(weekly?.imagePosition ? { imagePosition: weekly.imagePosition } : {}),
    };
    return { status: "changed", session, ...note };
  }
  return weekly ? { status: "regular", session: weekly } : { status: "none", session: null };
}

/** Tanggal (kunci WIB) tiap hari pada pekan berjalan: Senin sampai Ahad. */
export function weekDateKeys(
  parts: Pick<WibParts, "year" | "month" | "day" | "weekday">,
): Record<DayIndex, string> {
  const sejakSenin = (parts.weekday + 6) % 7;
  const senin = addDaysToKey(toDateKey(parts), -sejakSenin);
  const keys = {} as Record<DayIndex, string>;
  WEEK_ORDER.forEach((day, i) => {
    keys[day] = addDaysToKey(senin, i);
  });
  return keys;
}

/** Kajian terdekat setelah hari ini (mulai besok, hingga seminggu ke depan); hari libur dilewati. */
export function nextSessionAfterToday(
  sessions: readonly StudySession[],
  overrides: readonly SessionOverride[],
  now: WibParts,
): {
  session: StudySession;
  daysAhead: number;
  dateKey: string;
  status: "regular" | "changed";
  note?: string;
} | null {
  const today = toDateKey(now);
  for (let ahead = 1; ahead <= 7; ahead++) {
    const dateKey = addDaysToKey(today, ahead);
    const day = ((now.weekday + ahead) % 7) as DayIndex;
    const efektif = effectiveSessionOn(dateKey, day, sessions, overrides);
    if (efektif.session) {
      return {
        session: efektif.session,
        daysAhead: ahead,
        dateKey,
        status: efektif.status === "changed" ? "changed" : "regular",
        ...(efektif.note ? { note: efektif.note } : {}),
      };
    }
  }
  return null;
}

/** Pengecualian dengan tanggal pada atau setelah `fromKey` ("YYYY-MM-DD"). */
export function overridesFrom(
  overrides: readonly SessionOverride[],
  fromKey: string,
): SessionOverride[] {
  return overrides.filter((o) => o.date >= fromKey);
}
