# ROADMAP — SaaS de Videos Cortos (Reels/TikTok) a partir de Prompt
**Proyecto: Lumina Studio · Fecha de investigación: 10 junio 2026 · Autor: consultoría técnica**

> Precios verificados con búsqueda web en junio 2026. Los marcados **(est.)** son rangos de fuentes secundarias recientes, no página oficial de precios. Verifica siempre antes de fijar tus precios de venta.

---

## 1. Precios actuales de mercado (junio 2026)

### 1.1 Camino A — APIs de video generativo (precio por segundo de video generado)

| Proveedor / Modelo | Precio por segundo | Video de 30 s (bruto) | Notas |
|---|---|---|---|
| **Veo 3.1 Standard** (Gemini API, oficial) | $0.40/s (720p/1080p), $0.60/s (4K) | **$12.00** | Con audio. Página oficial de precios de Gemini API. |
| **Veo 3.1 Fast** (Gemini API, oficial) | $0.10/s (720p), $0.12/s (1080p) | **$3.00–3.60** | Mejor relación calidad/precio de Google. |
| **Veo 3.1 Lite** (Gemini API, oficial) | $0.05/s (720p), $0.08/s (1080p) | **$1.50–2.40** | Calidad menor, suficiente para b-roll. |
| **Kling** (API oficial Kuaishou) | ~$0.09–0.10/s (est.) | **$2.70–3.00** | Paquetes prepagados grandes (entrada ~$4,200/30k unidades, validez 90 días). Inviable para empezar. |
| **Kling vía fal.ai** | Standard $0.084/s, Pro $0.112/s; Kling 3.0 ~$0.029–0.07/s (est.) | **$0.87–3.36** | Pay-as-you-go, sin compromiso. La vía práctica para un dev solo. |
| **Runway Gen-4 Turbo** (API oficial) | 5 créditos/s × $0.01 = $0.05/s | **$1.50** | Página oficial. Gen-4.5: 12 cr/s = $0.12/s → $3.60/30s. |
| **Runway Gen-4 Aleph** | 15 cr/s = $0.15/s | **$4.50** | Edición video-a-video. |
| **Luma Ray-2** (Dream Machine API) | ~$0.08/s (est.; también listado $0.32/Mpíxel) | **~$2.40** | Ray3: por créditos (720p 5s = 320 cr). Billetera API separada de la app. |

**Realidad operativa del Camino A:** estos modelos generan clips de **5–10 segundos máximo**. Un reel de 30 s = 3–6 clips encadenados + transiciones. Y la tasa de descarte (regeneraciones porque el resultado no sirve) en producción es **1.5×–2×**. El costo real por video *utilizable* de 30 s es:

- Opción barata (Kling fal.ai / Runway Turbo): **$1.30–3.00 reales**
- Opción calidad (Veo 3.1 Fast): **$4.50–7.00 reales**
- Opción premium (Veo 3.1 Standard): **$18–24 reales**

### 1.2 Camino B — Video compuesto (componentes)

| Componente | Proveedor | Precio | Costo por video de 30 s |
|---|---|---|---|
| Guión | Gemini 2.5 Flash ($0.30 in / $2.50 out por 1M tokens) o Claude Haiku | ~$0.003/guión | **$0.003** |
| Voz TTS (económica) | **Azure Speech Neural**: $15/millón de caracteres (HD: $22/M, bajó de $30 en marzo 2026) | 30 s ≈ 500 caracteres | **$0.008** (HD: $0.011) |
| Voz TTS (premium) | **ElevenLabs**: ~$0.17–0.22/1k caracteres en planes Starter/Creator; modelo Flash consume 0.5 créditos/carácter (mitad de precio); overage ~$0.30/1k | 500 chars ≈ 250 créditos Flash | **$0.05–0.11** |
| Imágenes IA | **Imagen 4** (Gemini API): Fast $0.02, Standard $0.04, Ultra $0.06 por imagen; Gemini 2.5 Flash Image $0.039 | 6 imágenes Fast | **$0.12** |
| Imágenes/clips stock | **Pexels API: GRATIS (confirmado)**. 200 req/hora, 20,000 req/mes; límites ampliables gratis con atribución. Uso comercial permitido. Prohibido usarla para entrenar IA o redistribuir contenido "standalone". | — | **$0.00** |
| Subtítulos (si transcribes) | Whisper/GPT-4o-transcribe: $0.006/min; GPT-4o-mini-transcribe: $0.003/min. AssemblyAI: $0.15/h base (~$0.0025/min); real con extras $0.30–0.35/h | 0.5 min | **$0.0015–0.003** |
| Subtítulos (truco) | **Azure Speech devuelve eventos `WordBoundary` durante la síntesis** → timestamps palabra a palabra GRATIS. Como tú generas el guión, NO necesitas transcribir nada. | — | **$0.00** |
| Ensamblaje | Remotion en Node (CPU, sin GPU) en tu propio worker/VPS | ~$0.005–0.02 de cómputo | **$0.01** |
| Almacenamiento/entrega | Cloudflare R2: $0.015/GB-mes, **egreso $0** | video ≈ 25 MB | **<$0.001** |

### 1.3 Tabla comparativa final: costo por video de 30 s

| Configuración | Desglose | Costo total | Calidad percibida |
|---|---|---|---|
| **B-económico** | Guión $0.003 + Azure TTS $0.008 + Pexels $0 + subt. WordBoundary $0 + render $0.01 | **~$0.02** | Estilo Pictory/InVideo básico |
| **B-premium** | Guión $0.003 + ElevenLabs Flash $0.06 + 6× Imagen 4 Fast $0.12 + render $0.01 | **~$0.20** | Estilo opus.pro / faceless premium |
| **A-económico** (Kling fal.ai/Runway Turbo, con reintentos) | 4 clips × 8 s × ~$0.05–0.08/s × 1.5 | **~$1.30–3.00** | Video 100% generativo |
| **A-calidad** (Veo 3.1 Fast, con reintentos) | 4 clips × 8 s × $0.10–0.12/s × 1.5 | **~$4.50–7.00** | Cinemático con audio |
| **A-premium** (Veo 3.1 Standard) | 30 s × $0.40 × 1.5 | **~$18** | Tope de mercado |

**Conclusión: el Camino B cuesta 65×–900× menos que el Camino A.** La recomendación es construir el **Camino B como núcleo del producto** y ofrecer clips del Camino A (Veo Fast / Kling vía fal.ai) como **add-on premium cobrado en créditos**, nunca incluido "ilimitado" en ningún plan.

---

## 2. Arquitectura recomendada

```
┌──────────────────┐     ┌─────────────────────────────────────────┐
│  FRONTEND        │     │  SUPABASE                               │
│  (web estática   │────▶│  · Auth (email/Google)                  │
│  en Cloudflare   │     │  · Postgres: users, credits_ledger,     │
│  Pages, ya lo    │     │    jobs (cola), renders                 │
│  dominas)        │     │  · RLS: cada usuario ve solo lo suyo    │
└──────────────────┘     │  · Edge Function "create-job":          │
        │                │    valida créditos → estima costo →     │
        │ polling /      │    descuenta → encola (estado queued)   │
        │ Realtime       └─────────────────────────────────────────┘
        │                                  │
        │                                  │  worker hace polling con
        ▼                                  ▼  FOR UPDATE SKIP LOCKED
┌──────────────────┐     ┌─────────────────────────────────────────┐
│  ENTREGA         │     │  WORKER DE RENDER (Node en VPS barato   │
│  R2 + dominio    │◀────│  o tu PC Windows al inicio; SIN GPU)    │
│  público con     │     │  1. LLM → guión por escenas (JSON)      │
│  Cloudflare CDN  │     │  2. Azure TTS → mp3 + WordBoundary      │
│  (egreso $0)     │     │  3. Pexels/Imagen 4 → assets            │
└──────────────────┘     │  4. Remotion renderMedia() → mp4 1080×  │
                         │     1920, subtítulos karaoke quemados   │
                         │  5. Sube a R2, marca job "done"         │
                         └─────────────────────────────────────────┘
```

**Por qué cada pieza:**

- **Frontend estático en Cloudflare Pages**: ya lo dominas, costo $0, deploy en segundos. No necesitas Next.js con servidor; el estado vive en Supabase.
- **Supabase como cerebro**: auth + Postgres + RLS + Edge Functions en un solo producto que ya conoces. La **cola de trabajos vive en Postgres** (tabla `jobs`), no en Redis/SQS: a tu escala (<10k videos/mes), `FOR UPDATE SKIP LOCKED` es una cola perfecta, transaccional y gratis. Menos piezas = menos fallos.
- **Edge Function `create-job` como única puerta de entrada**: el frontend NUNCA escribe en `jobs` directamente. La función valida créditos, calcula costo estimado y descuenta ANTES de encolar (sección 4). Esto es tu muro anti-abuso.
- **Worker de render separado (Node + Remotion)**: Remotion renderiza con Chromium headless por CPU, sin GPU. Un VPS de $5–10/mes (Hetzner/Contabo) renderiza un video de 30 s en 1–3 minutos. Empieza incluso con tu PC Windows como worker (es solo un proceso Node con un bucle de polling). **No uses Cloudflare Workers para renderizar**: no pueden correr Chromium/ffmpeg; los Workers solo sirven aquí como API ligera o para firmar URLs de R2.
- **R2 para entrega**: egreso $0 es decisivo en video. Servir 1 TB de videos desde S3 cuesta ~$90; desde R2, $0. Usa URLs firmadas con expiración para descargas privadas.
- **Subtítulos sin Whisper**: tú generas el texto del guión → Azure TTS te da el timestamp de cada palabra con eventos `WordBoundary` → subtítulos karaoke perfectos a costo cero. Whisper solo lo necesitarás si en el futuro aceptas audio subido por el usuario.

---

## 3. Schema SQL para Supabase

```sql
-- ============================================================
-- PERFILES (extiende auth.users de Supabase)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free','starter','pro')),
  created_at timestamptz not null default now()
);

-- Trigger: crear perfil + créditos de bienvenida al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.credits_ledger (user_id, delta, reason)
  values (new.id, 30, 'welcome_bonus'); -- 30 créditos = ~3 videos gratis
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- LIBRO MAYOR DE CRÉDITOS (append-only; saldo = SUM(delta))
-- Nunca guardes "saldo" como columna editable: el ledger es la verdad.
-- ============================================================
create table public.credits_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,            -- positivo = compra/bono, negativo = consumo
  reason text not null,              -- 'purchase' | 'welcome_bonus' | 'job_charge' | 'job_refund' | 'monthly_grant'
  job_id uuid,                       -- referencia al job si aplica
  stripe_payment_id text,            -- idempotencia de pagos
  created_at timestamptz not null default now()
);

create index idx_ledger_user on public.credits_ledger (user_id, created_at desc);
create unique index idx_ledger_stripe on public.credits_ledger (stripe_payment_id)
  where stripe_payment_id is not null;  -- evita acreditar dos veces el mismo pago
create unique index idx_ledger_job_charge on public.credits_ledger (job_id, reason)
  where job_id is not null;             -- evita doble cobro / doble reembolso del mismo job

create or replace function public.get_balance(p_user uuid)
returns integer language sql stable as $$
  select coalesce(sum(delta), 0)::int from public.credits_ledger where user_id = p_user;
$$;

-- ============================================================
-- COLA DE TRABAJOS
-- ============================================================
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued','processing','done','failed','cancelled')),
  job_type text not null default 'composite_video'
    check (job_type in ('composite_video','genai_clip','carousel')),
  payload jsonb not null,            -- prompt, voz, estilo, duración, fuente de assets
  estimated_credits integer not null check (estimated_credits > 0),
  attempts integer not null default 0,
  max_attempts integer not null default 2,
  error text,
  worker_id text,                    -- qué worker lo tomó
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index idx_jobs_queue on public.jobs (status, created_at) where status = 'queued';
create index idx_jobs_user on public.jobs (user_id, created_at desc);
-- Anti-abuso: máximo de jobs activos por usuario se valida en la Edge Function,
-- pero este índice parcial hace esa consulta instantánea:
create index idx_jobs_active_per_user on public.jobs (user_id) 
  where status in ('queued','processing');

-- El worker reclama un job de forma atómica (sin colisiones entre workers):
create or replace function public.claim_next_job(p_worker text)
returns setof public.jobs language plpgsql security definer as $$
begin
  return query
  update public.jobs j set
    status = 'processing', worker_id = p_worker,
    locked_at = now(), started_at = coalesce(j.started_at, now()),
    attempts = j.attempts + 1
  where j.id = (
    select id from public.jobs
    where status = 'queued'
    order by created_at
    for update skip locked
    limit 1
  )
  returning *;
end; $$;

-- ============================================================
-- RENDERS (resultado final)
-- ============================================================
create table public.renders (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  r2_key text not null,              -- ej: renders/{user_id}/{job_id}.mp4
  duration_seconds numeric(6,2),
  width int, height int,
  watermarked boolean not null default true,
  actual_cost_usd numeric(8,4),      -- costo real medido (TTS chars + imágenes + API)
  created_at timestamptz not null default now(),
  expires_at timestamptz             -- borra renders de plan free a los 30 días
);

create index idx_renders_user on public.renders (user_id, created_at desc);
create index idx_renders_expiry on public.renders (expires_at) where expires_at is not null;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.credits_ledger enable row level security;
alter table public.jobs enable row level security;
alter table public.renders enable row level security;

create policy "own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "own ledger read" on public.credits_ledger
  for select using (auth.uid() = user_id);
-- SIN policy de INSERT para usuarios: solo service_role (Edge Functions / webhook
-- de Stripe / worker) escribe en el ledger. El cliente jamás se acredita créditos.

create policy "own jobs read" on public.jobs
  for select using (auth.uid() = user_id);
create policy "cancel own queued job" on public.jobs
  for update using (auth.uid() = user_id and status = 'queued')
  with check (status = 'cancelled');
-- SIN policy de INSERT: los jobs solo se crean vía Edge Function (service_role).

create policy "own renders read" on public.renders
  for select using (auth.uid() = user_id);
```

El worker y las Edge Functions usan la clave `service_role` (salta RLS). El frontend usa la `anon key` (sujeto a RLS). **Esa separación es el modelo de seguridad completo.**

---

## 4. Sistema anti-abuso (que nadie te vacíe las cuentas de API)

El riesgo nº1 de este SaaS: un script malicioso o un bug que dispare miles de llamadas a APIs de pago. Defensa en capas:

1. **Créditos prepagados, siempre.** Nadie consume sin saldo positivo. El plan gratis recibe créditos finitos una sola vez (trigger de bienvenida) + quizá una recarga mensual pequeña. Jamás "ilimitado".
2. **Estimar costo ANTES de encolar.** La Edge Function `create-job` calcula `estimated_credits` a partir del payload (duración pedida × tipo de assets × tipo de voz). Si `get_balance(user) < estimated_credits` → 402, no se encola. El descuento del ledger y el INSERT del job ocurren **en la misma transacción** (hazlo con una función RPC `create_job_atomic` que haga ambos pasos, no con dos llamadas separadas).
3. **Cobrar al encolar, reembolsar si falla.** Descuenta al crear el job; si el job termina en `failed` tras agotar `max_attempts`, el worker inserta un `job_refund`. El índice único `(job_id, reason)` impide reembolsos duplicados.
4. **Límites de concurrencia y de tasa por usuario:**
   - Máx. **2 jobs activos** (`queued`+`processing`) por usuario free, 5 en pago. Verificado en la Edge Function con el índice parcial.
   - Máx. **10 jobs/hora** free, 30/hora pago (consulta `count(*) ... created_at > now() - interval '1 hour'`).
   - Rate limit de red adicional en Cloudflare (WAF rule sobre el endpoint de la función: p. ej. 20 req/min/IP).
5. **Validación dura del payload:** duración máx. 60 s, nº máx. de escenas 10, longitud máx. del guión 1,200 caracteres, lista blanca de voces y resoluciones. Todo lo que entra al worker viene tipado y acotado; el prompt del usuario nunca controla cuántas llamadas a API se hacen.
6. **Topes en los propios proveedores (tu red de seguridad final):** presupuesto máximo mensual en Google Cloud Billing (alerta + tope), límite de gasto en fal.ai, plan ElevenLabs con tope de créditos (sin overage automático al inicio), presupuesto en Azure. Si todo lo demás falla, el grifo se cierra solo.
7. **Claves API solo en el worker y Edge Functions.** Jamás en el frontend. R2 se sirve con URLs firmadas con expiración de 24 h.
8. **Marca de agua + verificación de email en el plan free** (reduce granjas de cuentas). Si crece el abuso: requiere tarjeta para el free trial o limita free a IPs no-datacenter.
9. **Registra `actual_cost_usd` por render.** Un cron semanal compara costo estimado vs real y te avisa si la economía se desvía.

---

## 5. Plan MVP — 4 semanas (dev solo)

**Semana 1 — Pipeline de render local (el corazón, sin SaaS todavía)**
- Script Node: prompt → Gemini Flash devuelve JSON de escenas `{texto, búsqueda_pexels, duración}`.
- Azure TTS por escena, capturando eventos `WordBoundary` → JSON de timestamps.
- Descarga de clips/fotos de Pexels por escena.
- Composición Remotion: plantilla vertical 1080×1920, una sola plantilla, subtítulos karaoke, música de fondo de licencia libre, marca de agua.
- Meta de la semana: comando `node render.js "tema"` que escupe un MP4 decente. **Si esto no convence, nada de lo demás importa.**

**Semana 2 — Backend y cola**
- Proyecto Supabase: schema completo de la sección 3 (migración SQL).
- Edge Function `create-job` con validación + descuento atómico de créditos.
- Convertir el script de la semana 1 en worker: bucle de polling con `claim_next_job`, subida a R2, actualización de estado, reembolso en fallo.
- Probar el flujo completo por API (sin UI): curl → job → MP4 en R2.

**Semana 3 — Frontend**
- Web estática (Cloudflare Pages): login Supabase, formulario de creación (prompt, voz, estilo, duración), lista de jobs con estado (Supabase Realtime o polling), reproductor + botón de descarga (URL firmada), saldo de créditos visible.
- 2–3 plantillas Remotion seleccionables (cambia colores/fuente/transiciones; misma estructura).
- Pulir los 10 errores más comunes (Pexels sin resultados, TTS falla, render lento).

**Semana 4 — Monetización y lanzamiento**
- Stripe Checkout (pagos únicos de paquetes de créditos primero; suscripciones después — menos lógica de proración). Webhook → inserta en `credits_ledger` con `stripe_payment_id` idempotente.
- Quitar marca de agua a usuarios de pago; caducidad de renders free a 30 días.
- Landing en español con 6 videos de ejemplo reales, topes de presupuesto en todos los proveedores, analítica básica (Plausible/Umami).
- Lanzar a 20 usuarios beta hispanos (tus contactos de bots de WhatsApp son canal natural).

**Queda explícitamente FUERA del MVP:** Camino A generativo, clonación de voz, editor de timeline, equipos/colaboración, API pública, apps móviles, publicación directa en TikTok/IG.

---

## 6. Economía unitaria y planes para mercado hispano

Costos reales por unidad (de la sección 1.3): video básico **$0.02**, video premium **$0.20**, carrusel de imágenes (8 × Imagen 4 Fast + textos) **~$0.17**, clip generativo add-on (8 s Veo Fast con margen de reintento) **~$1.20**.

| Plan | Precio | Incluye (en créditos) | Costo de servir (peor caso) | Margen bruto |
|---|---|---|---|---|
| **Gratis** | $0 | 3 videos básicos/mes, marca de agua, 720p, renders caducan a 30 días | ~$0.06 + infra | CAC, no margen. Coste asumible incluso con 10,000 frees: ~$600/mes → por eso el free debe ser básico-solo. |
| **Starter** | **9 €/mes** (~$9.70) | 30 videos básicos o 15 premium (300 créditos; básico=10 cr, premium=20 cr), sin marca de agua, 1080p | 30×$0.02=$0.60 ó 15×$0.20=$3.00 | **69–94%** |
| **Pro** | **29 €/mes** (~$31) | 100 videos cualquier tipo + voces ElevenLabs + imágenes IA (1,200 créditos) | 100×$0.20=$20 peor caso; mezcla típica ~$8–12 | **35% peor caso, 60–75% típico** |
| **Add-on clips IA** | 5 € / 4 clips Veo Fast | clips de 8 s estilo cinemático | 4×$1.20=$4.80 | ~12% directo — cóbralo como diferenciador, no como negocio; o usa Kling fal.ai ($0.70/clip) y el margen sube a ~74% |

Reglas de oro:
- **Precio en función de valor percibido (un video editado "vale" 10–30 €), no del costo.** Tu costo de $0.02–0.20 es tu foso defensivo, no tu ancla de precio.
- En el mercado hispano la sensibilidad al precio es mayor que en EE. UU.: 9 €/29 € funciona mejor que 19 $/49 $. Acepta pago con Stripe (tarjeta) y considera MercadoPago para LATAM en fase 2.
- Punto de equilibrio: con infra fija de ~$50/mes (VPS + dominios + Supabase Pro), **6 clientes Starter ya cubren costos.** 100 clientes mezclados ≈ 1,500–2,500 €/mes con margen >70%.

---

## 7. Riesgos principales y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| **Cambio de precios de APIs** (Veo/ElevenLabs suben, o bajan y comoditizan) | Alta | Camino B depende poco de APIs caras (Azure TTS + Pexels son estables y baratos). Abstrae cada proveedor tras una interfaz (`ttsProvider`, `assetProvider`) para cambiar en horas. Registra `actual_cost_usd` y revisa mensual. |
| **Abuso / vaciado de cuenta de APIs** | Alta sin defensas | Sección 4 completa: créditos prepagados + validación previa + topes en proveedor. |
| **Calidad insuficiente del video compuesto** ("se ve genérico") | Media-alta | Es el riesgo de producto real. Invierte en las plantillas Remotion (diseño, animación de subtítulos, ritmo de cortes): ahí está la diferenciación, no en la IA. Estudia opus.pro y los reels faceless que más rinden en español. |
| **Licencia de Remotion** | Baja | Gratis para individuos y empresas ≤3 personas (est.; verificar remotion.dev/license al facturar en serio). Presupuesta la licencia company (~$25–100/mes) como costo futuro, sigue siendo despreciable. |
| **Contenido prohibido generado por usuarios** (difamación, NSFW, estafas) | Media | Filtro de moderación del prompt con el propio LLM (añade ~$0.001/video), términos de servicio claros, marca de agua en free, registro de `user_id` por render. |
| **Derechos de stock**: Pexels prohíbe redistribución "standalone" y scraping para IA | Baja | Tu uso (componer videos con guión+voz+subtítulos) es transformativo y permitido. No cachees masivamente la librería de Pexels; descarga por job. Añade atribución en el footer para pedir límites ampliados gratis. |
| **Dependencia de proveedores caídos** (Pexels/Azure caen → cola parada) | Media | Reintentos con backoff por componente, fallback de Pexels→Pixabay, de Azure→ElevenLabs. El diseño de cola ya tolera fallos (reintento + reembolso). |
| **Cuello de botella de render** (1 worker, picos de demanda) | Media | Remotion escala horizontal: añade VPS de $10 y duplica capacidad. La cola en Postgres ya soporta N workers (`SKIP LOCKED`). A futuro: Remotion Lambda. |
| **Competencia (InVideo, Pictory, opus.pro, y Canva/CapCut gratis)** | Alta | No compitas en features: compite en nicho (español nativo, voces latinas/castellanas correctas, plantillas para nichos hispanos: inmobiliario, restaurantes, infoproductores) y en precio (9 € vs $25–35 de los gringos). Tu canal de bots de WhatsApp es una ventaja de distribución única: "mándame un audio por WhatsApp y te devuelvo un reel". |
| **Churn alto típico de herramientas de creación** | Alta | Paquetes de créditos sin caducidad además de suscripción (el usuario esporádico no cancela lo que no expira); recordatorios de créditos sin usar. |

---

## 8. Recomendación final

1. **Construye el Camino B.** Margen de 70–95%, control total, sin riesgo de quema de saldo. Es exactamente el modelo de InVideo/Pictory, y tu stack actual (Node, Supabase, R2, Azure TTS) cubre el 90% del trabajo.
2. **Ofrece el Camino A como add-on en créditos** (clips Kling vía fal.ai por su precio, o Veo 3.1 Fast por su calidad) cuando tengas usuarios de pago que lo pidan. Nunca lo incluyas "ilimitado".
3. **El truco técnico más rentable del proyecto:** Azure TTS `WordBoundary` = subtítulos sincronizados gratis. Elimina Whisper del pipeline del MVP.
4. **La semana 1 es la apuesta:** si el MP4 del pipeline local no te emocionaría publicarlo en tu propio TikTok, itera las plantillas antes de escribir una sola línea del SaaS.
