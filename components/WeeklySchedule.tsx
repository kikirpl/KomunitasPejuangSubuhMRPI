"use client";

import { useMemo } from "react";
import { CardImage } from "@/components/ui/CardImage";
import { ModeChips } from "@/components/ui/ModeChips";
import { Section } from "@/components/ui/Section";
import { TimeRange } from "@/components/ui/TimeRange";
import { useWibNow } from "@/hooks/useWibNow";
import { sortWeek } from "@/lib/schedule";
import { dayName } from "@/lib/time";
import type { ScheduleData, StudySession } from "@/types";

/** Lebar tampil gambar kartu: 3 kolom mulai 1024px (maks. ~400px), 2 kolom mulai 768px, 1 kolom di ponsel. */
const UKURAN_FOTO =
  "(min-width: 1296px) 400px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

const todayChip =
  "rounded-full bg-gold px-3 py-0.5 text-base font-bold text-on-gold";

/**
 * Jadwal sepekan berupa kartu bergambar: gambar kajian (atau gambar pengganti)
 * di atas, lalu hari, jam, tema, dan ustadz. Gambar yang sama tampil di
 * "Kajian Hari Ini" pada harinya. Tiga kolom di layar lebar, dua di tablet;
 * satu kolom di ponsel, Tampilan Sederhana, dan ukuran tulisan terbesar agar
 * kartu tetap lega.
 */
export function WeeklySchedule({ schedule }: { schedule: ScheduleData }) {
  const now = useWibNow();
  const today = now?.weekday;
  const week = useMemo(() => sortWeek(schedule.sessions), [schedule.sessions]);

  return (
    <Section
      id="jadwal-mingguan"
      title="Jadwal Kajian Sepekan"
      intro="Seluruh jam memakai Waktu Indonesia Barat (WIB)."
      isSample={schedule.isSample}
      tone="alt"
      ornament
    >
      <ul
        role="list"
        aria-label="Jadwal kajian Pejuang Subuh Masjid Raya Pondok Indah, Senin sampai Ahad"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 huge:md:grid-cols-1 huge:lg:grid-cols-1 simple:md:grid-cols-1 simple:lg:grid-cols-1"
      >
        {week.map((session) => (
          <WeekCard key={session.id} session={session} isToday={session.day === today} />
        ))}
      </ul>
    </Section>
  );
}

/**
 * Satu kartu hari di Jadwal Sepekan. Di daftar memakai `<li>`; panel pengurus memakai
 * `as="div"` untuk pratinjau di luar daftar.
 */
export function WeekCard({
  session,
  isToday,
  as: Tag = "li",
}: {
  session: StudySession;
  isToday: boolean;
  as?: "li" | "div";
}) {
  return (
    <Tag
      aria-current={isToday ? "date" : undefined}
      className={`flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card hc:border-2 ${
        isToday ? "border-gold ring-4 ring-gold/40" : "border-line"
      }`}
    >
      {/* Lencana di sudut gambar, jadi judul kartu tetap sejajar dengan kartu di sebelahnya. */}
      <div className="relative">
        <CardImage
          type="kajian"
          imageUrl={session.imageUrl}
          alt={session.imageAlt}
          position={session.imagePosition}
          sizes={UKURAN_FOTO}
          className="w-full max-h-72"
        />
        {isToday ? (
          <span className={`${todayChip} absolute left-4 top-4`}>Hari ini</span>
        ) : null}
      </div>
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-2xl font-semibold text-brand">{dayName(session.day)}</h3>
          <p className="font-display text-xl font-semibold tabular-nums">
            <TimeRange start={session.startTime} end={session.endTime} />
          </p>
        </div>
        <p className="mt-3 text-xl font-bold [overflow-wrap:anywhere]">{session.topic}</p>
        <p className="text-lg text-ink-soft [overflow-wrap:anywhere]">{session.ustadz}</p>
        <div className="mt-3">
          <ModeChips session={session} />
        </div>
      </div>
    </Tag>
  );
}
