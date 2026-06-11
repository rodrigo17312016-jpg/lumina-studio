/* ============================================================
   LUMINA STUDIO — templates.js
   5 plantillas premium para slides 1080×1350 / 1080×1080.
   Cada plantilla devuelve el HTML interno del slide; el CSS
   vive en styles.css bajo .tpl-<id>.
   ============================================================ */

(function () {
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // Solo aceptamos imágenes locales (dataURL/blob); cualquier otra cosa se descarta.
  const safeSrc = (u) =>
    typeof u === "string" && (/^data:image\//i.test(u) || /^blob:/i.test(u)) ? u : "";

  window.escHTML = esc;
  window.safeSrc = safeSrc;

  // Bloques comunes ------------------------------------------------
  const kicker = (s, i) =>
    `<div class="s-kicker" contenteditable="true" data-f="kicker" data-i="${i}">${esc(s.kicker || "")}</div>`;

  const title = (s, i) =>
    `<h2 class="s-title" contenteditable="true" data-f="title" data-i="${i}">${esc(s.title || "")}</h2>`;

  const body = (s, i) =>
    s.role === "cover" && !s.body
      ? ""
      : `<p class="s-body" contenteditable="true" data-f="body" data-i="${i}">${esc(s.body || "")}</p>`;

  const media = (s) => {
    const u = safeSrc(s.img);
    return u ? `<div class="s-media"><img src="${u}" alt="" /></div>` : "";
  };

  const ctaPill = (s, ctx) =>
    s.role === "cta"
      ? `<div class="s-pill">${esc(ctx.brand.handle ? "@" + ctx.brand.handle.replace(/^@/, "") : "Sígueme")}</div>`
      : "";

  const stack = (s, i, ctx) =>
    `<div class="s-inner">${media(s)}${kicker(s, i)}${title(s, i)}${body(s, i)}${ctaPill(s, ctx)}</div>`;

  // Plantillas ------------------------------------------------------
  window.TEMPLATES = {
    softluxe: {
      label: "Soft Luxe",
      blurb: "Femenino · perla y oro",
      swatch: "linear-gradient(135deg,#FBF7F4,#F6C9D4 60%,#C6A368)",
      render: (s, i, ctx) => `<span class="lux-frame"></span><span class="lux-blob"></span>${stack(s, i, ctx)}`,
    },

    noir: {
      label: "Editorial Noir",
      blurb: "Revista · negro y serif",
      swatch: "linear-gradient(135deg,#0E0C10,#3A2E38 70%,#E8A0B4)",
      render: (s, i, ctx) =>
        `<span class="noir-num">${String(i + 1).padStart(2, "0")}</span>${stack(s, i, ctx)}`,
    },

    pop: {
      label: "Bold Pop",
      blurb: "Viral · color y contraste",
      swatch: "linear-gradient(135deg,#FF6B9C,#FF9A6B)",
      render: (s, i, ctx) => `<span class="pop-shape a"></span><span class="pop-shape b"></span>${stack(s, i, ctx)}`,
    },

    minimal: {
      label: "Clean Minimal",
      blurb: "Aire · tipografía pura",
      swatch: "linear-gradient(135deg,#FFFFFF,#EDEDED)",
      render: (s, i, ctx) => `<span class="min-rule"></span>${stack(s, i, ctx)}`,
    },

    foto: {
      label: "Foto Statement",
      blurb: "Imagen full + texto",
      swatch: "linear-gradient(135deg,#5B4450,#1D141B)",
      render: (s, i, ctx) => {
        const u = safeSrc(s.img);
        const ph = u
          ? `<div class="s-photo"><img src="${u}" alt="" /></div>`
          : `<div class="s-photo s-photo--empty"></div>`;
        return `${ph}<span class="foto-veil"></span>${stack(s, i, ctx)}`;
      },
    },
  };
})();
