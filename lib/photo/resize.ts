/**
 * Pengecilan foto di peramban (HP pengurus) sebelum diunggah (spec bagian 10). Hanya dipakai kode klien:
 * `resizeImage` butuh `createImageBitmap` dan `canvas`. Menyimpan ulang lewat canvas membuang metadata EXIF,
 * termasuk lokasi GPS. Hitungan ukuran dan urutan percobaan penyandian dibuat sebagai fungsi murni agar bisa diuji.
 */
import { MAX_SIDE_PX, MAX_UPLOAD_BYTES } from "@/lib/photo/rules";

/** Kualitas WebP berturut-turut: pertama 0,82; bila hasil masih di atas `SOFT_MAX_BYTES`, 0,7 lalu 0,6. */
export const QUALITY_STEPS: readonly number[] = [0.82, 0.7, 0.6];
/** Kualitas JPEG pertama bila peramban tidak bisa menyimpan WebP. */
export const JPEG_QUALITY = 0.85;
/** Ukuran yang dianggap cukup kecil; di atas ini kualitas diturunkan bertahap. */
export const SOFT_MAX_BYTES = 1_000_000;
/** Sisi terpanjang cadangan bila semua tingkat kualitas pada 1600 px masih melewati `SOFT_MAX_BYTES`. */
export const FALLBACK_MAX_SIDE = 1280;

export const PESAN_FOTO_TIDAK_TERBACA = "Foto tidak bisa dibaca. Coba foto lain.";
export const PESAN_FOTO_TERLALU_BESAR = "Foto masih terlalu besar setelah diperkecil. Coba foto lain.";

/** Ukuran hasil: tidak memperbesar, rasio tetap, sisi terpanjang paling besar `maxSide`, dibulatkan, minimal 1 px. */
export function computeTargetSize(
  width: number,
  height: number,
  maxSide: number = MAX_SIDE_PX,
): { width: number; height: number } {
  const skala = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * skala)),
    height: Math.max(1, Math.round(height * skala)),
  };
}

export interface EncodingAttempt {
  type: "image/webp" | "image/jpeg";
  quality: number;
}

/**
 * Urutan percobaan penyandian pada satu ukuran. Peramban yang bisa WebP: WebP 0,82, 0,7, 0,6. Peramban yang
 * hasilnya bukan `image/webp` (mis. Safari lama mengembalikan PNG): JPEG 0,85, lalu 0,7 dan 0,6.
 */
export function encodingPlan(webpSupported: boolean): readonly EncodingAttempt[] {
  if (webpSupported) return QUALITY_STEPS.map((quality) => ({ type: "image/webp", quality }));
  return [
    { type: "image/jpeg", quality: JPEG_QUALITY },
    ...QUALITY_STEPS.slice(1).map((quality): EncodingAttempt => ({ type: "image/jpeg", quality })),
  ];
}

interface GambarTerdekode {
  source: CanvasImageSource;
  width: number;
  height: number;
  tutup: () => void;
}

/** Mendekode berkas dengan orientasi EXIF diterapkan; cadangan: elemen gambar (peramban modern juga menerapkannya). */
async function dekode(file: File): Promise<GambarTerdekode> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, tutup: () => bitmap.close() };
    } catch {
      /* lanjut ke elemen gambar */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const gambar = new Image();
    gambar.src = url;
    await gambar.decode();
    return { source: gambar, width: gambar.naturalWidth, height: gambar.naturalHeight, tutup: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error(PESAN_FOTO_TIDAK_TERBACA);
  }
}

function kanvasKeBlob(kanvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((selesai, gagal) => {
    kanvas.toBlob((blob) => (blob ? selesai(blob) : gagal(new Error(PESAN_FOTO_TIDAK_TERBACA))), type, quality);
  });
}

/**
 * Memperkecil foto: sisi terpanjang 1600 px, WebP 0,82 (JPEG 0,85 bila peramban tidak bisa WebP). Bila masih di atas
 * `SOFT_MAX_BYTES`, kualitas turun bertahap, lalu sisi terpanjang 1280 px. Mengembalikan hasil pertama yang cukup
 * kecil, atau yang terkecil bila tidak ada; melempar galat bila bahkan yang terkecil melewati batas unggah.
 */
export async function resizeImage(file: File): Promise<Blob> {
  const gambar = await dekode(file);
  try {
    let terkecil: Blob | null = null;
    for (const sisiMaks of [MAX_SIDE_PX, FALLBACK_MAX_SIDE]) {
      const ukuran = computeTargetSize(gambar.width, gambar.height, sisiMaks);
      const kanvas = document.createElement("canvas");
      kanvas.width = ukuran.width;
      kanvas.height = ukuran.height;
      const konteks = kanvas.getContext("2d");
      if (!konteks) throw new Error(PESAN_FOTO_TIDAK_TERBACA);
      konteks.imageSmoothingQuality = "high";
      konteks.drawImage(gambar.source, 0, 0, ukuran.width, ukuran.height);

      let rencana = encodingPlan(true);
      for (let i = 0; i < rencana.length; i++) {
        const { type, quality } = rencana[i];
        const blob = await kanvasKeBlob(kanvas, type, quality);
        if (type === "image/webp" && blob.type !== "image/webp") {
          // Peramban tidak bisa menyimpan WebP: ulangi dari awal sebagai JPEG.
          rencana = encodingPlan(false);
          i = -1;
          continue;
        }
        if (!terkecil || blob.size < terkecil.size) terkecil = blob;
        if (blob.size <= SOFT_MAX_BYTES) return blob;
      }
    }
    if (!terkecil || terkecil.size > MAX_UPLOAD_BYTES) throw new Error(PESAN_FOTO_TERLALU_BESAR);
    return terkecil;
  } finally {
    gambar.tutup();
  }
}
