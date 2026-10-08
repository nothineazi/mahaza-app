import type { Metadata } from "next";
import { SiteHeader } from "@/ui/site/site-header";
import { SiteFooter } from "@/ui/site/site-footer";
import { BookingWizard } from "@/ui/booking/wizard";

export const metadata: Metadata = { title: "Réserver" };

export default function ReserverPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="min-h-[70dvh]">
        <BookingWizard />
      </main>
      <SiteFooter />
    </>
  );
}
