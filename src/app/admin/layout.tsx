import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/ui/admin/shell";

export const metadata: Metadata = { title: "Back-office" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
