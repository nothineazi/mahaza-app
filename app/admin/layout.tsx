import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MahazaAdminShell } from "@/components/mahaza/admin/shell";

export const metadata: Metadata = { title: "Back-office" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <MahazaAdminShell>{children}</MahazaAdminShell>;
}
