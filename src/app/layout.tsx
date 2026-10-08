import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { brand } from "@/brand/brand.config";
import { parseAppEnv } from "@/core/lib/runtime";
import { fontVariables } from "@/brand/theme/fonts";
import { EnvBanner } from "@/ui/env-banner";
import { RuntimeProvider } from "@/ui/runtime-provider";
import { ThemeProvider } from "@/ui/theme-provider";
import "@/brand/theme/tokens.css";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brand.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: brand.themeColor.dark },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // APP_ENV est lu à chaque requête : la même image sert le staging et la production.
  await connection();
  const appEnv = parseAppEnv(process.env.APP_ENV);

  return (
    <html lang="fr" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider>
          <RuntimeProvider appEnv={appEnv}>
            <EnvBanner appEnv={appEnv} />
            {children}
          </RuntimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
