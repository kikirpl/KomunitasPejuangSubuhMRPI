"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { AnnouncementCard } from "@/components/Announcements";
import { ChoiceCards } from "@/components/admin/ChoiceCards";
import { DateField } from "@/components/admin/DateField";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { describedBy, Field, inputClass } from "@/components/admin/Field";
import { FotoFields } from "@/components/admin/FotoFields";
import { PreviewPane } from "@/components/admin/PreviewPane";
import { SaveButton } from "@/components/admin/SaveButton";
import { buttonClass } from "@/components/ui/buttonStyles";
import type { FormState } from "@/lib/admin/form-state";
import { addDaysToKey, isValidDateKey } from "@/lib/time";
import { announcementSchema } from "@/lib/validation/pengumuman";
import { parseForm, POLA_JAM, type RawForm } from "@/lib/validation/umum";
import type { AnnouncementItem, AnnouncementType } from "@/types";

/** Isian formulir sebagai teks. `type` kosong = belum dipilih. */
export interface IsianPengumuman {
  id: string;
  type: AnnouncementType | "";
  title: string;
  date: string;
  time: string;
  excerpt: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: string;
  href: string;
}

const JENIS = [
  { value: "kegiatan", title: "Kegiatan", hint: "Acara yang dihadiri jamaah" },
  { value: "pengumuman", title: "Pengumuman", hint: "Informasi atau pemberitahuan" },
] as const;

/** Label kolom untuk ringkasan galat. */
const LABEL: Record<string, string> = {
  id: "Formulir",
  type: "Jenis",
  title: "Judul",
  date: "Tanggal",
  time: "Jam",
  excerpt: "Ringkasan",
  imageUrl: "Foto",
  imageAlt: "Keterangan foto",
  imagePosition: "Bagian foto yang tampil",
  href: "Tautan Selengkapnya",
};

const BATAS_RINGKASAN = 400;
/** Jam bawaan saat "Tampilkan jam" dicentang (waktu Subuh), supaya isiannya tidak kosong dan terlihat di pratinjau. */
const JAM_AWAL = "05:00";

/**
 * Form satu kegiatan atau pengumuman (klien, terkendali). `id` datang dari server (UUID dari halaman "baru" atau id
 * butir yang diubah) dan dikirim sebagai isian tersembunyi, jadi simpan dua kali tetap satu kartu. Validasi saat
 * meninggalkan kolom memakai skema yang sama dengan server; pratinjau memakai kartu asli web.
 */
export function AnnouncementForm({
  initial,
  todayKey,
  blobHost,
  uploadEnabled,
  action,
}: {
  initial: IsianPengumuman;
  /** Tanggal WIB hari ini ("YYYY-MM-DD"), batas rentang tanggal dan tanggal pratinjau bila isian belum sah. */
  todayKey: string;
  blobHost?: string;
  uploadEnabled: boolean;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [nilai, setNilai] = useState<IsianPengumuman>(() => ({ ...initial, ...state?.values }) as IsianPengumuman);
  const [tampilkanJam, setTampilkanJam] = useState(() => Boolean(initial.time || state?.values?.time));
  const [tersentuh, setTersentuh] = useState<readonly string[]>([]);
  const [sudahKirim, setSudahKirim] = useState(false);

  // Yang dikirim: jam hanya bila "Tampilkan jam" dicentang.
  const kiriman = useMemo<RawForm>(() => ({ ...nilai, time: tampilkanJam ? nilai.time : "" }), [nilai, tampilkanJam]);
  const hasil = useMemo(
    () => parseForm(announcementSchema({ blobHost, todayKey }), kiriman),
    [kiriman, blobHost, todayKey],
  );
  const galat = (nama: string): string | undefined =>
    sudahKirim || tersentuh.includes(nama) ? (hasil.ok ? undefined : hasil.fieldErrors[nama]) : undefined;

  const ubah = (nama: keyof IsianPengumuman, nilaiBaru: string) => setNilai((s) => ({ ...s, [nama]: nilaiBaru }));
  const sentuh = (nama: string) => setTersentuh((s) => (s.includes(nama) ? s : [...s, nama]));
  const teksKolom = (nama: "title" | "href") => ({
    id: `field-${nama}`,
    name: nama,
    value: nilai[nama],
    onChange: (e: { target: { value: string } }) => ubah(nama, e.target.value),
    onBlur: () => sentuh(nama),
    "aria-invalid": galat(nama) ? (true as const) : undefined,
    className: inputClass(Boolean(galat(nama))),
  });

  const panjangRingkasan = nilai.excerpt.trim().length;
  const tanggalSah = isValidDateKey(nilai.date);
  const adaJam = tampilkanJam && POLA_JAM.test(nilai.time);
  const hrefPratinjau = nilai.href.trim() !== "" && hasil.ok ? nilai.href.trim() : undefined;
  const pratinjau: AnnouncementItem = {
    id: nilai.id || "pratinjau",
    type: nilai.type === "" ? "kegiatan" : nilai.type,
    title: nilai.title.trim() || "Judul kegiatan atau pengumuman",
    date: tanggalSah ? (adaJam ? `${nilai.date}T${nilai.time}:00+07:00` : nilai.date) : todayKey,
    excerpt: nilai.excerpt.trim() || "Ringkasan akan tampil di sini.",
    ...(nilai.imageUrl ? { imageUrl: nilai.imageUrl } : {}),
    ...(nilai.imageAlt.trim() ? { imageAlt: nilai.imageAlt.trim() } : {}),
    imagePosition: nilai.imagePosition === "top" || nilai.imagePosition === "bottom" ? nilai.imagePosition : "center",
    ...(hrefPratinjau ? { href: hrefPratinjau } : {}),
  };

  return (
    <form action={formAction} onSubmit={() => setSudahKirim(true)} noValidate className="space-y-8">
      <ErrorSummary errors={state?.fieldErrors} labels={LABEL} message={state?.message} />
      <input type="hidden" name="id" value={nilai.id} />

      <ChoiceCards<AnnouncementType>
        name="type"
        legend="Jenis"
        options={JENIS}
        value={nilai.type}
        onChange={(jenis) => ubah("type", jenis)}
        error={galat("type")}
        required
      />

      <Field id="field-title" label="Judul" required error={galat("title")}>
        <input
          type="text"
          autoComplete="off"
          aria-describedby={describedBy("field-title", { error: galat("title") })}
          {...teksKolom("title")}
        />
      </Field>

      <DateField
        id="field-date"
        name="date"
        label="Tanggal"
        required
        value={nilai.date}
        onChange={(tanggal) => ubah("date", tanggal)}
        onBlur={() => sentuh("date")}
        min="2020-01-01"
        max={addDaysToKey(todayKey, 731)}
        error={galat("date")}
      />

      <div>
        <label className="flex min-h-14 cursor-pointer items-center gap-3 text-xl font-bold text-ink">
          <input
            type="checkbox"
            checked={tampilkanJam}
            onChange={(e) => {
              setTampilkanJam(e.target.checked);
              if (e.target.checked && nilai.time === "") ubah("time", JAM_AWAL);
            }}
            className="size-7 shrink-0 accent-primary"
          />
          Tampilkan jam
        </label>
        {tampilkanJam ? (
          <div className="mt-2">
            <Field id="field-time" label="Jam" required hint="Waktu WIB" error={galat("time")}>
              <input
                type="time"
                name="time"
                id="field-time"
                value={nilai.time}
                onChange={(e) => ubah("time", e.target.value)}
                onBlur={() => sentuh("time")}
                aria-invalid={galat("time") ? true : undefined}
                aria-describedby={describedBy("field-time", { hint: true, error: galat("time") })}
                className={inputClass(Boolean(galat("time")))}
              />
            </Field>
          </div>
        ) : null}
      </div>

      <Field
        id="field-excerpt"
        label="Ringkasan"
        required
        hint="Di kartu tampil sekitar 3 baris."
        error={galat("excerpt")}
      >
        <textarea
          id="field-excerpt"
          name="excerpt"
          rows={4}
          value={nilai.excerpt}
          onChange={(e) => ubah("excerpt", e.target.value)}
          onBlur={() => sentuh("excerpt")}
          aria-invalid={galat("excerpt") ? true : undefined}
          aria-describedby={`${describedBy("field-excerpt", { hint: true, error: galat("excerpt") })} field-excerpt-count`}
          className={`${inputClass(Boolean(galat("excerpt")))} min-h-32 py-3 leading-relaxed`}
        />
        <p id="field-excerpt-count" className="mt-2 text-lg text-ink-soft">
          {panjangRingkasan} dari {BATAS_RINGKASAN} huruf
        </p>
      </Field>

      <FotoFields
        folder="kegiatan"
        uploadEnabled={uploadEnabled}
        imageUrl={nilai.imageUrl}
        imageAlt={nilai.imageAlt}
        imagePosition={nilai.imagePosition}
        error={galat}
        onFoto={(url) => {
          setNilai((s) => ({ ...s, imageUrl: url, imageAlt: url === "" ? "" : s.imageAlt }));
          sentuh("imageUrl");
        }}
        onAlt={(teks) => ubah("imageAlt", teks)}
        onPosisi={(posisi) => ubah("imagePosition", posisi)}
        onBlur={sentuh}
      />

      <Field
        id="field-href"
        label="Tautan “Selengkapnya”"
        hint="Boleh dikosongkan. Awali dengan https://, http://, / atau #."
        error={galat("href")}
      >
        <input
          type="url"
          autoComplete="off"
          aria-describedby={describedBy("field-href", { hint: true, error: galat("href") })}
          {...teksKolom("href")}
        />
      </Field>

      <PreviewPane>
        {/* inert: pratinjau hanya untuk dilihat; tautan di dalamnya tidak boleh membawa pengurus pergi dari formulir. */}
        <div inert>
          <AnnouncementCard item={pratinjau} />
        </div>
      </PreviewPane>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SaveButton label={state?.message ? "Coba lagi" : "Simpan"} />
        <Link href="/admin/pengumuman" className={buttonClass("outline", "lg", "w-full sm:w-auto")}>
          Batal
        </Link>
      </div>
    </form>
  );
}
