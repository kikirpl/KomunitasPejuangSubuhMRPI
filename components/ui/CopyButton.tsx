"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import {
  buttonClass,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/buttonStyles";
import { copyText } from "@/lib/clipboard";

interface CopyButtonProps {
  text: string;
  label: string;
  /** Pesan pada pemberitahuan setelah berhasil, contoh: "Nomor Rekening Berhasil Disalin!" */
  successMessage: string;
  copiedLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Tombol salin: tulisan tombol berubah dan muncul pemberitahuan besar saat berhasil. */
export function CopyButton({
  text,
  label,
  successMessage,
  copiedLabel = "Sudah Tersalin",
  variant = "outline",
  size = "lg",
  className = "",
}: CopyButtonProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  async function handleClick() {
    const ok = await copyText(text);
    window.clearTimeout(timerRef.current);
    if (ok) {
      setCopied(true);
      showToast(successMessage, "success");
      timerRef.current = window.setTimeout(() => setCopied(false), 3500);
    } else {
      setCopied(false);
      showToast(
        "Belum berhasil menyalin. Tekan dan tahan tulisannya, lalu pilih Salin.",
        "error",
      );
    }
  }

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonClass(variant, size, className)}
    >
      <Icon aria-hidden className="size-6" strokeWidth={2.5} />
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
