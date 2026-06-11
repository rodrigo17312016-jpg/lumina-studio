# ✦ LUMINA — Content Studio

App que **crea carruseles de Instagram y reels en segundos**: escribes tu idea (o pegas tu contenido), eliges una plantilla premium y exportas PNG listos para publicar o un **video vertical 1080×1920** con transiciones. Todo corre **en tu navegador**: sin servidores, sin suscripciones, sin costos por render.

> La generación de texto con IA es opcional: funciona en modo demo sin conexión, o con tu propia API key de **Gemini (gratis)** o **Claude**.

---

## ▶️ Cómo abrirla

**Opción 1 (la más fácil):** doble clic en `index.html`.

**Opción 2 (servidor local):**
```bash
node D:/YEMINA/MANICURA/.claude/serve-lumina.mjs
# → http://localhost:5070
```

---

## 🧭 Cómo se usa

1. **✦ Generar con IA** → escribe el tema (ej. *"cómo hacer que tu manicura dure más"*), audiencia y tono → la IA escribe hook, slides y caption.
   - **Demo sin IA**: fórmulas profesionales offline, sin key.
   - **Gemini**: key gratis en [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
   - **Claude**: key en [console.anthropic.com](https://console.anthropic.com).
   - Las keys se guardan **solo en tu navegador** (localStorage).
2. **Edita** los textos haciendo clic directamente sobre el slide, o desde el panel izquierdo (reordenar, añadir foto por slide, roles portada/contenido/CTA).
3. **Marca**: nombre, @handle, logo PNG, colores → se aplican a todas las plantillas.
4. **Diseño**: 5 plantillas premium (Soft Luxe, Editorial Noir, Bold Pop, Clean Minimal, Foto Statement) y formato 4:5 o 1:1.
5. **Exporta**:
   - **PNGs** → cada slide en 1080px listo para Instagram.
   - **ZIP** → todos los slides + caption.txt.
   - **🎬 Crear Reel** → video vertical 1080×1920 con transiciones suaves y música opcional (MP3), grabado en el navegador. Mantén la pestaña visible mientras graba.
6. **📤 Publicar** → desde el celular, "Compartir imágenes" abre el menú nativo y eliges Instagram, TikTok, Facebook… con todo listo. X/WhatsApp/Telegram abren con el texto. (Ver **PUBLICAR-REDES.md** para qué se puede / el camino del auto-publish con 1 clic.)

El proyecto se **autoguarda** en el navegador; también puedes Guardar/Abrir como archivo `.json`.

---

## 📁 Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app (interfaz) |
| `styles.css` | Editor + las 5 plantillas de slide |
| `app.js` | Lógica: estado, IA, export PNG/ZIP, grabación de video |
| `templates.js` | Las plantillas (añade aquí nuevos diseños) |
| `content.js` | Banco de 25 hooks ES, 5 fórmulas, prompt de IA y 3 demos |
| `ROADMAP-VIDEO.md` | **Plan completo del producto SaaS de video** (investigación de precios 2026, arquitectura, SQL, plan de 4 semanas, economía unitaria) |

---

## 🚀 Siguiente nivel (ver ROADMAP-VIDEO.md)

El roadmap detalla cómo convertir esto en un SaaS con video generado por servidor:
- **Camino B (recomendado)**: guión LLM + voz Azure TTS + stock Pexels + render Remotion → **$0.02–0.20 por video de 30 s** (margen 70–95% con planes de 9–29 €).
- Camino A (Veo/Kling/Runway) solo como add-on por créditos: cuesta $1.30–18 por video.
- Arquitectura: Supabase (auth + créditos prepagados + cola) → worker Remotion en VPS de $10 → Cloudflare R2 (egreso $0).

## 💡 Hallazgos clave de la investigación de competidores

- **La queja #1 del mercado son los créditos opacos** (InVideo, Canva, Predis): vender "sin créditos, límites claros" es una feature.
- **El español es ciudadano de segunda en todas** las herramientas grandes: español-first es EL hueco.
- **Carruseles = costo marginal ~$0** (lo que hace esta app); el video procesado es el único costo real — limita solo eso.
- Diferenciadores baratos que nadie tiene: calendario de festividades hispanas, flujo de aprobación por WhatsApp, packs por vertical (salón de uñas, barbería, taquería…).
