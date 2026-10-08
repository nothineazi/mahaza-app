import type { Metadata } from "next";
import { Clients } from "@/components/mahaza/admin/clients";

export const metadata: Metadata = { title: "Clients" };

export default function AdminClientsPage() {
  return <Clients />;
}
