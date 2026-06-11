# 📤 Publicar a redes sociales — qué se puede y qué no (datos 2026)

> Investigado con fuentes verificadas (MDN Web Share API, caniuse, docs oficiales de Meta/TikTok/X/LinkedIn/Pinterest/Google, repo social-share-urls). Resumen honesto para decidir el camino.

---

## 1. Lo que Lumina YA hace (sin servidor, gratis) — botón "📤 Publicar"

| Vía | Qué hace | Dónde funciona |
|---|---|---|
| **📲 Compartir imágenes** (Web Share API con archivos) | Abre el **menú nativo de tu teléfono** y eliges Instagram, TikTok, Facebook, WhatsApp… con los PNG del carrusel (o el MP4 del reel) ya adjuntos | **Móvil** (Android / iOS 15+). Es la **única vía real** para llevar imágenes a Instagram/TikTok desde web |
| **Caption automático** | Se copia al portapapeles al abrir; lo pegas en la app | Todos |
| **X / WhatsApp / Telegram** | Abren el compositor con el **texto** ya escrito | Móvil y escritorio |
| **⬇ Descargar imágenes** | Bajas los PNG y los subes a mano | Todos (100% fiable, sin depender de nada) |

**Reglas técnicas que respeta el código** (por eso funciona donde otros fallan):
- `navigator.share()` se llama **síncrono tras el toque** (si haces `await` justo antes, iOS pierde el "gesto de usuario" y no abre nada) → por eso preparamos las imágenes *antes*, mientras lees el modal.
- A Instagram/TikTok se envía **solo `{files}`** (sin texto): muchas apps fallan si mezclas texto + archivos.
- Carrusel de **varias** imágenes por el menú es poco fiable (sobre todo iOS) → para carrusel perfecto, **descarga y sube manual**.

**Lo que NO se puede desde web (sin servidor), y por qué:**
- **Instagram y TikTok no tienen "enlace de publicar"** como X. Es decisión de Meta/ByteDance: solo aceptan publicar desde su app o desde su API oficial (con cuenta business + revisión). No existe un `instagram://share` fiable desde el navegador.
- **Facebook y LinkedIn**: sus enlaces de compartir solo aceptan una **URL** (el texto que les pases lo *ignoran* desde hace años; sacan título/imagen del Open Graph de la página). No suben tu imagen local.
- **Pinterest**: su enlace sí acepta imagen, pero **debe estar alojada en una URL pública** (no sirve un archivo generado en el navegador).

---

## 2. Auto-publicar de verdad (1 clic, sin abrir la app) — requiere backend

Todas las redes **sí** permiten auto-publicar por API, pero ninguna desde una app sin servidor. Esto es lo que exige cada una (2026):

| Red | ¿Auto-publica? | Requisitos | Costo API | Revisión |
|---|---|---|---|---|
| **Instagram** (Graph API) | Sí (crear container → publish) | Cuenta **Business/Creator** + Página de FB · App de Meta + permiso `content_publish` (App Review) · **imagen en URL pública** (R2 encaja) · servidor para OAuth | Gratis (solo pagas hosting) | **2-4 semanas** |
| **Facebook Pages** | Sí | App + `pages_manage_posts` (App Review) + **Business Verification** | Gratis | 2-4 semanas |
| **TikTok** (Content Posting) | Sí (Direct Post) | App + OAuth `video.publish` · **audit obligatorio** (sin él, los posts quedan privados) · UX que muestre el perfil del creador | **Gratis** | Audit ~1-2 semanas |
| **X / Twitter** (API v2) | Sí | App + OAuth | ⚠️ **Sin tier gratis** para nuevos (desde feb-2026). ~$0.01/post, **$0.20 si el post lleva enlace**. ~100 posts ≈ $6/mes | Acceso inmediato (pero pagas) |
| **LinkedIn** | Sí | App + `Share on LinkedIn` (perfil) / Community API (empresa, exige org legal) | Gratis | Días–semanas |
| **Pinterest** | Sí | App + OAuth · publicar real exige pasar de Trial a Standard (video demo) | Gratis | Trial inmediato; Standard según demo |
| **YouTube Shorts** | Sí (`videos.insert`) | Google Cloud + OAuth · **compliance audit** (sin él, privados) | Gratis (cuota 10k/día) | **Semanas–meses** (el más lento) |

**Conclusión:** construir las 7 integraciones = meses de revisiones (Meta, TikTok, Google…) + cuentas business + un servidor. Es exactamente la barrera por la que Buffer/Metricool/Predis cobran $25-49/mes.

---

## 3. El atajo inteligente: agregadores (una sola API → todas las redes)

En vez de pelear con 7 App Reviews, usas un **agregador** que ya tiene las aprobaciones resueltas. Tú solo llamas su API.

| Agregador | Qué da | Precio |
|---|---|---|
| **Late / Zernio** (getlate.dev) ⭐ | API a 13-15 redes, maneja OAuth y subida directa. **El más barato.** | **Plan GRATIS real: 20 posts/mes, 2 cuentas, sin tarjeta** · desde ~$16-19/mes. Sin cargos por exceso |
| **Ayrshare** | El más maduro/developer. 13+ redes, se encarga de TODOS los audits por ti, scheduling, analytics | Sin gratis nuevo · Premium **$149/mes** (1 marca) · agencia $299-599/mes |
| **Postiz** (open source) | Self-host en tu Cloudflare/Supabase, API REST + OAuth | **Gratis** (self-host, ~$5-10/mes hosting). ⚠️ tú haces los App Reviews de cada red |

---

## 4. MVP recomendado para auto-publish (cuando quieras dar el salto)

**No construyas las integraciones una por una.** El camino realista y barato para un dev indie:

1. **Backend mínimo** (Supabase Edge Function o Cloudflare Worker — ya los dominas) que reciba el carrusel/caption.
2. Sube las imágenes a **Cloudflare R2** (bucket público) → te da la URL pública que Instagram exige.
3. Llama a la API de **Late/Zernio** (gratis para empezar) para publicar/agendar a todas las redes conectadas.
4. El usuario conecta sus cuentas **una vez** (OAuth que maneja el agregador).
5. Cuando tengas tracción y quieras quitar al intermediario, migras red por red a las APIs nativas (empezando por las gratis: TikTok, Instagram).

**Costo de arranque:** ~$0 (R2 + Late free + tu Worker). Escala a ~$16-19/mes cuando pases de 20 posts/mes.

> Mientras tanto, el botón **"📤 Publicar"** ya te resuelve el 90% del trabajo real desde el celular: generas, tocas Compartir, eliges la red. Sin backend, sin revisiones, sin costo.
