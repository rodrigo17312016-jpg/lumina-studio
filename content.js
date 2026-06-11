/* ============================================================
   LUMINA STUDIO — content.js
   Motor de contenido: banco de hooks, fórmulas, prompt de IA
   y carruseles demo. Producido con investigación de copywriting
   para el mercado hispano (ES + LATAM).
   ============================================================ */

window.LUMINA_CONTENT = {
  hooksBank: [
    "Nadie te cuenta esto sobre {tema}",
    "El error #1 que cometes con {tema}",
    "5 cosas de {tema} que aprendí tarde",
    "Deja de hacer esto con {tema}",
    "La verdad incómoda sobre {tema}",
    "¿Por qué nadie habla de esto en {tema}?",
    "Antes vs después de dominar {tema}",
    "Lo que los expertos callan sobre {tema}",
    "3 mitos de {tema} que te están frenando",
    "Guarda esto si te interesa {tema}",
    "Probé {tema} 30 días y esto pasó",
    "El 90% falla en {tema} por esto",
    "¿Estás cometiendo este error con {tema}?",
    "{tema} explicado en 60 segundos",
    "No empieces con {tema} sin leer esto",
    "Esto cambió mi forma de ver {tema}",
    "La regla de oro de {tema}",
    "7 señales de que haces mal {tema}",
    "Por esto tu {tema} no funciona",
    "Lo que haría distinto si empezara {tema} hoy",
    "Opinión impopular sobre {tema}",
    "Esto pasa cuando ignoras {tema}",
    "{tema}: hazlo así y nota la diferencia",
    "Creía que sabía de {tema}, hasta que vi esto",
    "El secreto de {tema} que cambia las reglas",
  ],

  formulas: [
    { name: "PAS: Problema, Agitación, Solución", structure: "Slide 1: hook que nombra el problema que la audiencia ya siente · Slide 2: agitar el problema con consecuencias concretas · Slides 3-5: la solución paso a paso, una acción clara por slide · Slide 6: prueba o resultado (dato, antes/después) · Slide final: CTA directa." },
    { name: "Listicle de valor", structure: "Slide 1: hook con número que promete valor concreto · Slides 2-6: un tip por slide con título corto y body accionable (el qué + el cómo) · Slide final: recap en una línea + CTA de guardar y seguir." },
    { name: "Mito vs Realidad", structure: "Slide 1: hook polémico suave con el mito más extendido · Slides 2-6: cada slide desmonta un mito (kicker: MITO 0X) con la realidad apoyada en un dato · Slide final: CTA invitando a comentar qué mito creían cierto." },
    { name: "Historia antes/después", structure: "Slide 1: hook con el resultado final (cómo pasé de X a Y) · Slide 2: el antes con detalle emocional · Slide 3: el momento de quiebre · Slides 4-5: qué cambió exactamente, acciones replicables · Slide 6: el después medible · Slide final: CTA." },
    { name: "Error, consecuencia, corrección", structure: "Slide 1: hook tipo el error que sabotea tu {tema} · Slides 2-6: cada slide expone un error (kicker: ERROR 0X), por qué duele y la corrección inmediata · Slide final: CTA de guardar como checklist." },
  ],

  aiSystemPrompt: `Eres un copywriter senior especializado en carruseles de Instagram para el mercado hispanohablante (España y LATAM). Recibirás cuatro datos: tema, audiencia, tono y número de slides. Tu única tarea es generar el contenido completo del carrusel.

FORMATO DE SALIDA (OBLIGATORIO)
Devuelve EXCLUSIVAMENTE un objeto JSON válido, sin ningún texto antes ni después, sin markdown, sin bloques de código, sin comentarios y sin explicaciones. La estructura exacta es:
{"slides":[{"role":"cover|content|cta","kicker":"...","title":"...","body":"..."}],"caption":"..."}
Cada slide debe incluir siempre las cuatro claves: role, kicker, title y body. La clave role solo admite: cover, content o cta.

REGLAS DE ESTRUCTURA
1. El array slides debe contener exactamente el número de slides solicitado.
2. La primera slide siempre tiene role cover: su title es un hook potente que genera curiosidad, tensión o promesa concreta; su body invita a deslizar.
3. La última slide siempre tiene role cta: una sola llamada a la acción concreta (guardar, comentar una palabra clave, compartir, DM o link en bio). Nunca dos CTAs.
4. Todas las slides intermedias tienen role content y cada una desarrolla UNA sola idea clara, específica y accionable. Nada de generalidades.

LÍMITES DE CARACTERES (ESTRICTOS, CUENTA ANTES DE RESPONDER)
- kicker: máximo 24 caracteres. Etiqueta corta en mayúsculas (ej: SECRETO 01, PASO 03).
- title: máximo 60 caracteres. Debe entenderse por sí solo.
- body: máximo 140 caracteres. Da el cómo, el dato o el ejemplo; no repitas el title.
Si algún texto supera su límite, reescríbelo más corto antes de responder.

REGLAS DE ESTILO
- Español neutro, comprensible en España y toda LATAM. Evita modismos locales salvo que la audiencia lo justifique.
- Prohibido usar emojis en title y kicker. En body máximo 1 emoji y solo si aporta.
- Usa únicamente comillas rectas ("). Prohibidas las comillas tipográficas.
- Adapta vocabulario al tono indicado (lujo elegante = frases pulidas y sensoriales; motivador directo = imperativos cortos; educativo cercano = claridad y ejemplos numéricos).
- Contenido real y útil: cifras, plazos, pasos, ejemplos concretos. Prohibido el relleno tipo "la constancia es clave" sin un cómo.

REGLAS DEL CAPTION
- Entre 300 y 600 caracteres.
- Refuerza la idea central con voz propia, no repitas los titles.
- Incluye exactamente UNA pregunta para provocar comentarios.
- Incluye una micro-CTA de guardar o compartir.
- Cierra con 5 a 8 hashtags relevantes del nicho, en minúsculas, separados por espacios.

VALIDACIÓN FINAL ANTES DE RESPONDER
Verifica en silencio: (1) JSON parseable con claves exactas; (2) número de slides correcto; (3) primera cover y última cta; (4) límites de caracteres respetados; (5) cero emojis en titles y kickers; (6) caption con una sola pregunta y 5-8 hashtags; (7) sin comillas tipográficas. Solo entonces responde. Tu salida es únicamente el JSON.`,

  demoCarousels: [
    {
      name: "5 secretos para que tu manicura dure el doble",
      brand: { name: "Yemi Nails Studio", handle: "yeminails.studio" },
      caption: "Una manicura impecable no termina cuando sales del estudio: empieza ahí. Estos 5 gestos marcan la diferencia entre retocar a la semana o presumir de uñas perfectas durante semanas. ¿Cuál de estos secretos vas a probar primero? Guarda este post para tu próxima manicura y compártelo con esa amiga que siempre llega con un chip. #manicurabarcelona #nailsbarcelona #uñasdegel #manicurasemipermanente #cuidadodeuñas #nailcare #beautybarcelona",
      slides: [
        { role: "cover", kicker: "YEMI NAILS STUDIO", title: "5 secretos para que tu manicura dure el doble", body: "Los trucos que usamos en cabina y que casi nadie aplica en casa. Desliza y toma nota. ✨" },
        { role: "content", kicker: "SECRETO 01", title: "Hidrata la cutícula cada noche", body: "Una gota de aceite de jojoba cada noche evita que el esmalte se levante desde el borde. 30 segundos que alargan tu manicura días." },
        { role: "content", kicker: "SECRETO 02", title: "Guantes para fregar, sin excusas", body: "Los detergentes debilitan el gel y resecan la piel. Ponte guantes para fregar y limpiar: tu esmalte lo notará desde el primer día." },
        { role: "content", kicker: "SECRETO 03", title: "Tus uñas no son herramientas", body: "Abrir latas, despegar etiquetas, rascar... cada microimpacto crea fisuras que acaban en rotura. Usa la yema, no la uña." },
        { role: "content", kicker: "SECRETO 04", title: "Sella el borde libre cada 3 días", body: "Aplica una capa fina de top coat sellando el borde libre. Es la barrera invisible que protege el color del desgaste diario." },
        { role: "content", kicker: "SECRETO 05", title: "Evita el calor extremo 24 horas", body: "Sauna, bañera muy caliente o agua ardiendo las primeras 24 h dilatan la capa de gel y acortan su vida. Dale ese margen a tu esmalte." },
        { role: "cta", kicker: "RESERVA TU CITA", title: "Tu manicura merece manos expertas", body: "Reserva en nuestro estudio de Barcelona y déjalo en manos expertas. Link en bio o escríbenos por WhatsApp. 💅" },
      ],
    },
    {
      name: "5 hábitos que transforman tu cuerpo",
      brand: { name: "Coach Fit", handle: "coach.fit" },
      caption: "La transformación no es un sprint de enero, es un sistema que aguanta todo el año. Estos 5 hábitos no son glamurosos, pero son los que de verdad mueven la aguja cuando la motivación desaparece. ¿Cuál de los 5 te cuesta más mantener? Te leo en comentarios. Guarda este post para releerlo el día que quieras tirar la toalla. #fitness #habitossaludables #entrenamiento #vidasana #gimnasio #entrenadorpersonal #motivacionfitness",
      slides: [
        { role: "cover", kicker: "HÁBITOS REALES", title: "No necesitas motivación, necesitas estos 5 hábitos", body: "Lo que separa a quien se transforma de quien abandona en febrero. Desliza y guarda este post. 🔥" },
        { role: "content", kicker: "HÁBITO 01", title: "Entrena corto, pero entrena siempre", body: "20 minutos 4 veces por semana ganan a 2 horas una vez al mes. La constancia construye el cuerpo, no las sesiones heroicas." },
        { role: "content", kicker: "HÁBITO 02", title: "Proteína en cada comida", body: "Apunta a 1,6-2 g por kilo de peso al día: huevos, pollo, pescado, legumbres, yogur griego. Sin proteína no hay músculo." },
        { role: "content", kicker: "HÁBITO 03", title: "Camina 8.000 pasos al día", body: "El gasto fuera del gym importa más de lo que crees. Bájate una parada antes, sube escaleras, haz llamadas caminando." },
        { role: "content", kicker: "HÁBITO 04", title: "Duerme 7-8 horas, en serio", body: "Dormir poco dispara el hambre y frena tu recuperación. El músculo se construye en la cama, no solo en el gym." },
        { role: "content", kicker: "HÁBITO 05", title: "Agenda tus entrenos como reuniones", body: "Lo que no está en el calendario no existe. Decide hoy qué días entrenas esta semana y trátalos como citas innegociables." },
        { role: "cta", kicker: "DA EL PASO", title: "El segundo mejor momento es hoy", body: "Escríbeme PLAN por DM y te mando una rutina inicial gratis adaptada a tu nivel. Tu yo de dentro de 90 días te lo agradecerá. 💪" },
      ],
    },
    {
      name: "Cómo empezar a invertir con 50 € al mes",
      brand: { name: "Finanzas Claras", handle: "finanzas.claras" },
      caption: "Invertir no va de adivinar la próxima acción estrella, va de un sistema simple repetido durante años. Con 50 euros al mes y estos 5 pasos ya estás por delante de la mayoría que sigue esperando el momento perfecto. ¿Ya tienes tu fondo de emergencia o todavía estás en ello? Cuéntame en comentarios. Guarda esta guía: es la hoja de ruta que me habría gustado tener al empezar. #finanzaspersonales #ahorro #inversion #educacionfinanciera #interescompuesto #fondosindexados #libertadfinanciera",
      slides: [
        { role: "cover", kicker: "FINANZAS CLARAS", title: "Cómo empezar a invertir con 50 € al mes", body: "No necesitas ser rico para empezar: necesitas empezar para llegar. Guía básica en 5 pasos, sin humo. 📊" },
        { role: "content", kicker: "PASO 01", title: "Primero, tu colchón de emergencia", body: "Antes de invertir un euro, junta 3-6 meses de gastos en una cuenta aparte. Evita vender tus inversiones en el peor momento." },
        { role: "content", kicker: "PASO 02", title: "Mata las deudas caras antes", body: "Una tarjeta al 20% de interés es una inversión garantizada... en tu contra. Liquidarla rinde más que cualquier fondo." },
        { role: "content", kicker: "PASO 03", title: "Fondos indexados: simple y diversificado", body: "Replican índices como el S&P 500 con comisiones bajas (menos del 0,5%). Una sola compra, miles de empresas." },
        { role: "content", kicker: "PASO 04", title: "El interés compuesto hace el resto", body: "100 € al mes al 7% anual son unos 52.000 € en 20 años. Solo habrías aportado 24.000. El tiempo trabaja para ti." },
        { role: "content", kicker: "PASO 05", title: "Automatiza y olvídate del ruido", body: "Programa una transferencia automática el día que cobras. Si no pasa por tus manos, no lo gastas. Invertir aburrido funciona. 💸" },
        { role: "cta", kicker: "SÍGUENOS", title: "Tu yo del futuro te lo agradecerá", body: "Sígueme para aprender finanzas sin tecnicismos y guarda este post. Nota: esto es educación, no asesoramiento." },
      ],
    },
  ],
};
