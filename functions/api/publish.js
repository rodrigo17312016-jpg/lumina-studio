/* Pages Function: POST /api/publish
   Orquesta la publicación a varias redes a la vez vía Late/Zernio:
   1) sube cada imagen a Late /media → URL pública
   2) crea el post (publishNow) a las plataformas seleccionadas
   MODO PRUEBA: sin API key responde simulando éxito (para ver el flujo). */
const LATE = "https://getlate.dev/api/v1";

function dataUrlToBlob(d) {
  const [m, b] = String(d).split(",");
  const mime = (m.match(/data:(.*?);/) || [])[1] || "image/png";
  const bin = atob(b);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return new Blob([a], { type: mime });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON inválido" }, { status: 400 }); }

  const key = env.LATE_API_KEY || body.key || "";
  const caption = body.caption || "";
  const platforms = Array.isArray(body.platforms) ? body.platforms : [];
  const images = Array.isArray(body.images) ? body.images : [];
  if (!platforms.length) return Response.json({ error: "No seleccionaste ninguna red" }, { status: 400 });

  // MODO PRUEBA: sin key → simulamos el flujo completo
  if (!key) {
    return Response.json({
      mode: "demo",
      published: platforms.map((p) => ({ platform: p.platform, status: "ok" })),
      message: "Modo prueba ✓ — el flujo funciona. Conecta tu API key de Late para publicar de verdad.",
    });
  }

  try {
    // 1) Subir imágenes a Late /media
    const mediaUrls = [];
    for (const img of images) {
      const fd = new FormData();
      fd.append("file", dataUrlToBlob(img), "slide.png");
      const mr = await fetch(`${LATE}/media`, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd });
      const mj = await mr.json().catch(() => ({}));
      const u = mj.url || mj.publicUrl || (mj.media && mj.media.url) || (mj.data && mj.data.url);
      if (!mr.ok || !u) return Response.json({ error: "Fallo al subir imagen a Late", status: mr.status, detail: mj }, { status: 502 });
      mediaUrls.push(u);
    }
    // 2) Crear y publicar el post
    const pr = await fetch(`${LATE}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: caption, publishNow: true, platforms, mediaUrls }),
    });
    const pj = await pr.json().catch(() => ({}));
    if (!pr.ok) return Response.json({ mode: "live", error: "Late rechazó el post", status: pr.status, detail: pj }, { status: 502 });
    return Response.json({ mode: "live", status: pr.status, result: pj });
  } catch (e) {
    return Response.json({ error: "Error publicando: " + e.message }, { status: 502 });
  }
}
