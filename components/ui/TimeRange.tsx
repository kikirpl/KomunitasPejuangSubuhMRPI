import { formatTime } from "@/lib/time";

/**
 * Rentang jam, mis. "05.00 – 06.00" (tanda pisah panjang dengan spasi, bukan tanda hubung).
 * Pembaca layar mendengar "05.00 sampai 06.00", bukan "05.00 tanda hubung 06.00".
 */
export function TimeRange({ start, end }: { start: string; end: string }) {
  const from = formatTime(start);
  const to = formatTime(end);
  return (
    <>
      <span aria-hidden="true">
        {from} &ndash; {to}
      </span>
      <span className="sr-only">
        {from} sampai {to}
      </span>
    </>
  );
}
