"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Tautan "Kembali ke Panel" di posisi yang sama pada semua layar dalam. Tidak tampil di beranda
 * panel, layar masuk, dan rute OAuth.
 */
export function PanelBackLink() {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/masuk") || pathname.startsWith("/admin/auth")) {
    return null;
  }
  return (
    <Link
      href="/admin"
      className="mb-4 inline-flex min-h-14 items-center gap-3 text-lg font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-brand [&_svg]:shrink-0"
    >
      <ArrowLeft aria-hidden className="size-6" />
      Kembali ke Panel
    </Link>
  );
}
