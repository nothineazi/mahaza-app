"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { focusRing } from "@/ui/kv/control-classes";

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** 1 : toujours visible · 2 : masquée sous `lg` (1024 px) · 3 : masquée sous `md` (768 px). */
  priority?: 1 | 2 | 3;
  /** `right` ⇒ chiffres tabulaires. */
  align?: "left" | "right";
  sortable?: boolean;
  /** Largeur max (ex. `max-w-[220px]`) : le contenu est tronqué, avec `title` si c'est une chaîne. */
  maxWidth?: string;
};

export type SortState = { key: string | null; dir: "asc" | "desc" };

export type Selection = {
  selected: Set<string>;
  isSelectable: (key: string) => boolean;
  allSelected: boolean;
  onToggle: (key: string) => void;
  onToggleAll: () => void;
  label: string;
};

const PRIORITY: Record<1 | 2 | 3, string> = { 1: "", 2: "max-lg:hidden", 3: "max-md:hidden" };

/**
 * Tableau de données : lignes de 40 px, première colonne collée à gauche, colonnes masquées par priorité.
 * Sous 640 px : liste de cartes (`mobileCard`), jamais un tableau à défilement horizontal de page.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  label,
  onRowClick,
  sort,
  onSort,
  select,
  actions,
  rowAccent,
  mobileCard,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Nom accessible du tableau. */
  label: string;
  onRowClick?: (row: T) => void;
  sort?: SortState;
  onSort?: (key: string) => void;
  select?: Selection;
  actions?: (row: T) => React.ReactNode;
  /** Classe de bordure gauche (3 px) de la carte mobile et de la ligne, pour l'urgence. */
  rowAccent?: (row: T) => string | undefined;
  mobileCard: (row: T) => React.ReactNode;
  className?: string;
}) {
  const stickyFirst = "sticky left-0 z-10 bg-card";
  return (
    <div className={className}>
      <ul aria-label={label} className="space-y-2 sm:hidden">
        {rows.map((row) => {
          const key = rowKey(row);
          const accent = rowAccent?.(row);
          const body = <div className={cn("rounded-lg border bg-card p-3", accent && cn("border-l-[3px]", accent))}>{mobileCard(row)}</div>;
          return (
            <li key={key}>
              {onRowClick ? (
                <button type="button" onClick={() => onRowClick(row)} className={cn("block w-full rounded-lg text-left", focusRing)}>
                  {body}
                </button>
              ) : (
                body
              )}
              {actions && <div className="mt-1 flex justify-end">{actions(row)}</div>}
            </li>
          );
        })}
      </ul>

      <div role="region" aria-label={label} tabIndex={0} className={cn("hidden overflow-x-auto rounded-lg border bg-card sm:block", focusRing)}>
        <table className="w-full border-collapse text-kv-body">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr className="h-9 border-b">
              {select && (
                <th scope="col" className={cn("w-10 px-3 text-left", stickyFirst)}>
                  <input type="checkbox" aria-label={select.label} checked={select.allSelected} onChange={select.onToggleAll} className="size-4 accent-primary" />
                </th>
              )}
              {columns.map((c, i) => {
                const dir = sort?.key === c.id ? sort.dir : null;
                return (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={c.sortable ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined}
                  className={cn("px-3 text-kv-label uppercase text-muted-foreground", c.align === "right" ? "text-right" : "text-left", PRIORITY[c.priority ?? 1], i === 0 && !select && stickyFirst)}
                >
                  {c.sortable && onSort ? (
                    <button type="button" onClick={() => onSort(c.id)} className={cn("inline-flex items-center gap-1 rounded-sm uppercase", focusRing)}>
                      {c.header}
                      {dir === "asc" ? <ArrowUp className="size-3" aria-hidden /> : dir === "desc" ? <ArrowDown className="size-3" aria-hidden /> : <ChevronsUpDown className="size-3 opacity-60" aria-hidden />}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
                );
              })}
              {actions && (
                <th scope="col" className="px-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = rowKey(row);
              const accent = rowAccent?.(row);
              const activate = (e: React.KeyboardEvent) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onRowClick?.(row);
                }
              };
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? activate : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn("group h-10 border-b last:border-0 hover:bg-muted/50", onRowClick && cn("cursor-pointer", focusRing), accent && cn("border-l-[3px]", accent))}
                >
                  {select && (
                    <td className={cn("px-3 align-middle", stickyFirst, "group-hover:bg-muted")} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`${select.label} : ${key}`} disabled={!select.isSelectable(key)} checked={select.selected.has(key)} onChange={() => select.onToggle(key)} className="size-4 accent-primary" />
                    </td>
                  )}
                  {columns.map((c, i) => {
                    const content = c.cell(row);
                    return (
                      <td
                        key={c.id}
                        title={c.maxWidth && typeof content === "string" ? content : undefined}
                        className={cn("px-3 align-middle", c.align === "right" && "text-right tabular-nums", "whitespace-nowrap", c.maxWidth && cn("truncate", c.maxWidth), PRIORITY[c.priority ?? 1], i === 0 && !select && cn(stickyFirst, "group-hover:bg-muted"))}
                      >
                        {content}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-3 text-right align-middle" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
