import { showDevBanner, type AppEnv } from "@/core/lib/runtime";

/** Bandeau global, affiché tant que APP_ENV n'est pas « production ». Rendu côté serveur : aucun décalage de mise en page. */
export function EnvBanner({ appEnv }: { appEnv: AppEnv }) {
  if (!showDevBanner(appEnv)) return null;
  return (
    <div role="status" className="bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-foreground">
      Version de développement – données fictives
    </div>
  );
}
