# GitHub PRO 🐙

App formativa Android (familia **Experto/PRO**: Flutter + WebView + TTS) para convertirte en **experto en Git y GitHub** aunque no seas programador de formación: cómo piensa Git por dentro, el ciclo diario de commits y ramas, pull requests y revisión de código, GitHub Actions, publicación con Pages y releases, seguridad del repositorio y el flujo de trabajo con **Claude Code**, Copilot y la CLI `gh`. Funciona sin internet.

## Qué trae

- **12 áreas y 55 lecciones** con audio en todo (lección completa o por sección), ideas previas marcables, secciones con tablas y ejemplos, errores que cuestan horas, comandos y rutas clave, puntos clave, fichas de repaso y autoevaluación. Cierra con tres casos completos y un **examen integrador** de 20 preguntas.
- **Terminal Git simulada** con 9 retos guiados que verifican el estado real del repositorio simulado (init, ciclo diario, ramas, merge, primer push, fork, deshacer, recuperar tras reset, etiquetar versión).
- **Herramientas**: ficha del proyecto (rellena todas las plantillas), buscador de comandos (por lo que quieres hacer, con nivel de riesgo), generador de `.gitignore`, constructor de workflow de Actions (CI, Pages, release, APK, labeler), **SOS Git** (18 situaciones de "algo salió mal" con pasos), checklists (commit, push, PR, revisión, release, repo público, pedir a Claude Code), plantillas (README, PR, issues, commit, release, CODEOWNERS, CLAUDE.md, CONTRIBUTING, dependabot) y glosario con 80+ términos.

## Ejecutar la versión web

La app web vive en `assets/web/` y funciona sola en cualquier navegador (la voz usa `speechSynthesis` cuando no está el shell Flutter):

```bash
python3 -m http.server 8080 -d assets/web
# http://localhost:8080
```

También se publica en GitHub Pages con el workflow `.github/workflows/pages.yml` (Settings → Pages → Source: GitHub Actions).

## Construir el APK

Requiere Flutter (canal stable) y Java 17. Puerto del servidor local: **9048**; applicationId `com.alfonso.githubpro`.

```bash
flutter pub get
dart run flutter_launcher_icons        # regenera los iconos desde assets/icon/
dart run flutter_native_splash:create  # regenera el splash
flutter build apk --release
```

## Validar el contenido

```bash
node scripts/validar.js            # las 55 lecciones: sintaxis, campos, catálogo, tamaño, HTML permitido, quiz
node scripts/validar.js <id>       # una lección
node scripts/probar-web.js         # prueba de navegador (playwright-core + Chromium)
```

## Cómo se escribe una lección

Cada lección es un archivo `assets/web/lessons/<id>.js` con una sola llamada `Lesson.start({...})` (formato exacto en `_brief/brief.md`, contenido obligatorio por lección en `_brief/anclas.md`). El catálogo está en `assets/web/assets/catalog.js`. La lección modelo es `init-add-y-commit.js`.

## Estructura

```
assets/web/            app web (index, lesson, lessons/, assets/, herramientas)
assets/web/assets/     engine.js (motor + TTS), catalog.js, tools.js, gitsim.js (simulador), glosario.js, styles.css
lib/main.dart          shell Flutter: servidor local + WebView + TTS
android/               proyecto Android
scripts/               validar.js, probar-web.js
_brief/                brief, anclas y lotes para los redactores
.github/workflows/     ci.yml (valida lecciones), pages.yml (publica en Pages)
```

Los repositorios y personas de los ejemplos son ficticios. La interfaz de GitHub, sus planes y límites cambian: verifica en docs.github.com. La app no se conecta a GitHub, no llama a ninguna API y no guarda claves.
