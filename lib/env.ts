/**
 * Bentuk umum variabel lingkungan untuk fungsi yang menerima `env` sebagai argumen (supaya bisa diuji
 * dengan objek sebagian). `process.env` memenuhinya; `NodeJS.ProcessEnv` tidak dipakai karena
 * Next.js mewajibkan `NODE_ENV` di tipe itu.
 */
export type EnvLike = Readonly<Record<string, string | undefined>>;
