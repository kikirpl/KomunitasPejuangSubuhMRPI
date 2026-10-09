"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ChoiceCards } from "@/components/admin/ChoiceCards";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { describedBy, Field, inputClass } from "@/components/admin/Field";
import { KajianFields } from "@/components/admin/KajianFields";
import { PhotoField } from "@/components/admin/PhotoField";
import { PreviewPane } from "@/components/admin/PreviewPane";
import { SaveButton } from "@/components/admin/SaveButton";
import { buttonClass } from "@/components/ui/buttonStyles";
import { WeekCard } from "@/components/WeeklySchedule";
import type { FormState } from "@/lib/admin/form-state";
import { masjid, TEMPAT_AWAL, tempatSetelahCara, type KolomKajian } from "@/lib/admin/session-fields";
import type { SessionInput } from "@/lib/store/types";
import { sessionSchema } from "@/lib/validation/jadwal";
import { parseForm, type RawForm } from "@/lib/validation/umum";
import type { DayIndex, ImagePosition, SessionMode, StudySession } from "@/types";

/** Label kolom untuk ringkasan galat. */
const LABEL: Record<string, string> = {
  startTime: "Jam mulai",
  endTime: "Jam selesai",
  ustadz: "Nama ustadz",
  topic: "Tema kajian",
  mode: "Cara mengikuti",
  location: "Tempat",
  imageUrl: "Foto",
  imageAlt: "Keterangan foto",
  imagePosition: "Bagian foto yang tampil",
};

const POSISI_FOTO = [
  { value: "top", title: "Atas" },
  { value: "center", title: "Tengah" },
  { value: "bottom", title: "Bawah" },
] as const;

type Nilai = Record<"startTime" | "endTime" | "ustadz" | "topic" | "mode" | "location" | "imageUrl" | "imageAlt" | "imagePosition", string>;

/** Isian awal: hasil aksi sebelumnya (bila halaman dirender ulang oleh server), jadwal yang ada, atau hari baru. */
function nilaiAwal(initial: SessionInput | null, echo: RawForm | undefined): Nilai {
  const dasar: Nilai = initial
    ? {
        startTime: initial.startTime,
        endTime: initial.endTime,
        ustadz: initial.ustadz,
        topic: initial.topic,
        mode: initial.mode,
        location: initial.location ?? "",
        imageUrl: initial.imageUrl ?? "",
        imageAlt: initial.imageAlt ?? "",
        imagePosition: initial.imagePosition,
      }
    : {
        startTime: "05:00",
        endTime: "06:00",
        ustadz: "",
        topic: "",
        mode: "",
        location: TEMPAT_AWAL,
        imageUrl: "",
        imageAlt: "",
        imagePosition: "center",
      };
  return echo ? { ...dasar, ...echo } : dasar;
}

/**
 * Form satu hari jadwal tetap (klien, terkendali). Tempat hanya tampil bila cara mengikuti mencakup masjid.
 * Foto diunggah lewat PhotoField; keterangan dan bagian foto yang tampil hanya muncul bila ada foto.
 */
export function SessionForm({
  day,
  initial,
  blobHost,
  uploadEnabled,
  action,
}: {
  day: DayIndex;
  initial: SessionInput | null;
  blobHost?: string;
  /** Unggah foto siap dipakai (host publik dan token Blob terisi). */
  uploadEnabled: boolean;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [nilai, setNilai] = useState<Nilai>(() => nilaiAwal(initial, state?.values));
  const [tersentuh, setTersentuh] = useState<readonly string[]>([]);
  const [sudahKirim, setSudahKirim] = useState(false);

  // Yang dikirim: Tempat dikosongkan bila hanya Zoom.
  const kiriman = useMemo<RawForm>(
    () => ({ ...nilai, location: masjid(nilai.mode) ? nilai.location : "" }),
    [nilai],
  );
  const hasil = useMemo(() => parseForm(sessionSchema(blobHost), kiriman), [kiriman, blobHost]);
  const galat = (nama: string): string | undefined =>
    sudahKirim || tersentuh.includes(nama) ? (hasil.ok ? undefined : hasil.fieldErrors[nama]) : undefined;

  const ubah = (nama: KolomKajian, nilaiBaru: string) => setNilai((s) => ({ ...s, [nama]: nilaiBaru }));
  const ubahFoto = (nama: "imageAlt" | "imagePosition", nilaiBaru: string) =>
    setNilai((s) => ({ ...s, [nama]: nilaiBaru }));
  const sentuh = (nama: string) => setTersentuh((s) => (s.includes(nama) ? s : [...s, nama]));
  const pilihCara = (cara: SessionMode) =>
    setNilai((s) => ({ ...s, mode: cara, location: tempatSetelahCara(cara, s.location) }));

  const pratinjau: StudySession = {
    id: "pratinjau",
    day,
    startTime: nilai.startTime,
    endTime: nilai.endTime,
    ustadz: nilai.ustadz.trim() || "Nama ustadz",
    topic: nilai.topic.trim() || "Tema kajian",
    mode: nilai.mode === "" ? "masjid" : (nilai.mode as SessionMode),
    ...(masjid(nilai.mode) && nilai.location.trim() ? { location: nilai.location.trim() } : {}),
    ...(nilai.imageUrl ? { imageUrl: nilai.imageUrl } : {}),
    ...(nilai.imageAlt.trim() ? { imageAlt: nilai.imageAlt.trim() } : {}),
    imagePosition: nilai.imagePosition === "top" || nilai.imagePosition === "bottom" ? nilai.imagePosition : "center",
  };

  return (
    <form action={formAction} onSubmit={() => setSudahKirim(true)} noValidate className="space-y-8">
      <ErrorSummary errors={state?.fieldErrors} labels={LABEL} message={state?.message} />

      <KajianFields values={nilai} error={galat} onChange={ubah} onBlur={sentuh} onCara={pilihCara} />

      <PhotoField
        name="imageUrl"
        value={nilai.imageUrl}
        onChange={(url) => {
          setNilai((s) => ({ ...s, imageUrl: url, imageAlt: url === "" ? "" : s.imageAlt }));
          sentuh("imageUrl");
        }}
        folder="kajian"
        uploadEnabled={uploadEnabled}
        error={galat("imageUrl")}
      />

      {nilai.imageUrl ? (
        <>
          <Field
            id="field-imageAlt"
            label="Keterangan foto"
            hint="Ceritakan foto ini dalam satu kalimat untuk pembaca layar. Boleh dikosongkan."
            error={galat("imageAlt")}
          >
            <input
              id="field-imageAlt"
              name="imageAlt"
              type="text"
              autoComplete="off"
              value={nilai.imageAlt}
              onChange={(e) => ubahFoto("imageAlt", e.target.value)}
              onBlur={() => sentuh("imageAlt")}
              aria-invalid={galat("imageAlt") ? true : undefined}
              aria-describedby={describedBy("field-imageAlt", { hint: true, error: galat("imageAlt") })}
              className={inputClass(Boolean(galat("imageAlt")))}
            />
          </Field>
          <ChoiceCards<ImagePosition>
            name="imagePosition"
            legend="Bagian foto yang tampil"
            options={POSISI_FOTO}
            value={nilai.imagePosition as ImagePosition}
            onChange={(posisi) => ubahFoto("imagePosition", posisi)}
            error={galat("imagePosition")}
            required
          />
        </>
      ) : (
        <>
          <input type="hidden" name="imageAlt" value="" />
          <input type="hidden" name="imagePosition" value={nilai.imagePosition} />
        </>
      )}

      <PreviewPane>
        <WeekCard session={pratinjau} isToday={false} as="div" />
      </PreviewPane>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SaveButton label={state?.message ? "Coba lagi" : "Simpan"} />
        <Link href="/admin/jadwal" className={buttonClass("outline", "lg", "w-full sm:w-auto")}>
          Batal
        </Link>
      </div>
    </form>
  );
}
