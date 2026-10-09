"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/ui/buttonStyles";

/**
 * Tombol utama sebuah formulir (satu per layar). Selama permintaan berjalan tombol nonaktif dan
 * berganti tulisan, supaya tidak tertekan dua kali dan pengurus tahu ada proses.
 */
export function SaveButton({
  label = "Simpan",
  pendingLabel = "Menyimpan...",
}: {
  label?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "xl", "w-full sm:w-auto")}>
      {pending ? <LoaderCircle aria-hidden className="size-7 motion-safe:animate-spin" /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}
