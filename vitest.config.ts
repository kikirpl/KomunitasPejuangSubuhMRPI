import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Akar proyek dengan garis miring di akhir, supaya "@/lib/x" menjadi "<akar>/lib/x". */
const akar = fileURLToPath(new URL("./", import.meta.url)).replace(/\\/g, "/");

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: akar },
      // Paket "server-only" melempar galat di luar bundel Next.js; di tes dipakai berkas kosong.
      { find: "server-only", replacement: `${akar}tests/helpers/empty.ts` },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
