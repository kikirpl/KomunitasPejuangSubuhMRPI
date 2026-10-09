import { ChoiceCards } from "@/components/admin/ChoiceCards";
import { describedBy, Field, inputClass } from "@/components/admin/Field";
import { CARA, masjid, type IsianKajian, type KolomKajian } from "@/lib/admin/session-fields";
import type { SessionMode } from "@/types";

/**
 * Kolom kajian yang sama untuk jadwal tetap dan kajian pengganti: jam mulai dan selesai, ustadz, tema, cara
 * mengikuti, dan tempat (hanya bila cara mengikuti mencakup masjid). Id kolom `field-{nama}` menjadi sasaran
 * tautan ringkasan galat. Terkendali: nilai dan penanganan perubahan dipegang formulir pemakainya.
 */
export function KajianFields({
  values,
  error,
  onChange,
  onBlur,
  onCara,
}: {
  values: IsianKajian;
  error: (nama: string) => string | undefined;
  onChange: (nama: KolomKajian, nilai: string) => void;
  onBlur: (nama: string) => void;
  onCara: (cara: SessionMode) => void;
}) {
  const kolom = (nama: KolomKajian) => ({
    id: `field-${nama}`,
    name: nama,
    value: values[nama],
    onChange: (e: { target: { value: string } }) => onChange(nama, e.target.value),
    onBlur: () => onBlur(nama),
    "aria-invalid": error(nama) ? (true as const) : undefined,
    "aria-describedby": describedBy(`field-${nama}`, {
      hint: nama === "startTime" || nama === "endTime",
      error: error(nama),
    }),
    className: inputClass(Boolean(error(nama))),
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 huge:sm:grid-cols-1 simple:sm:grid-cols-1">
        <Field id="field-startTime" label="Jam mulai" required hint="Waktu WIB" error={error("startTime")}>
          <input type="time" {...kolom("startTime")} />
        </Field>
        <Field id="field-endTime" label="Jam selesai" required hint="Waktu WIB" error={error("endTime")}>
          <input type="time" {...kolom("endTime")} />
        </Field>
      </div>

      <Field id="field-ustadz" label="Nama ustadz" required error={error("ustadz")}>
        <input type="text" autoComplete="off" {...kolom("ustadz")} />
      </Field>

      <Field id="field-topic" label="Tema kajian" required error={error("topic")}>
        <input type="text" autoComplete="off" {...kolom("topic")} />
      </Field>

      <ChoiceCards
        name="mode"
        legend="Cara mengikuti"
        options={CARA}
        value={values.mode as SessionMode | ""}
        onChange={onCara}
        error={error("mode")}
        required
      />

      {masjid(values.mode) ? (
        <Field id="field-location" label="Tempat" error={error("location")}>
          <input type="text" autoComplete="off" {...kolom("location")} />
        </Field>
      ) : null}
    </>
  );
}
