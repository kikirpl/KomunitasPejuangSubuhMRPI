import { MapPin, MonitorPlay } from "lucide-react";
import { hasZoom } from "@/lib/schedule";
import type { StudySession } from "@/types";

const chip =
  "inline-flex max-w-full items-center gap-2 rounded-full border border-line-soft bg-tint px-3.5 py-1.5 text-base font-bold text-brand hc:border-2";

/**
 * Keterangan cara mengikuti kajian: di masjid, lewat Zoom, atau keduanya. Tempat bebas diisi pengurus,
 * jadi bisa berupa tautan panjang tanpa spasi: teksnya boleh menyusut dan membungkus (kartu memotong luapan).
 */
export function ModeChips({ session }: { session: StudySession }) {
  const inMosque = session.mode === "masjid" || session.mode === "hybrid";
  return (
    <ul className="flex flex-wrap gap-2">
      {inMosque ? (
        <li className={chip}>
          <MapPin aria-hidden className="size-5 shrink-0" />
          <span className="min-w-0 [overflow-wrap:anywhere]">{session.location ?? "Di masjid"}</span>
        </li>
      ) : null}
      {hasZoom(session) ? (
        <li className={chip}>
          <MonitorPlay aria-hidden className="size-5 shrink-0" />
          Bisa lewat Zoom
        </li>
      ) : null}
    </ul>
  );
}
