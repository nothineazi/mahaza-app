import { describe, expect, it } from "vitest";
import { cn } from "@/core/lib/utils";

describe("cn (tailwind-merge étendu à l'échelle kv)", () => {
  it("garde une taille kv ET une couleur de texte", () => {
    expect(cn("text-kv-body", "text-muted-foreground")).toBe("text-kv-body text-muted-foreground");
    expect(cn("text-muted-foreground", "text-kv-meta")).toBe("text-muted-foreground text-kv-meta");
  });

  it("une taille kv remplace une autre taille (kv ou Tailwind), la dernière l'emporte", () => {
    expect(cn("text-kv-body", "text-kv-meta")).toBe("text-kv-meta");
    expect(cn("text-sm", "text-kv-label")).toBe("text-kv-label");
    expect(cn("text-kv-section", "text-xs")).toBe("text-xs");
  });

  it("fusionne les conflits ordinaires (rayon, hauteur responsive)", () => {
    expect(cn("rounded-full", "rounded-md")).toBe("rounded-md");
    expect(cn("h-11 md:h-8", "md:h-9")).toBe("h-11 md:h-9");
  });
});
