import type {
  AnnouncementItem,
  AnnouncementType,
  DayIndex,
  ImagePosition,
  PublicContent,
  SectionKey,
  SessionMode,
  SessionOverride,
  StudySession,
} from "@/types";

/** Isian satu kajian tetap (satu hari). `id` dan `day` ditentukan oleh store dari hari. */
export interface SessionInput {
  /** "HH:mm" WIB. */
  startTime: string;
  endTime: string;
  ustadz: string;
  topic: string;
  mode: SessionMode;
  location?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition: ImagePosition;
}

/** Isian satu kegiatan atau pengumuman. `id` ditentukan pemanggil (UUID dari halaman "baru"). */
export interface AnnouncementInput {
  id: string;
  type: AnnouncementType;
  title: string;
  /** "YYYY-MM-DD". */
  date: string;
  /** "HH:mm" WIB, opsional. */
  time?: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition: ImagePosition;
  href?: string;
}

/**
 * Penyimpanan isi dinamis situs. Dua isi: SqlStore (Neon) dan MemoryStore (lokal).
 * Tes kontrak yang sama dijalankan terhadap keduanya (tests/store.contract.ts).
 */
export interface ContentStore {
  /** Tabel sudah ada dan data awal sudah terisi. Tidak melempar bila tabel belum ada. */
  isReady(): Promise<boolean>;
  /** Membuat tabel dan mengisi data awal dari data/content.ts. Idempoten dan tidak menimpa data. */
  setup(): Promise<void>;
  /** Isi untuk halaman publik; pengecualian dimuat mulai `sinceKey` ("YYYY-MM-DD"). */
  readPublic(sinceKey: string): Promise<Omit<PublicContent, "generatedAt">>;

  listSessions(): Promise<StudySession[]>;
  getSession(day: DayIndex): Promise<StudySession | null>;
  saveSession(day: DayIndex, input: SessionInput): Promise<{ previousImageUrl: string | null }>;
  deleteSession(day: DayIndex): Promise<{ previousImageUrl: string | null }>;

  /** Pengecualian mulai `fromKey`, urut tanggal naik. */
  listOverrides(fromKey: string): Promise<SessionOverride[]>;
  getOverride(date: string): Promise<SessionOverride | null>;
  /** Upsert per tanggal. "ganti" tanpa `session` yang lengkap ditolak. */
  saveOverride(input: SessionOverride): Promise<void>;
  deleteOverride(date: string): Promise<void>;

  /** Terbaru lebih dulu. */
  listAnnouncements(): Promise<AnnouncementItem[]>;
  getAnnouncement(id: string): Promise<AnnouncementItem | null>;
  /** Upsert per id: menyimpan dua kali dengan id yang sama tetap satu baris. */
  saveAnnouncement(input: AnnouncementInput): Promise<{ previousImageUrl: string | null }>;
  deleteAnnouncement(id: string): Promise<{ previousImageUrl: string | null }>;

  getSampleFlags(): Promise<Record<SectionKey, boolean>>;
  setSampleFlag(section: SectionKey, isSample: boolean): Promise<void>;
}
