import { ChoiceCards } from "@/components/admin/ChoiceCards";
import { describedBy, Field, inputClass } from "@/components/admin/Field";
import { PhotoField } from "@/components/admin/PhotoField";
import type { ImagePosition } from "@/types";

const POSISI_FOTO = [
  { value: "top", title: "Atas" },
  { value: "center", title: "Tengah" },
  { value: "bottom", title: "Bawah" },
] as const;

/**
 * Isian foto yang sama untuk jadwal dan kegiatan/pengumuman: PhotoField, lalu (hanya bila ada foto) keterangan foto
 * dan bagian foto yang tampil. Tanpa foto, keterangan dikosongkan dan posisi dibawa sebagai isian tersembunyi.
 */
export function FotoFields({
  folder,
  uploadEnabled,
  imageUrl,
  imageAlt,
  imagePosition,
  error,
  onFoto,
  onAlt,
  onPosisi,
  onBlur,
}: {
  folder: "kajian" | "kegiatan";
  uploadEnabled: boolean;
  imageUrl: string;
  imageAlt: string;
  imagePosition: string;
  error: (nama: string) => string | undefined;
  onFoto: (url: string) => void;
  onAlt: (teks: string) => void;
  onPosisi: (posisi: ImagePosition) => void;
  onBlur: (nama: string) => void;
}) {
  return (
    <>
      <PhotoField
        name="imageUrl"
        value={imageUrl}
        onChange={onFoto}
        folder={folder}
        uploadEnabled={uploadEnabled}
        error={error("imageUrl")}
      />

      {imageUrl ? (
        <>
          <Field
            id="field-imageAlt"
            label="Keterangan foto"
            hint="Ceritakan foto ini dalam satu kalimat untuk pembaca layar. Boleh dikosongkan."
            error={error("imageAlt")}
          >
            <input
              id="field-imageAlt"
              name="imageAlt"
              type="text"
              autoComplete="off"
              value={imageAlt}
              onChange={(e) => onAlt(e.target.value)}
              onBlur={() => onBlur("imageAlt")}
              aria-invalid={error("imageAlt") ? true : undefined}
              aria-describedby={describedBy("field-imageAlt", { hint: true, error: error("imageAlt") })}
              className={inputClass(Boolean(error("imageAlt")))}
            />
          </Field>
          <ChoiceCards<ImagePosition>
            name="imagePosition"
            legend="Bagian foto yang tampil"
            options={POSISI_FOTO}
            value={imagePosition as ImagePosition}
            onChange={onPosisi}
            error={error("imagePosition")}
            required
          />
        </>
      ) : (
        <>
          <input type="hidden" name="imageAlt" value="" />
          <input type="hidden" name="imagePosition" value={imagePosition} />
        </>
      )}
    </>
  );
}
