import type { Metadata } from "next";
import { Planning } from "@/components/mahaza/admin/planning";

export const metadata: Metadata = { title: "Planning" };

export default function AdminPlanningPage() {
  return <Planning />;
}
