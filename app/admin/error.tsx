"use client";

import { CircleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui/buttonStyles";

/**
 * Bila sebuah halaman panel gagal dimuat (mis. database tidak terjangkau), pengurus melihat pesan
 * ramah dan tombol "Coba lagi", bukan halaman galat bawaan. Kepala halaman dengan tautan Bantuan tetap tampil.
 */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-card border-2 border-gold bg-gold-tint p-8 hc:border-black">
      <h1 className="flex items-start gap-3 font-display text-3xl font-semibold text-brand">
        <CircleAlert aria-hidden className="mt-1 size-8 shrink-0" />
        Halaman ini belum bisa dimuat
      </h1>
      <p className="mt-3 text-xl text-ink">
        Mungkin sambungan terputus atau server sedang sibuk. Perubahan yang belum Anda simpan belum
        tersimpan. Coba lagi; bila terulang, tekan Bantuan di bagian atas.
      </p>
      <button type="button" onClick={reset} className={buttonClass("primary", "lg", "mt-6")}>
        Coba lagi
      </button>
    </div>
  );
}
