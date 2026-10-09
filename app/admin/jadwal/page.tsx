import { CalendarPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OverrideList } from "@/components/admin/OverrideList";
import { StoreNotice } from "@/components/admin/StoreNotice";
import { SuccessBanner } from "@/components/admin/SuccessBanner";
import { WeekDayList } from "@/components/admin/WeekDayList";
import { buttonClass } from "@/components/ui/buttonStyles";
import { loadAdminContext } from "@/lib/admin/context";
import { todayKey } from "@/lib/time";

export const metadata: Metadata = { title: "Jadwal Kajian" };

/** Daftar jadwal tetap tujuh hari dan perubahan untuk tanggal tertentu (libur atau ganti). */
export default async function JadwalPage({ searchParams }: { searchParams: Promise<{ hasil?: string }> }) {
  const { store, ready } = await loadAdminContext();
  const { hasil } = await searchParams;

  if (!store || !ready) {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold text-brand">Jadwal Kajian</h1>
        <StoreNotice state={store ? "not-ready" : "missing"} />
      </div>
    );
  }

  const [sessions, overrides] = await Promise.all([store.listSessions(), store.listOverrides(todayKey())]);

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-brand">Jadwal Kajian</h1>
      <p className="mt-2 text-xl text-ink-soft">
        Pilih hari yang ingin diubah. Setelah disimpan, perubahan langsung tampil di web.
      </p>

      <SuccessBanner
        hasil={hasil === "tersimpan" || hasil === "terhapus" ? hasil : undefined}
        viewHref="/#jadwal-hari-ini"
      />

      <section aria-labelledby="judul-jadwal-tetap" className="mt-10">
        <h2 id="judul-jadwal-tetap" className="font-display text-3xl font-semibold text-brand">
          Jadwal tetap tiap pekan
        </h2>
        <WeekDayList sessions={sessions} labelledBy="judul-jadwal-tetap" />
      </section>

      <section aria-labelledby="judul-perubahan-tanggal" className="mt-12">
        <h2 id="judul-perubahan-tanggal" className="font-display text-3xl font-semibold text-brand">
          Perubahan untuk tanggal tertentu
        </h2>
        <OverrideList overrides={overrides} labelledBy="judul-perubahan-tanggal" />
        <Link href="/admin/jadwal/tanggal/baru" className={buttonClass("primary", "xl", "mt-6 w-full sm:w-auto")}>
          <CalendarPlus aria-hidden className="size-7" />
          Liburkan atau ganti satu tanggal
        </Link>
      </section>
    </div>
  );
}
