"use client";

import { useState } from "react";
import Image from "next/image";
import { Landmark, QrCode, ZoomIn } from "lucide-react";
import { QrisDialog } from "@/components/QrisDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { MasjidSiluet } from "@/components/ui/MasjidSiluet";
import { Section } from "@/components/ui/Section";
import { DONATION } from "@/data/content";

const card =
  "rounded-card border border-line bg-card p-6 shadow-card md:p-8 hc:border-2";

/**
 * Info donasi: QRIS (bisa diperbesar) dan rekening bank syariah dengan tombol
 * salin. Sengaja tanpa formulir dan tanpa konfirmasi lewat WhatsApp.
 */
export function DonationSection() {
  const [qrisOpen, setQrisOpen] = useState(false);
  const { qris, bankAccounts, isSample } = DONATION;

  return (
    <Section
      id="donasi"
      title="Infak dan Donasi"
      intro="Cukup scan QRIS atau transfer ke rekening di bawah ini. Tidak perlu konfirmasi ke admin."
      isSample={isSample}
      tone="alt"
    >
      <div className="muncul-anak grid grid-cols-1 gap-6 lg:grid-cols-2 simple:lg:grid-cols-1">
        <article className={card}>
          <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold text-brand">
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-tint text-accent ring-1 ring-gilt/35 hc:ring-line">
              <QrCode className="size-6" />
            </span>
            Scan QRIS
          </h3>
          <button
            type="button"
            onClick={() => setQrisOpen(true)}
            aria-label="Tekan untuk memperbesar kode QRIS"
            aria-haspopup="dialog"
            className="mx-auto mt-5 block w-full max-w-sm rounded-card border-2 border-line-soft bg-white p-3 transition-colors hover:border-primary"
          >
            <Image
              src={qris.imageSrc}
              alt={qris.imageAlt}
              width={qris.width}
              height={qris.height}
              unoptimized
              className="h-auto w-full"
            />
            <span className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-lg font-bold text-primary huge:text-base">
              <ZoomIn aria-hidden className="size-6 shrink-0" />
              <span>Tekan untuk memperbesar</span>
            </span>
          </button>
          <p className="mt-5 text-lg text-ink-soft">
            Atas nama <strong className="text-ink">{qris.merchantName}</strong>. Buka
            aplikasi bank atau e-wallet, pilih &quot;Scan&quot; atau &quot;Bayar&quot;,
            lalu arahkan kamera ke kode ini.
          </p>
        </article>

        {bankAccounts.map((account) => (
          <article key={account.id} className={card}>
            <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold text-brand">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-tint text-accent ring-1 ring-gilt/35 hc:ring-line">
                <Landmark className="size-6" />
              </span>
              Transfer Bank Syariah
            </h3>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-lg text-ink-soft">Nama bank</dt>
                <dd className="text-2xl font-bold">{account.bankName}</dd>
              </div>
              <div>
                <dt className="text-lg text-ink-soft">Nomor rekening</dt>
                <dd className="break-all font-display text-4xl font-semibold tracking-wider text-brand tabular-nums huge:text-2xl">
                  {account.accountNumber}
                </dd>
              </div>
              <div>
                <dt className="text-lg text-ink-soft">Atas nama</dt>
                <dd className="text-2xl font-bold">{account.accountHolder}</dd>
              </div>
            </dl>
            <CopyButton
              text={account.accountNumber}
              label="Salin Nomor Rekening"
              successMessage="Nomor Rekening Berhasil Disalin!"
              variant="primary"
              size="xl"
              className="mt-7 w-full"
            />
            <h4 className="mt-8 text-xl font-bold text-brand">Cara transfer</h4>
            <ol className="mt-2 list-decimal space-y-1.5 ps-7 text-lg text-ink-soft marker:font-bold marker:text-brand">
              <li>Tekan tombol &quot;Salin Nomor Rekening&quot;.</li>
              <li>Buka aplikasi bank di ponsel Anda.</li>
              <li>Pilih &quot;Transfer&quot;, lalu tempel nomor rekening.</li>
              <li>Isi jumlah infak, lalu selesaikan.</li>
            </ol>
          </article>
        ))}
      </div>

      {/* Penutup infak: langit Subuh berbingkai dengan siluet MRPI di depan cahaya fajar. */}
      <div className="muncul bingkai on-dark langit-subuh relative mt-8 overflow-hidden rounded-card px-6 pt-8 pb-36 text-on-brand shadow-elev-2 sm:px-10 sm:pb-40 md:py-10 md:pr-[42%] hc:border-2 hc:pb-8 simple:pb-8 simple:md:pr-10">
        <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
        <MasjidSiluet className="terbit pointer-events-none absolute -bottom-px right-4 h-32 w-auto text-brand-deep sm:h-36 md:right-8 md:h-[88%] hc:hidden simple:hidden" />
        <p className="relative max-w-2xl text-xl leading-relaxed">
          <strong className="text-gold-soft">Tidak perlu konfirmasi.</strong> Setelah
          transfer atau scan, selesai. Tidak ada formulir yang perlu diisi dan tidak
          perlu mengirim bukti ke WhatsApp.
        </p>
      </div>

      <QrisDialog open={qrisOpen} onClose={() => setQrisOpen(false)} />
    </Section>
  );
}
