export type ButtonVariant =
  | "primary"
  | "gold"
  | "outline"
  | "light"
  | "outlineOnDark"
  | "danger"
  | "dangerSolid";
export type ButtonSize = "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-3 rounded-xl border-2 text-center font-bold leading-tight transition-colors select-none disabled:opacity-60 [&_svg]:shrink-0 huge:[&_svg]:hidden";

/**
 * Pada ukuran tulisan "Lebih besar" dan "Terbesar" (varian huge:), ikon di dalam tombol
 * disembunyikan serta bantalan samping dan huruf tombol raksasa dikecilkan sedikit,
 * supaya labelnya tetap muat utuh di layar ponsel. Ikon hanya pelengkap (aria-hidden).
 */
const sizes: Record<ButtonSize, string> = {
  md: "min-h-14 px-5 py-3 text-lg huge:px-4",
  lg: "min-h-16 px-7 py-3.5 text-xl huge:px-4",
  xl: "min-h-20 px-5 py-4 text-xl font-extrabold sm:px-8 sm:text-2xl huge:px-4 huge:text-xl",
};

/*
 * Warna tombol mengikuti peran di app/globals.css:
 * primary = biru royal (navy saat disentuh), gold = sorotan emas dengan teks gelap,
 * outline = garis royal di latar terang (garis biru langit saat disentuh),
 * danger = garis merah di latar kartu (tombol hapus yang membuka konfirmasi),
 * dangerSolid = isi merah dengan teks putih ("Ya, hapus" di dalam konfirmasi).
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-on-brand hover:border-primary-hover hover:bg-primary-hover active:bg-primary-hover",
  gold: "border-gold bg-gold text-on-gold hover:brightness-105 active:brightness-95",
  outline:
    "border-primary bg-card text-primary hover:border-accent hover:bg-tint active:bg-tint",
  light: "border-card bg-card text-primary hover:border-tint hover:bg-tint",
  outlineOnDark:
    "border-on-brand bg-transparent text-on-brand hover:bg-on-brand hover:text-brand active:bg-on-brand active:text-brand",
  danger: "border-danger bg-card text-danger hover:bg-danger-tint active:bg-danger-tint",
  dangerSolid: "border-danger bg-danger text-on-danger hover:brightness-90 active:brightness-75",
};

/** Kelas Tailwind untuk tombol dan tautan berbentuk tombol. Tinggi minimal 56px ke atas. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "lg",
  extra = "",
): string {
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`.trim();
}
