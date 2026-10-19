import { BadgeCheck, Info, Undo2 } from "lucide-react";
import { ubahStatusContoh } from "@/app/admin/actions/status";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { KembaliStatus } from "@/lib/admin/status";
import type { SectionKey } from "@/types";

/**
 * Penanda "contoh" atau "resmi" satu bagian web. Selama masih contoh, web menampilkan lencana "Contoh data, belum
 * resmi": spanduk di sini mengingatkan pengurus dan menyediakan tombol "Tandai sudah resmi" (dengan konfirmasi).
 * Sesudah resmi, tersisa tautan kecil "Kembalikan ke status contoh". `label` adalah nama bagian dalam bahasa pengurus.
 */
export function SampleStatus({
  section,
  isSample,
  label,
  kembali,
}: {
  section: SectionKey;
  isSample: boolean;
  label: string;
  kembali: KembaliStatus;
}) {
  const judulId = `status-${section}`;

  if (isSample) {
    return (
      <section
        aria-labelledby={judulId}
        className="mt-6 rounded-card border-2 border-gold bg-gold-tint p-5 hc:border-black"
      >
        <h2 id={judulId} className="flex items-start gap-3 text-xl font-bold text-ink">
          <Info aria-hidden className="mt-0.5 size-6 shrink-0 text-brand huge:hidden" />
          {label}
        </h2>
        <p className="mt-1 text-xl text-ink">
          Data masih contoh. Setelah semuanya diganti dengan data resmi, tandai resmi.
        </p>
        <div className="mt-4">
          <ConfirmDialog
            triggerLabel="Tandai sudah resmi"
            triggerVariant="outline"
            triggerIcon={<BadgeCheck aria-hidden className="size-6" />}
            title={`Tandai ${label} sebagai resmi?`}
            message="Lencana 'Contoh data, belum resmi' akan hilang dari web."
            confirmLabel="Ya, tandai resmi"
            action={ubahStatusContoh.bind(null, section, false, kembali)}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-lg text-ink-soft">
      <p className="flex items-center gap-2">
        <BadgeCheck aria-hidden className="size-6 shrink-0 text-primary" />
        {label}: sudah ditandai resmi.
      </p>
      <form action={ubahStatusContoh.bind(null, section, true, kembali)}>
        <button
          type="submit"
          className="inline-flex min-h-14 items-center gap-2 text-lg font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-brand"
        >
          <Undo2 aria-hidden className="size-5" />
          Kembalikan ke status contoh
        </button>
      </form>
    </div>
  );
}
