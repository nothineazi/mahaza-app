# syntax=docker/dockerfile:1

# Image de la souche : sert uniquement à vérifier en CI que le build et le démarrage fonctionnent (la souche n'est jamais déployée).
# Les dépôts clients dérivés construisent la même image et la publient sur GHCR.

# --- 1. Dépendances ----------------------------------------------------------
FROM node:24-alpine AS deps
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci

# --- 2. Build ----------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- 3. Exécution ------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

# APP_ENV (development | staging | production) est lu à l'exécution : ne pas le figer dans l'image.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server.js"]
