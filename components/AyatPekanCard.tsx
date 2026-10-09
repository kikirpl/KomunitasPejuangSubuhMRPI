"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FlaskConical,
  Info,
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { buttonClass } from "@/components/ui/buttonStyles";
import { QARI, SUMBER_CADANGAN } from "@/data/ayatPekan";
import { useAyahAudio, type StatusAudio } from "@/hooks/useAyahAudio";
import { useAyatPekan } from "@/hooks/useAyatPekan";
import {
  NAMA_HARI_PEKAN,
  labelAyatPanjang,
  labelBlok,
  labelRentangTanggal,
  labelRujukan,
  labelTanggal,
  type PekanTadabbur,
} from "@/lib/ayatPekan";
import type { AyahData, EdisiInfo, SumberAyat } from "@/types";

const DAFTAR_ID = "ayat-pekan-daftar";

/**
 * Bagian interaktif "Ayat Pekan Ini" (client): kartu ayat, tombol buka/tutup
 * lima ayat, dan murottal per ayat. Data dari Route Handler /api/ayat
 * (Al Quran Cloud); logika pekan di lib/ayatPekan.ts.
 */
export function AyatPekanCard() {
  const { status, pekan, ayat, sumber, terjemahan, pesan, tanggalUji, cobaLagi } = useAyatPekan();

  return (
    <>
      {tanggalUji ? (
        <p
          role="note"
          className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-dashed border-gold bg-gold-tint px-5 py-3 text-lg text-brand hc:border-black"
        >
          <FlaskConical aria-hidden className="mt-1 size-5 shrink-0" />
          <span>
            <strong>Mode uji (development):</strong> kartu ditampilkan seolah-olah hari ini{" "}
            {NAMA_HARI_PEKAN[pekan?.urutanHariIni ?? 0]}, {labelTanggal(tanggalUji)}{" "}
            (parameter <code>?tanggal=</code>).
          </span>
        </p>
      ) : null}

      {pekan ? (
        <p className="mb-6 text-xl font-bold text-brand">
          Pekan {labelRentangTanggal(pekan.senin, pekan.ahad)}: {labelBlok(pekan.rujukan)}
        </p>
      ) : null}

      {status === "siap" && pekan && ayat && sumber ? (
        // key: berganti pekan = daftar baru, audio pekan lama otomatis berhenti.
        <DaftarAyat
          key={pekan.senin}
          pekan={pekan}
          ayat={ayat}
          sumber={sumber}
          terjemahan={terjemahan}
          pesan={pesan}
        />
      ) : status === "gagal" ? (
        <KotakGagal pekan={pekan} pesan={pesan} cobaLagi={cobaLagi} />
      ) : (
        <KerangkaMemuat />
      )}
    </>
  );
}

interface DaftarAyatProps {
  pekan: PekanTadabbur;
  ayat: AyahData[];
  sumber: SumberAyat;
  terjemahan: EdisiInfo | null;
  pesan: string | null;
}

function DaftarAyat({ pekan, ayat, sumber, terjemahan, pesan }: DaftarAyatProps) {
  const [terbuka, setTerbuka] = useState(false);
  const audio = useAyahAudio();
  const adaAudio = ayat.some((a) => a.audioUrl || a.audioFallbackUrl);

  function alihkanDaftar() {
    if (terbuka) audio.hentikan(); // audio berhenti saat daftar ditutup
    setTerbuka((nilai) => !nilai);
  }

  return (
    <>
      {sumber === "cadangan" ? (
        <p
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-line-soft bg-tint px-5 py-4 text-lg text-ink hc:border-2 hc:border-line"
        >
          <Info aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
          <span>
            {pesan}
            {adaAudio ? null : " Murottal belum tersedia untuk sementara."}
          </span>
        </p>
      ) : null}

      <ol id={DAFTAR_ID} role="list" className="grid grid-cols-1 gap-5">
        {ayat.map((item, index) => {
          const id = String(item.nomorGlobal);
          return (
            <KartuAyat
              key={id}
              ayat={item}
              index={index}
              pekan={pekan}
              terbuka={terbuka}
              statusAudio={audio.statusUntuk(id)}
              onAudio={() => audio.alihkan(id, item)}
            />
          );
        })}
      </ol>

      <div className="mt-6">
        <button
          type="button"
          aria-expanded={terbuka}
          aria-controls={DAFTAR_ID}
          onClick={alihkanDaftar}
          className={buttonClass("primary", "lg", "w-full sm:w-auto")}
        >
          {terbuka ? (
            <ChevronUp aria-hidden className="size-6" />
          ) : (
            <ChevronDown aria-hidden className="size-6" />
          )}
          {terbuka ? "Sembunyikan" : "Lihat 5 ayat pekan ini"}
        </button>
      </div>

      <Atribusi sumber={sumber} terjemahan={terjemahan} adaAudio={adaAudio} />
    </>
  );
}

interface KartuAyatProps {
  ayat: AyahData;
  index: number;
  pekan: PekanTadabbur;
  terbuka: boolean;
  statusAudio: StatusAudio;
  onAudio: () => void;
}

function KartuAyat({ ayat, index, pekan, terbuka, statusAudio, onAudio }: KartuAyatProps) {
  const indeksAwal = pekan.indeksHariIni ?? 0;
  const awal = index === indeksAwal;
  const hariIni = pekan.indeksHariIni === index;
  const murajaah = pekan.murajaah && awal;
  const hari = NAMA_HARI_PEKAN[index];
  // Urutan muncul di antara kartu yang tadinya tersembunyi (untuk animasi bertahap).
  const urutanMuncul = index < indeksAwal ? index : index - 1;
  const rujukan = { surah: ayat.surah.nomor, ayat: ayat.nomorAyat };
  const diputar = statusAudio === "memutar" || statusAudio === "memuat";
  const adaAudio = Boolean(ayat.audioUrl || ayat.audioFallbackUrl);

  return (
    <li
      hidden={!terbuka && !awal}
      className={terbuka && !awal ? "ayat-muncul" : undefined}
      style={terbuka && !awal ? { animationDelay: `${urutanMuncul * 90}ms` } : undefined}
    >
      <article
        className={`rounded-2xl p-6 shadow-card md:p-8 ${
          hariIni
            ? "border-2 border-gold bg-gold-tint hc:border-4 hc:border-black"
            : "border border-line bg-card hc:border-2"
        } ${diputar ? "ring-4 ring-accent/55 ring-offset-2 ring-offset-paper" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <p className="flex flex-wrap items-center gap-2">
            {hariIni ? (
              <span className="rounded-full bg-gold px-3.5 py-1 text-base font-bold text-on-gold hc:border-2 hc:border-black">
                Hari ini · {hari}
              </span>
            ) : (
              <span className="rounded-full border border-line-soft bg-tint px-3.5 py-1 text-base font-bold text-brand hc:border-2">
                {hari}
              </span>
            )}
            {murajaah ? (
              <span className="rounded-full bg-brand px-3.5 py-1 text-base font-bold text-on-brand">
                Muraja&apos;ah pekan ini
              </span>
            ) : null}
          </p>
          <h3 className="text-xl font-semibold text-brand sm:text-2xl">{labelRujukan(rujukan)}</h3>
        </div>

        {ayat.basmalah ? (
          <p lang="ar" dir="rtl" data-basmalah="" className="arabic mt-6 text-center text-brand">
            {ayat.basmalah}
          </p>
        ) : null}
        <p lang="ar" dir="rtl" className="arabic mt-6 text-ink">
          {ayat.teksArab}
        </p>

        {adaAudio ? (
          <TombolMurottal
            status={statusAudio}
            label={labelAyatPanjang(rujukan)}
            onClick={onAudio}
          />
        ) : null}

        <p className="mt-6 border-t border-line pt-5 text-xl leading-relaxed text-ink">
          {ayat.terjemahan}
        </p>
      </article>
    </li>
  );
}

const TEKS_TOMBOL: Record<StatusAudio, string> = {
  diam: "Putar murottal",
  galat: "Putar murottal",
  memuat: "Memuat…",
  memutar: "Jeda",
};

const AKSI_ARIA: Record<StatusAudio, string> = {
  diam: "Putar",
  galat: "Putar",
  memuat: "Memuat",
  memutar: "Jeda",
};

/**
 * Tombol putar/jeda murottal. Nama aksesibel diawali teks yang terlihat
 * (mis. "Putar murottal QS. Al-Isra ayat 88"), sesuai WCAG 2.5.3.
 */
function TombolMurottal({
  status,
  label,
  onClick,
}: {
  status: StatusAudio;
  label: string;
  onClick: () => void;
}) {
  const aktif = status === "memutar" || status === "memuat";
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${AKSI_ARIA[status]} murottal ${label}`}
        className={`inline-flex min-h-12 items-center gap-2.5 rounded-full border-2 px-5 py-2 text-lg font-bold transition-colors ${
          aktif
            ? "border-primary bg-primary text-on-brand hover:border-primary-hover hover:bg-primary-hover"
            : "border-primary bg-card text-primary hover:bg-tint"
        }`}
      >
        {status === "memutar" ? (
          <Pause aria-hidden className="size-5" fill="currentColor" />
        ) : status === "memuat" ? (
          <LoaderCircle aria-hidden className="size-5 animate-spin" />
        ) : (
          <Play aria-hidden className="size-5" fill="currentColor" />
        )}
        {TEKS_TOMBOL[status]}
      </button>

      {status === "memutar" ? (
        <span className="inline-flex items-center gap-2 text-lg font-bold text-primary">
          <Equalizer />
          Sedang diputar
        </span>
      ) : null}

      <p role="status" className="text-lg text-ink-soft empty:hidden">
        {status === "galat" ? "Audio belum dapat dimuat." : ""}
      </p>
    </div>
  );
}

/** Ikon equalizer sederhana (tiga batang); bergerak pelan hanya saat audio diputar. */
function Equalizer() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 18 18" className="size-5 text-accent hc:text-primary">
      <rect className="eq-bar" x="2" y="4" width="3" height="12" rx="1" fill="currentColor" />
      <rect className="eq-bar" x="7.5" y="2" width="3" height="14" rx="1" fill="currentColor" />
      <rect className="eq-bar" x="13" y="6" width="3" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

function Atribusi({
  sumber,
  terjemahan,
  adaAudio,
}: {
  sumber: SumberAyat;
  terjemahan: EdisiInfo | null;
  adaAudio: boolean;
}) {
  // Teks biasa (bukan tautan kecil) agar tidak ada target sentuh di bawah 44px.
  const tautan = "Al Quran Cloud";

  return (
    <p className="mt-6 text-base text-ink-soft">
      {sumber === "api" ? (
        <>
          Teks dan audio: {tautan} · Qari: {QARI.nama}
          {terjemahan ? (
            <>
              <br />
              Terjemahan: {terjemahan.nama} ({terjemahan.identifier})
            </>
          ) : null}
        </>
      ) : (
        <>
          Teks (data cadangan): {SUMBER_CADANGAN.teks}
          {adaAudio ? (
            <>
              <br />
              Audio: {tautan} · Qari: {QARI.nama}
            </>
          ) : null}
        </>
      )}
    </p>
  );
}

function KotakGagal({
  pekan,
  pesan,
  cobaLagi,
}: {
  pekan: PekanTadabbur | null;
  pesan: string | null;
  cobaLagi: () => void;
}) {
  const rujukanHariIni = pekan ? pekan.rujukan[pekan.indeksHariIni ?? 0] : null;
  return (
    <div
      role="alert"
      className="rounded-2xl border border-line bg-card p-6 shadow-card md:p-8 hc:border-2"
    >
      <p className="flex items-start gap-3 text-xl">
        <CircleAlert aria-hidden className="mt-1 size-6 shrink-0 text-accent" />
        <span>
          <strong className="text-brand">Maaf, ayat pekan ini belum bisa ditampilkan.</strong>{" "}
          {pesan}{" "}
          {rujukanHariIni
            ? `Untuk sementara, silakan baca ${labelRujukan(rujukanHariIni)} dari mushaf. `
            : null}
          Tekan Coba Lagi beberapa saat lagi.
        </span>
      </p>
      <button type="button" onClick={cobaLagi} className={buttonClass("primary", "md", "mt-5")}>
        <RefreshCw aria-hidden className="size-5" />
        Coba Lagi
      </button>
    </div>
  );
}

function KerangkaMemuat() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-line bg-card p-6 shadow-card md:p-8 hc:border-2"
    >
      <p className="text-xl text-ink-soft">Memuat ayat pekan ini...</p>
      <div aria-hidden className="mt-6 space-y-4">
        <div className="ms-auto h-10 w-11/12 animate-pulse rounded-lg bg-tint" />
        <div className="ms-auto h-10 w-3/4 animate-pulse rounded-lg bg-tint" />
        <div className="mt-8 h-6 w-full animate-pulse rounded bg-tint" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-tint" />
      </div>
    </div>
  );
}
