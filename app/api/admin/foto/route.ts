import { handleUpload } from "@vercel/blob/client";
import { getAdmin } from "@/lib/auth/guard";
import { handleFotoUpload } from "@/lib/photo/upload";

/** Izin unggah foto langsung ke Blob (hanya pengurus yang masuk). Halaman panel memakainya lewat `upload()` di klien. */
export async function POST(request: Request): Promise<Response> {
  return handleFotoUpload(request, { getAdmin, handleUpload });
}
