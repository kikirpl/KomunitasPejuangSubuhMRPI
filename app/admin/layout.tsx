import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AccessibilityBar } from "@/components/AccessibilityBar";
import { getAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: { default: "Panel Pengurus", template: "%s | Panel Pengurus" },
  robots: { index: false, follow: false },
};

/** Semua layar panel: bilah pengaturan tampilan (huruf besar, kontras tinggi) di atas kerangka panel. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdmin();
  return (
    <>
      <AccessibilityBar />
      <AdminShell admin={admin}>{children}</AdminShell>
    </>
  );
}
