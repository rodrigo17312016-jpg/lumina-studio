/* ============================================================
   LUMINA STUDIO — app.js
   Estado · render · IA · export PNG/ZIP · grabación de Reel.
   Todo corre en el navegador: cero servidores, cero costos.
   ============================================================ */

"use strict";

/* ---------------- helpers ---------------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

let toastTimer;
function toast(msg, ms = 2600) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function download(href, name) {
  const a = document.createElement("a");
  a.href = href; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------------- estado ---------------- */
const DEFAULTS = () => ({
  brand: {
    name: "Mi Marca", handle: "mimarca", logo: null,
    c1: "#dd8aa0", c2: "#c6a368",
    showLogo: true, showHandle: true, showNum: true, showArrow: true,
  },
  template: "softluxe",
  format: "45",
  fontScale: 1,
  slides: [],
  caption: "",
});

let state = DEFAULTS();
let current = 0;

// Valida y normaliza un proyecto externo (localStorage o .json importado).
// Lanza si no tiene forma de proyecto — nunca dejes entrar datos corruptos al estado.
function sanitizeProject(p) {
  if (!p || typeof p !== "object" || !Array.isArray(p.slides)) throw new Error("No es un proyecto válido");
  const out = DEFAULTS();
  if (p.brand && typeof p.brand === "object") {
    for (const k of ["name", "handle"]) if (typeof p.brand[k] === "string") out.brand[k] = p.brand[k];
    for (const k of ["c1", "c2"]) if (/^#[0-9a-f]{6}$/i.test(p.brand[k] || "")) out.brand[k] = p.brand[k];
    for (const k of ["showLogo", "showHandle", "showNum", "showArrow"]) if (typeof p.brand[k] === "boolean") out.brand[k] = p.brand[k];
    out.brand.logo = safeSrc(p.brand.logo) || null;
  }
  out.template = TEMPLATES[p.template] ? p.template : out.template;
  out.format = p.format === "11" ? "11" : "45";
  out.fontScale = Math.min(1.3, Math.max(0.8, +p.fontScale || 1));
  out.caption = typeof p.caption === "string" ? p.caption : "";
  out.slides = p.slides
    .filter((s) => s && typeof s === "object")
    .map((s) => ({
      role: ["cover", "content", "cta"].includes(s.role) ? s.role : "content",
      kicker: String(s.kicker ?? ""), title: String(s.title ?? ""), body: String(s.body ?? ""),
      img: safeSrc(s.img) || null,
    }));
  if (!out.slides.length) throw new Error("El proyecto no tiene slides");
  return out;
}

function loadInitial() {
  try {
    const saved = localStorage.getItem("lumina_project");
    if (saved) { state = sanitizeProject(JSON.parse(saved)); return; }
  } catch (e) {
    try { localStorage.removeItem("lumina_project"); } catch (e2) {}
  }
  const demo = (window.LUMINA_CONTENT?.demoCarousels || [])[0];
  if (demo) {
    state.brand.name = demo.brand.name;
    state.brand.handle = demo.brand.handle;
    state.slides = demo.slides.map((s) => ({ ...s }));
    state.caption = demo.caption || "";
  } else {
    state.slides = [
      { role: "cover", kicker: "MI MARCA", title: "Tu primer carrusel premium", body: "" },
      { role: "content", kicker: "Paso 01", title: "Edita este texto", body: "Haz clic en cualquier texto del slide o usa el panel de la izquierda." },
      { role: "cta", kicker: "¿Te gustó?", title: "Sígueme para más", body: "Guarda este post ✨" },
    ];
  }
}

const persist = debounce(() => {
  try { localStorage.setItem("lumina_project", JSON.stringify(state)); } catch (e) {}
}, 400);

// Flush síncrono al cerrar/ocultar la pestaña: sin esto, las ediciones de los
// últimos 400 ms (la frase que acabas de escribir) se perderían.
window.addEventListener("pagehide", () => {
  try { localStorage.setItem("lumina_project", JSON.stringify(state)); } catch (e) {}
});

/* ---------------- render: slide ---------------- */
function slideNode(i, interactive) {
  const s = state.slides[i];
  const tpl = TEMPLATES[state.template] || TEMPLATES.softluxe;
  const div = document.createElement("div");
  div.className = `slide tpl-${state.template} f${state.format} role-${s.role || "content"}`;
  div.style.setProperty("--c1", state.brand.c1);
  div.style.setProperty("--c2", state.brand.c2);
  div.style.setProperty("--fs", state.fontScale);

  let html = tpl.render(s, i, { brand: state.brand });

  const total = state.slides.length;
  const logoSrc = safeSrc(state.brand.logo);
  if (state.brand.showLogo && logoSrc) html += `<img class="s-logo" src="${logoSrc}" alt="" />`;
  if (state.brand.showHandle && state.brand.handle) html += `<div class="s-handle">@${escHTML(state.brand.handle.replace(/^@/, ""))}</div>`;
  if (state.brand.showNum) html += `<div class="s-num">${i + 1} / ${total}</div>`;
  if (state.brand.showArrow && i < total - 1) html += `<div class="s-arrow">→</div>`;

  div.innerHTML = html;

  if (!interactive) {
    $$("[contenteditable]", div).forEach((el) => el.removeAttribute("contenteditable"));
  } else {
    $$("[contenteditable]", div).forEach((el) => {
      el.dataset.ph = el.dataset.f === "title" ? "Escribe un título…" : "";
      el.addEventListener("input", () => {
        const f = el.dataset.f, idx = +el.dataset.i;
        // innerText (no textContent): preserva los saltos de línea del contenteditable
        const val = el.innerText.replace(/\n+$/, "");
        state.slides[idx][f] = val;
        syncPanelField(idx, f, val);
        persist();
      });
      el.addEventListener("blur", () => renderThumbs());
      // Evitar saltos de línea con Enter en títulos/kickers
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" && el.dataset.f !== "body") e.preventDefault(); });
    });
  }
  return div;
}

function slideH() { return state.format === "11" ? 1080 : 1350; }

function fitZoom() {
  const view = $("#stageView");
  const wrap = $("#zoomWrap");
  const slide = wrap.firstElementChild;
  if (!slide) return;
  const availW = view.clientWidth - 140;
  const availH = view.clientHeight - 40;
  const z = Math.min(availW / 1080, availH / slideH(), 0.9);
  slide.style.transform = `scale(${z})`;
  wrap.style.width = 1080 * z + "px";
  wrap.style.height = slideH() * z + "px";
}

function renderStage() {
  current = Math.max(0, Math.min(current, state.slides.length - 1));
  const wrap = $("#zoomWrap");
  wrap.innerHTML = "";
  if (!state.slides.length) return;
  wrap.appendChild(slideNode(current, true));
  fitZoom();
}

function renderThumbs() {
  const host = $("#thumbs");
  host.innerHTML = "";
  const z = 86 / 1080;
  state.slides.forEach((s, i) => {
    const th = document.createElement("button");
    th.className = "thumb" + (i === current ? " on" : "");
    th.style.height = slideH() * z + "px";
    th.title = `Slide ${i + 1}`;
    const inner = slideNode(i, false);
    inner.style.transform = `scale(${z})`;
    inner.style.transformOrigin = "top left";
    inner.style.pointerEvents = "none";
    th.appendChild(inner);
    th.addEventListener("click", () => { current = i; renderStage(); renderThumbs(); markActiveCard(); });
    host.appendChild(th);
  });
}

/* ---------------- render: panel ---------------- */
function renderPanel() {
  const host = $("#slideCards");
  host.innerHTML = "";
  state.slides.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "scard" + (i === current ? " on" : "");
    card.dataset.i = i;
    card.innerHTML = `
      <div class="scard__head">
        <span class="scard__n">${i + 1}</span>
        <select class="scard__role" data-f="role">
          <option value="cover"${s.role === "cover" ? " selected" : ""}>Portada</option>
          <option value="content"${s.role === "content" ? " selected" : ""}>Contenido</option>
          <option value="cta"${s.role === "cta" ? " selected" : ""}>CTA</option>
        </select>
        <div class="scard__tools">
          <button class="ibtn" data-act="up" title="Subir">↑</button>
          <button class="ibtn" data-act="down" title="Bajar">↓</button>
          <button class="ibtn ibtn--del" data-act="del" title="Eliminar">✕</button>
        </div>
      </div>
      <input type="text" data-f="kicker" placeholder="Kicker (ej. Secreto 01)" value="${escHTML(s.kicker || "")}" />
      <input type="text" data-f="title" placeholder="Título" value="${escHTML(s.title || "")}" />
      <textarea data-f="body" placeholder="Texto de apoyo">${escHTML(s.body || "")}</textarea>
      <div class="scard__img">
        ${safeSrc(s.img) ? `<img src="${safeSrc(s.img)}" alt="" /><button class="ibtn ibtn--del" data-act="rmimg" title="Quitar foto">✕</button>` : ""}
        <label class="filebtn">${s.img ? "Cambiar" : "Añadir"} foto<input type="file" data-act="img" accept="image/*" /></label>
      </div>`;
    host.appendChild(card);
  });
}

function markActiveCard() {
  $$(".scard").forEach((c) => c.classList.toggle("on", +c.dataset.i === current));
}

function syncPanelField(idx, f, val) {
  const card = $(`.scard[data-i="${idx}"]`);
  if (!card) return;
  const el = card.querySelector(`[data-f="${f}"]`);
  if (el && el.value !== val) el.value = val;
}

function renderTplGrid() {
  const host = $("#tplGrid");
  host.innerHTML = "";
  Object.entries(TEMPLATES).forEach(([id, t]) => {
    const b = document.createElement("button");
    b.className = "tplcard" + (id === state.template ? " on" : "");
    b.innerHTML = `<div class="tplcard__sw" style="background:${t.swatch}"></div>
      <div class="tplcard__tx"><b>${t.label}</b><span>${t.blurb}</span></div>`;
    b.addEventListener("click", () => { state.template = id; persist(); renderAll(); });
    host.appendChild(b);
  });
}

function renderBrandInputs() {
  $("#bName").value = state.brand.name || "";
  $("#bHandle").value = state.brand.handle || "";
  $("#bC1").value = state.brand.c1;
  $("#bC2").value = state.brand.c2;
  $("#bShowLogo").checked = state.brand.showLogo;
  $("#bShowHandle").checked = state.brand.showHandle;
  $("#bShowNum").checked = state.brand.showNum;
  $("#bShowArrow").checked = state.brand.showArrow;
  $("#fmt").value = state.format;
  $("#fontScale").value = state.fontScale;
  $("#fsVal").textContent = "×" + Number(state.fontScale).toFixed(2).replace(/0$/, "");
}

function renderAll() {
  renderStage();
  renderThumbs();
  renderPanel();
  renderTplGrid();
  renderBrandInputs();
}

/* ---------------- eventos: panel ---------------- */
const softRefresh = debounce(() => { renderStage(); renderThumbs(); }, 220);

$("#slideCards").addEventListener("input", (e) => {
  const card = e.target.closest(".scard"); if (!card) return;
  const i = +card.dataset.i, f = e.target.dataset.f;
  if (!f) return;
  if (i !== current) { current = i; renderStage(); markActiveCard(); }
  state.slides[i][f] = e.target.value;
  persist(); softRefresh();
});

$("#slideCards").addEventListener("change", async (e) => {
  const card = e.target.closest(".scard"); if (!card) return;
  const i = +card.dataset.i;
  if (e.target.dataset.act === "img" && e.target.files[0]) {
    state.slides[i].img = await fileToDataURL(e.target.files[0]);
    persist(); renderAll();
  }
});

$("#slideCards").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]"); if (!btn) return;
  const card = e.target.closest(".scard"); if (!card) return;
  const i = +card.dataset.i;
  const act = btn.dataset.act;
  if (act === "del") {
    if (state.slides.length <= 1) return toast("Necesitas al menos 1 slide");
    state.slides.splice(i, 1); current = Math.min(current, state.slides.length - 1);
  } else if (act === "up" && i > 0) {
    [state.slides[i - 1], state.slides[i]] = [state.slides[i], state.slides[i - 1]]; current = i - 1;
  } else if (act === "down" && i < state.slides.length - 1) {
    [state.slides[i + 1], state.slides[i]] = [state.slides[i], state.slides[i + 1]]; current = i + 1;
  } else if (act === "rmimg") {
    state.slides[i].img = null;
  } else { return; }
  persist(); renderAll();
});

$("#btnAddSlide").addEventListener("click", () => {
  state.slides.splice(current + 1, 0, { role: "content", kicker: "", title: "Nuevo slide", body: "" });
  current += 1;
  persist(); renderAll();
});

/* marca */
const brandBind = [
  ["#bName", "name", "value"], ["#bHandle", "handle", "value"],
  ["#bC1", "c1", "value"], ["#bC2", "c2", "value"],
  ["#bShowLogo", "showLogo", "checked"], ["#bShowHandle", "showHandle", "checked"],
  ["#bShowNum", "showNum", "checked"], ["#bShowArrow", "showArrow", "checked"],
];
brandBind.forEach(([sel, key, prop]) => {
  $(sel).addEventListener("input", (e) => { state.brand[key] = e.target[prop]; persist(); softRefresh(); });
});
$("#bLogo").addEventListener("change", async (e) => {
  if (e.target.files[0]) { state.brand.logo = await fileToDataURL(e.target.files[0]); persist(); renderAll(); toast("Logo cargado ✓"); }
});
$("#fmt").addEventListener("change", (e) => { state.format = e.target.value; persist(); renderAll(); });
$("#fontScale").addEventListener("input", (e) => {
  state.fontScale = +e.target.value;
  $("#fsVal").textContent = "×" + Number(state.fontScale).toFixed(2);
  persist(); softRefresh();
});

/* tabs */
$$(".tab").forEach((t) => t.addEventListener("click", () => {
  $$(".tab").forEach((x) => x.classList.remove("on"));
  $$(".tabpane").forEach((x) => x.classList.remove("on"));
  t.classList.add("on");
  $("#pane-" + t.dataset.tab).classList.add("on");
}));

/* navegación */
function go(dir) {
  current = (current + dir + state.slides.length) % state.slides.length;
  renderStage(); renderThumbs(); markActiveCard();
}
$("#navPrev").addEventListener("click", () => go(-1));
$("#navNext").addEventListener("click", () => go(1));
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input,textarea,[contenteditable]")) return;
  if (e.key === "ArrowLeft") go(-1);
  if (e.key === "ArrowRight") go(1);
});
window.addEventListener("resize", debounce(fitZoom, 120));

/* modals */
$$("[data-close]").forEach((b) => b.addEventListener("click", () => b.closest(".modal").classList.remove("open")));
$$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) m.classList.remove("open"); }));

/* ---------------- export PNG / ZIP ---------------- */
// Caché de @font-face POR PLANTILLA: html-to-image solo embebe las fuentes que
// usa el nodo capturado, y cada plantilla usa familias distintas.
const fontCSSCache = {};

async function snap(i) {
  await document.fonts.ready;
  const node = slideNode(i, false);
  const hold = document.createElement("div");
  hold.style.cssText = "position:fixed;left:-12000px;top:0;z-index:-1;";
  hold.appendChild(node);
  document.body.appendChild(hold);
  try {
    const key = state.template;
    if (!(key in fontCSSCache)) {
      fontCSSCache[key] = await htmlToImage.getFontEmbedCSS(node);
      if (!fontCSSCache[key]) {
        // Sin crossorigin en el <link> de Google Fonts esto saldría vacío y los PNG
        // exportarían con tipografía de sistema. Avisamos en vez de fallar en silencio.
        console.warn("No se pudieron embeber las fuentes; el export puede salir con otra tipografía.");
        toast("⚠ Aviso: no se pudieron embeber las fuentes en el export", 3500);
      }
    }
    return await htmlToImage.toPng(node, {
      width: 1080, height: slideH(), pixelRatio: 1, fontEmbedCSS: fontCSSCache[key] || undefined,
    });
  } finally { hold.remove(); }
}

async function snapAll(onStep) {
  const out = [];
  for (let i = 0; i < state.slides.length; i++) {
    out.push(await snap(i));
    onStep && onStep(i + 1, state.slides.length);
  }
  return out;
}

function dataURLtoBlob(u) {
  const bin = atob(u.split(",")[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: "image/png" });
}

$("#btnPngs").addEventListener("click", async () => {
  try {
    toast("Generando imágenes… si el navegador pregunta, permite las descargas múltiples", 9000);
    const urls = await snapAll();
    const objUrls = [];
    for (let i = 0; i < urls.length; i++) {
      const ou = URL.createObjectURL(dataURLtoBlob(urls[i]));
      objUrls.push(ou);
      download(ou, `slide-${String(i + 1).padStart(2, "0")}.png`);
      await new Promise((r) => setTimeout(r, 350));
    }
    setTimeout(() => objUrls.forEach((u) => URL.revokeObjectURL(u)), 10000);
    toast(`✓ ${urls.length} PNG generados (1080×${slideH()}). ¿Falta alguno? Usa el botón ZIP`, 5000);
  } catch (e) { console.error(e); toast("Error al exportar: " + e.message, 4000); }
});

$("#btnZip").addEventListener("click", async () => {
  try {
    toast("Preparando ZIP…", 9000);
    const urls = await snapAll();
    const zip = new JSZip();
    urls.forEach((u, i) => zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, u.split(",")[1], { base64: true }));
    if (state.caption) zip.file("caption.txt", state.caption);
    const blob = await zip.generateAsync({ type: "blob" });
    download(URL.createObjectURL(blob), "lumina-carrusel.zip");
    toast("✓ ZIP descargado");
  } catch (e) { console.error(e); toast("Error al exportar: " + e.message, 4000); }
});

/* ---------------- guardar / abrir proyecto ---------------- */
$("#btnSave").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  download(URL.createObjectURL(blob), "proyecto-lumina.json");
  toast("✓ Proyecto guardado (.json)");
});
$("#loadFile").addEventListener("change", async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const next = sanitizeProject(JSON.parse(await f.text()));
    state = next; current = 0;
    renderAll(); persist();
    toast("✓ Proyecto cargado");
  } catch { toast("Archivo no válido: no parece un proyecto de Lumina", 3500); }
  e.target.value = "";
});

/* ---------------- IA ---------------- */
$("#btnAI").addEventListener("click", () => $("#mAI").classList.add("open"));
$("#btnReel").addEventListener("click", () => $("#mReel").classList.add("open"));

const keys = (() => { try { return JSON.parse(localStorage.getItem("lumina_keys") || "{}"); } catch { return {}; } })();

$("#aiProv").addEventListener("change", () => {
  const p = $("#aiProv").value;
  $("#aiKeyRow").style.display = p === "demo" ? "none" : "";
  $("#aiKey").value = keys[p] || "";
  $("#aiHint").innerHTML = p === "gemini"
    ? 'Key gratis en <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>. Se guarda solo en tu navegador.'
    : p === "claude"
      ? 'Key en <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a>. Se guarda solo en tu navegador.'
      : "El modo demo usa fórmulas profesionales sin conexión.";
});

function extractJSON(text) {
  const cleaned = text.replace(/```json|```/g, "");
  const a = cleaned.indexOf("{"), b = cleaned.lastIndexOf("}");
  if (a === -1 || b === -1) throw new Error("La IA no devolvió JSON");
  return JSON.parse(cleaned.slice(a, b + 1));
}

function buildUserPrompt(tema, aud, tono, n) {
  return `Tema: ${tema}\nAudiencia: ${aud || "general hispanohablante"}\nTono: ${tono}\nNúmero de slides: ${n}\nMarca: ${state.brand.name} (@${state.brand.handle})`;
}

function friendlyGeminiError(status, detail) {
  const d = detail ? ` — ${detail}` : "";
  if (status === 200) return `Gemini no devolvió texto (posible bloqueo de contenido)${d}. Prueba otro tema o el modo Demo.`;
  if (status === 429) return `Gemini sin cuota gratis ahora mismo (429)${d}. Tu key SÍ funciona; el plan gratis está topado. Espera 1-2 min, revisa tu cuota en aistudio.google.com/rate-limit, o usa el modo Demo.`;
  if (status === 400) return `Petición inválida a Gemini (400)${d}.`;
  if (status === 401 || status === 403) return `Gemini rechazó la key (${status})${d}. Crea otra en aistudio.google.com/apikey y habilita la Generative Language API.`;
  if (status === 404) return `Modelo de Gemini no disponible (404)${d}.`;
  return `Error de Gemini (${status})${d}.`;
}

async function callGemini(key, sys, user) {
  // Cadena de modelos actuales (2026): si uno está sin cuota (429), probamos el siguiente.
  const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];
  let last = { status: 0, detail: "" };
  for (const model of models) {
    let res;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sys }] },
            contents: [{ parts: [{ text: user }] }],
            generationConfig: { temperature: 0.85, responseMimeType: "application/json" },
          }),
        }
      );
    } catch (netErr) {
      throw new Error("No se pudo conectar con Gemini (¿internet o bloqueo de red?). " + netErr.message);
    }
    if (res.ok) {
      const j = await res.json();
      const txt = j.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) return txt;
      const reason = j.promptFeedback?.blockReason || j.candidates?.[0]?.finishReason || "vacía";
      last = { status: 200, detail: "respuesta " + reason };
      continue; // probar siguiente modelo
    }
    let detail = "";
    try { const e = await res.json(); detail = e?.error?.message || ""; } catch (x) {}
    last = { status: res.status, detail };
    if (res.status !== 429) break; // solo el 429 vale la pena reintentar con otro modelo
  }
  throw new Error(friendlyGeminiError(last.status, last.detail));
}

async function callClaude(key, sys, user) {
  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        system: sys,
        messages: [{ role: "user", content: user }],
      }),
    });
  } catch (netErr) {
    throw new Error("No se pudo conectar con Claude. " + netErr.message);
  }
  if (!res.ok) {
    let detail = "";
    try { const e = await res.json(); detail = e?.error?.message || ""; } catch (x) {}
    const d = detail ? ` — ${detail}` : "";
    if (res.status === 429) throw new Error(`Claude sin cuota ahora (429)${d}. Espera un momento o usa el modo Demo.`);
    if (res.status === 401) throw new Error(`Key de Claude inválida (401)${d}. Revísala en console.anthropic.com.`);
    throw new Error(`Error de Claude (${res.status})${d}.`);
  }
  const j = await res.json();
  return j.content?.[0]?.text || "";
}

function demoGenerate(tema, aud, tono, n) {
  const C = window.LUMINA_CONTENT;
  const hook = C.hooksBank[Math.floor(Math.random() * C.hooksBank.length)].replace("{tema}", tema);
  const bodies = [
    ["Empieza simple", `No necesitas más para arrancar con ${tema}: constancia gana a perfección.`],
    ["El error común", `La mayoría falla en ${tema} por querer resultados en 48 h. Dale tiempo al proceso.`],
    ["Hazlo medible", `Define una meta concreta de ${tema} esta semana. Lo que se mide, mejora.`],
    ["El atajo real", `Aprende de quien ya domina ${tema}: 1 hora de mentoría ahorra meses de prueba y error.`],
    ["Hábito mínimo", `Dedica 15 minutos diarios a ${tema}. En 30 días notarás la diferencia.`],
    ["Comparte", `Cuenta públicamente tu avance con ${tema}: el compromiso social multiplica resultados.`],
  ];
  const slides = [{ role: "cover", kicker: (state.brand.name || "Guía rápida").toUpperCase(), title: hook, body: "" }];
  for (let i = 0; i < Math.max(2, n - 2); i++) {
    const b = bodies[i % bodies.length];
    slides.push({ role: "content", kicker: `Tip 0${i + 1}`, title: b[0], body: b[1] });
  }
  slides.push({ role: "cta", kicker: "¿Te sirvió?", title: "Guárdalo y sígueme", body: `Más contenido de ${tema} cada semana ✨` });
  const tag = tema.toLowerCase().split(/\s+/).slice(0, 2).join("");
  return { slides, caption: `¿Cuál de estos puntos vas a aplicar primero? 👇\n\n#${tag} #tips #crecimiento #contenidoenespanol #aprendeconmigo` };
}

function applyAIResult(result) {
  state.slides = (result.slides || []).map((s) => ({
    role: ["cover", "content", "cta"].includes(s.role) ? s.role : "content",
    kicker: s.kicker || "", title: s.title || "", body: s.body || "", img: null,
  }));
  state.caption = result.caption || "";
  current = 0;
  persist(); renderAll();
  $("#aiCaption").value = state.caption;
  $("#aiResult").classList.add("show");
}

$("#aiGo").addEventListener("click", async () => {
  const tema = $("#aiTema").value.trim();
  if (!tema) return toast("Escribe un tema primero");
  const prov = $("#aiProv").value;
  const aud = $("#aiAud").value.trim();
  const tono = $("#aiTono").value;
  const n = +$("#aiN").value;
  const btn = $("#aiGo");
  btn.disabled = true; btn.textContent = "Generando…";
  try {
    if (prov === "demo") {
      applyAIResult(demoGenerate(tema, aud, tono, n));
      toast("✓ Carrusel generado (modo Demo)");
    } else {
      const key = $("#aiKey").value.trim();
      if (!key) throw new Error("Pega tu API key primero");
      keys[prov] = key;
      try { localStorage.setItem("lumina_keys", JSON.stringify(keys)); } catch (e) {}
      const sys = window.LUMINA_CONTENT.aiSystemPrompt;
      const user = buildUserPrompt(tema, aud, tono, n);
      const raw = prov === "gemini" ? await callGemini(key, sys, user) : await callClaude(key, sys, user);
      const result = extractJSON(raw);
      if (!Array.isArray(result.slides) || !result.slides.length) throw new Error("La IA respondió sin slides válidos");
      applyAIResult(result);
      toast("✓ Carrusel generado con IA");
    }
  } catch (e) {
    console.error(e);
    if (prov !== "demo") {
      // Garantía: nunca te quedes sin nada. Generamos un borrador con el motor offline.
      applyAIResult(demoGenerate(tema, aud, tono, n));
      toast("⚠ " + e.message + "  ·  Te dejé un borrador en modo Demo mientras tanto.", 9000);
    } else {
      toast("⚠ " + e.message, 5000);
    }
  } finally {
    btn.disabled = false; btn.textContent = "Generar carrusel";
  }
});

$("#aiCopy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("#aiCaption").value); toast("✓ Caption copiado"); }
  catch { $("#aiCaption").select(); document.execCommand("copy"); toast("✓ Caption copiado"); }
});

/* ---------------- REEL (video) ---------------- */
function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

function drawCover(ctx, img, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s, ih = img.height * s;
  ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
}

function pickMime() {
  const c = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', "video/mp4",
    'video/webm;codecs="vp9,opus"', "video/webm",
  ];
  return c.find((m) => MediaRecorder.isTypeSupported(m)) || "";
}

let reelBlobURL = null, reelExt = "webm";

$("#vGo").addEventListener("click", async () => {
  const btn = $("#vGo");
  const prog = $("#vProg"), bar = $("#vProg span");
  const prev = $("#vPrev"), dl = $("#vDown");
  if (typeof MediaRecorder === "undefined") return toast("Tu navegador no soporta grabación de video");
  btn.disabled = true; btn.textContent = "Renderizando slides…";
  prog.classList.add("show"); bar.style.width = "4%";
  prev.classList.remove("show"); dl.style.display = "none";

  try {
    const durPer = parseFloat($("#vDur").value);
    const urls = await snapAll((done, total) => { bar.style.width = (done / total) * 30 + "%"; });
    const imgs = await Promise.all(urls.map(loadImg));

    const W = 1080, H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    // Fondos difuminados precalculados (uno por slide)
    const bgs = imgs.map((img) => {
      const c = document.createElement("canvas");
      c.width = W / 4; c.height = H / 4;
      const cx = c.getContext("2d");
      cx.filter = "blur(16px)";
      drawCover(cx, img, c.width, c.height);
      return c;
    });

    const stream = canvas.captureStream(30);

    // Música opcional
    let audioEl = null, actx = null;
    const mf = $("#vMusic").files[0];
    if (mf) {
      actx = new AudioContext();
      audioEl = new Audio(URL.createObjectURL(mf));
      audioEl.loop = true;
      const src = actx.createMediaElementSource(audioEl);
      const dest = actx.createMediaStreamDestination();
      src.connect(dest);
      const tr = dest.stream.getAudioTracks()[0];
      if (tr) stream.addTrack(tr);
    }

    const mime = pickMime();
    reelExt = mime.includes("mp4") ? "mp4" : "webm";
    const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 9_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise((res) => (rec.onstop = res));

    const total = imgs.length * durPer;
    const trans = Math.min(0.55, durPer / 3);

    function drawSlide(idx, p, alpha) {
      const img = imgs[idx];
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(bgs[idx], 0, 0, W, H);
      ctx.fillStyle = "rgba(12,8,12,0.25)";
      ctx.fillRect(0, 0, W, H);
      const zoom = 1.02 + 0.06 * p;
      const s = Math.min((W * 0.92) / img.width, (H * 0.84) / img.height) * zoom;
      const iw = img.width * s, ih = img.height * s;
      const dx = (idx % 2 ? -1 : 1) * 14 * p;
      ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
      ctx.drawImage(img, (W - iw) / 2 + dx, (H - ih) / 2, iw, ih);
      ctx.restore();
    }

    btn.textContent = "Grabando…";

    // rAF se pausa con la pestaña oculta pero el reloj del video sigue corriendo:
    // el resultado serían tramos congelados. Mejor abortar y avisar.
    let hiddenAbort = false;
    const visHandler = () => { if (document.hidden) hiddenAbort = true; };
    document.addEventListener("visibilitychange", visHandler);

    rec.start(250);
    if (audioEl) { try { await audioEl.play(); } catch (e) {} }
    const t0 = performance.now();

    await new Promise((done) => {
      function frame(now) {
        const t = (now - t0) / 1000;
        if (t >= total || hiddenAbort) { done(); return; }
        const idx = Math.min(Math.floor(t / durPer), imgs.length - 1);
        const local = (t - idx * durPer) / durPer;
        ctx.clearRect(0, 0, W, H);
        drawSlide(idx, local, 1);
        const tStart = 1 - trans / durPer;
        if (local > tStart && idx < imgs.length - 1) {
          drawSlide(idx + 1, 0, (local - tStart) / (trans / durPer));
        }
        bar.style.width = 30 + (t / total) * 68 + "%";
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });

    document.removeEventListener("visibilitychange", visHandler);
    rec.stop();
    if (audioEl) { audioEl.pause(); }
    if (actx) { try { actx.close(); } catch (e) {} }
    await stopped;

    if (hiddenAbort) {
      throw new Error("Grabación cancelada: la pestaña pasó a segundo plano. Mantenla visible y vuelve a intentarlo.");
    }

    const blob = new Blob(chunks, { type: mime || "video/webm" });
    if (reelBlobURL) URL.revokeObjectURL(reelBlobURL);
    reelBlobURL = URL.createObjectURL(blob);
    prev.src = reelBlobURL;
    prev.classList.add("show");
    dl.style.display = "";
    bar.style.width = "100%";
    toast(`✓ Reel listo (${reelExt.toUpperCase()}, ${Math.round(blob.size / 1024 / 102.4) / 10} MB)`);
  } catch (e) {
    console.error(e);
    toast("⚠ " + e.message, 4500);
  } finally {
    btn.disabled = false; btn.textContent = "Grabar video";
    setTimeout(() => prog.classList.remove("show"), 1200);
  }
});

$("#vDown").addEventListener("click", () => {
  if (reelBlobURL) download(reelBlobURL, `lumina-reel.${reelExt}`);
});

/* ---------------- init ---------------- */
window.addEventListener("DOMContentLoaded", () => {
  try {
    loadInitial();
    renderAll();
  } catch (e) {
    // Estado irrecuperable (p. ej. localStorage corrupto): resetea y arranca limpio.
    console.error(e);
    try { localStorage.removeItem("lumina_project"); } catch (e2) {}
    state = DEFAULTS();
    loadInitial();
    renderAll();
  }
});
