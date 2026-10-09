import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

/** Kelas bersama isian teks, jam, dan tanggal: tinggi minimal 56 px dan garis yang cukup kontras (3:1). */
export function inputClass(adaGalat: boolean): string {
  return `block w-full min-h-14 rounded-xl border-2 bg-card px-4 py-2 text-xl text-ink ${
    adaGalat ? "border-danger" : "border-ink-soft"
  }`;
}

/** Nilai `aria-describedby` sebuah kontrol: bantuan dan galatnya, bila ada. */
export function describedBy(id: string, parts: { hint?: boolean; error?: string }): string | undefined {
  const ids = [parts.hint ? `${id}-hint` : "", parts.error ? `${id}-error` : ""].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/**
 * Satu isian formulir: label terlihat di atas (bukan placeholder) dengan "(wajib)" atau "(boleh dikosongkan)",
 * bantuan, kontrol, dan pesan galat di bawahnya. `id` adalah id kontrolnya; bantuan dan galat memakai
 * `{id}-hint` dan `{id}-error` supaya kontrol bisa merujuknya lewat `describedBy`.
 */
export function Field({
  id,
  label,
  required = false,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xl font-bold text-ink">
        {label}
        <span className="font-normal text-ink-soft"> {required ? "(wajib)" : "(boleh dikosongkan)"}</span>
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-lg text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-2 text-lg font-bold text-danger">
          <CircleAlert aria-hidden className="mt-1 size-5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
