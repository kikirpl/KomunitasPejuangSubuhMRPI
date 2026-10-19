import { Clock, Video } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { Rosette } from "@/components/ui/Rosette";
import { Section } from "@/components/ui/Section";
import { buttonClass } from "@/components/ui/buttonStyles";
import { ZOOM } from "@/data/content";

const JOIN_STEPS = [
  'Tekan tombol kuning "Buka Zoom".',
  'Jika ada pertanyaan, pilih "Buka" atau "Open Zoom".',
  'Tulis nama Anda, lalu tekan "Gabung" atau "Join".',
] as const;

/**
 * Ikut kajian lewat Zoom. Baris atas: yang perlu ditekan (tombol besar, salin
 * tautan) di kiri, serta jadwal dan data rapat (Meeting ID, kode sandi) di kanan
 * untuk yang perlu mengetik sendiri. Baris bawah: panduan bergabung tiga langkah
 * sebagai kartu besar.
 *
 * Urutan di kode (tombol, langkah, jadwal) sama dengan urutan baca di ponsel;
 * di layar lebar kartu jadwal dipindah ke sisi kanan atas dengan `order`.
 */
export function ZoomSection() {
  return (
    <Section
      id="zoom"
      tone="dark"
      title="Ikut Kajian dari Rumah lewat Zoom"
      intro="Tidak perlu datang ke masjid. Tekan tombol kuning, kajian langsung terbuka."
      isSample={ZOOM.isSample}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 simple:lg:grid-cols-1">
        <div className="flex flex-col gap-4 lg:order-1 simple:lg:order-none">
          <a
            href={ZOOM.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("gold", "xl", "min-h-24 w-full text-3xl sm:text-3xl huge:text-2xl")}
          >
            <Video aria-hidden className="size-10" />
            <span>
              Buka Zoom
              <span className="sr-only"> (terbuka di jendela baru)</span>
            </span>
          </a>
          <CopyButton
            text={ZOOM.meetingUrl}
            label="Salin Tautan Zoom"
            successMessage="Tautan Zoom Berhasil Disalin!"
            variant="outlineOnDark"
            size="lg"
            className="w-full"
          />
          {ZOOM.note ? (
            <p className="mt-2 max-w-2xl text-lg text-on-brand-soft">{ZOOM.note}</p>
          ) : null}
        </div>

        <div className="lg:order-3 lg:col-span-2 simple:lg:order-none simple:lg:col-span-1">
          <h3 className="text-2xl font-semibold">Cara bergabung</h3>
          <ol
            role="list"
            className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3 simple:lg:grid-cols-1 huge:lg:grid-cols-1"
          >
            {JOIN_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-4 rounded-card border border-line-dark bg-white/5 p-5 hc:border-2 lg:flex-col lg:p-6 simple:lg:flex-row huge:lg:flex-row"
              >
                <Rosette dark className="size-14 text-2xl">
                  {index + 1}
                </Rosette>
                <p className="min-w-0 text-xl">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="bingkai rounded-card bg-white/5 p-6 md:p-8 hc:border-2 lg:order-2 simple:lg:order-none">
          <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold">
            <Clock aria-hidden className="size-7 shrink-0 text-gold" />
            Jadwal Sesi Daring
          </h3>
          <dl className="mt-4 divide-y divide-line-dark">
            {ZOOM.slots.map((slot) => (
              <div
                key={slot.label}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 py-3 text-xl"
              >
                <dt>{slot.label}</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">{slot.time}</dd>
              </div>
            ))}
          </dl>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 simple:sm:grid-cols-1">
            <div>
              <dt className="text-lg text-on-brand-soft">Meeting ID</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums">
                {ZOOM.meetingId}
              </dd>
            </div>
            <div>
              <dt className="text-lg text-on-brand-soft">Kode sandi (passcode)</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums">
                {ZOOM.passcode}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Section>
  );
}
