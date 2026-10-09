import { CircleAlert } from "lucide-react";

/**
 * Pilihan tunggal berupa kartu besar (radio asli yang disembunyikan secara visual, jadi papan ketik dan
 * pembaca layar bekerja seperti biasa). Radio pertama berid `field-{name}` sebagai sasaran tautan ringkasan galat.
 */
export function ChoiceCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  required = false,
}: {
  name: string;
  legend: string;
  options: readonly { value: T; title: string; hint?: string }[];
  value: T | "";
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
}) {
  const errorId = `field-${name}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-xl font-bold text-ink">
        {legend}
        <span className="font-normal text-ink-soft"> {required ? "(wajib)" : "(boleh dikosongkan)"}</span>
      </legend>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 huge:sm:grid-cols-1 simple:sm:grid-cols-1">
        {options.map((o, i) => {
          const dipilih = value === o.value;
          return (
            <label
              key={o.value}
              className={`relative flex min-h-16 cursor-pointer items-start gap-3 rounded-xl p-4 text-xl text-ink has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-(--focus) ${
                dipilih
                  ? "border-4 border-primary bg-tint"
                  : `border-2 bg-card ${error ? "border-danger" : "border-ink-soft"}`
              }`}
            >
              <input
                type="radio"
                id={i === 0 ? `field-${name}` : undefined}
                name={name}
                value={o.value}
                checked={dipilih}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 bg-card ${
                  dipilih ? "border-primary" : "border-ink-soft"
                }`}
              >
                {dipilih ? <span className="size-3 rounded-full bg-primary" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block font-bold [overflow-wrap:anywhere]">{o.title}</span>
                {o.hint ? <span className="block text-lg text-ink-soft">{o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="mt-2 flex items-start gap-2 text-lg font-bold text-danger">
          <CircleAlert aria-hidden className="mt-1 size-5 shrink-0" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
