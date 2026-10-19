import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { TimeRange } from "@/components/ui/TimeRange";
import { buttonClass } from "@/components/ui/buttonStyles";
import { sessionForDay, WEEK_ORDER } from "@/lib/schedule";
import { dayName, daySlug } from "@/lib/time";
import type { StudySession } from "@/types";

export const KARTU_DAFTAR =
  "flex flex-col gap-4 rounded-card border border-line bg-card p-5 shadow-card hc:border-2 sm:flex-row sm:items-center sm:justify-between huge:sm:flex-col huge:sm:items-stretch simple:sm:flex-col simple:sm:items-stretch";

/**
 * Tujuh kartu hari, Senin sampai Ahad. Hari yang punya jadwal tetap menampilkan jam, tema, dan ustadz dengan
 * tombol Ubah; hari kosong menampilkan "Tidak ada kajian" dengan tombol Tambah kajian.
 */
export function WeekDayList({
  sessions,
  labelledBy,
}: {
  sessions: readonly StudySession[];
  labelledBy?: string;
}) {
  return (
    <ul role="list" aria-labelledby={labelledBy} className="mt-4 grid grid-cols-1 gap-4">
      {WEEK_ORDER.map((day) => {
        const sesi = sessionForDay(sessions, day);
        const nama = dayName(day);
        return (
          <li key={day} className={KARTU_DAFTAR}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="text-2xl font-semibold text-brand">{nama}</h3>
                {sesi ? (
                  <p className="font-display text-xl font-semibold tabular-nums">
                    <TimeRange start={sesi.startTime} end={sesi.endTime} />
                  </p>
                ) : null}
              </div>
              {sesi ? (
                <>
                  <p className="mt-1 text-xl font-bold [overflow-wrap:anywhere]">{sesi.topic}</p>
                  <p className="text-lg text-ink-soft [overflow-wrap:anywhere]">{sesi.ustadz}</p>
                </>
              ) : (
                <p className="mt-1 text-xl text-ink-soft">Tidak ada kajian</p>
              )}
            </div>
            <Link href={`/admin/jadwal/${daySlug(day)}`} className={buttonClass("outline", "md", "w-full sm:w-auto")}>
              {sesi ? <Pencil aria-hidden className="size-6" /> : <Plus aria-hidden className="size-6" />}
              <span>
                {sesi ? "Ubah" : "Tambah kajian"}
                <span className="sr-only">{sesi ? ` jadwal hari ${nama}` : ` hari ${nama}`}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
