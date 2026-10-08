"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/core/lib/utils";
import { focusRing } from "@/ui/kv/control-classes";

/**
 * Interrupteur avec son libellé : zone tactile de 44 px sur mobile, 32 px sur bureau. Piste éteinte contrastée (≥ 3:1).
 * Le libellé fait partie du contrôle (un clic dessus bascule l'interrupteur).
 */
export function LabeledSwitch({ id, label, checked, onCheckedChange, className }: { id: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void; className?: string }) {
  return (
    <label htmlFor={id} className={cn("flex h-11 cursor-pointer items-center gap-2 text-kv-body md:h-8", className)}>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-success data-[state=unchecked]:bg-muted-foreground/70",
          focusRing,
        )}
      >
        <SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
      </SwitchPrimitive.Root>
      {label}
    </label>
  );
}
