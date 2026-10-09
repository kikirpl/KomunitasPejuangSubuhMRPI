import { neon } from "@neondatabase/serverless";
import { daySlug } from "@/lib/time";
import type {
  AnnouncementItem,
  AnnouncementType,
  DayIndex,
  ImagePosition,
  SectionKey,
  SessionMode,
  SessionOverride,
  StudySession,
} from "@/types";
import { SCHEMA_STATEMENTS } from "./schema";
import { buildSeed } from "./seed";
import type { AnnouncementInput, ContentStore, SessionInput } from "./types";

/** Antarmuka SQL minimal; isinya Neon (produksi) atau PGlite (tes). */
export interface SqlClient {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  /** Beberapa pernyataan dalam satu transaksi; mengembalikan baris tiap pernyataan. */
  transaction(statements: { text: string; params?: unknown[] }[]): Promise<Record<string, unknown>[][]>;
}

/** Klien Neon lewat HTTP: tidak membuka koneksi sampai kueri pertama. */
export function createNeonClient(connectionString: string): SqlClient {
  const sql = neon(connectionString);
  return {
    async query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
      return (await sql.query(text, params)) as T[];
    },
    async transaction(statements) {
      const hasil = await sql.transaction(statements.map((s) => sql.query(s.text, s.params ?? [])));
      return hasil as Record<string, unknown>[][];
    },
  };
}

interface SessionRow {
  day: number;
  start_time: string;
  end_time: string;
  ustadz: string;
  topic: string;
  mode: SessionMode;
  location: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_position: ImagePosition;
}

interface OverrideRow {
  date: string;
  kind: "libur" | "ganti";
  note: string | null;
  start_time: string | null;
  end_time: string | null;
  ustadz: string | null;
  topic: string | null;
  mode: SessionMode | null;
  location: string | null;
}

interface AnnouncementRow {
  id: string;
  type: AnnouncementType;
  title: string;
  event_date: string;
  event_time: string | null;
  excerpt: string;
  image_url: string | null;
  image_alt: string | null;
  image_position: ImagePosition;
  href: string | null;
}

// Kolom tanggal selalu dibaca sebagai teks agar tidak ada pergeseran zona waktu pada driver mana pun.
const KOLOM_KAJIAN = "day, start_time, end_time, ustadz, topic, mode, location, image_url, image_alt, image_position";
const KOLOM_PENGECUALIAN = "date::text AS date, kind, note, start_time, end_time, ustadz, topic, mode, location";
const KOLOM_PENGUMUMAN =
  "id, type, title, event_date::text AS event_date, event_time, excerpt, image_url, image_alt, image_position, href";
const URUT_PENGUMUMAN = "ORDER BY event_date DESC, event_time DESC NULLS LAST, id";

function kajianDariBaris(r: SessionRow): StudySession {
  const day = Number(r.day) as DayIndex;
  return {
    id: daySlug(day),
    day,
    startTime: r.start_time,
    endTime: r.end_time,
    ustadz: r.ustadz,
    topic: r.topic,
    mode: r.mode,
    ...(r.location ? { location: r.location } : {}),
    ...(r.image_url ? { imageUrl: r.image_url } : {}),
    ...(r.image_alt ? { imageAlt: r.image_alt } : {}),
    imagePosition: r.image_position,
  };
}

function pengecualianDariBaris(r: OverrideRow): SessionOverride {
  const dasar = { date: r.date, kind: r.kind, ...(r.note ? { note: r.note } : {}) };
  if (r.kind === "ganti" && r.start_time && r.end_time && r.ustadz && r.topic && r.mode) {
    return {
      ...dasar,
      session: {
        startTime: r.start_time,
        endTime: r.end_time,
        ustadz: r.ustadz,
        topic: r.topic,
        mode: r.mode,
        ...(r.location ? { location: r.location } : {}),
      },
    };
  }
  return dasar;
}

function pengumumanDariBaris(r: AnnouncementRow): AnnouncementItem {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    date: r.event_time ? `${r.event_date}T${r.event_time}:00+07:00` : r.event_date,
    excerpt: r.excerpt,
    ...(r.image_url ? { imageUrl: r.image_url } : {}),
    ...(r.image_alt ? { imageAlt: r.image_alt } : {}),
    imagePosition: r.image_position,
    ...(r.href ? { href: r.href } : {}),
  };
}

const parameterKajian = (day: number, i: SessionInput): unknown[] => [
  day,
  i.startTime,
  i.endTime,
  i.ustadz,
  i.topic,
  i.mode,
  i.location ?? null,
  i.imageUrl ?? null,
  i.imageAlt ?? null,
  i.imagePosition,
];

const parameterPengumuman = (a: AnnouncementInput): unknown[] => [
  a.id,
  a.type,
  a.title,
  a.date,
  a.time ?? null,
  a.excerpt,
  a.imageUrl ?? null,
  a.imageAlt ?? null,
  a.imagePosition,
  a.href ?? null,
];

const SISIP_KAJIAN = `INSERT INTO sessions (${KOLOM_KAJIAN})
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
const SISIP_PENGUMUMAN = `INSERT INTO announcements (id, type, title, event_date, event_time, excerpt, image_url, image_alt, image_position, href)
VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10)`;

export class SqlStore implements ContentStore {
  constructor(private readonly db: SqlClient) {}

  async isReady(): Promise<boolean> {
    const [ada] = await this.db.query<{ ok: string | null }>("SELECT to_regclass('public.section_meta')::text AS ok");
    if (!ada?.ok) return false;
    const [jumlah] = await this.db.query<{ n: string | number }>("SELECT count(*) AS n FROM section_meta");
    return Number(jumlah?.n ?? 0) > 0;
  }

  async setup(): Promise<void> {
    await this.db.transaction(SCHEMA_STATEMENTS.map((text) => ({ text })));
    // Data awal hanya diisi sekali; penyiapan ulang tidak menghidupkan lagi butir yang sengaja dihapus.
    if (await this.isReady()) return;
    const seed = buildSeed();
    await this.db.transaction([
      ...seed.sessions.map(({ day, input }) => ({
        text: `${SISIP_KAJIAN} ON CONFLICT (day) DO NOTHING`,
        params: parameterKajian(day, input),
      })),
      ...seed.announcements.map((a) => ({
        text: `${SISIP_PENGUMUMAN} ON CONFLICT (id) DO NOTHING`,
        params: parameterPengumuman(a),
      })),
      // Terakhir: baris ini menandai database siap, jadi kegagalan di tengah menggulung semuanya.
      ...(Object.entries(seed.flags) as [SectionKey, boolean][]).map(([section, isSample]) => ({
        text: "INSERT INTO section_meta (section, is_sample) VALUES ($1, $2) ON CONFLICT (section) DO NOTHING",
        params: [section, isSample],
      })),
    ]);
  }

  async readPublic(sinceKey: string) {
    const [sesi, pengecualian, pengumuman, penanda] = await this.db.transaction([
      { text: `SELECT ${KOLOM_KAJIAN} FROM sessions ORDER BY day` },
      {
        text: `SELECT ${KOLOM_PENGECUALIAN} FROM session_overrides WHERE date >= $1::date ORDER BY date`,
        params: [sinceKey],
      },
      { text: `SELECT ${KOLOM_PENGUMUMAN} FROM announcements ${URUT_PENGUMUMAN}` },
      { text: "SELECT section, is_sample FROM section_meta" },
    ]);
    const flags = this.petakanPenanda(penanda as { section: SectionKey; is_sample: boolean }[]);
    return {
      schedule: {
        isSample: flags.schedule,
        sessions: (sesi as unknown as SessionRow[]).map(kajianDariBaris),
        overrides: (pengecualian as unknown as OverrideRow[]).map(pengecualianDariBaris),
      },
      announcements: {
        isSample: flags.announcements,
        items: (pengumuman as unknown as AnnouncementRow[]).map(pengumumanDariBaris),
      },
    };
  }

  private petakanPenanda(rows: { section: SectionKey; is_sample: boolean }[]): Record<SectionKey, boolean> {
    const flags: Record<SectionKey, boolean> = { schedule: true, announcements: true };
    for (const r of rows) flags[r.section] = Boolean(r.is_sample);
    return flags;
  }

  async listSessions(): Promise<StudySession[]> {
    const rows = await this.db.query<SessionRow>(`SELECT ${KOLOM_KAJIAN} FROM sessions ORDER BY day`);
    return rows.map(kajianDariBaris);
  }

  async getSession(day: DayIndex): Promise<StudySession | null> {
    const [row] = await this.db.query<SessionRow>(`SELECT ${KOLOM_KAJIAN} FROM sessions WHERE day = $1`, [day]);
    return row ? kajianDariBaris(row) : null;
  }

  async saveSession(day: DayIndex, input: SessionInput): Promise<{ previousImageUrl: string | null }> {
    const [row] = await this.db.query<{ previous_image_url: string | null }>(
      `WITH old AS (SELECT image_url FROM sessions WHERE day = $1)
INSERT INTO sessions (${KOLOM_KAJIAN}, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
ON CONFLICT (day) DO UPDATE SET
  start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, ustadz = EXCLUDED.ustadz,
  topic = EXCLUDED.topic, mode = EXCLUDED.mode, location = EXCLUDED.location,
  image_url = EXCLUDED.image_url, image_alt = EXCLUDED.image_alt,
  image_position = EXCLUDED.image_position, updated_at = now()
RETURNING (SELECT image_url FROM old) AS previous_image_url`,
      parameterKajian(day, input),
    );
    return { previousImageUrl: row?.previous_image_url ?? null };
  }

  async deleteSession(day: DayIndex): Promise<{ previousImageUrl: string | null }> {
    const [row] = await this.db.query<{ image_url: string | null }>(
      "DELETE FROM sessions WHERE day = $1 RETURNING image_url",
      [day],
    );
    return { previousImageUrl: row?.image_url ?? null };
  }

  async listOverrides(fromKey: string): Promise<SessionOverride[]> {
    const rows = await this.db.query<OverrideRow>(
      `SELECT ${KOLOM_PENGECUALIAN} FROM session_overrides WHERE date >= $1::date ORDER BY date`,
      [fromKey],
    );
    return rows.map(pengecualianDariBaris);
  }

  async getOverride(date: string): Promise<SessionOverride | null> {
    const [row] = await this.db.query<OverrideRow>(
      `SELECT ${KOLOM_PENGECUALIAN} FROM session_overrides WHERE date = $1::date`,
      [date],
    );
    return row ? pengecualianDariBaris(row) : null;
  }

  async saveOverride(input: SessionOverride): Promise<void> {
    if (input.kind === "ganti" && !input.session) {
      throw new Error('Pengecualian "ganti" butuh isi kajian pengganti');
    }
    // "libur" selalu membuang isi pengganti lama pada tanggal yang sama.
    const s = input.kind === "ganti" ? input.session : undefined;
    await this.db.query(
      `INSERT INTO session_overrides (date, kind, note, start_time, end_time, ustadz, topic, mode, location, updated_at)
VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, now())
ON CONFLICT (date) DO UPDATE SET
  kind = EXCLUDED.kind, note = EXCLUDED.note, start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time,
  ustadz = EXCLUDED.ustadz, topic = EXCLUDED.topic, mode = EXCLUDED.mode, location = EXCLUDED.location,
  updated_at = now()`,
      [
        input.date,
        input.kind,
        input.note ?? null,
        s?.startTime ?? null,
        s?.endTime ?? null,
        s?.ustadz ?? null,
        s?.topic ?? null,
        s?.mode ?? null,
        s?.location ?? null,
      ],
    );
  }

  async deleteOverride(date: string): Promise<void> {
    await this.db.query("DELETE FROM session_overrides WHERE date = $1::date", [date]);
  }

  async listAnnouncements(): Promise<AnnouncementItem[]> {
    const rows = await this.db.query<AnnouncementRow>(
      `SELECT ${KOLOM_PENGUMUMAN} FROM announcements ${URUT_PENGUMUMAN}`,
    );
    return rows.map(pengumumanDariBaris);
  }

  async getAnnouncement(id: string): Promise<AnnouncementItem | null> {
    const [row] = await this.db.query<AnnouncementRow>(
      `SELECT ${KOLOM_PENGUMUMAN} FROM announcements WHERE id = $1`,
      [id],
    );
    return row ? pengumumanDariBaris(row) : null;
  }

  async saveAnnouncement(input: AnnouncementInput): Promise<{ previousImageUrl: string | null }> {
    const [row] = await this.db.query<{ previous_image_url: string | null }>(
      `WITH old AS (SELECT image_url FROM announcements WHERE id = $1)
${SISIP_PENGUMUMAN}
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type, title = EXCLUDED.title, event_date = EXCLUDED.event_date, event_time = EXCLUDED.event_time,
  excerpt = EXCLUDED.excerpt, image_url = EXCLUDED.image_url, image_alt = EXCLUDED.image_alt,
  image_position = EXCLUDED.image_position, href = EXCLUDED.href, updated_at = now()
RETURNING (SELECT image_url FROM old) AS previous_image_url`,
      parameterPengumuman(input),
    );
    return { previousImageUrl: row?.previous_image_url ?? null };
  }

  async deleteAnnouncement(id: string): Promise<{ previousImageUrl: string | null }> {
    const [row] = await this.db.query<{ image_url: string | null }>(
      "DELETE FROM announcements WHERE id = $1 RETURNING image_url",
      [id],
    );
    return { previousImageUrl: row?.image_url ?? null };
  }

  async getSampleFlags(): Promise<Record<SectionKey, boolean>> {
    const rows = await this.db.query<{ section: SectionKey; is_sample: boolean }>(
      "SELECT section, is_sample FROM section_meta",
    );
    return this.petakanPenanda(rows);
  }

  async setSampleFlag(section: SectionKey, isSample: boolean): Promise<void> {
    await this.db.query(
      `INSERT INTO section_meta (section, is_sample, updated_at) VALUES ($1, $2, now())
ON CONFLICT (section) DO UPDATE SET is_sample = EXCLUDED.is_sample, updated_at = now()`,
      [section, isSample],
    );
  }
}
