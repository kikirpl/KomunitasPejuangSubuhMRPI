/**
 * Skema Postgres untuk konten dinamis (spec §5). Satu pernyataan per butir supaya bisa dijalankan
 * lewat transaksi HTTP Neon maupun PGlite. Semuanya IF NOT EXISTS, jadi aman dijalankan ulang.
 * Panjang teks dibatasi di lapisan zod, bukan di database.
 */
const JAM = "'^([01][0-9]|2[0-3]):[0-5][0-9]$'";
const POSISI = "('top', 'center', 'bottom')";

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS sessions (
  day            smallint PRIMARY KEY CHECK (day BETWEEN 0 AND 6),
  start_time     text NOT NULL CHECK (start_time ~ ${JAM}),
  end_time       text NOT NULL CHECK (end_time ~ ${JAM}),
  ustadz         text NOT NULL,
  topic          text NOT NULL,
  mode           text NOT NULL CHECK (mode IN ('masjid', 'zoom', 'hybrid')),
  location       text,
  image_url      text,
  image_alt      text,
  image_position text NOT NULL DEFAULT 'center' CHECK (image_position IN ${POSISI}),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
)`,
  `CREATE TABLE IF NOT EXISTS session_overrides (
  date        date PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('libur', 'ganti')),
  note        text,
  start_time  text CHECK (start_time IS NULL OR start_time ~ ${JAM}),
  end_time    text CHECK (end_time IS NULL OR end_time ~ ${JAM}),
  ustadz      text,
  topic       text,
  mode        text CHECK (mode IS NULL OR mode IN ('masjid', 'zoom', 'hybrid')),
  location    text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (
    kind = 'libur'
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND ustadz IS NOT NULL
        AND topic IS NOT NULL AND mode IS NOT NULL AND end_time > start_time)
  )
)`,
  `CREATE TABLE IF NOT EXISTS announcements (
  id             text PRIMARY KEY,
  type           text NOT NULL CHECK (type IN ('kegiatan', 'pengumuman')),
  title          text NOT NULL,
  event_date     date NOT NULL,
  event_time     text CHECK (event_time IS NULL OR event_time ~ ${JAM}),
  excerpt        text NOT NULL,
  image_url      text,
  image_alt      text,
  image_position text NOT NULL DEFAULT 'center' CHECK (image_position IN ${POSISI}),
  href           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
)`,
  `CREATE INDEX IF NOT EXISTS announcements_event_date_idx ON announcements (event_date DESC)`,
  `CREATE TABLE IF NOT EXISTS section_meta (
  section    text PRIMARY KEY CHECK (section IN ('schedule', 'announcements')),
  is_sample  boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
)`,
];
