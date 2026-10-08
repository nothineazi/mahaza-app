import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN = /next\/font\/google|fonts\.googleapis|fonts\.gstatic|use\.typekit|fonts\.bunny/;

/** Le build ne contacte aucun service de polices : toutes les polices sont auto-hébergées (src/brand/fonts, licences OFL). */
describe("polices auto-hébergées", () => {
  it("aucun import de next/font/google ni lien vers un service de polices dans le code, les tests e2e et public/", () => {
    const hits: string[] = [];
    for (const dir of ["src", "e2e", "public"]) {
      for (const rel of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
        const file = join(dir, rel);
        if (!statSync(file).isFile() || /\.(woff2?|png|jpe?g|webp|avif|ico)$/.test(file)) continue;
        if (FORBIDDEN.test(readFileSync(file, "utf8"))) hits.push(file);
      }
    }
    expect(hits).toEqual([]);
  });

  it("chaque dossier de police versionne sa licence OFL", () => {
    for (const family of readdirSync("src/brand/fonts").filter((n) => statSync(join("src/brand/fonts", n)).isDirectory())) {
      expect(readFileSync(join("src/brand/fonts", family, "OFL.txt"), "utf8"), family).toContain("SIL OPEN FONT LICENSE Version 1.1");
    }
  });
});
