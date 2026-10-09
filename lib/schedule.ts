import type { DayIndex, SessionMode, StudySession } from "@/types";
import { minutesOfDay, type WibParts } from "@/lib/time";

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

/** Kajian terdekat setelah hari ini (mulai besok, hingga seminggu ke depan). */
export function nextSessionAfterToday(
  sessions: readonly StudySession[],
  now: WibParts,
): { session: StudySession; daysAhead: number } | null {
  for (let ahead = 1; ahead <= 7; ahead++) {
    const day = ((now.weekday + ahead) % 7) as DayIndex;
    const session = sessionForDay(sessions, day);
    if (session) return { session, daysAhead: ahead };
  }
  return null;
}
