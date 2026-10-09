import { daySlug, isValidDateKey } from "@/lib/time";
import type {
  AnnouncementItem,
  DayIndex,
  ImagePosition,
  SectionKey,
  SessionMode,
  SessionOverride,
  StudySession,
} from "@/types";
import { buildSeed } from "./seed";
import type { AnnouncementInput, ContentStore, SessionInput } from "./types";

const JAM = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const MODE: readonly SessionMode[] = ["masjid", "zoom", "hybrid"];
const POSISI: readonly ImagePosition[] = ["top", "center", "bottom"];
const JENIS = ["kegiatan", "pengumuman"];

// Pemeriksaan di bawah menyamai batasan CHECK pada skema SQL (lib/store/schema.ts).
function pastikanHari(day: number): void {
  if (!Number.isInteger(day) || day < 0 || day > 6) throw new Error(`Hari tidak sah: ${day}`);
}

function pastikanRentang(mulai: string, selesai: string): void {
  if (!JAM.test(mulai)) throw new Error(`startTime bukan jam HH:mm: "${mulai}"`);
  if (!JAM.test(selesai)) throw new Error(`endTime bukan jam HH:mm: "${selesai}"`);
  if (selesai <= mulai) throw new Error("endTime harus setelah startTime");
}

function pastikanMode(mode: string): void {
  if (!MODE.includes(mode as SessionMode)) throw new Error(`mode tidak sah: "${mode}"`);
}

function pastikanPosisi(posisi: string): void {
  if (!POSISI.includes(posisi as ImagePosition)) throw new Error(`imagePosition tidak sah: "${posisi}"`);
}

function bentukKajian(day: DayIndex, input: SessionInput): StudySession {
  return {
    id: daySlug(day),
    day,
    startTime: input.startTime,
    endTime: input.endTime,
    ustadz: input.ustadz,
    topic: input.topic,
    mode: input.mode,
    ...(input.location ? { location: input.location } : {}),
    ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    ...(input.imageAlt ? { imageAlt: input.imageAlt } : {}),
    imagePosition: input.imagePosition,
  };
}

function bentukPengumuman(input: AnnouncementInput): AnnouncementItem {
  return {
    id: input.id,
    type: input.type,
    title: input.title,
    date: input.time ? `${input.date}T${input.time}:00+07:00` : input.date,
    excerpt: input.excerpt,
    ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    ...(input.imageAlt ? { imageAlt: input.imageAlt } : {}),
    imagePosition: input.imagePosition,
    ...(input.href ? { href: input.href } : {}),
  };
}

/** Terbaru lebih dulu: tanggal turun, lalu jam turun (tanpa jam paling akhir), lalu id naik. */
function terbaruDulu(a: AnnouncementInput, b: AnnouncementInput): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.time !== b.time) {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time < b.time ? 1 : -1;
  }
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Penyimpanan di memori proses: untuk menjalankan panel di laptop tanpa akun apa pun.
 * Data hilang saat server berhenti. Tidak boleh dipakai di Vercel (lihat getStore).
 */
export class MemoryStore implements ContentStore {
  private ready = false;
  private sessions = new Map<DayIndex, SessionInput>();
  private overrides = new Map<string, SessionOverride>();
  private announcements = new Map<string, AnnouncementInput>();
  private flags: Record<SectionKey, boolean> = { schedule: true, announcements: true };

  constructor(opts: { seeded?: boolean } = {}) {
    if (opts.seeded) this.isiDataAwal();
  }

  private isiDataAwal(): void {
    const seed = buildSeed();
    for (const { day, input } of seed.sessions) this.sessions.set(day, { ...input });
    for (const item of seed.announcements) this.announcements.set(item.id, { ...item });
    this.flags = { ...seed.flags };
    this.ready = true;
  }

  async isReady(): Promise<boolean> {
    return this.ready;
  }

  async setup(): Promise<void> {
    if (!this.ready) this.isiDataAwal();
  }

  async readPublic(sinceKey: string) {
    return {
      schedule: {
        isSample: this.flags.schedule,
        sessions: await this.listSessions(),
        overrides: await this.listOverrides(sinceKey),
      },
      announcements: {
        isSample: this.flags.announcements,
        items: await this.listAnnouncements(),
      },
    };
  }

  async listSessions(): Promise<StudySession[]> {
    return [...this.sessions.entries()].sort(([a], [b]) => a - b).map(([day, input]) => bentukKajian(day, input));
  }

  async getSession(day: DayIndex): Promise<StudySession | null> {
    const input = this.sessions.get(day);
    return input ? bentukKajian(day, input) : null;
  }

  async saveSession(day: DayIndex, input: SessionInput): Promise<{ previousImageUrl: string | null }> {
    pastikanHari(day);
    pastikanRentang(input.startTime, input.endTime);
    pastikanMode(input.mode);
    pastikanPosisi(input.imagePosition);
    const previousImageUrl = this.sessions.get(day)?.imageUrl ?? null;
    this.sessions.set(day, { ...input });
    return { previousImageUrl };
  }

  async deleteSession(day: DayIndex): Promise<{ previousImageUrl: string | null }> {
    const previousImageUrl = this.sessions.get(day)?.imageUrl ?? null;
    this.sessions.delete(day);
    return { previousImageUrl };
  }

  async listOverrides(fromKey: string): Promise<SessionOverride[]> {
    return [...this.overrides.values()]
      .filter((o) => o.date >= fromKey)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((o) => structuredClone(o));
  }

  async getOverride(date: string): Promise<SessionOverride | null> {
    const o = this.overrides.get(date);
    return o ? structuredClone(o) : null;
  }

  async saveOverride(input: SessionOverride): Promise<void> {
    if (!isValidDateKey(input.date)) throw new Error(`Tanggal tidak sah: "${input.date}"`);
    if (input.kind === "libur") {
      this.overrides.set(input.date, {
        date: input.date,
        kind: "libur",
        ...(input.note ? { note: input.note } : {}),
      });
      return;
    }
    if (input.kind !== "ganti" || !input.session) throw new Error('Pengecualian "ganti" butuh isi kajian pengganti');
    const s = input.session;
    pastikanRentang(s.startTime, s.endTime);
    pastikanMode(s.mode);
    if (!s.ustadz || !s.topic) throw new Error("Kajian pengganti butuh ustadz dan tema");
    this.overrides.set(input.date, {
      date: input.date,
      kind: "ganti",
      ...(input.note ? { note: input.note } : {}),
      session: {
        startTime: s.startTime,
        endTime: s.endTime,
        ustadz: s.ustadz,
        topic: s.topic,
        mode: s.mode,
        ...(s.location ? { location: s.location } : {}),
      },
    });
  }

  async deleteOverride(date: string): Promise<void> {
    this.overrides.delete(date);
  }

  async listAnnouncements(): Promise<AnnouncementItem[]> {
    return [...this.announcements.values()].sort(terbaruDulu).map(bentukPengumuman);
  }

  async getAnnouncement(id: string): Promise<AnnouncementItem | null> {
    const input = this.announcements.get(id);
    return input ? bentukPengumuman(input) : null;
  }

  async saveAnnouncement(input: AnnouncementInput): Promise<{ previousImageUrl: string | null }> {
    if (!input.id) throw new Error("id pengumuman wajib diisi");
    if (!JENIS.includes(input.type)) throw new Error(`type tidak sah: "${input.type}"`);
    if (!isValidDateKey(input.date)) throw new Error(`Tanggal tidak sah: "${input.date}"`);
    if (input.time && !JAM.test(input.time)) throw new Error(`time bukan jam HH:mm: "${input.time}"`);
    pastikanPosisi(input.imagePosition);
    const previousImageUrl = this.announcements.get(input.id)?.imageUrl ?? null;
    this.announcements.set(input.id, { ...input });
    return { previousImageUrl };
  }

  async deleteAnnouncement(id: string): Promise<{ previousImageUrl: string | null }> {
    const previousImageUrl = this.announcements.get(id)?.imageUrl ?? null;
    this.announcements.delete(id);
    return { previousImageUrl };
  }

  async getSampleFlags(): Promise<Record<SectionKey, boolean>> {
    return { ...this.flags };
  }

  async setSampleFlag(section: SectionKey, isSample: boolean): Promise<void> {
    this.flags[section] = isSample;
  }
}
