# Brief para los agentes redactores — GitHub PRO

App formativa Android (familia Experto/PRO, Flutter + WebView + TTS) que enseña **Git y GitHub de cero a experto**: cómo funciona Git por dentro, el ciclo diario de commits y ramas, la colaboración en GitHub (pull requests, issues, revisión), la automatización con GitHub Actions, la publicación (Pages, releases, paquetes), la seguridad del repositorio y el flujo de trabajo con **Claude Code**, Copilot y la CLI `gh`. Formato `Lesson.start`, reglas de HTML y de comillas idénticos a las apps hermanas (Decisiones PRO, Riesgos Obra PRO). Lo que cambia está aquí.

## El lector
Alfonso: ingeniero civil colegiado, residente y supervisor de obras públicas municipales, que **construye aplicativos con Claude Code** (apps formativas Flutter + WebView, servidores MCP para AutoCAD, Civil 3D, ArcGIS, Word, Power Query) y los guarda en GitHub bajo el usuario `alfonsommc311-boop`. No es programador de formación: ha aprendido usando. Sabe hacer commit y push porque Claude Code lo hace por él; **quiere entender qué pasa por debajo, dejar de tener miedo a romper algo, y usar GitHub como un profesional**: ramas, pull requests, revisión, Actions, Pages, releases con APK, seguridad. Explica siempre el porqué, con ejemplos de SUS proyectos (una app formativa Flutter, un servidor MCP en Python, un cotizador web).

## Qué distingue a esta app (no lo pierdas)
- Enseña **el oficio completo de GitHub**, no solo comandos: cada lección conecta el comando con la situación real en la que se usa y con lo que se ve en la web de GitHub.
- Lema: **casi nada se pierde en Git; lo que se pierde es la calma.** Y su pareja: **un commit pequeño con buen mensaje vale más que diez "cambios varios".**
- El hilo Claude Code: el lector trabaja con un asistente que crea ramas `claude/...`, hace commits con coautoría y abre PR. Las lecciones muestran cómo entender y supervisar ese flujo (revisar el diff, pedir cambios, fusionar), no cómo reemplazarlo.
- Tiene una **terminal Git simulada** dentro de la app (herramienta "Terminal") con retos guiados: cuando una lección enseñe comandos, remite a practicarlos allí ("practica este flujo en la Terminal de esta app").

## REGLAS DE RIGOR (obligatorias)
1. **Todo comando debe ser real y correcto** en Git 2.4x y GitHub actual. Nada de flags inventados. Si dudas de un flag exacto, usa la forma que conoces con certeza o descríbelo por concepto. Prefiere los comandos modernos (`git switch`, `git restore`) y menciona el clásico (`git checkout`) como equivalente.
2. **La interfaz web de GitHub cambia.** Las rutas de pantallas se describen por su nombre en inglés tal como aparecen (Settings → Branches, Actions, Releases) y toda lección remite, en el campo `norma` y al menos una vez en el cuerpo, a **verificar en la documentación oficial (docs.github.com) porque la interfaz y los planes cambian**.
3. **Nunca inventes cifras ni límites** (minutos gratis de Actions, tamaños máximos, precios). Si los mencionas, di "según la documentación vigente" sin número, o "verifica los límites del plan".
4. **Todo ejemplo es ilustrativo y usa repos ficticios** del propio lector: `alfonsommc311-boop/metrados-pro` (app formativa Flutter), `alfonsommc311-boop/word-mcp` (servidor MCP en Python), `alfonsommc311-boop/cotizador-web` (sitio estático). Cero personas o empresas reales señaladas; nombres de compañeros ficticios (Rocío, Mateo).
5. **Seguridad**: nunca enseñes a saltarte protecciones (force push a main, desactivar checks, borrar historia ajena) sin explicar el riesgo y la alternativa segura (`--force-with-lease`, revert). Si el ejemplo sube una clave por error, la lección debe decir que **borrarla en un commit posterior no la elimina de la historia: hay que revocarla**.
6. **Sobre Claude Code, Copilot y la IA**: se describen las capacidades que el lector ya usa (ramas `claude/`, commits con `Co-Authored-By`, PR abiertos por el asistente, revisión automática) sin prometer resultados ("el asistente puede equivocarse; el diff lo revisa una persona").
7. **Prohibido inventar historia**: autores y fechas solo los seguros (Linus Torvalds creó Git en 2005; GitHub nació en 2008; Microsoft lo adquirió en 2018). Nada más de fechas.
8. Si no estás seguro de un número, un flag o un procedimiento exacto, descríbelo sin inventar y remite a verificar en docs.github.com.

## FORMATO EXACTO de cada lección
Un archivo `assets/web/lessons/<id>.js` con UNA sola llamada `Lesson.start({...})`, JS válido. Extensión objetivo **10 a 14 KB** (nunca más de 20 KB). Escríbelo en **DOS pasos**: (1) `Write` con todo hasta el cierre de `sections` terminando en `  ],\n});` y (2) `Edit` que reemplaza ese cierre `  ],\n});` por `  ],\n  errors: [...], commands: [...], keypoints: [...], flashcards: [...], quiz: [...]\n});`. Así ningún mensaje supera ~12 KB.

```
Lesson.start({
  id: '<id>', area: '<ÁREA EXACTA DEL CATÁLOGO>', areaIcon: '<ICONO EXACTO DEL ÁREA>', icon: '<ICONO DE LA LECCIÓN>',
  title: '<título>',
  subtitle: '<frase que engancha, ~10 palabras>',
  norma: '<una frase: regla de oro de la lección; termina remitiendo a verificar en docs.github.com porque la interfaz cambia>',
  intro: '<p>3-5 frases: qué es y POR QUÉ importa a quien construye y publica sus propios aplicativos.</p>',
  materials: [ { t: '...', d: '...' }, ... ],       // 3 a 4 ideas previas ("Antes de empezar: ten esto claro")
  sections: [ { h: '...', html: '...' }, ... ],      // 5 a 6 secciones; al menos una tabla; un ejemplo concreto con un repo ficticio del lector; el contraste "sin método / con método"
  errors: [ { bad: '...', fix: '...' }, ... ],       // 3 a 4 errores que cuestan horas, con su corrección
  commands: [ { eq: '...', desc: '...' }, ... ],     // 2 a 6 comandos o rutas de la web (omite el bloque si la lección no tiene comandos)
  keypoints: [ ... ],                               // 5 a 6 frases memorizables
  flashcards: [ { q: '...', a: '...' }, ... ],      // 4 a 5
  quiz: [ { q: '...', opts: ['...','...','...'], correct: <0|1|2>, why: '...' }, ... ]   // 3 a 4 (el examen integrador: 20)
});
```
- `id` == nombre del archivo. `area`, `areaIcon` e `icon` == exactamente los de `assets/web/assets/catalog.js` (cópialos, no los reescribas de memoria). `title` puede ser el `t` del catálogo.
- HTML permitido SOLO: `<p> <b> <ul><li> <ol><li> <table><tr><th><td> <span class="hl"> <code>` (también `<i>`, `<br>`). Los comandos dentro del texto van en `<code>`. Nada de script/style/clases inventadas/SVG. NO uses `steps`, `fig` ni `formulas`.
- Cadenas JS con comilla SIMPLE; HTML con comillas dobles en atributos. **Evita apóstrofes** (en español casi no hacen falta); si uno es imprescindible, escápalo como `\'`. **Prohibidas las comillas tipográficas curvas** (“ ” ‘ ’): usa comillas rectas dobles `"` para citar dentro de texto.
- **Prosa CON tildes, ñ y signos ¿ ¡.** Escribir sin tildes se considera error grave.
- Termina con `});` sin markdown ni texto fuera del objeto.

## Estilo y pedagogía
- Español peruano, técnico y didáctico, sobrio. Explica SIEMPRE el porqué (qué hace Git por dentro), no solo el comando.
- Cada lección incluye: (a) al menos una tabla útil (comparativa, pasos, comandos, síntomas y remedios), (b) un ejemplo concreto con un repo ficticio del lector (metrados-pro, word-mcp, cotizador-web) con nombres de ramas, mensajes de commit y salidas de comandos plausibles, (c) un error típico de quien aprende usando, (d) cuando sirva, el contraste "lo que Claude Code hace por ti" frente a "lo que debes entender y revisar tú".
- Resalta lo esencial con `<span class="hl">`. Nada de relleno ni frases motivacionales vacías.
- Quiz: 3-4 preguntas, la primera conceptual y al menos una de SITUACIÓN práctica ("hiciste X y aparece Y; ¿qué haces?"); distractores plausibles; **reparte `correct` entre 0, 1 y 2**. `why` explica el fundamento.
- Flashcards: pregunta corta, respuesta breve y correcta.
- Puedes mencionar las herramientas de esta app: Terminal Git simulada (retos guiados), Buscador de comandos, Generador de .gitignore, Constructor de workflow de Actions, SOS Git (diagnóstico de situaciones), Checklist (antes de commit, push, PR, release), Plantillas (README, PR, issue, commit, release) y Glosario.

## Proceso del agente
1. Lee este brief y `_brief/anclas.md` (bullets de contenido que DEBES cubrir por lección).
2. Lee tus lecciones en `assets/web/assets/catalog.js` (copia `area`, `areaIcon`, `icon` y título exactos).
3. Lee la lección modelo `assets/web/lessons/init-add-y-commit.js` con Read: **es el PATRÓN EXACTO en estructura, extensión y tono; no entregues nada inferior.**
4. Escribe cada lección con Write (+ Edit para el cierre). PROHIBIDO lanzar sub-agentes.
5. Autocomprobación: `node scripts/validar.js <id>` desde la raíz del repo no debe reportar errores.
6. Responde SOLO con la lista de archivos creados y el resultado del validador.
