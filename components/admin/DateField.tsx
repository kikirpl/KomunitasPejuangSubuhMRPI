import { Info } from "lucide-react";
import { Field, inputClass } from "@/components/admin/Field";
import { formatDateKeyLong, isValidDateKey } from "@/lib/time";

/**
 * Isian tanggal (`type="date"`). Tanggal lengkap ("Kamis, 15 Oktober 2026") selalu ditulis di bawah isian,
 * karena tampilan bawaan peramban bisa membuat hari dan bulan tertukar. `extra` adalah catatan tambahan di
 * bawah tanggal lengkap (mis. "tanggal ini sudah ada perubahannya"); keduanya dibacakan lewat `aria-describedby`.
 */
export function DateField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  error,
  required = false,
  extra,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
  extra?: string;
}) {
  const lengkap = isValidDateKey(value) ? formatDateKeyLong(value) : "";
  const ids = [lengkap ? `${id}-echo` : "", extra ? `${id}-extra` : "", error ? `${id}-error` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Field id={id} label={label} required={required} error={error}>
      <input
        id={id}
        name={name}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids || undefined}
        className={inputClass(Boolean(error))}
      />
      <div aria-live="polite">
        {lengkap ? (
          <p id={`${id}-echo`} className="mt-2 text-xl font-bold text-brand">
            {lengkap}
          </p>
        ) : null}
        {extra ? (
          <p id={`${id}-extra`} className="mt-2 flex items-start gap-2 text-lg text-ink">
            <Info aria-hidden className="mt-1 size-5 shrink-0 text-brand" />
            {extra}
          </p>
        ) : null}
      </div>
    </Field>
  );
}
