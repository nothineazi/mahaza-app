import type { Metadata } from "next";
import { Clients } from "@/ui/admin/clients";

export const metadata: Metadata = { title: "Clients" };

export default function AdminClientsPage() {
  return <Clients />;
}
