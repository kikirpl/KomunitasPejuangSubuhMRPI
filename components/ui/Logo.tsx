import { StarMark } from "@/components/ui/StarMark";

/**
 * Logo situs yang sudah ada: bintang delapan emas di dalam kotak navy bersudut bulat
 * (sama dengan ikon situs app/icon.svg). Dipakai di kepala halaman.
 */
export function Logo({
  className = "size-14 rounded-xl",
  starClassName = "size-9",
}: {
  /** Ukuran dan sudut kotak, mis. "size-14 rounded-xl". */
  className?: string;
  starClassName?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center bg-brand-deep text-gold ring-1 ring-gold/70 ${className}`}
    >
      <StarMark className={starClassName} />
    </span>
  );
}
