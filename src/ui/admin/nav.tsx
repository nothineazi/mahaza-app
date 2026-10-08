"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, DoorOpen, LayoutDashboard, ListChecks, UserRound, Users } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { focusRing } from "@/ui/kv/control-classes";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/planning", label: "Planning", icon: CalendarDays },
  { href: "/admin/reservations", label: "Réservations", icon: ListChecks },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/salles", label: "Salles", icon: DoorOpen },
  { href: "/admin/staff", label: "Staff", icon: UserRound },
];

/** Navigation du back-office (barre latérale et tiroir mobile) : éléments de 44 px sur mobile, 32 px sur bureau. */
export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation du back-office">
      <ul className="space-y-0.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-md px-2 text-kv-body transition-colors md:h-8",
                  focusRing,
                  active ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active && "text-primary")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
