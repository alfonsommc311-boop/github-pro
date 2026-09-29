# GitHub PRO

App formativa Android (familia Experto/PRO) para convertirse en **experto en Git y GitHub**: cómo funciona Git por dentro, el ciclo diario de commits y ramas, colaboración con pull requests y revisión, GitHub Actions, publicación (Pages, releases, paquetes), seguridad del repositorio y el flujo de trabajo con **Claude Code**, Copilot y la CLI `gh`. Incluye una **terminal Git simulada** con retos guiados. Clon estructural de Decisiones PRO (mismo motor `Lesson.start`, mismo shell Flutter + WebView + TTS).

Reglas de este proyecto:
- Usa el skill `app-formativa-flutter` para el ciclo completo. Puerto **9051** (verificar en `ports.md` que esté libre antes de compilar), applicationId `com.alfonso.githubpro`, prefijo de storage `gh`.
- Fuentes: `_brief/brief.md` (reglas de rigor y formato), `_brief/anclas.md` (contenido por lección), `_brief/lotes.md` (estado de los lotes). Catálogo en `assets/web/assets/catalog.js` (12 áreas, 55 lecciones).
- **Todo comando debe ser real y correcto**; nada de flags inventados. La interfaz web de GitHub se describe por nombres en inglés y toda lección remite a verificar en docs.github.com. Nunca cifras de límites ni precios.
- Repos de ejemplo ficticios: `alfonsommc311-boop/metrados-pro`, `word-mcp`, `cotizador-web`; personas ficticias (Rocío, Mateo). Cero personas o empresas reales señaladas.
- Si un ejemplo sube una clave, la lección dice que hay que **revocarla**: borrarla en un commit posterior no la saca de la historia. Nunca enseñar a saltarse protecciones sin explicar riesgo y alternativa segura.
- Carpeta ASCII sin tildes ni ñ (Gradle). Prosa con tildes. Scripts de Python en archivos, no en `python -c`.
- Validar siempre con `node scripts/validar.js` (todas) o `node scripts/validar.js <id>`; la prueba de navegador es `node scripts/probar-web.js` (requiere `playwright-core` y Chromium).
- Al terminar: `ports.md` a HECHA, fila en `LINAJE` de `apps_db.py`, `apps_db.py construir` e `indexar`, y nota en la memoria del proyecto.

Estructura:
- `assets/web/` app web completa (funciona sola en cualquier navegador y en GitHub Pages): `index.html`, `lesson.html`, `lessons/*.js`, `assets/{engine,catalog,tools,glosario,gitsim,styles}.js|css`, herramientas `terminal.html`, `comandos.html`, `gitignore.html`, `workflow.html`, `sos.html`, `checklist.html`, `plantillas.html`, `glosario.html`, `herramientas.html`.
- `lib/main.dart` shell Flutter (InAppLocalhostServer + WebView + flutter_tts). `android/` proyecto Android. `assets/icon/` iconos fuente (regenerar con `dart run flutter_launcher_icons` y `dart run flutter_native_splash:create`).
- `scripts/validar.js` validador de lecciones; `scripts/probar-web.js` prueba de navegador.
- `.github/workflows/ci.yml` valida lecciones en cada push y PR; `pages.yml` publica `assets/web` en GitHub Pages.
