import { Home } from "@/ui/home/home";
import { SiteHeader } from "@/ui/site/site-header";
import { SiteFooter } from "@/ui/site/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <Home />
      <SiteFooter />
    </>
  );
}
