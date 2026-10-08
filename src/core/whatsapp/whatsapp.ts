/**
 * Lien wa.me avec message pré-rempli. Sans destinataire (`recipientless`, ou numéro vide) : https://wa.me/?text=…
 * L'utilisateur choisit alors lui-même le contact dans WhatsApp.
 */
export function whatsappLink(number: string, message: string, recipientless = false): string {
  const digits = recipientless ? "" : number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
