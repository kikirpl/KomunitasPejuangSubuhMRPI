export type ButtonVariant =
  | "primary"
  | "gold"
  | "outline"
  | "light"
  | "outlineOnDark"
  | "danger"
  | "dangerSolid";
export type ButtonSize = "md" | "lg" | "xl";

/*
 * Sudut, bayangan, dan gerak memakai token komponen di app/globals.css (--radius-control,
 * --elev-*, --dur-hover, --ease-out-expo). Saat ditekan tombol turun 1px: umpan balik sentuh
 * yang terasa tanpa animasi panjang (dimatikan oleh "kurangi gerakan").
 */
const base =
  "inline-flex items-center justify-center gap-3 rounded-control border-2 text-center font-bold leading-tight select-none transition-[background-color,border-color,color,box-shadow,filter,transform] duration-(--dur-hover) ease-out-expo active:translate-y-px disabled:opacity-60 disabled:active:translate-y-0 [&_svg]:shrink-0 huge:[&_svg]:hidden";

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
 * primary = biru genteng (lebih gelap saat disentuh), gold = emas fajar berbingkai daun emas
 * dengan teks gelap, outline = garis biru genteng di latar terang,
 * outlineOnDark = garis putih di latar gelap; isinya biru malam tembus pandang, jadi tulisan tetap
 * terbaca walau tombol berada di atas langit beranda,
 * danger = garis merah di latar kartu (tombol hapus yang membuka konfirmasi),
 * dangerSolid = isi merah dengan teks putih ("Ya, hapus" di dalam konfirmasi).
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-on-brand shadow-elev-1 hover:border-primary-hover hover:bg-primary-hover hover:shadow-elev-2 active:bg-primary-hover active:shadow-none",
  gold: "border-gilt bg-gold text-on-gold shadow-elev-1 hover:brightness-[1.06] hover:shadow-elev-2 active:brightness-95 active:shadow-none",
  outline:
    "border-primary bg-card text-primary hover:bg-tint active:bg-tint",
  light: "border-card bg-card text-primary shadow-elev-1 hover:border-tint hover:bg-tint",
  outlineOnDark:
    "border-on-brand bg-brand-deep/55 text-on-brand hover:bg-on-brand hover:text-brand active:bg-on-brand active:text-brand",
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
