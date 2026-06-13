/* ============================================================
   LUMINA — Cloudflare Pages (Advanced mode, _worker.js)
   Maneja /api/* (publicación multi-red vía Late/Zernio) y delega
   el resto a los archivos estáticos (env.ASSETS). Mismo dominio
   que la app → sin CORS. MODO PRUEBA si no hay API key.
   ============================================================ */

const LATE = "https://getlate.dev/api/v1";

const jsonResp = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

function dataUrlToBlob(d) {
  const [m, b] = String(d).split(",");
  const mime = (m.match(/data:(.*?);/) || [])[1] || "image/png";
  const bin = atob(b);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return new Blob([a], { type: mime });
}

async function handleAccounts(request, env) {
  const url = new URL(request.url);
  const key = env.LATE_API_KEY || url.searchParams.get("key") || "";
  if (!key) return jsonResp({ demo: true, accounts: [] });
  try {
    const r = await fetch(`${LATE}/accounts`, { headers: { Authorization: `Bearer ${key}` } });
    const data = await r.json().catch(() => ({}));
    return jsonResp(data, r.status);
  } catch (e) {
    return jsonResp({ error: "No se pudo contactar a Late: " + e.message }, 502);
  }
}

async function handlePublish(request, env) {
  let body;
  try { body = await request.json(); } catch { return jsonResp({ error: "JSON inválido" }, 400); }
  const key = env.LATE_API_KEY || body.key || "";
  const caption = body.caption || "";
  const platforms = Array.isArray(body.platforms) ? body.platforms : [];
  const images = Array.isArray(body.images) ? body.images : [];
  if (!platforms.length) return jsonResp({ error: "No seleccionaste ninguna red" }, 400);

  // MODO PRUEBA: sin key → simulamos el flujo completo
  if (!key) {
    return jsonResp({
      mode: "demo",
      published: platforms.map((p) => ({ platform: p.platform, status: "ok" })),
      message: "Modo prueba ✓ — el flujo funciona. Conecta tu API key de Late para publicar de verdad.",
    });
  }

  try {
    const mediaUrls = [];
    for (const img of images) {
      const fd = new FormData();
      fd.append("file", dataUrlToBlob(img), "slide.png");
      const mr = await fetch(`${LATE}/media`, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd });
      const mj = await mr.json().catch(() => ({}));
      const u = mj.url || mj.publicUrl || (mj.media && mj.media.url) || (mj.data && mj.data.url);
      if (!mr.ok || !u) return jsonResp({ error: "Fallo al subir imagen a Late", status: mr.status, detail: mj }, 502);
      mediaUrls.push(u);
    }
    const pr = await fetch(`${LATE}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: caption, publishNow: true, platforms, mediaUrls }),
    });
    const pj = await pr.json().catch(() => ({}));
    if (!pr.ok) return jsonResp({ mode: "live", error: "Late rechazó el post", status: pr.status, detail: pj }, 502);
    return jsonResp({ mode: "live", status: pr.status, result: pj });
  } catch (e) {
    return jsonResp({ error: "Error publicando: " + e.message }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/accounts" && request.method === "GET") return handleAccounts(request, env);
    if (url.pathname === "/api/publish" && request.method === "POST") return handlePublish(request, env);
    if (url.pathname.startsWith("/api/")) return jsonResp({ error: "Ruta no encontrada" }, 404);
    // Todo lo demás: archivos estáticos de la app
    return env.ASSETS.fetch(request);
  },
};
