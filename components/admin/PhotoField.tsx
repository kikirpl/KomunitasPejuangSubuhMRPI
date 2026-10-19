"use client";

import { upload } from "@vercel/blob/client";
import { CircleAlert, ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/buttonStyles";
import { resizeImage } from "@/lib/photo/resize";
import { ACCEPTED_INPUT_TYPES, isAcceptedImageType, uploadPathname } from "@/lib/photo/rules";

const PESAN_BUKAN_FOTO = "Pilih foto berformat JPG, PNG, atau WebP.";
const PESAN_GAGAL_UNGGAH = "Foto belum berhasil diunggah. Periksa sambungan, lalu coba lagi.";

type Tahap =
  | { jenis: "diam" }
  | { jenis: "memperkecil" }
  | { jenis: "mengunggah"; persen: number }
  | { jenis: "gagal"; pesan: string; bisaUlang: boolean };

/**
 * Isian foto: memilih dari galeri atau kamera, diperkecil di HP, lalu diunggah langsung ke Vercel Blob. Isian
 * tersembunyi `name` memuat URL fotonya; selama proses berjalan, isian `fotoMasihDiunggah=1` ikut terkirim sehingga
 * server menolak Simpan sebelum fotonya selesai. Bila unggah gagal, formulir tetap bisa disimpan tanpa foto baru.
 * Tombol utama berid `field-{name}` sebagai sasaran tautan ringkasan galat.
 */
export function PhotoField({
  name,
  value,
  onChange,
  folder,
  uploadEnabled,
  error,
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
  folder: "kajian" | "kegiatan";
  uploadEnabled: boolean;
  error?: string;
}) {
  const [tahap, setTahap] = useState<Tahap>({ jenis: "diam" });
  // Miniatur dari berkas yang baru dipilih (sudah diperkecil dan tegak), dipakai selama sesi ini.
  const [lokal, setLokal] = useState<string | null>(null);
  const terakhir = useRef<File | null>(null);
  const masukan = useRef<HTMLInputElement>(null);
  const lokalRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (lokalRef.current) URL.revokeObjectURL(lokalRef.current);
    },
    [],
  );

  const gantiLokal = (url: string | null) => {
    if (lokalRef.current) URL.revokeObjectURL(lokalRef.current);
    lokalRef.current = url;
    setLokal(url);
  };

  async function proses(berkas: File) {
    terakhir.current = berkas;
    if (!isAcceptedImageType(berkas.type)) {
      setTahap({ jenis: "gagal", pesan: PESAN_BUKAN_FOTO, bisaUlang: false });
      return;
    }
    setTahap({ jenis: "memperkecil" });
    let kecil: Blob;
    try {
      kecil = await resizeImage(berkas);
    } catch (e) {
      setTahap({ jenis: "gagal", pesan: e instanceof Error ? e.message : PESAN_GAGAL_UNGGAH, bisaUlang: false });
      return;
    }
    setTahap({ jenis: "mengunggah", persen: 0 });
    try {
      const hasil = await upload(uploadPathname(folder, kecil.type), kecil, {
        access: "public",
        contentType: kecil.type,
        handleUploadUrl: "/api/admin/foto",
        onUploadProgress: ({ percentage }) => setTahap({ jenis: "mengunggah", persen: Math.min(99, Math.round(percentage)) }),
      });
      gantiLokal(URL.createObjectURL(kecil));
      onChange(hasil.url);
      setTahap({ jenis: "diam" });
    } catch {
      setTahap({ jenis: "gagal", pesan: PESAN_GAGAL_UNGGAH, bisaUlang: true });
    }
  }

  const sibuk = tahap.jenis === "memperkecil" || tahap.jenis === "mengunggah";
  const gambar = lokal ?? (value || null);
  const kontrolId = `field-${name}`;
  const pilihFoto = () => masukan.current?.click();

  return (
    <fieldset>
      <legend className="text-xl font-bold text-ink">
        Foto<span className="font-normal text-ink-soft"> (boleh dikosongkan)</span>
      </legend>
      <input type="hidden" name={name} value={value} />
      {sibuk ? <input type="hidden" name="fotoMasihDiunggah" value="1" /> : null}

      {!uploadEnabled ? (
        <>
          {gambar ? <Miniatur src={gambar} /> : null}
          <p className="mt-2 rounded-control border-2 border-gold bg-gold-tint px-4 py-3 text-lg text-ink hc:border-black">
            Unggah foto belum disiapkan.
          </p>
          {gambar ? (
            <button
              type="button"
              id={kontrolId}
              onClick={() => {
                gantiLokal(null);
                onChange("");
              }}
              className={buttonClass("danger", "md", "mt-3 w-full sm:w-auto")}
            >
              <Trash2 aria-hidden className="size-6" />
              Hapus foto
            </button>
          ) : null}
        </>
      ) : (
        <>
          <input
            ref={masukan}
            type="file"
            accept={ACCEPTED_INPUT_TYPES.join(",")}
            tabIndex={-1}
            aria-hidden
            className="sr-only"
            onChange={(e) => {
              const berkas = e.target.files?.[0];
              e.target.value = "";
              if (berkas) void proses(berkas);
            }}
          />
          {gambar ? <Miniatur src={gambar} /> : null}

          <div aria-live="polite" className="mt-2">
            {tahap.jenis === "memperkecil" ? (
              <p className="flex items-center gap-3 text-xl font-bold text-brand">
                <LoaderCircle aria-hidden className="size-6 shrink-0 motion-safe:animate-spin" />
                Memperkecil foto...
              </p>
            ) : null}
            {tahap.jenis === "mengunggah" ? (
              <div>
                <p className="flex items-center gap-3 text-xl font-bold text-brand">
                  <LoaderCircle aria-hidden className="size-6 shrink-0 motion-safe:animate-spin" />
                  Mengunggah {tahap.persen}%
                </p>
                <div aria-hidden className="mt-2 h-3 w-full overflow-hidden rounded-full bg-tint hc:border hc:border-black">
                  <div className="h-full bg-primary" style={{ width: `${tahap.persen}%` }} />
                </div>
              </div>
            ) : null}
            {tahap.jenis === "gagal" ? (
              <p role="alert" className="text-lg font-bold text-danger">
                {tahap.pesan}
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              id={kontrolId}
              onClick={pilihFoto}
              disabled={sibuk}
              aria-describedby={error ? `${kontrolId}-error` : undefined}
              className={buttonClass("outline", "md", "w-full sm:w-auto")}
            >
              <ImagePlus aria-hidden className="size-6" />
              {gambar ? "Ganti foto" : "Pilih foto"}
            </button>
            {tahap.jenis === "gagal" && tahap.bisaUlang ? (
              <button
                type="button"
                onClick={() => terakhir.current && void proses(terakhir.current)}
                className={buttonClass("outline", "md", "w-full sm:w-auto")}
              >
                <RefreshCw aria-hidden className="size-6" />
                Coba lagi
              </button>
            ) : null}
            {gambar && !sibuk ? (
              <button
                type="button"
                onClick={() => {
                  gantiLokal(null);
                  onChange("");
                  setTahap({ jenis: "diam" });
                }}
                className={buttonClass("danger", "md", "w-full sm:w-auto")}
              >
                <Trash2 aria-hidden className="size-6" />
                Hapus foto
              </button>
            ) : null}
          </div>
        </>
      )}

      {error ? (
        <p id={`${kontrolId}-error`} className="mt-3 flex items-start gap-2 text-lg font-bold text-danger">
          <CircleAlert aria-hidden className="mt-1 size-5 shrink-0" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Miniatur foto yang dipilih (utuh, tanpa dipotong), memakai berkas lokal atau alamat tersimpan. */
function Miniatur({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Foto yang dipilih"
      width={320}
      height={320}
      unoptimized
      className="h-40 w-auto max-w-full rounded-control border-2 border-line bg-paper-2 object-contain hc:border-black"
    />
  );
}
