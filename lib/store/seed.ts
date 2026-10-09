import { ANNOUNCEMENTS, SCHEDULE } from "@/data/content";
import type { DayIndex, SectionKey } from "@/types";
import type { AnnouncementInput, SessionInput } from "./types";

/** Data awal penyimpanan: salinan data/content.ts, sehingga tampilan web tidak berubah sebelum pengurus mengubahnya. */
export interface SeedData {
  sessions: { day: DayIndex; input: SessionInput }[];
  announcements: AnnouncementInput[];
  flags: Record<SectionKey, boolean>;
}

/** "2026-10-09" atau "2026-10-09T05:00:00+07:00" -> tanggal dan jam WIB terpisah. */
export function splitAnnouncementDate(value: string): { date: string; time?: string } {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(value);
  if (!match) return { date: value };
  return match[2] ? { date: match[1], time: match[2] } : { date: match[1] };
}

export function buildSeed(): SeedData {
  return {
    sessions: SCHEDULE.sessions.map((s) => ({
      day: s.day,
      input: {
        startTime: s.startTime,
        endTime: s.endTime,
        ustadz: s.ustadz,
        topic: s.topic,
        mode: s.mode,
        ...(s.location ? { location: s.location } : {}),
        ...(s.imageUrl ? { imageUrl: s.imageUrl } : {}),
        ...(s.imageAlt ? { imageAlt: s.imageAlt } : {}),
        imagePosition: s.imagePosition ?? "center",
      },
    })),
    announcements: ANNOUNCEMENTS.items.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      ...splitAnnouncementDate(a.date),
      excerpt: a.excerpt,
      ...(a.imageUrl ? { imageUrl: a.imageUrl } : {}),
      ...(a.imageAlt ? { imageAlt: a.imageAlt } : {}),
      imagePosition: a.imagePosition ?? "center",
      ...(a.href ? { href: a.href } : {}),
    })),
    flags: {
      schedule: SCHEDULE.isSample ?? false,
      announcements: ANNOUNCEMENTS.isSample ?? false,
    },
  };
}
