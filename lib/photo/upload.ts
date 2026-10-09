import type { HandleUploadBody, handleUpload } from "@vercel/blob/client";
import type { AdminSession } from "@/lib/auth/session";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/photo/rules";

/** Jalur berkas yang boleh diminta klien: hanya folder kajian/ dan kegiatan/, satu tingkat, tanpa "..". */
const JALUR_SAH = /^(kajian|kegiatan)\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;

/** Opsi token unggah: jenis dan ukuran dibatasi oleh Blob sendiri, dan nama berkas selalu diberi akhiran acak. */
export function uploadTokenOptions(): {
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
  addRandomSuffix: true;
} {
  return {
    allowedContentTypes: [...ALLOWED_UPLOAD_TYPES],
    maximumSizeInBytes: MAX_UPLOAD_BYTES,
    addRandomSuffix: true,
  };
}

const jawab = (pesan: string, status: number) => Response.json({ error: pesan }, { status });

/**
 * Pengendali `POST /api/admin/foto`: memberi klien izin (token) untuk mengunggah satu foto langsung ke Blob, tanpa
 * melewati batas 1 MB badan Server Action. Sesi diperiksa sebelum SDK dipanggil dan sekali lagi saat token dibuat.
 * Tanpa `onUploadCompleted`: URL foto diterima Server Action ketika formulir disimpan.
 */
export async function handleFotoUpload(
  request: Request,
  deps: { getAdmin: () => Promise<AdminSession | null>; handleUpload: typeof handleUpload },
): Promise<Response> {
  if (!(await deps.getAdmin())) return jawab("Sesi Anda sudah berakhir. Silakan masuk lagi.", 401);

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return jawab("Permintaan unggah tidak dikenal.", 400);
  }

  let tanpaSesi = false;
  try {
    const hasil = await deps.handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await deps.getAdmin())) {
          tanpaSesi = true;
          throw new Error("Sesi berakhir.");
        }
        if (!JALUR_SAH.test(pathname)) throw new Error("Jalur berkas tidak sah.");
        return uploadTokenOptions();
      },
    });
    return Response.json(hasil);
  } catch (error) {
    if (tanpaSesi) return jawab("Sesi Anda sudah berakhir. Silakan masuk lagi.", 401);
    console.error("[admin/foto] Gagal membuat izin unggah:", error);
    return jawab("Izin unggah foto belum bisa dibuat. Coba lagi.", 400);
  }
}
