/* GitHub PRO - catalogo (12 areas, 55 lecciones). Ids unicos, kebab-case ASCII. Sin apostrofes dentro de las cadenas. */
var CATALOG = [
  {
    area: 'Fundamentos: qué son Git y GitHub', icon: '🌱', acc: 'a1',
    desc: 'Qué problema resuelven, cómo piensa Git por dentro y cómo dejar tu máquina y tu cuenta listas para trabajar.',
    lessons: [
      { id: 'que-son-git-y-github', icon: '🐙', t: 'Qué son Git y GitHub', d: 'Control de versiones frente a plataforma de colaboración: dos cosas distintas que se complementan.' },
      { id: 'como-piensa-git', icon: '🧠', t: 'Cómo piensa Git: instantáneas y hashes', d: 'Commits como fotos completas, identificados por un hash; por qué casi nada se pierde.' },
      { id: 'las-tres-zonas-de-git', icon: '🗂️', t: 'Las tres zonas: árbol, stage y repositorio', d: 'El modelo mental que evita el 80 por ciento de las confusiones con add, commit y restore.' },
      { id: 'instalar-y-configurar-git', icon: '🛠️', t: 'Instalar y configurar Git', d: 'Instalación en Windows, nombre y correo, rama por defecto, editor y alias útiles.' },
      { id: 'tu-cuenta-y-perfil-de-github', icon: '👤', t: 'Tu cuenta y perfil de GitHub', d: 'Nombre de usuario, verificación en dos pasos, correo verificado y un README de perfil que hable por ti.' }
    ]
  },
  {
    area: 'Tu primer repositorio', icon: '📦', acc: 'a2',
    desc: 'El ciclo diario: crear el repo, preparar cambios, confirmarlos con mensajes que sirvan y saber qué no subir jamás.',
    lessons: [
      { id: 'init-add-y-commit', icon: '📝', t: 'init, add y commit', d: 'El flujo básico paso a paso con un proyecto real: de carpeta vacía a primera historia.' },
      { id: 'mensajes-de-commit-que-sirven', icon: '💬', t: 'Mensajes de commit que sirven', d: 'Imperativo, corto, un cambio por commit y la convención Conventional Commits.' },
      { id: 'status-diff-y-log', icon: '🔍', t: 'status, diff y log', d: 'Leer el estado del repo y su historia sin adivinar: los tres comandos que se usan cien veces al día.' },
      { id: 'gitignore-y-que-no-subir', icon: '🚫', t: '.gitignore y qué no subir jamás', d: 'Dependencias, compilados, claves y datos personales: patrones y plantillas por lenguaje.' },
      { id: 'deshacer-antes-del-commit', icon: '↩️', t: 'Deshacer antes del commit', d: 'restore, restore --staged y amend: corregir sin miedo mientras nada se ha compartido.' }
    ]
  },
  {
    area: 'Ramas y fusiones', icon: '🌿', acc: 'a3',
    desc: 'Trabajar en paralelo sin romper lo que funciona: crear ramas, fusionarlas, resolver conflictos y decidir entre merge y rebase.',
    lessons: [
      { id: 'que-es-una-rama', icon: '🔀', t: 'Qué es una rama de verdad', d: 'Un puntero a un commit, HEAD y por qué crear ramas es gratis.' },
      { id: 'crear-cambiar-y-borrar-ramas', icon: '🌱', t: 'Crear, cambiar y borrar ramas', d: 'switch, checkout, branch y las convenciones de nombres que ordenan un proyecto.' },
      { id: 'merge-fast-forward-y-de-tres-vias', icon: '🔗', t: 'Merge: fast-forward y de tres vías', d: 'Qué hace Git al fusionar, cuándo crea un commit de merge y qué significa --no-ff.' },
      { id: 'resolver-conflictos', icon: '⚡', t: 'Resolver conflictos sin pánico', d: 'Leer los marcadores, decidir con criterio, probar y cerrar el merge o abortarlo.' },
      { id: 'rebase-y-cuando-no-usarlo', icon: '🧹', t: 'Rebase y cuándo no usarlo', d: 'Historia lineal a cambio de reescribir hashes: la regla de oro de la historia compartida.' }
    ]
  },
  {
    area: 'Trabajar con GitHub: remotos', icon: '☁️', acc: 'a4',
    desc: 'Conectar tu repo local con GitHub, autenticarte sin contraseñas, sincronizar con otros y contribuir a proyectos ajenos.',
    lessons: [
      { id: 'crear-un-repo-y-primer-push', icon: '🚀', t: 'Crear un repo en GitHub y hacer el primer push', d: 'remote add, push -u y las dos formas de empezar: desde local o clonando.' },
      { id: 'clone-fetch-pull-y-push', icon: '🔄', t: 'clone, fetch, pull y push', d: 'Sincronizar sin perder trabajo: qué hace cada comando y qué pasa cuando el push es rechazado.' },
      { id: 'autenticacion-token-ssh-y-gh', icon: '🔐', t: 'Autenticación: token, SSH y gh', d: 'GitHub no acepta contraseñas: personal access tokens, claves SSH y GitHub CLI.' },
      { id: 'fork-y-upstream', icon: '🍴', t: 'Fork y upstream', d: 'Contribuir donde no tienes permisos: fork, rama, PR y mantener tu copia al día.' },
      { id: 'readme-licencia-y-archivos-de-comunidad', icon: '📄', t: 'README, licencia y archivos de comunidad', d: 'Lo que un repo serio lleva en la raíz y por qué un repo sin licencia no es libre.' }
    ]
  },
  {
    area: 'Pull Requests y revisión de código', icon: '🔍', acc: 'a5',
    desc: 'El corazón de la colaboración en GitHub: proponer cambios, revisarlos con criterio y fusionarlos con la estrategia correcta.',
    lessons: [
      { id: 'anatomia-de-un-pull-request', icon: '🧩', t: 'Anatomía de un pull request', d: 'Conversación, commits, checks y archivos: qué hay en cada pestaña y para qué sirve.' },
      { id: 'escribir-un-buen-pr', icon: '✍️', t: 'Escribir un buen PR', d: 'Tamaño, título, descripción con qué, por qué y cómo probar; borradores y palabras clave que cierran issues.' },
      { id: 'revisar-codigo-con-criterio', icon: '🧐', t: 'Revisar código con criterio', d: 'Comment, approve y request changes; sugerencias aplicables y cómo dar feedback útil.' },
      { id: 'estrategias-de-merge', icon: '🧬', t: 'Merge, squash o rebase al fusionar', d: 'Qué historia deja cada botón y cuál conviene según el proyecto.' },
      { id: 'ramas-protegidas-y-codeowners', icon: '🛡️', t: 'Ramas protegidas y CODEOWNERS', d: 'Reglas que impiden romper main: revisiones obligatorias, checks y dueños por carpeta.' }
    ]
  },
  {
    area: 'Issues, Projects y organización del trabajo', icon: '🗂️', acc: 'a6',
    desc: 'Registrar bugs e ideas de forma que se resuelvan, planificar con tableros y mantener la conversación ordenada.',
    lessons: [
      { id: 'issues-que-se-resuelven', icon: '🐞', t: 'Issues que se resuelven', d: 'Pasos para reproducir, esperado frente a actual y entorno: el reporte que ahorra horas.' },
      { id: 'labels-milestones-y-plantillas', icon: '🏷️', t: 'Labels, milestones y plantillas', d: 'Clasificar, agrupar por hito y formularios de issue en .github para no repetir preguntas.' },
      { id: 'github-projects-para-planificar', icon: '📋', t: 'GitHub Projects para planificar', d: 'Tableros y tablas conectados a issues y PR, campos propios y automatizaciones.' },
      { id: 'discussions-wiki-y-notificaciones', icon: '💬', t: 'Discussions, wiki y notificaciones', d: 'Dónde va cada conversación y cómo domar la bandeja de notificaciones.' }
    ]
  },
  {
    area: 'GitHub Actions: automatizar', icon: '⚙️', acc: 'a7',
    desc: 'Que la máquina pruebe, revise y despliegue por ti en cada push: workflows en YAML, secretos y entornos.',
    lessons: [
      { id: 'que-es-un-workflow', icon: '🤖', t: 'Qué es un workflow', d: 'Eventos, jobs, steps y runners: el modelo de GitHub Actions explicado con un ejemplo mínimo.' },
      { id: 'anatomia-del-yaml', icon: '📐', t: 'Anatomía del YAML de Actions', d: 'on, jobs, runs-on, uses y run; matrices, needs y las expresiones con llaves.' },
      { id: 'secretos-variables-y-entornos', icon: '🔑', t: 'Secretos, variables y entornos', d: 'Guardar claves sin exponerlas, GITHUB_TOKEN y aprobaciones manuales por entorno.' },
      { id: 'ci-para-probar-y-revisar', icon: '🧪', t: 'CI: probar y revisar en cada push', d: 'Lint, tests y validadores propios como los de tus apps formativas, corriendo solos.' },
      { id: 'cd-desplegar-y-publicar', icon: '📦', t: 'CD: desplegar y publicar', d: 'Publicar a Pages, generar un APK o un paquete y adjuntarlo a una release desde un workflow.' }
    ]
  },
  {
    area: 'Publicar: Pages, releases y paquetes', icon: '🚀', acc: 'a8',
    desc: 'Convertir un repositorio en un producto: sitio web, versiones numeradas con notas y paquetes descargables.',
    lessons: [
      { id: 'github-pages', icon: '🌐', t: 'GitHub Pages', d: 'Publicar un sitio estático gratis desde una rama, una carpeta o un workflow, con dominio propio.' },
      { id: 'tags-releases-y-semver', icon: '🏷️', t: 'Tags, releases y SemVer', d: 'Numerar versiones con sentido, etiquetar commits y publicar releases con notas y binarios.' },
      { id: 'github-packages-y-contenedores', icon: '📦', t: 'GitHub Packages y contenedores', d: 'Registro de paquetes npm, PyPI compatibles y de imágenes Docker ligado al repo.' },
      { id: 'codespaces-y-devcontainers', icon: '💻', t: 'Codespaces y devcontainers', d: 'Un entorno de desarrollo completo en la nube, definido en un archivo dentro del repo.' }
    ]
  },
  {
    area: 'Git avanzado: deshacer y arqueología', icon: '🧠', acc: 'a9',
    desc: 'Los comandos que salvan el día: recuperar lo perdido, limpiar la historia y averiguar quién cambió qué y cuándo.',
    lessons: [
      { id: 'reset-revert-y-reflog', icon: '⏪', t: 'reset, revert y reflog', d: 'Tres formas de deshacer con consecuencias distintas y la red de seguridad que casi nadie conoce.' },
      { id: 'stash-y-cherry-pick', icon: '🎒', t: 'stash y cherry-pick', d: 'Guardar trabajo a medias y traer un commit concreto de otra rama.' },
      { id: 'rebase-interactivo-y-limpiar-historia', icon: '🧽', t: 'Rebase interactivo y limpiar historia', d: 'Reordenar, unir y reescribir commits antes de compartirlos; cuándo está prohibido.' },
      { id: 'bisect-blame-y-arqueologia', icon: '🔎', t: 'bisect, blame y arqueología', d: 'Encontrar el commit que rompió algo por búsqueda binaria y leer la historia de una línea.' },
      { id: 'submodulos-worktrees-y-lfs', icon: '🧱', t: 'Submódulos, worktrees y LFS', d: 'Repos dentro de repos, dos ramas a la vez en carpetas distintas y archivos grandes.' }
    ]
  },
  {
    area: 'Seguridad y flujos de trabajo', icon: '🛡️', acc: 'a10',
    desc: 'Proteger el código, las claves y la cuenta, y elegir la estrategia de ramas que encaja con tu forma de trabajar.',
    lessons: [
      { id: 'dependabot-y-alertas', icon: '🤖', t: 'Dependabot y alertas de seguridad', d: 'Dependencias vulnerables detectadas y actualizadas por PR automáticos.' },
      { id: 'secret-scanning-y-push-protection', icon: '🚨', t: 'Secret scanning y push protection', d: 'Qué pasa cuando subes una clave, cómo GitHub la detecta y por qué borrarla no basta.' },
      { id: 'commits-firmados-y-2fa', icon: '✅', t: 'Commits firmados y 2FA', d: 'El sello Verified, claves SSH o GPG para firmar y la verificación en dos pasos.' },
      { id: 'github-flow-git-flow-y-trunk', icon: '🗺️', t: 'GitHub Flow, Git Flow y trunk-based', d: 'Tres estrategias de ramas comparadas: cuál usar solo, en equipo pequeño o con releases planificadas.' }
    ]
  },
  {
    area: 'GitHub con Claude Code, Copilot y la CLI', icon: '🤖', acc: 'a11',
    desc: 'Cómo usar GitHub desde la terminal, desde la API y con asistentes de IA que abren PR, revisan y responden por ti.',
    lessons: [
      { id: 'claude-code-y-github', icon: '✨', t: 'Claude Code y GitHub: tu flujo de trabajo', d: 'Ramas claude/, commits con coautoría, PR que se revisan solos y cómo pedir bien las cosas.' },
      { id: 'github-cli-gh', icon: '⌨️', t: 'GitHub CLI: gh', d: 'Repos, issues, PR, releases y workflows sin salir de la terminal.' },
      { id: 'copilot-en-github', icon: '🧑‍✈️', t: 'Copilot en GitHub', d: 'Autocompletar, chat, revisión de PR y agentes: qué hace bien y qué revisar siempre.' },
      { id: 'api-webhooks-y-mcp', icon: '🔌', t: 'API, webhooks y servidores MCP', d: 'Automatizar GitHub desde fuera: la API REST, avisos por webhook y el servidor MCP de GitHub.' }
    ]
  },
  {
    area: 'Casos completos y examen', icon: '🏆', acc: 'a12',
    desc: 'Situaciones reales de principio a fin y un examen integrador para comprobar que dominas el oficio.',
    lessons: [
      { id: 'caso-publicar-una-app-formativa', icon: '📱', t: 'Caso: publicar una app formativa en GitHub', d: 'De la carpeta local a un repo con README, Pages, release con APK y CI que valida las lecciones.' },
      { id: 'caso-recuperar-un-commit-perdido', icon: '🆘', t: 'Caso: recuperar un commit perdido', d: 'Un reset --hard equivocado, una rama borrada y un push rechazado: cómo salir de cada uno.' },
      { id: 'caso-contribuir-a-un-proyecto-abierto', icon: '🌍', t: 'Caso: contribuir a un proyecto abierto', d: 'Fork, rama, PR, revisión y merge en un proyecto ajeno, con las normas de la comunidad.' },
      { id: 'examen-integrador', icon: '🎓', t: 'Examen integrador', d: 'Veinte preguntas de situación que recorren todo el curso; repasa lo que falle.' }
    ]
  }
];
