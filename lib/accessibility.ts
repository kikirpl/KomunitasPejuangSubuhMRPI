import type {
  AccessibilitySettings,
  TextScaleLevel,
  TextScaleOption,
} from "@/types";

/* ==========================================================================
 * Pengaturan aksesibilitas (ukuran teks, kontras tinggi, tampilan sederhana).
 *
 * - Disimpan di localStorage agar pilihan jamaah diingat saat membuka lagi.
 * - Diterapkan sebagai atribut pada <html> (data-text-scale, data-contrast,
 *   data-simple) + ukuran huruf dasar. Semua ukuran di Tailwind memakai rem,
 *   jadi seluruh halaman ikut membesar atau mengecil.
 * - Dibaca lewat useSyncExternalStore (lihat hooks/useAccessibility.ts).
 * ========================================================================== */

export const ACCESSIBILITY_STORAGE_KEY = "ps:a11y:v1";

/** Level 1 (112,5% = 18px) adalah "Normal" situs ini, lebih besar dari web biasa (16px). */
export const TEXT_SCALES: readonly TextScaleOption[] = [
  { level: 0, percent: 100, label: "Kecil" },
  { level: 1, percent: 112.5, label: "Normal" },
  { level: 2, percent: 125, label: "Besar" },
  { level: 3, percent: 143.75, label: "Lebih besar" },
  { level: 4, percent: 162.5, label: "Terbesar" },
];

export const MIN_TEXT_SCALE: TextScaleLevel = 0;
export const MAX_TEXT_SCALE: TextScaleLevel = 4;

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  textScale: 1,
  highContrast: false,
  simpleLayout: false,
};

function clampLevel(value: unknown): TextScaleLevel {
  const n =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : DEFAULT_SETTINGS.textScale;
  return Math.min(MAX_TEXT_SCALE, Math.max(MIN_TEXT_SCALE, n)) as TextScaleLevel;
}

export function sanitizeSettings(input: unknown): AccessibilitySettings {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  return {
    textScale: clampLevel(raw.textScale),
    highContrast: raw.highContrast === true,
    simpleLayout: raw.simpleLayout === true,
  };
}

/** Terapkan pengaturan ke elemen <html>. */
export function applySettings(
  settings: AccessibilitySettings,
  root: HTMLElement = document.documentElement,
): void {
  const option = TEXT_SCALES[settings.textScale] ?? TEXT_SCALES[1];
  root.style.fontSize = `${option.percent}%`;
  root.dataset.textScale = String(settings.textScale);
  root.dataset.contrast = settings.highContrast ? "high" : "normal";
  root.dataset.simple = settings.simpleLayout ? "true" : "false";
}

/**
 * Skrip kecil yang dijalankan sebelum halaman digambar, supaya pilihan
 * jamaah langsung berlaku (tanpa tampilan "berkedip" ke ukuran bawaan).
 */
export const ACCESSIBILITY_INIT_SCRIPT = `(function(){try{var r=localStorage.getItem(${JSON.stringify(
  ACCESSIBILITY_STORAGE_KEY,
)});if(!r)return;var d=document.documentElement,s=JSON.parse(r)||{},p=${JSON.stringify(
  TEXT_SCALES.map((option) => option.percent),
)},t=typeof s.textScale==="number"&&p[s.textScale]?s.textScale:${
  DEFAULT_SETTINGS.textScale
};d.style.fontSize=p[t]+"%";d.dataset.textScale=String(t);d.dataset.contrast=s.highContrast===true?"high":"normal";d.dataset.simple=s.simpleLayout===true?"true":"false"}catch(e){}})();`;

/* ---------------------------- penyimpanan eksternal --------------------------- */

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: AccessibilitySettings = DEFAULT_SETTINGS;
let loaded = false;

function load(): AccessibilitySettings {
  try {
    const raw = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    return raw ? sanitizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persist(settings: AccessibilitySettings): void {
  try {
    window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // penyimpanan diblokir (mode privat): pengaturan tetap berlaku selama halaman terbuka
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export const accessibilityStore = {
  getSnapshot(): AccessibilitySettings {
    if (!loaded && typeof window !== "undefined") {
      snapshot = load();
      loaded = true;
    }
    return snapshot;
  },

  getServerSnapshot(): AccessibilitySettings {
    return DEFAULT_SETTINGS;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    applySettings(accessibilityStore.getSnapshot());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== ACCESSIBILITY_STORAGE_KEY) return;
      snapshot = load();
      applySettings(snapshot);
      notify();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  update(
    updater: (current: AccessibilitySettings) => Partial<AccessibilitySettings>,
  ): void {
    const current = accessibilityStore.getSnapshot();
    snapshot = sanitizeSettings({ ...current, ...updater(current) });
    persist(snapshot);
    applySettings(snapshot);
    notify();
  },
};

/* ------------------------------------ aksi ------------------------------------ */

export const accessibilityActions = {
  increaseText: () =>
    accessibilityStore.update((s) => ({ textScale: clampLevel(s.textScale + 1) })),
  decreaseText: () =>
    accessibilityStore.update((s) => ({ textScale: clampLevel(s.textScale - 1) })),
  resetText: () =>
    accessibilityStore.update(() => ({ textScale: DEFAULT_SETTINGS.textScale })),
  toggleContrast: () =>
    accessibilityStore.update((s) => ({ highContrast: !s.highContrast })),
  toggleSimple: () =>
    accessibilityStore.update((s) => ({ simpleLayout: !s.simpleLayout })),
  resetAll: () => accessibilityStore.update(() => DEFAULT_SETTINGS),
};
