/* Pages Function: GET /api/accounts
   Lista las redes conectadas del usuario en Late/Zernio (para los checkboxes).
   Mismo dominio que la app → sin CORS. */
const LATE = "https://getlate.dev/api/v1";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = env.LATE_API_KEY || url.searchParams.get("key") || "";
  if (!key) return Response.json({ demo: true, accounts: [] });
  try {
    const r = await fetch(`${LATE}/accounts`, { headers: { Authorization: `Bearer ${key}` } });
    const data = await r.json().catch(() => ({}));
    return Response.json(data, { status: r.status });
  } catch (e) {
    return Response.json({ error: "No se pudo contactar a Late: " + e.message }, { status: 502 });
  }
}
