# GitHub Pro 🐙

Aplicativo para **aprender Git y GitHub de cero a avanzado**: 7 módulos y 14 lecciones con teoría,
quiz y práctica en una **terminal de Git simulada** en el navegador. Sin dependencias: HTML, CSS y
JavaScript puros, listo para publicarse en GitHub Pages.

## Ejecutar en local

```bash
python3 serve.py           # http://localhost:8080
# o cualquier servidor estático:
python3 -m http.server -d docs 8080
```

## Publicar en GitHub Pages

Settings → Pages → *Deploy from a branch* → rama `main`, carpeta `/docs`.
La app quedará en `https://<usuario>.github.io/github-pro/`.

## Contenido

| Módulo | Lecciones |
|---|---|
| 1. Fundamentos | Qué son Git y GitHub · Instalar y configurar |
| 2. Tu primer repositorio | init/add/commit · status, diff y .gitignore |
| 3. Ramas y fusiones | Crear y cambiar de rama · merge, conflictos y rebase |
| 4. Trabajar con GitHub | Crear repo y push · Fork, clone y open source |
| 5. Pull Requests y revisión | PRs de principio a fin · Issues, Projects y Discussions |
| 6. Automatización | GitHub Actions (CI/CD) · Pages, Releases y Packages |
| 7. Git avanzado | Deshacer (reset, revert, reflog, stash) · Flujos y buenas prácticas |

Además: **glosario** con buscador, **chuleta de comandos** y **terminal libre** para practicar.

## Características

- Progreso, XP y racha diaria guardados en `localStorage` (por navegador).
- Tema claro/oscuro.
- Terminal simulada (`docs/js/gitsim.js`) que implementa: `init, clone, status, add, commit, log, diff,
  branch, switch/checkout, merge, rebase, remote, push, pull, fetch, restore, reset, revert, stash,
  tag, cherry-pick, reflog` y comandos de shell básicos (`ls, touch, echo >, cat, rm`).
- Cada práctica valida tus comandos contra el estado real del simulador, no contra texto exacto.

## Estructura

```
docs/
  index.html        # app
  css/style.css
  js/lessons.js     # contenido del curso (módulos, quizzes, prácticas, glosario, chuleta)
  js/gitsim.js      # simulador de Git
  js/app.js         # enrutado, progreso, quiz, terminal
serve.py            # servidor local
swarmcast/          # SwarmCast: simulador de predicción multiagente (proyecto anterior)
```

Para añadir una lección basta con agregar un objeto en `docs/js/lessons.js` con `content` (HTML),
`quiz` y opcionalmente `practice` con tareas `check(state, history)`.

---

## SwarmCast (proyecto anterior)

Motor de predicción por simulación multiagente inspirado en MiroFish. `python3 -m swarmcast.server`
(http://localhost:8000) y `python3 -m unittest discover -s tests`. Opcional: `ANTHROPIC_API_KEY` u
`OPENAI_API_KEY` para el informe y el chat con agentes.
