import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { theme } from "@/theme.config";
import { parseAppEnv } from "@/lib/runtime";
import { MahazaStoreProvider } from "@/lib/mahaza/store";
import { displayFont } from "@/lib/mahaza/fonts";
import { EnvBanner } from "@/components/env-banner";
import { RuntimeProvider } from "@/components/runtime-provider";
import "@/brand/theme/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${theme.name} — ${theme.tagline}`, template: `%s · ${theme.name}` },
  description: theme.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: theme.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: theme.themeColor.dark },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // APP_ENV est lu à chaque requête : la même image sert le staging et la production.
  await connection();
  const appEnv = parseAppEnv(process.env.APP_ENV);

  return (
    <html lang="fr" className={displayFont.variable}>
      <body className="min-h-dvh">
        <RuntimeProvider appEnv={appEnv}>
          <EnvBanner appEnv={appEnv} />
          <MahazaStoreProvider>{children}</MahazaStoreProvider>
        </RuntimeProvider>
      </body>
    </html>
  );
}
