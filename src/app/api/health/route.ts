// Sonde de santé (conteneur / reverse proxy) : aucune donnée, aucun secret, aucun accès externe.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
