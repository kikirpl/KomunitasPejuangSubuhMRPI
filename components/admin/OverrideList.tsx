import { Pencil } from "lucide-react";
import Link from "next/link";
import { KARTU_DAFTAR } from "@/components/admin/WeekDayList";
import { TimeRange } from "@/components/ui/TimeRange";
import { buttonClass } from "@/components/ui/buttonStyles";
import { formatDateKeyLong } from "@/lib/time";
import type { SessionOverride } from "@/types";

/**
 * Perubahan untuk tanggal tertentu, terdekat dulu (urutan dari penyimpanan). Tanpa perubahan: kalimat
 * kosong yang menunjuk tombol di bawahnya (bukan layar kosong tanpa petunjuk).
 */
export function OverrideList({
  overrides,
  labelledBy,
}: {
  overrides: readonly SessionOverride[];
  labelledBy?: string;
}) {
  if (overrides.length === 0) {
    return (
      <p className="mt-4 rounded-2xl border-2 border-dashed border-line-soft bg-card p-5 text-xl text-ink-soft hc:border-black">
        Belum ada perubahan tanggal. Gunakan tombol di bawah bila kajian libur atau diganti pada tanggal
        tertentu.
      </p>
    );
  }

  return (
    <ul role="list" aria-labelledby={labelledBy} className="mt-4 grid grid-cols-1 gap-4">
      {overrides.map((o) => {
        const tanggal = formatDateKeyLong(o.date);
        const pengganti = o.kind === "ganti" ? o.session : undefined;
        return (
          <li key={o.date} className={KARTU_DAFTAR}>
            <div className="min-w-0">
              <h3 className="text-2xl font-semibold text-brand">{tanggal}</h3>
              <p className="mt-1 text-xl font-bold [overflow-wrap:anywhere]">
                {o.kind === "libur" ? "Libur" : `Diganti: ${pengganti?.topic ?? ""}`}
              </p>
              {pengganti ? (
                <p className="text-lg text-ink-soft [overflow-wrap:anywhere]">
                  <span className="tabular-nums">
                    <TimeRange start={pengganti.startTime} end={pengganti.endTime} />
                  </span>
                  {` · ${pengganti.ustadz}`}
                </p>
              ) : null}
              {o.note ? (
                <p className="mt-1 text-lg text-ink-soft [overflow-wrap:anywhere]">{`Catatan: ${o.note}`}</p>
              ) : null}
            </div>
            <Link
              href={`/admin/jadwal/tanggal/${o.date}`}
              className={buttonClass("outline", "md", "w-full sm:w-auto")}
            >
              <Pencil aria-hidden className="size-6" />
              <span>
                Ubah<span className="sr-only">{` perubahan untuk ${tanggal}`}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
