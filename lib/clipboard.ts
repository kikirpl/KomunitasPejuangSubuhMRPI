/**
 * Menyalin teks ke papan klip. Mengembalikan true jika berhasil.
 * Memakai Clipboard API bila tersedia (HTTPS/localhost), dan cara lama
 * (textarea + execCommand) untuk peramban atau tablet yang lebih tua.
 */
export async function copyText(text: string): Promise<boolean> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof window !== "undefined" &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // izin ditolak atau tidak didukung: lanjut ke cara lama
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;

  const previouslyFocused = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "-9999px";
  area.style.opacity = "0";

  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(area);
  previouslyFocused?.focus?.();
  return ok;
}
