/** Environnement d'exécution (variable `APP_ENV`, lue à l'exécution : une même image sert staging et production). */
export type AppEnv = "development" | "staging" | "production";

const APP_ENVS: readonly AppEnv[] = ["development", "staging", "production"];

/** Toute valeur absente ou inconnue retombe sur « development » : le cas le plus prudent (bandeau affiché, liens sans destinataire). */
export function parseAppEnv(value: string | undefined): AppEnv {
  return (APP_ENVS as readonly string[]).includes(value ?? "") ? (value as AppEnv) : "development";
}

/** Hors production, les liens WhatsApp n'ont pas de destinataire : un numéro fictif ne doit jamais recevoir de message. */
export const recipientlessLinks = (env: AppEnv): boolean => env !== "production";

/** Le bandeau « Version de développement – données fictives » est affiché tant que l'environnement n'est pas la production. */
export const showDevBanner = (env: AppEnv): boolean => env !== "production";
