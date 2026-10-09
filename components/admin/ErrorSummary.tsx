"use client";

import { CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

/** Butir ringkasan: nama kolom ditambahkan di depan hanya bila pesan belum menyebutnya. */
export function pesanButir(label: string, pesan: string): string {
  return pesan.toLowerCase().includes(label.toLowerCase()) ? pesan : `${label}: ${pesan}`;
}

/**
 * Ringkasan galat di atas formulir setelah Simpan gagal. Menerima fokus (tabindex=-1) setiap kali hasil
 * gagal yang baru tiba, supaya pembaca layar dan papan ketik langsung tahu; tiap butir menaut ke isian
 * `#field-{nama}`. `errors` harus berasal dari hasil aksi (identitasnya berganti per hasil), bukan dari
 * validasi saat mengetik, supaya fokus tidak direbut ketika pengurus sedang mengisi.
 */
export function ErrorSummary({
  errors,
  labels,
  message,
}: {
  errors?: Record<string, string>;
  labels: Record<string, string>;
  message?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const butir = Object.entries(errors ?? {});
  const adaIsi = butir.length > 0 || Boolean(message);

  useEffect(() => {
    if (adaIsi) ref.current?.focus();
  }, [errors, message, adaIsi]);

  if (!adaIsi) return null;

  return (
    <div
      ref={ref}
      id="ringkasan-galat"
      tabIndex={-1}
      role="alert"
      className="rounded-2xl border-2 border-danger bg-danger-tint p-5"
    >
      {butir.length > 0 ? (
        <>
          <h2 className="flex items-start gap-3 text-2xl font-bold text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-7 shrink-0 huge:hidden" />
            Ada {butir.length} isian yang perlu diperbaiki.
          </h2>
          <ul role="list" className="mt-2">
            {butir.map(([nama, pesan]) => (
              <li key={nama}>
                <a
                  href={`#field-${nama}`}
                  className="inline-flex min-h-14 items-center text-xl font-bold text-ink underline decoration-danger decoration-2 underline-offset-4 hover:text-danger"
                >
                  {pesanButir(labels[nama] ?? nama, pesan)}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="flex items-start gap-3 text-xl font-bold text-danger">
          <CircleAlert aria-hidden className="mt-0.5 size-7 shrink-0 huge:hidden" />
          {message}
        </p>
      )}
    </div>
  );
}
