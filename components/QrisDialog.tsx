"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { buttonClass } from "@/components/ui/buttonStyles";
import { DONATION } from "@/data/content";

interface QrisDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Jendela perbesaran QRIS. Memakai elemen <dialog> bawaan peramban:
 * fokus terkunci di dalam jendela, tombol Esc menutup, dan pembaca layar
 * memahaminya sebagai jendela dialog.
 */
export function QrisDialog({ open, onClose }: QrisDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { qris } = DONATION;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="qris-dialog-judul"
      className="bingkai m-auto w-[min(94vw,36rem)] rounded-card bg-paper p-0 text-ink shadow-elev-3 backdrop:bg-brand-deep/85 backdrop:backdrop-blur-[2px] hc:border-2 hc:border-black"
    >
      <div className="p-5 sm:p-7">
        <h2 id="qris-dialog-judul" className="text-2xl font-semibold text-brand">
          Kode QRIS Donasi
        </h2>
        <div className="mt-4 rounded-card bg-white p-3">
          <Image
            src={qris.imageSrc}
            alt={qris.imageAlt}
            width={qris.width}
            height={qris.height}
            unoptimized
            className="h-auto w-full"
          />
        </div>
        <p className="mt-3 text-lg text-ink-soft">
          Arahkan kamera aplikasi bank atau e-wallet ke kode ini.
        </p>
        <button
          type="button"
          onClick={onClose}
          className={buttonClass("primary", "xl", "mt-5 w-full")}
        >
          <X aria-hidden className="size-8" />
          Tutup
        </button>
      </div>
    </dialog>
  );
}
