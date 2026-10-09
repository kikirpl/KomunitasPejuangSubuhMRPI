"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useId, useRef, type ReactNode, type RefObject } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/ui/buttonStyles";

/**
 * Tombol "Ya, ..." pengirim formulir di dalam dialog: nonaktif dan berganti tulisan selama permintaan berjalan.
 * Harus berada di dalam `<form>` (di dalam dialog atau di formulir yang membungkus dialog) agar status kirimnya terbaca.
 */
export function ConfirmSubmit({ label, pendingLabel = "Menghapus..." }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("dangerSolid", "lg", "w-full sm:w-auto")}>
      {pending ? <LoaderCircle aria-hidden className="size-6 motion-safe:animate-spin" /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Kotak konfirmasi `<dialog>` bawaan, dibuka lewat `dialogRef.current.showModal()` (fokus terkunci di dalam,
 * Esc menutup, fokus kembali ke pemicu). "Tidak jadi" berada paling awal sehingga menjadi fokus awal, pilihan
 * yang aman; `children` adalah tombol "Ya, ..." (`ConfirmSubmit`, atau formulirnya).
 */
export function ConfirmDialogBox({
  dialogRef,
  title,
  message,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  message: string;
  children: ReactNode;
}) {
  const judulId = useId();
  const pesanId = useId();
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={judulId}
      aria-describedby={pesanId}
      className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-2xl border-2 border-danger bg-card p-6 text-ink shadow-card backdrop:bg-black/60 hc:border-black"
    >
      <h2 id={judulId} className="font-display text-3xl font-semibold text-brand [overflow-wrap:anywhere]">
        {title}
      </h2>
      <p id={pesanId} className="mt-3 text-xl [overflow-wrap:anywhere]">
        {message}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => dialogRef.current?.close()} className={buttonClass("outline", "lg")}>
          Tidak jadi
        </button>
        {children}
      </div>
    </dialog>
  );
}

/**
 * Tombol bahaya yang meminta konfirmasi lewat dialog. Penghapusan sebenarnya adalah `<form action>` biasa,
 * jadi tidak butuh JavaScript tambahan.
 */
export function ConfirmDialog({
  triggerLabel,
  title,
  message,
  confirmLabel,
  action,
  hidden,
}: {
  triggerLabel: string;
  title: string;
  message: string;
  confirmLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={buttonClass("danger", "lg", "w-full sm:w-auto")}
      >
        <Trash2 aria-hidden className="size-6" />
        {triggerLabel}
      </button>
      <ConfirmDialogBox dialogRef={dialog} title={title} message={message}>
        <form action={action}>
          {Object.entries(hidden ?? {}).map(([nama, nilai]) => (
            <input key={nama} type="hidden" name={nama} value={nilai} />
          ))}
          <ConfirmSubmit label={confirmLabel} />
        </form>
      </ConfirmDialogBox>
    </>
  );
}
