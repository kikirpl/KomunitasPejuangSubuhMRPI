import "server-only";
import { redirect } from "next/navigation";
import type { CommandDeps } from "@/lib/admin/commands";
import { blobPublicHost } from "@/lib/photo/host";
import { getStore } from "@/lib/store/index";
import { todayKey } from "@/lib/time";

/** Bahan perintah panel untuk sebuah Server Action; tanpa database kembali ke beranda yang menjelaskannya. */
export function commandDeps(): CommandDeps {
  const store = getStore();
  if (!store) redirect("/admin");
  return { store, blobHost: blobPublicHost(), todayKey: todayKey() };
}
