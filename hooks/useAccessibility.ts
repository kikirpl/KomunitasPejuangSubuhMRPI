"use client";

import { useSyncExternalStore } from "react";
import { accessibilityActions, accessibilityStore } from "@/lib/accessibility";

/** State pengaturan tampilan + aksi untuk mengubahnya. */
export function useAccessibility() {
  const settings = useSyncExternalStore(
    accessibilityStore.subscribe,
    accessibilityStore.getSnapshot,
    accessibilityStore.getServerSnapshot,
  );
  return { settings, ...accessibilityActions };
}
