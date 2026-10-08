import { MahazaHome } from "@/components/mahaza/home/mahaza-home";
import { MahazaHeader } from "@/components/mahaza/site-header";
import { MahazaFooter } from "@/components/mahaza/site-footer";

export default function HomePage() {
  return (
    <>
      <MahazaHeader />
      <MahazaHome />
      <MahazaFooter />
    </>
  );
}
