"use client";

import { useId } from "react";
import { Sparkles } from "lucide-react";
import { brand } from "@/brand/brand.config";
import { useAppStore } from "@/core/state/store";
import { belongsToSite } from "@/core/sites/sites";
import { cn } from "@/core/lib/utils";
import { FictiveBadge } from "@/ui/fictive-badge";
import { Card } from "@/ui/primitives/card";
import type { Draft } from "@/ui/booking/types";

/** Un choix par soin du panier : « sans préférence » (par défaut) ou un praticien qualifié du site. */
export function StepPractitioners({ draft, onChoose }: { draft: Draft; onChoose: (serviceId: string, practitionerId: string | null) => void }) {
  const { staff } = useAppStore();
  const uid = useId();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Laissez-nous attribuer la praticienne disponible, ou choisissez la personne de votre choix pour chaque soin.
      </p>
      {draft.cart.map((serviceId) => {
        const service = brand.services.find((s) => s.id === serviceId);
        const options = staff.filter((p) => p.active && belongsToSite(p, draft.siteId ?? "") && p.serviceIds.includes(serviceId));
        const value = draft.choice[serviceId] ?? null;
        const name = `${uid}-${serviceId}`;
        return (
          <Card key={serviceId} className="p-5">
            <fieldset>
              <legend className="font-heading text-2xl font-medium">{service?.name}</legend>
              {options.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Aucun praticien n&apos;est disponible pour ce soin dans ce site pour le moment. Retirez-le du panier ou choisissez un autre site.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Option name={name} checked={value === null} onSelect={() => onChoose(serviceId, null)} title="Sans préférence" hint="Recommandé : le plus de créneaux disponibles" icon={<Sparkles className="size-5" aria-hidden />} />
                  {options.map((p) => (
                    <Option
                      key={p.id}
                      name={name}
                      checked={value === p.id}
                      onSelect={() => onChoose(serviceId, p.id)}
                      title={p.name}
                      hint={p.role}
                      icon={<span className="font-heading text-lg">{p.name.charAt(0)}</span>}
                      badge={p.fictive ? <FictiveBadge /> : null}
                    />
                  ))}
                </div>
              )}
            </fieldset>
          </Card>
        );
      })}
    </div>
  );
}

function Option({ name, checked, onSelect, title, hint, icon, badge }: { name: string; checked: boolean; onSelect: () => void; title: string; hint: string; icon: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <label className={cn("flex min-h-[72px] cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-[border-color,box-shadow,background-color] duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring", checked ? "border-primary bg-secondary/50 shadow-soft" : "border-border bg-card hover:border-primary/60")}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full transition-colors", checked ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{icon}</span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 font-medium">
          {title}
          {badge}
        </span>
        <span className="block text-sm text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}
