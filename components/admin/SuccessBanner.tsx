"use client";

import { CircleCheck, Globe, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/buttonStyles";

const TEKS = {
  tersimpan: "Tersimpan. Sudah tampil di web.",
  terhapus: "Terhapus. Sudah hilang dari web.",
} as const;

/**
 * Spanduk tetap sesudah Simpan atau Hapus berhasil (`?hasil=tersimpan` atau `?hasil=terhapus`). Bukan toast
 * yang hilang sendiri karena memuat tombol; pengurus menutupnya sendiri. Parameter dibersihkan dari alamat
 * lewat `history.replaceState`, yang terhubung ke router Next.js tanpa meminta halaman lagi. `router.replace`
 * meminta halaman ke server tanpa `?hasil`; render ulang itu bisa menghilangkan spanduk yang baru tampil.
 */
export function SuccessBanner({
  hasil,
  viewHref,
}: {
  hasil: "tersimpan" | "terhapus" | undefined;
  viewHref: string;
}) {
  const [ditutup, setDitutup] = useState(false);

  useEffect(() => {
    if (!hasil) return;
    const alamat = new URL(window.location.href);
    if (!alamat.searchParams.has("hasil")) return;
    alamat.searchParams.delete("hasil");
    window.history.replaceState(null, "", `${alamat.pathname}${alamat.search}${alamat.hash}`);
  }, [hasil]);

  if (!hasil || ditutup) return null;

  return (
    <div role="status" className="mt-6 rounded-card border-2 border-primary bg-tint p-5 hc:border-black">
      <p className="flex items-start gap-3 text-xl font-bold text-brand">
        <CircleCheck aria-hidden className="mt-0.5 size-7 shrink-0 huge:hidden" />
        {TEKS[hasil]}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {/* prefetch dimatikan: web publik dibuat ulang setiap Simpan, jangan tampilkan salinan lama. */}
        <Link href={viewHref} prefetch={false} className={buttonClass("outline", "md")}>
          <Globe aria-hidden className="size-6" />
          Lihat di web
        </Link>
        <button type="button" onClick={() => setDitutup(true)} className={buttonClass("outline", "md")}>
          <X aria-hidden className="size-6" />
          Tutup<span className="sr-only"> pemberitahuan</span>
        </button>
      </div>
    </div>
  );
}
