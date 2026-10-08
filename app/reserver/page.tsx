import type { Metadata } from "next";
import { MahazaHeader } from "@/components/mahaza/site-header";
import { MahazaFooter } from "@/components/mahaza/site-footer";
import { MahazaBookingWizard } from "@/components/mahaza/booking/wizard";

export const metadata: Metadata = { title: "Réserver" };

export default function ReserverPage() {
  return (
    <>
      <MahazaHeader />
      <main id="contenu" className="min-h-[70dvh]">
        <MahazaBookingWizard />
      </main>
      <MahazaFooter />
    </>
  );
}
