export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Le vert WhatsApp d'origine (#1FA855) n'atteint pas 4,5:1 avec du texte blanc : on utilise le vert « success » du thème (palette AA). */
export const whatsappButtonClass = "bg-success hover:bg-success/90";
