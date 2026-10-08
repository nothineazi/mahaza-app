import Link from "next/link";
import { brand } from "@/brand/brand.config";
import { sites } from "@/core/sites/sites";

const hhmm = (t: string) => t.replace(":", "h");

/** Pied de page premium (fond charcoal, texte crème, liens or). */
export function SiteFooter() {
  return (
    <footer id="contact" className="bg-inverse text-inverse-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="font-heading text-3xl font-medium">{brand.name}</p>
            <p className="max-w-xs text-sm leading-relaxed text-inverse-foreground/80">{brand.description}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Nos sites</h2>
            <ul className="mt-4 space-y-1.5 text-sm">
              {sites.map((s) => (
                <li key={s.id}>
                  {s.name} <span className="text-xs text-inverse-foreground/70">· {s.address}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Horaires</h2>
            <ul className="mt-4 space-y-1.5 text-sm">
              {brand.schedule?.map((r) => (
                <li key={r.label}>
                  {r.label} : {hhmm(r.open)} – {hhmm(r.close)}
                </li>
              ))}
            </ul>
            {brand.hoursToConfirm && <p className="mt-2 text-xs italic text-inverse-foreground/70">Horaires à confirmer par site.</p>}
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Contact</h2>
            {brand.contactEmail && (
              <p className="mt-4 text-sm">
                <a href={`mailto:${brand.contactEmail}`} className="text-accent underline underline-offset-4 hover:text-inverse-foreground">
                  {brand.contactEmail}
                </a>
              </p>
            )}
            {brand.socials && (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm" aria-label="Réseaux sociaux">
                {brand.socials.map((s) => (
                  <li key={s.network}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:text-inverse-foreground">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-inverse-foreground/20 pt-6 text-xs text-inverse-foreground/75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Marque fictive de démonstration. Aucune réservation n&apos;est réellement enregistrée et aucun paiement n&apos;est effectué. Les données marquées FICTIF sont inventées.
          </p>
          <Link href="/admin" className="shrink-0 text-accent underline underline-offset-4 hover:text-inverse-foreground">
            Accès back-office (démo)
          </Link>
        </div>
      </div>
    </footer>
  );
}
