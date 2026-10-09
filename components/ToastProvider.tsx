"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import type { ToastMessage, ToastTone } from "@/types";

interface ToastApi {
  showToast: (text: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TOAST_DURATION_MS = 5000;

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  }
  return context;
}

const toneStyles: Record<ToastTone, string> = {
  success: "bg-brand-deep text-on-brand border-gold",
  error: "bg-[#7a1f1f] text-white border-white",
  info: "bg-brand-deep text-on-brand border-line-dark",
};

const toneIcon = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
} as const;

/**
 * Pemberitahuan singkat berukuran besar di bagian bawah layar.
 * Wilayah `aria-live` selalu ada di halaman agar pembaca layar mengumumkan
 * isinya setiap kali pesan baru muncul.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((text: string, tone: ToastTone = "success") => {
    window.clearTimeout(timerRef.current);
    idRef.current += 1;
    setToast({ id: idRef.current, text, tone });
    timerRef.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const api = useMemo<ToastApi>(() => ({ showToast }), [showToast]);
  const Icon = toast ? toneIcon[toast.tone] : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {toast && Icon ? (
          <div
            key={toast.id}
            className={`toast-in pointer-events-auto flex w-full max-w-xl items-center gap-4 rounded-2xl border-2 px-5 py-4 shadow-2xl ${toneStyles[toast.tone]}`}
          >
            <Icon aria-hidden className="size-9 shrink-0" strokeWidth={2.25} />
            <p className="flex-1 text-xl font-bold leading-snug">{toast.text}</p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Tutup pemberitahuan"
              className="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-current/40 hover:bg-white/10"
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
