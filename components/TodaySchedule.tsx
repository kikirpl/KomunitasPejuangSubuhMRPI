"use client";

import { CalendarOff, CalendarX2, CircleCheck, Clock, Play, RefreshCw, Video } from "lucide-react";
import { CardImage } from "@/components/ui/CardImage";
import { ModeChips } from "@/components/ui/ModeChips";
import { Section } from "@/components/ui/Section";
import { buttonClass } from "@/components/ui/buttonStyles";
import { useWibNow } from "@/hooks/useWibNow";
import {
  effectiveSessionOn,
  hasZoom,
  nextSessionAfterToday,
  sessionStatus,
  type SessionStatus,
} from "@/lib/schedule";
import {
  dayName,
  formatLongDate,
  formatTime,
  greetingForHour,
  toDateKey,
  type WibParts,
} from "@/lib/time";
import type { DayIndex, ScheduleData, StudySession } from "@/types";

const STATUS: Record<
  SessionStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  upcoming: {
    label: "Belum dimulai",
    className: "border-primary bg-tint text-brand",
    Icon: Clock,
  },
  ongoing: {
    label: "Sedang berlangsung",
    className: "border-gold bg-gold text-on-gold",
    Icon: Play,
  },
  finished: {
    label: "Sudah selesai",
    className: "border-line-soft bg-tint text-ink-soft",
    Icon: CircleCheck,
  },
};

/** Lebar tampil gambar: kolom kiri 22rem (~396px) mulai 1024px, 18rem (~324px) mulai 768px, selebar kartu di ponsel. */
const UKURAN_FOTO = "(min-width: 1024px) 440px, (min-width: 768px) 360px, 100vw";

/**
 * Kartu khusus untuk kajian hari ini (WIB), dengan status yang diperbarui tiap menit.
 * Gambar kajian (atau gambar pengganti) sama dengan kartunya di Jadwal Sepekan.
 */
export function TodaySchedule({ schedule }: { schedule: ScheduleData }) {
  const now = useWibNow();

  return (
    <Section
      id="jadwal-hari-ini"
      title="Kajian Hari Ini"
      intro={
        now
          ? `${greetingForHour(now.hour)}. Hari ini ${formatLongDate(now)}.`
          : undefined
      }
      isSample={schedule.isSample}
    >
      {now ? <TodayContent now={now} schedule={schedule} /> : <TodaySkeleton />}
    </Section>
  );
}

/**
 * Isi kartu Kajian Hari Ini untuk waktu `now` (WIB). Pengecualian tanggal hari ini mengalahkan jadwal tetap:
 * libur menampilkan kartu "Kajian hari ini diliburkan"; ganti menampilkan kajian pengganti dengan lencana
 * "Ada perubahan hari ini". Kotak "Kajian berikutnya" tampil bila hari ini tidak ada kajian, diliburkan, atau sudah selesai.
 */
export function TodayContent({ now, schedule }: { now: WibParts; schedule: ScheduleData }) {
  const overrides = schedule.overrides ?? [];
  const hariIni = effectiveSessionOn(toDateKey(now), now.weekday, schedule.sessions, overrides);
  const today = hariIni.session;
  const next = nextSessionAfterToday(schedule.sessions, overrides, now);
  const finishedOrNone = !today || sessionStatus(today, now) === "finished";

  return (
    <div className="space-y-6">
      {today ? (
        <TodayCard
          session={today}
          status={sessionStatus(today, now)}
          changed={hariIni.status === "changed" ? "ganti" : undefined}
          note={hariIni.note}
        />
      ) : hariIni.status === "cancelled" ? (
        <CancelledCard note={hariIni.note} />
      ) : (
        <div className="flex items-start gap-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8 hc:border-2">
          <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-tint text-accent ring-1 ring-gilt/35 hc:ring-line">
            <CalendarX2 className="size-7" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 className="text-2xl font-semibold text-brand">
              Hari ini tidak ada kajian
            </h3>
            <p className="mt-2 text-xl text-ink-soft">
              Insya Allah kita bertemu kembali pada kajian berikutnya.
            </p>
          </div>
        </div>
      )}

      {finishedOrNone && next ? (
        <NextNote
          session={next.session}
          daysAhead={next.daysAhead}
          changed={next.status === "changed"}
        />
      ) : null}
    </div>
  );
}

/** Kartu pada hari libur: "Kajian hari ini diliburkan" dengan catatan untuk jamaah bila ada. */
export function CancelledCard({ note }: { note?: string }) {
  return (
    <div className="flex items-start gap-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8 hc:border-2">
      <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-gold-tint text-ink ring-1 ring-gilt/50 hc:ring-line">
        <CalendarOff className="size-7" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <h3 className="text-2xl font-semibold text-brand">Kajian hari ini diliburkan</h3>
        {note ? (
          <p className="mt-2 text-xl text-ink-soft [overflow-wrap:anywhere]">Catatan: {note}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TodayCard({
  session,
  status,
  changed,
  note,
}: {
  session: StudySession;
  status: SessionStatus;
  /** "ganti": kajian pengganti pada tanggal ini (lencana "Ada perubahan hari ini"). */
  changed?: "ganti";
  /** Catatan untuk jamaah dari pengecualian, tampil di bawah tema. */
  note?: string;
}) {
  const { label, className, Icon } = STATUS[status];

  const statusPill = (
    <p
      className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-lg font-bold ${className}`}
    >
      <Icon aria-hidden className="size-5" />
      {label}
    </p>
  );

  return (
    <article className="overflow-hidden rounded-card border border-line bg-card shadow-card hc:border-2 md:grid md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[22rem_minmax(0,1fr)] simple:md:grid-cols-1 huge:md:grid-cols-1 simple:lg:grid-cols-1 huge:lg:grid-cols-1">
      <div className="flex flex-col border-b border-line md:border-b-0 md:border-r simple:md:border-b simple:md:border-r-0 huge:md:border-b huge:md:border-r-0">
        {/* max-h-72 (dengan w-full): pada tata letak satu kolom yang lebar (Tampilan Sederhana, huruf terbesar) gambar menjadi spanduk, bukan raksasa. */}
        <CardImage
          type="kajian"
          imageUrl={session.imageUrl}
          alt={session.imageAlt}
          position={session.imagePosition}
          sizes={UKURAN_FOTO}
          className="w-full max-h-72"
        />
        {/* Panel jam: langit Subuh dengan pola girih samar dan garis daun emas di tepi atasnya. */}
        <div className="on-dark relative flex flex-1 flex-col justify-center overflow-hidden bg-brand-deep px-6 py-8 text-on-brand md:px-8">
          <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold to-transparent hc:h-0.5 hc:bg-gold hc:bg-none" />
          <p className="relative text-lg text-on-brand-soft">Mulai pukul</p>
          <p className="relative font-display text-6xl font-semibold leading-[1.15] tabular-nums huge:text-4xl huge:md:text-6xl">
            {formatTime(session.startTime)}
          </p>
          <p className="relative mt-3 text-xl text-on-brand-soft">
            WIB, selesai{" "}
            <span className="font-display font-semibold tabular-nums">
              {formatTime(session.endTime)}
            </span>
          </p>
        </div>
      </div>

      <div className="px-6 py-8 md:flex md:flex-col md:justify-center md:px-8">
        <div>
          {changed ? (
            <div className="flex flex-wrap items-center gap-2">
              {statusPill}
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-gold bg-gold-tint px-4 py-1.5 text-lg font-bold text-ink hc:border-black">
                <RefreshCw aria-hidden className="size-5" />
                Ada perubahan hari ini
              </p>
            </div>
          ) : (
            statusPill
          )}
          <h3 className="mt-4 text-3xl font-semibold text-brand [overflow-wrap:anywhere]">{session.topic}</h3>
          {note ? (
            <p className="mt-2 text-xl text-ink-soft [overflow-wrap:anywhere]">Catatan: {note}</p>
          ) : null}
          <p className="mt-2 text-xl text-ink-soft [overflow-wrap:anywhere]">
            Bersama <strong className="text-ink">{session.ustadz}</strong>
          </p>
          <div className="mt-5">
            <ModeChips session={session} />
          </div>
          {hasZoom(session) && status !== "finished" ? (
            <a href="#zoom" className={buttonClass("primary", "lg", "mt-7 w-full sm:w-auto")}>
              <Video aria-hidden className="size-7" />
              Ikut lewat Zoom
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function NextNote({
  session,
  daysAhead,
  changed,
}: {
  session: StudySession;
  daysAhead: number;
  changed?: boolean;
}) {
  const when = daysAhead === 1 ? "Besok" : dayName(session.day as DayIndex);
  return (
    <div className="rounded-card border border-line bg-tint px-6 py-5 text-xl hc:border-2">
      <p>
        <strong className="text-brand">Kajian berikutnya: {when}</strong>, pukul{" "}
        {formatTime(session.startTime)} WIB{changed ? " (ada perubahan)" : ""}.
      </p>
      <p className="mt-1 text-ink-soft [overflow-wrap:anywhere]">
        {session.topic}, bersama {session.ustadz}.
      </p>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div
      role="status"
      className="rounded-card border border-line bg-card p-8 shadow-card hc:border-2"
    >
      <p className="text-xl text-ink-soft">Memuat jadwal hari ini...</p>
      <div aria-hidden className="mt-5 space-y-3">
        <div className="h-8 w-1/3 animate-pulse rounded-control bg-paper-2" />
        <div className="h-6 w-2/3 animate-pulse rounded-control bg-paper-2" />
      </div>
    </div>
  );
}
