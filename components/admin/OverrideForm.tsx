"use client";

import Link from "next/link";
import { useActionState, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ChoiceCards } from "@/components/admin/ChoiceCards";
import { ConfirmDialogBox, ConfirmSubmit } from "@/components/admin/ConfirmDialog";
import { DateField } from "@/components/admin/DateField";
import { ErrorSummary } from "@/components/admin/ErrorSummary";
import { describedBy, Field, inputClass } from "@/components/admin/Field";
import { KajianFields } from "@/components/admin/KajianFields";
import { PreviewPane } from "@/components/admin/PreviewPane";
import { SaveButton } from "@/components/admin/SaveButton";
import { buttonClass } from "@/components/ui/buttonStyles";
import { CancelledCard, TodayCard } from "@/components/TodaySchedule";
import type { FormState } from "@/lib/admin/form-state";
import {
  isiDariJadwalTetap,
  KOLOM_KAJIAN,
  masjid,
  tempatSetelahCara,
  type IsianKajian,
  type KolomKajian,
} from "@/lib/admin/session-fields";
import { effectiveSessionOn } from "@/lib/schedule";
import { addDaysToKey, formatDateKeyLong, isValidDateKey, weekdayOfKey } from "@/lib/time";
import { overrideSchema } from "@/lib/validation/jadwal";
import { parseForm, type RawForm } from "@/lib/validation/umum";
import type { SessionMode, SessionOverride, StudySession } from "@/types";

/** Label kolom untuk ringkasan galat. */
const LABEL: Record<string, string> = {
  date: "Tanggal",
  kind: "Libur atau Ganti jadwal",
  startTime: "Jam mulai",
  endTime: "Jam selesai",
  ustadz: "Nama ustadz",
  topic: "Tema kajian",
  mode: "Cara mengikuti",
  location: "Tempat",
  note: "Catatan untuk jamaah",
};

const PILIHAN = [
  { value: "libur", title: "Libur", hint: "Tidak ada kajian pada tanggal itu" },
  { value: "ganti", title: "Ganti jadwal", hint: "Ustadz, tema, atau jam berbeda dari biasanya" },
] as const;

type Jenis = "libur" | "ganti";
type Nilai = IsianKajian & { date: string; kind: Jenis | ""; note: string };

/** Isian awal: hasil aksi sebelumnya (halaman dirender ulang server), entri yang diubah, atau formulir baru. */
function nilaiAwal(
  initial: SessionOverride | null,
  sessions: readonly StudySession[],
  echo: RawForm | undefined,
): { nilai: Nilai; diubah: readonly KolomKajian[] } {
  const tanggal = echo?.date ?? initial?.date ?? "";
  const kajian: IsianKajian = initial?.session
    ? {
        startTime: initial.session.startTime,
        endTime: initial.session.endTime,
        ustadz: initial.session.ustadz,
        topic: initial.session.topic,
        mode: initial.session.mode,
        location: initial.session.location ?? "",
      }
    : isiDariJadwalTetap(sessions, tanggal);
  const dasar: Nilai = { ...kajian, date: tanggal, kind: initial?.kind ?? "", note: initial?.note ?? "" };
  if (echo) return { nilai: { ...dasar, ...echo } as Nilai, diubah: KOLOM_KAJIAN };
  return { nilai: dasar, diubah: initial?.session ? KOLOM_KAJIAN : [] };
}

/**
 * Form perubahan untuk satu tanggal (klien, terkendali): Libur atau Ganti jadwal. Kolom kajian hanya tampil untuk
 * "Ganti jadwal" dan terisi dari jadwal tetap hari pada tanggal itu; kolom yang sudah diubah pengurus tidak
 * ditimpa lagi saat tanggal berganti. "Libur" meminta konfirmasi lewat dialog sebelum disimpan.
 */
export function OverrideForm({
  original,
  initial,
  sessions,
  todayKey,
  takenDates,
  action,
}: {
  /** Tanggal entri yang sedang diubah, atau null untuk entri baru. */
  original: string | null;
  initial: SessionOverride | null;
  sessions: readonly StudySession[];
  todayKey: string;
  /** Tanggal yang sudah punya perubahan (untuk pemberitahuan "akan menggantinya"). */
  takenDates: readonly string[];
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [awal] = useState(() => nilaiAwal(initial, sessions, state?.values));
  const [nilai, setNilai] = useState<Nilai>(awal.nilai);
  const [diubah, setDiubah] = useState<readonly KolomKajian[]>(awal.diubah);
  const [tersentuh, setTersentuh] = useState<readonly string[]>([]);
  const [sudahKirim, setSudahKirim] = useState(false);
  const dialogLibur = useRef<HTMLDialogElement>(null);

  // Hasil aksi tiba (galat atau gagal simpan): dialog Libur yang masih terbuka ditutup lebih dulu, sebelum
  // ringkasan galat meminta fokus, supaya fokus tidak dikembalikan ke tombol Simpan.
  useLayoutEffect(() => {
    if (state) dialogLibur.current?.close();
  }, [state]);

  // Yang dikirim sama dengan isian yang tampil: kolom kajian hanya untuk Ganti, Tempat hanya bila ada masjid.
  const kiriman = useMemo<RawForm>(
    () =>
      nilai.kind === "ganti"
        ? { ...nilai, location: masjid(nilai.mode) ? nilai.location : "" }
        : { date: nilai.date, kind: nilai.kind, note: nilai.note },
    [nilai],
  );
  const hasil = useMemo(() => parseForm(overrideSchema(todayKey), kiriman), [kiriman, todayKey]);
  const galat = (nama: string): string | undefined =>
    sudahKirim || tersentuh.includes(nama) ? (hasil.ok ? undefined : hasil.fieldErrors[nama]) : undefined;

  const sentuh = (nama: string) => setTersentuh((s) => (s.includes(nama) ? s : [...s, nama]));
  const ubahKajian = (nama: KolomKajian, nilaiBaru: string) => {
    setNilai((s) => ({ ...s, [nama]: nilaiBaru }));
    setDiubah((d) => (d.includes(nama) ? d : [...d, nama]));
  };
  const pilihCara = (cara: SessionMode) => {
    setNilai((s) => ({ ...s, mode: cara, location: tempatSetelahCara(cara, s.location) }));
    setDiubah((d) => (d.includes("mode") ? d : [...d, "mode"]));
  };
  const ubahTanggal = (tanggal: string) =>
    setNilai((s) => {
      if (!isValidDateKey(tanggal)) return { ...s, date: tanggal };
      // Kolom yang belum diubah pengurus mengikuti jadwal tetap hari pada tanggal baru.
      const jadwal = isiDariJadwalTetap(sessions, tanggal);
      const isi = { ...s, date: tanggal };
      for (const kolom of KOLOM_KAJIAN) if (!diubah.includes(kolom)) isi[kolom] = jadwal[kolom];
      return isi;
    });

  // Libur yang sudah sah dikonfirmasi dulu; selain itu Simpan langsung mengirim (galat dijawab server dengan ringkasan).
  const tahanUntukKonfirmasi = (e: MouseEvent<HTMLButtonElement>) => {
    if (nilai.kind === "libur" && hasil.ok) {
      e.preventDefault();
      dialogLibur.current?.showModal();
    }
  };

  const tanggalLengkap = isValidDateKey(nilai.date) ? formatDateKeyLong(nilai.date) : "";
  const terpakai = nilai.date !== original && takenDates.includes(nilai.date);

  let pratinjau: ReactNode = (
    <p className="text-xl text-ink-soft">Pilih tanggal dan Libur atau Ganti jadwal untuk melihat pratinjau.</p>
  );
  if (tanggalLengkap && nilai.kind === "libur") {
    pratinjau = <CancelledCard note={nilai.note.trim() || undefined} />;
  } else if (tanggalLengkap && nilai.kind === "ganti") {
    const draf: SessionOverride = {
      date: nilai.date,
      kind: "ganti",
      session: {
        startTime: nilai.startTime,
        endTime: nilai.endTime,
        ustadz: nilai.ustadz.trim() || "Nama ustadz",
        topic: nilai.topic.trim() || "Tema kajian",
        mode: nilai.mode === "" ? "masjid" : (nilai.mode as SessionMode),
        ...(masjid(nilai.mode) && nilai.location.trim() ? { location: nilai.location.trim() } : {}),
      },
    };
    const efektif = effectiveSessionOn(nilai.date, weekdayOfKey(nilai.date), sessions, [draf]);
    pratinjau = efektif.session ? <TodayCard session={efektif.session} status="upcoming" /> : null;
  }

  return (
    <form action={formAction} onSubmit={() => setSudahKirim(true)} noValidate className="space-y-8">
      <ErrorSummary errors={state?.fieldErrors} labels={LABEL} message={state?.message} />

      <DateField
        id="field-date"
        name="date"
        label="Tanggal"
        required
        value={nilai.date}
        onChange={ubahTanggal}
        onBlur={() => sentuh("date")}
        min={todayKey}
        max={addDaysToKey(todayKey, 366)}
        error={galat("date")}
        extra={terpakai ? "Tanggal ini sudah ada perubahannya. Menyimpan akan menggantinya." : undefined}
      />

      <ChoiceCards
        name="kind"
        legend="Apa yang terjadi pada tanggal itu?"
        options={PILIHAN}
        value={nilai.kind}
        onChange={(kind) => setNilai((s) => ({ ...s, kind }))}
        error={galat("kind")}
        required
      />

      {nilai.kind === "ganti" ? (
        <KajianFields values={nilai} error={galat} onChange={ubahKajian} onBlur={sentuh} onCara={pilihCara} />
      ) : null}

      <Field
        id="field-note"
        label="Catatan untuk jamaah"
        hint="Contoh: Ustadz berhalangan hadir."
        error={galat("note")}
      >
        <input
          id="field-note"
          name="note"
          type="text"
          autoComplete="off"
          value={nilai.note}
          onChange={(e) => setNilai((s) => ({ ...s, note: e.target.value }))}
          onBlur={() => sentuh("note")}
          aria-invalid={galat("note") ? true : undefined}
          aria-describedby={describedBy("field-note", { hint: true, error: galat("note") })}
          className={inputClass(Boolean(galat("note")))}
        />
      </Field>

      <PreviewPane>
        {tanggalLengkap && nilai.kind ? (
          <p className="mb-4 text-lg text-ink-soft">Kartu “Kajian Hari Ini” pada {tanggalLengkap}.</p>
        ) : null}
        {pratinjau}
      </PreviewPane>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SaveButton label={state?.message ? "Coba lagi" : "Simpan"} onClick={tahanUntukKonfirmasi} />
        <Link href="/admin/jadwal" className={buttonClass("outline", "lg", "w-full sm:w-auto")}>
          Batal
        </Link>
      </div>

      <ConfirmDialogBox
        dialogRef={dialogLibur}
        title={`Liburkan kajian ${tanggalLengkap}?`}
        message="Web akan menampilkan 'Kajian hari ini diliburkan' pada tanggal itu."
      >
        <ConfirmSubmit label="Ya, liburkan" pendingLabel="Menyimpan..." />
      </ConfirmDialogBox>
    </form>
  );
}
