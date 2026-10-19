"use client";

import { CalendarOff, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { CardImage } from "@/components/ui/CardImage";
import { ModeChips } from "@/components/ui/ModeChips";
import { Section } from "@/components/ui/Section";
import { TimeRange } from "@/components/ui/TimeRange";
import { useWibNow } from "@/hooks/useWibNow";
import { effectiveSessionOn, sessionForDay, WEEK_ORDER, weekDateKeys } from "@/lib/schedule";
import { dayName, getWibParts } from "@/lib/time";
import type { DayIndex, ScheduleData, StudySession } from "@/types";

/** Lebar tampil gambar kartu: 3 kolom mulai 1024px (maks. ~400px), 2 kolom mulai 768px, 1 kolom di ponsel. */
const UKURAN_FOTO =
  "(min-width: 1296px) 400px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

const todayChip =
  "rounded-full border border-gilt bg-gold px-3 py-0.5 text-base font-bold text-on-gold shadow-elev-1";

/** Lencana perubahan di sudut gambar: ikon dan tulisan (tidak hanya warna), latar pekat agar terbaca di atas foto. */
const changeChip =
  "inline-flex items-center gap-1.5 rounded-full border-2 border-primary bg-tint px-3 py-0.5 text-base font-bold text-brand hc:border-black";

/** Satu kartu pada pekan berjalan: tanggalnya, dan jadwal yang berlaku pada tanggal itu. */
interface KartuHari {
  day: DayIndex;
  session: StudySession;
  changed?: "libur" | "ganti";
  note?: string;
}

/**
 * Kartu pekan berjalan (Senin sampai Ahad) menurut pengecualian yang berlaku pada tiap tanggalnya. Kartu tampil bila
 * ada kajian pada hari itu (tetap atau pengganti) atau hari itu diliburkan; hari tanpa kajian tidak tampil.
 */
function kartuPekan(schedule: ScheduleData, now: ReturnType<typeof getWibParts>): KartuHari[] {
  const tanggal = weekDateKeys(now);
  const overrides = schedule.overrides ?? [];
  return WEEK_ORDER.flatMap((day): KartuHari[] => {
    const efektif = effectiveSessionOn(tanggal[day], day, schedule.sessions, overrides);
    const catatan = efektif.note ? { note: efektif.note } : {};
    if (efektif.status === "cancelled") {
      // Gambar kartu tetap gambar jadwal tetap hari itu; tanpa jadwal tetap, kerangka kosong (hanya hari dan "Libur" yang tampil).
      const dasar: StudySession = sessionForDay(schedule.sessions, day) ?? {
        id: `libur-${tanggal[day]}`,
        day,
        startTime: "",
        endTime: "",
        ustadz: "",
        topic: "",
        mode: "masjid",
      };
      return [{ day, session: dasar, changed: "libur", ...catatan }];
    }
    if (!efektif.session) return [];
    return [{ day, session: efektif.session, ...(efektif.status === "changed" ? { changed: "ganti" as const } : {}), ...catatan }];
  });
}

/**
 * Jadwal sepekan berupa kartu bergambar: gambar kajian (atau gambar pengganti)
 * di atas, lalu hari, jam, tema, dan ustadz. Gambar yang sama tampil di
 * "Kajian Hari Ini" pada harinya. Tiga kolom di layar lebar, dua di tablet;
 * satu kolom di ponsel, Tampilan Sederhana, dan ukuran tulisan terbesar agar
 * kartu tetap lega.
 *
 * Pekan ditentukan dari `generatedAt` (waktu halaman dibuat) selama jam peramban belum diketahui, sehingga HTML
 * server dan render pertama di klien sama persis; sesudah itu jam peramban mengoreksinya. Sorotan "Hari ini"
 * hanya muncul setelah jam peramban diketahui.
 */
export function WeeklySchedule({ schedule, generatedAt }: { schedule: ScheduleData; generatedAt: string }) {
  const now = useWibNow();
  const today = now?.weekday;
  const kartu = useMemo(
    () => kartuPekan(schedule, now ?? getWibParts(new Date(generatedAt))),
    [schedule, now, generatedAt],
  );

  return (
    <Section
      id="jadwal-mingguan"
      title="Jadwal Kajian Sepekan"
      intro="Seluruh jam memakai Waktu Indonesia Barat (WIB)."
      isSample={schedule.isSample}
      tone="alt"
      ornament
    >
      {kartu.length === 0 ? (
        <p className="rounded-card border border-line bg-card p-8 text-xl text-ink-soft shadow-card hc:border-2">
          Jadwal kajian belum tersedia.
        </p>
      ) : (
        <ul
          role="list"
          aria-label="Jadwal kajian Pejuang Subuh Masjid Raya Pondok Indah, Senin sampai Ahad"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 huge:md:grid-cols-1 huge:lg:grid-cols-1 simple:md:grid-cols-1 simple:lg:grid-cols-1"
        >
          {kartu.map(({ day, session, changed, note }) => (
            <WeekCard
              key={session.id}
              session={session}
              isToday={day === today}
              changed={changed}
              note={note}
            />
          ))}
        </ul>
      )}
    </Section>
  );
}

/**
 * Satu kartu hari di Jadwal Sepekan. Di daftar memakai `<li>`; panel pengurus memakai
 * `as="div"` untuk pratinjau di luar daftar. `changed="libur"`: lencana "Libur", jam diganti "Libur", tema
 * "Kajian diliburkan", catatan di baris ustadz. `changed="ganti"`: lencana "Ada perubahan"; jam, tema, dan
 * ustadz adalah kajian pengganti.
 */
export function WeekCard({
  session,
  isToday,
  as: Tag = "li",
  changed,
  note,
}: {
  session: StudySession;
  isToday: boolean;
  as?: "li" | "div";
  changed?: "libur" | "ganti";
  note?: string;
}) {
  const libur = changed === "libur";
  const Ikon = libur ? CalendarOff : RefreshCw;

  return (
    <Tag
      aria-current={isToday ? "date" : undefined}
      className={`flex flex-col overflow-hidden rounded-card border bg-card transition-shadow duration-(--dur-state) ease-out-expo hover:shadow-elev-2 hc:border-2 ${
        isToday ? "border-gilt shadow-elev-2 ring-2 ring-gold/60 ring-offset-2 ring-offset-paper-2" : "border-line shadow-card"
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
        {changed ? (
          <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2">
            {isToday ? <span className={todayChip}>Hari ini</span> : null}
            <span className={changeChip}>
              <Ikon aria-hidden className="size-4" />
              {libur ? "Libur" : "Ada perubahan"}
            </span>
          </div>
        ) : isToday ? (
          <span className={`${todayChip} absolute left-4 top-4`}>Hari ini</span>
        ) : null}
      </div>
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-2xl font-semibold text-brand">{dayName(session.day)}</h3>
          <p className="font-display text-xl font-semibold tabular-nums">
            {libur ? "Libur" : <TimeRange start={session.startTime} end={session.endTime} />}
          </p>
        </div>
        <p className="mt-3 text-xl font-bold [overflow-wrap:anywhere]">
          {libur ? "Kajian diliburkan" : session.topic}
        </p>
        {libur ? (
          note ? <p className="text-lg text-ink-soft [overflow-wrap:anywhere]">Catatan: {note}</p> : null
        ) : (
          <p className="text-lg text-ink-soft [overflow-wrap:anywhere]">{session.ustadz}</p>
        )}
        {changed === "ganti" && note ? (
          <p className="text-lg text-ink-soft [overflow-wrap:anywhere]">Catatan: {note}</p>
        ) : null}
        {libur ? null : (
          <div className="mt-3">
            <ModeChips session={session} />
          </div>
        )}
      </div>
    </Tag>
  );
}
