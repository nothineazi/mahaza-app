import { Cormorant_Garamond } from "next/font/google";
// Habillage (ombres, animations) : importé avec la police.
import "@/brand/theme/effects.css";

/** Police d'affichage (titres). Repli auto-ajusté par next/font : pas de décalage de mise en page. */
export const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
