import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

/** Pesan galat di atas isi halaman (mis. gagal menghapus atau mengubah status): ikon dan teks, bukan hanya warna. */
export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-6 flex items-start gap-3 rounded-xl border-2 border-danger bg-danger-tint px-5 py-4 text-xl font-bold text-danger"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-7 shrink-0" />
      {children}
    </p>
  );
}
