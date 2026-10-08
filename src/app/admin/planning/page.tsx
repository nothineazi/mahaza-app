import type { Metadata } from "next";
import { Planning } from "@/ui/admin/planning";

export const metadata: Metadata = { title: "Planning" };

export default function AdminPlanningPage() {
  return <Planning />;
}
