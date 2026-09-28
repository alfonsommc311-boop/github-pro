/* Contenido del curso: módulos, lecciones, quizzes y prácticas en la terminal simulada.
   Cada práctica tiene `check(state, history)` que recibe el estado del GitSim y
   el historial de comandos, y devuelve true cuando la tarea está cumplida. */
window.COURSE = {
  modules: [
    {
      id: 'intro', title: '1. Fundamentos', icon: '🌱',
      lessons: [
        {
          id: 'que-es-git', title: '¿Qué son Git y GitHub?', xp: 10,
          content: `
<p><strong>Git</strong> es un sistema de control de versiones distribuido creado por Linus Torvalds en 2005. Guarda la historia completa de un proyecto como una serie de <em>commits</em> (instantáneas) y permite trabajar en paralelo con <em>ramas</em>.</p>
<p><strong>GitHub</strong> es una plataforma web que aloja repositorios Git y añade colaboración: <em>pull requests</em>, <em>issues</em>, revisión de código, automatización (<em>Actions</em>), hosting (<em>Pages</em>), paquetes, seguridad y mucho más.</p>
<table><tr><th>Git</th><th>GitHub</th></tr>
<tr><td>Herramienta de línea de comandos</td><td>Servicio web (también con app de escritorio y CLI)</td></tr>
<tr><td>Funciona sin internet</td><td>Necesita conexión</td></tr>
<tr><td>Controla versiones</td><td>Aloja repos y organiza equipos</td></tr>
<tr><td>Gratis y de código abierto</td><td>Gratis para uso básico; planes de pago para empresas</td></tr></table>
<div class="callout tip"><b>Idea clave:</b> puedes usar Git sin GitHub, pero GitHub no tiene sentido sin Git.</div>
<h2>Vocabulario esencial</h2>
<ul>
<li><b>Repositorio (repo):</b> carpeta del proyecto con su historia (la carpeta oculta <code>.git</code>).</li>
<li><b>Commit:</b> una instantánea del proyecto con mensaje, autor y fecha.</li>
<li><b>Rama (branch):</b> línea de desarrollo independiente. La principal suele llamarse <code>main</code>.</li>
<li><b>Remoto (remote):</b> copia del repo en otro lugar (por ejemplo GitHub). Se suele llamar <code>origin</code>.</li>
<li><b>Clonar, push, pull:</b> copiar un repo remoto, subir tus commits, bajar los de otros.</li>
</ul>`,
          quiz: [
            { q: '¿Cuál es la diferencia principal entre Git y GitHub?', a: ['Son lo mismo con distinto nombre', 'Git controla versiones; GitHub aloja repos y añade colaboración', 'GitHub es la versión de pago de Git', 'Git solo funciona en Linux'], c: 1, e: 'Git es la herramienta; GitHub es la plataforma que la aloja y le añade servicios.' },
            { q: '¿Qué es un commit?', a: ['Una rama', 'Una instantánea del proyecto con mensaje y autor', 'Un servidor', 'Una copia de seguridad en la nube'], c: 1, e: 'Cada commit registra un estado del proyecto y quién lo hizo.' },
            { q: '¿Cómo se llama por convención el remoto principal?', a: ['main', 'master', 'origin', 'upstream'], c: 2, e: '“origin” es el nombre que Git da al remoto del que clonaste.' }
          ]
        },
        {
          id: 'instalacion', title: 'Instalar y configurar Git', xp: 10,
          content: `
<h2>Instalación</h2>
<ul>
<li><b>Windows:</b> descarga <a href="https://git-scm.com" target="_blank" rel="noopener">git-scm.com</a> (incluye Git Bash) o usa <code>winget install Git.Git</code>.</li>
<li><b>macOS:</b> <code>brew install git</code> o instala Xcode Command Line Tools.</li>
<li><b>Linux:</b> <code>sudo apt install git</code> (Debian/Ubuntu) o <code>sudo dnf install git</code> (Fedora).</li>
</ul>
<h2>Configuración inicial (una sola vez)</h2>
<pre><code>git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"   # opcional: VS Code como editor
git config --list                              # ver la configuración</code></pre>
<div class="callout warn"><b>Importante:</b> el correo debe coincidir con uno verificado en tu cuenta de GitHub para que los commits se te atribuyan.</div>
<h2>Crear cuenta en GitHub</h2>
<ol><li>Ve a <a href="https://github.com/signup" target="_blank" rel="noopener">github.com/signup</a>.</li>
<li>Elige un nombre de usuario profesional (aparecerá en todas tus URLs).</li>
<li>Activa la autenticación en dos pasos (2FA) en <em>Settings → Password and authentication</em>.</li></ol>`,
          quiz: [
            { q: '¿Qué comando define tu nombre para todos tus repos?', a: ['git name "Tu Nombre"', 'git config --global user.name "Tu Nombre"', 'git set user "Tu Nombre"', 'git init --name'], c: 1, e: '--global aplica la configuración a todos los repositorios del usuario.' },
            { q: '¿Por qué el email de Git debe coincidir con el de GitHub?', a: ['Para poder hacer login', 'Para que los commits se atribuyan a tu cuenta', 'No importa', 'Para recibir notificaciones'], c: 1, e: 'GitHub asocia los commits a cuentas comparando el email del autor.' }
          ],
          practice: {
            intro: 'Configura tu identidad en la terminal simulada.',
            tasks: [
              { text: 'Configura tu nombre con git config --global user.name', check: function (s, h) { return h.some(function (c) { return /^git config --global user\.name/.test(c); }); } },
              { text: 'Configura tu email con git config --global user.email', check: function (s, h) { return h.some(function (c) { return /^git config --global user\.email/.test(c); }); } }
            ]
          }
        }
      ]
    },
    {
      id: 'basico', title: '2. Tu primer repositorio', icon: '📦',
      lessons: [
        {
          id: 'init-add-commit', title: 'init, add y commit', xp: 15,
          content: `
<h2>Las tres zonas de Git</h2>
<table><tr><th>Zona</th><th>Qué es</th><th>Comando para pasar a la siguiente</th></tr>
<tr><td>Árbol de trabajo</td><td>Tus archivos tal cual están en disco</td><td><code>git add</code></td></tr>
<tr><td>Área de preparación (staging / index)</td><td>Lo que entrará en el próximo commit</td><td><code>git commit</code></td></tr>
<tr><td>Repositorio (.git)</td><td>La historia de commits</td><td><code>git push</code> (al remoto)</td></tr></table>
<h2>Flujo básico</h2>
<pre><code>git init                     # crea el repo en la carpeta actual
git status                   # ¿qué ha cambiado?
git add archivo.txt          # prepara un archivo
git add .                    # prepara todo
git commit -m "Mensaje claro"   # guarda la instantánea
git log --oneline            # ver la historia</code></pre>
<h2>Buenos mensajes de commit</h2>
<ul><li>Imperativo y corto en la primera línea (≤ 50 caracteres): <em>“Añade validación de email”</em>.</li>
<li>Explica el <b>por qué</b> en el cuerpo si hace falta.</li>
<li>Un commit = un cambio lógico. Evita “arreglos varios”.</li></ul>
<div class="callout"><b>Convención popular:</b> <em>Conventional Commits</em>: <code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>refactor:</code>, <code>test:</code>, <code>chore:</code>…</div>`,
          quiz: [
            { q: '¿Qué hace git add?', a: ['Crea un commit', 'Pasa cambios del árbol de trabajo al área de preparación', 'Sube archivos a GitHub', 'Crea una rama'], c: 1, e: 'add prepara los cambios; commit los guarda en la historia.' },
            { q: 'Ejecutas `git commit` sin haber hecho `git add`. ¿Qué pasa?', a: ['Se guardan todos los cambios', 'Git avisa que no hay nada preparado', 'Se borra el trabajo', 'Se sube al remoto'], c: 1, e: 'Solo lo que está en staging entra en el commit.' },
            { q: '¿Cuál es un buen mensaje de commit?', a: ['"cambios"', '"fix"', '"Corrige cálculo de IVA en facturas"', '"asdf"'], c: 2, e: 'Describe qué cambia de forma concreta y en imperativo.' }
          ],
          practice: {
            intro: 'Crea tu primer repositorio y haz un commit.',
            tasks: [
              { text: 'Inicializa un repositorio con git init', check: function (s) { return s.initialized; } },
              { text: 'Crea un archivo README.md (touch README.md o echo "# Hola" > README.md)', check: function (s) { return s.files.indexOf('README.md') > -1; } },
              { text: 'Prepáralo con git add', check: function (s) { return s.initialized && (s.staged.indexOf('README.md') > -1 || s.commits > 0); } },
              { text: 'Haz un commit con mensaje (git commit -m "...")', check: function (s) { return s.commits >= 1; } },
              { text: 'Mira la historia con git log', check: function (s, h) { return s.commits >= 1 && h.some(function (c) { return /^git log/.test(c); }); } }
            ]
          }
        },
        {
          id: 'status-diff', title: 'status, diff y .gitignore', xp: 15,
          content: `
<h2>Ver el estado</h2>
<pre><code>git status            # resumen: preparado, modificado, sin seguimiento
git status -s         # versión corta
git diff              # cambios NO preparados (árbol vs staging)
git diff --staged     # cambios preparados (staging vs último commit)
git show              # contenido del último commit</code></pre>
<h2>Deshacer antes del commit</h2>
<pre><code>git restore archivo.txt            # descarta cambios del árbol de trabajo
git restore --staged archivo.txt   # saca del área de preparación (sigue modificado)</code></pre>
<h2>.gitignore</h2>
<p>Archivo de texto con patrones de rutas que Git debe ignorar (dependencias, secretos, binarios):</p>
<pre><code>node_modules/
*.log
.env
dist/
__pycache__/</code></pre>
<div class="callout tip">GitHub ofrece plantillas de .gitignore por lenguaje al crear un repo. También en <a href="https://github.com/github/gitignore" target="_blank" rel="noopener">github/gitignore</a>.</div>
<div class="callout warn">Nunca subas contraseñas ni claves de API. Si lo hiciste, rota la clave: borrarla en un commit posterior <b>no</b> la elimina de la historia.</div>`,
          quiz: [
            { q: '¿Qué muestra `git diff --staged`?', a: ['Cambios sin preparar', 'Diferencia entre staging y el último commit', 'La lista de ramas', 'Los archivos ignorados'], c: 1, e: 'Sin --staged compara árbol de trabajo con staging.' },
            { q: 'Subiste una clave API por error y la borraste en el siguiente commit. ¿Está a salvo?', a: ['Sí, ya no está en el código', 'No, sigue en la historia; debes rotarla', 'Solo si el repo es privado', 'Sí, GitHub la elimina automáticamente'], c: 1, e: 'La historia de Git conserva todo. Revoca la clave y genera una nueva.' },
            { q: '¿Para qué sirve .gitignore?', a: ['Para ocultar el repo', 'Para indicar rutas que Git no debe rastrear', 'Para borrar archivos', 'Para ignorar ramas'], c: 1, e: 'Evita subir dependencias, artefactos y secretos.' }
          ],
          practice: {
            intro: 'Practica el ciclo modificar → revisar → preparar.',
            tasks: [
              { text: 'Inicializa el repo, crea app.js y haz un commit', check: function (s) { return s.commits >= 1 && s.files.indexOf('app.js') > -1; } },
              { text: 'Modifica app.js (echo "console.log(1)" >> app.js) y revisa con git status', check: function (s, h) { return s.modified.indexOf('app.js') > -1 || (s.commits >= 2); } },
              { text: 'Mira el cambio con git diff', check: function (s, h) { return h.some(function (c) { return /^git diff/.test(c); }); } },
              { text: 'Crea un .gitignore con la línea node_modules/ (echo "node_modules/" > .gitignore)', check: function (s) { return s.files.indexOf('.gitignore') > -1; } },
              { text: 'Haz un segundo commit', check: function (s) { return s.commits >= 2; } }
            ]
          }
        }
      ]
    },
    {
      id: 'ramas', title: '3. Ramas y fusiones', icon: '🌿',
      lessons: [
        {
          id: 'branches', title: 'Crear y cambiar de rama', xp: 15,
          content: `
<p>Una rama es simplemente un puntero móvil a un commit. Crear ramas es instantáneo y barato, por eso en Git se crea una rama para <b>cada</b> funcionalidad o arreglo.</p>
<pre><code>git branch                    # listar ramas (* = actual)
git branch feature/login      # crear rama
git switch feature/login      # cambiar (moderno)
git checkout feature/login    # cambiar (clásico)
git switch -c hotfix/typo     # crear y cambiar a la vez
git branch -d feature/login   # borrar rama ya fusionada
git branch -m nuevo-nombre    # renombrar la rama actual</code></pre>
<h2>Convenciones de nombres</h2>
<ul><li><code>feature/descripcion</code> – nueva funcionalidad</li><li><code>fix/descripcion</code> o <code>bugfix/…</code> – corrección</li><li><code>hotfix/…</code> – arreglo urgente en producción</li><li><code>release/1.2.0</code> – preparación de versión</li></ul>
<div class="callout">HEAD es el puntero a “dónde estás”. Normalmente apunta a una rama; si apunta a un commit suelto se llama <em>detached HEAD</em>.</div>`,
          quiz: [
            { q: 'Técnicamente, ¿qué es una rama en Git?', a: ['Una copia de la carpeta', 'Un puntero a un commit', 'Un archivo zip', 'Un servidor'], c: 1, e: 'Por eso crear ramas es instantáneo: solo se crea una referencia.' },
            { q: '¿Qué comando crea una rama y cambia a ella en un paso?', a: ['git branch -c x', 'git switch -c x', 'git new x', 'git checkout x'], c: 1, e: 'También vale git checkout -b x.' }
          ],
          practice: {
            intro: 'Trabaja en una rama de funcionalidad.',
            tasks: [
              { text: 'Crea un repo con un commit inicial', check: function (s) { return s.commits >= 1; } },
              { text: 'Crea y cambia a la rama feature/login', check: function (s) { return s.branches.indexOf('feature/login') > -1; } },
              { text: 'Estando en feature/login, crea login.js y haz commit', check: function (s) { return s.branch === 'feature/login' && s.commits >= 2 && s.files.indexOf('login.js') > -1; } },
              { text: 'Vuelve a main (git switch main)', check: function (s, h) { return s.branches.indexOf('feature/login') > -1 && s.branch === 'main' && h.some(function (c) { return /^git (switch|checkout) main/.test(c); }); } }
            ]
          }
        },
        {
          id: 'merge', title: 'merge, conflictos y rebase', xp: 20,
          content: `
<h2>Fusionar (merge)</h2>
<pre><code>git switch main
git merge feature/login      # trae los cambios de la rama a main</code></pre>
<ul><li><b>Fast-forward:</b> si main no avanzó, Git solo mueve el puntero. No hay commit de merge.</li>
<li><b>Merge de tres vías:</b> si ambas ramas avanzaron, Git crea un <em>commit de merge</em> con dos padres. Usa <code>--no-ff</code> para forzarlo y conservar la forma de la historia.</li></ul>
<h2>Conflictos</h2>
<p>Ocurren cuando dos ramas cambian las mismas líneas. Git marca el archivo así:</p>
<pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
color: azul;
=======
color: rojo;
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/tema</code></pre>
<ol><li>Edita el archivo, deja la versión correcta y borra los marcadores.</li><li><code>git add archivo</code></li><li><code>git commit</code> (o <code>git merge --continue</code>).</li></ol>
<p>Para abortar: <code>git merge --abort</code>.</p>
<h2>Rebase</h2>
<p><code>git rebase main</code> (desde tu rama) reescribe tus commits encima de main, dejando una historia lineal.</p>
<div class="callout warn"><b>Regla de oro:</b> nunca hagas rebase de commits que ya has compartido (subidos a una rama que otros usan). Reescribir historia compartida rompe el trabajo de los demás.</div>
<table><tr><th>Merge</th><th>Rebase</th></tr><tr><td>Conserva la historia real</td><td>Historia lineal y limpia</td></tr><tr><td>Crea commits de merge</td><td>Reescribe hashes</td></tr><tr><td>Seguro en ramas compartidas</td><td>Solo en ramas locales/propias</td></tr></table>`,
          quiz: [
            { q: '¿Cuándo ocurre un merge fast-forward?', a: ['Siempre', 'Cuando la rama destino no tiene commits nuevos desde que se creó la otra', 'Cuando hay conflictos', 'Nunca en main'], c: 1, e: 'Git solo tiene que mover el puntero hacia adelante.' },
            { q: '¿Qué marcan `<<<<<<<`, `=======` y `>>>>>>>`?', a: ['Comentarios', 'Un conflicto de merge', 'Una rama nueva', 'Un error de sintaxis'], c: 1, e: 'Separan tu versión (HEAD) de la versión de la otra rama.' },
            { q: '¿Cuándo NO debes hacer rebase?', a: ['En ramas locales', 'Sobre commits ya compartidos con otros', 'Antes de un merge', 'Nunca se debe'], c: 1, e: 'Rebase reescribe hashes; hacerlo sobre historia compartida rompe el trabajo ajeno.' }
          ],
          practice: {
            intro: 'Fusiona una rama en main.',
            tasks: [
              { text: 'Crea un repo con commit inicial y una rama feature/nav con un commit propio', check: function (s) { return s.branches.indexOf('feature/nav') > -1 && s.commits >= 2; } },
              { text: 'Vuelve a main y ejecuta git merge feature/nav', check: function (s, h) { return s.branch === 'main' && h.some(function (c) { return /^git merge feature\/nav/.test(c); }) && s.commits >= 2; } },
              { text: 'Borra la rama ya fusionada con git branch -d feature/nav', check: function (s, h) { return h.some(function (c) { return /^git merge feature\/nav/.test(c); }) && s.branches.indexOf('feature/nav') === -1; } }
            ]
          }
        }
      ]
    },
    {
      id: 'remoto', title: '4. Trabajar con GitHub', icon: '☁️',
      lessons: [
        {
          id: 'remote-push', title: 'Crear un repo en GitHub y hacer push', xp: 20,
          content: `
<h2>Opción A: repo nuevo en GitHub, proyecto local existente</h2>
<ol><li>En GitHub: <b>+ → New repository</b>. Nombre, visibilidad (público/privado), sin README si ya tienes proyecto.</li>
<li>Conecta y sube:</li></ol>
<pre><code>git remote add origin https://github.com/usuario/mi-repo.git
git branch -M main
git push -u origin main      # -u guarda el upstream; luego basta con git push</code></pre>
<h2>Opción B: clonar un repo existente</h2>
<pre><code>git clone https://github.com/usuario/mi-repo.git
cd mi-repo</code></pre>
<h2>Sincronizar</h2>
<pre><code>git fetch          # descarga referencias sin tocar tu trabajo
git pull           # fetch + merge (o rebase con --rebase)
git push           # sube commits de la rama actual
git remote -v      # ver remotos</code></pre>
<h2>Autenticación</h2>
<ul><li><b>HTTPS:</b> GitHub no acepta contraseñas; usa un <em>Personal Access Token</em> (Settings → Developer settings → Tokens) o <em>Git Credential Manager</em>.</li>
<li><b>SSH:</b> genera clave con <code>ssh-keygen -t ed25519 -C "tu@email.com"</code>, añade la pública en Settings → SSH and GPG keys, y usa URLs <code>git@github.com:usuario/repo.git</code>.</li>
<li><b>GitHub CLI:</b> <code>gh auth login</code> lo configura todo.</li></ul>
<div class="callout warn">Si el push es rechazado (<em>non-fast-forward</em>), alguien subió antes: haz <code>git pull</code>, resuelve conflictos y vuelve a hacer push. Evita <code>--force</code> en ramas compartidas; si es imprescindible usa <code>--force-with-lease</code>.</div>`,
          quiz: [
            { q: '¿Qué hace el flag -u en `git push -u origin main`?', a: ['Actualiza Git', 'Configura la rama remota como upstream para futuros push/pull', 'Sube con más velocidad', 'Deshace el último push'], c: 1, e: 'Tras eso basta con git push / git pull sin argumentos.' },
            { q: '¿Diferencia entre fetch y pull?', a: ['Ninguna', 'fetch descarga sin integrar; pull descarga e integra (merge/rebase)', 'pull es más antiguo', 'fetch sube cambios'], c: 1, e: 'fetch es seguro para “mirar” qué hay nuevo antes de integrar.' },
            { q: 'Tu push es rechazado como non-fast-forward. ¿Qué haces?', a: ['git push --force', 'git pull, resolver e intentar de nuevo', 'Borrar el repo', 'Crear otra cuenta'], c: 1, e: 'Alguien subió antes que tú; integra sus cambios primero.' }
          ],
          practice: {
            intro: 'Conecta tu repo local con GitHub y sube tu trabajo.',
            tasks: [
              { text: 'Crea un repo local con al menos un commit', check: function (s) { return s.commits >= 1; } },
              { text: 'Añade el remoto: git remote add origin https://github.com/tu-usuario/mi-repo.git', check: function (s) { return s.remotes.indexOf('origin') > -1; } },
              { text: 'Sube la rama con git push -u origin main', check: function (s) { return s.remoteBranches.indexOf('origin/main') > -1; } },
              { text: 'Haz otro commit y súbelo con git push (sin argumentos)', check: function (s, h) { return s.commits >= 2 && h.some(function (c) { return c.trim() === 'git push'; }); } }
            ]
          }
        },
        {
          id: 'fork-clone', title: 'Fork, clone y contribuir a open source', xp: 20,
          content: `
<h2>Fork vs clone</h2>
<ul><li><b>Clone:</b> copia el repo a tu máquina. Necesitas permiso de escritura para hacer push.</li>
<li><b>Fork:</b> copia el repo a <em>tu cuenta de GitHub</em>. Es el mecanismo para contribuir a proyectos donde no tienes permisos.</li></ul>
<h2>Flujo de contribución a open source</h2>
<pre><code># 1. Fork en GitHub (botón Fork) → github.com/TU-USUARIO/proyecto
git clone https://github.com/TU-USUARIO/proyecto.git
cd proyecto
git remote add upstream https://github.com/ORIGINAL/proyecto.git   # el original

# 2. Rama de trabajo
git switch -c fix/typo-readme
# ... cambios, commits ...
git push -u origin fix/typo-readme

# 3. En GitHub: "Compare & pull request" hacia ORIGINAL/proyecto

# 4. Mantener tu fork al día
git fetch upstream
git switch main
git merge upstream/main
git push</code></pre>
<h2>Antes de contribuir</h2>
<ul><li>Lee <code>CONTRIBUTING.md</code>, el <code>CODE_OF_CONDUCT.md</code> y la licencia.</li>
<li>Busca issues con etiqueta <em>good first issue</em> o <em>help wanted</em>.</li>
<li>Comenta en el issue antes de trabajar en algo grande.</li></ul>`,
          quiz: [
            { q: 'Quieres contribuir a un proyecto donde no tienes permisos. ¿Qué haces primero?', a: ['Pedir contraseña al dueño', 'Hacer fork', 'git push --force', 'Crear un issue de queja'], c: 1, e: 'El fork te da una copia en tu cuenta donde sí puedes hacer push.' },
            { q: '¿Qué es el remoto `upstream` por convención?', a: ['Tu fork', 'El repositorio original del que hiciste fork', 'GitHub', 'La rama main'], c: 1, e: 'origin = tu fork; upstream = el proyecto original.' }
          ],
          practice: {
            intro: 'Simula el flujo de fork: clona tu fork y añade el remoto upstream.',
            tasks: [
              { text: 'Clona: git clone https://github.com/tu-usuario/proyecto.git', check: function (s) { return s.initialized && s.remotes.indexOf('origin') > -1 && s.commits >= 1; } },
              { text: 'Añade el original: git remote add upstream https://github.com/original/proyecto.git', check: function (s) { return s.remotes.indexOf('upstream') > -1; } },
              { text: 'Crea la rama fix/typo, haz un commit y súbela con git push -u origin fix/typo', check: function (s) { return s.remoteBranches.indexOf('origin/fix/typo') > -1; } }
            ]
          }
        }
      ]
    },
    {
      id: 'colaboracion', title: '5. Pull Requests y revisión', icon: '🔀',
      lessons: [
        {
          id: 'pull-requests', title: 'Pull Requests de principio a fin', xp: 20,
          content: `
<p>Un <b>Pull Request (PR)</b> propone fusionar una rama en otra y abre una conversación: diff, comentarios línea a línea, revisiones, checks automáticos.</p>
<h2>Crear un buen PR</h2>
<ol><li>Rama pequeña y enfocada (idealmente &lt; 400 líneas cambiadas).</li>
<li>Título claro; descripción con <b>qué</b>, <b>por qué</b> y <b>cómo probarlo</b>. Enlaza el issue: <code>Closes #42</code> lo cierra al fusionar.</li>
<li>Marca como <em>Draft</em> si aún no está listo.</li>
<li>Pide revisores (<em>Reviewers</em>) y asigna etiquetas.</li></ol>
<h2>Revisar código</h2>
<ul><li><b>Comment:</b> observaciones sin bloquear.</li><li><b>Approve:</b> listo para fusionar.</li><li><b>Request changes:</b> bloquea hasta que se corrija.</li>
<li>Usa <em>suggestions</em> (bloques <code>\`\`\`suggestion</code>) para proponer cambios aplicables con un clic.</li></ul>
<h2>Formas de fusionar</h2>
<table><tr><th>Método</th><th>Resultado</th><th>Cuándo</th></tr>
<tr><td>Merge commit</td><td>Conserva todos los commits + commit de merge</td><td>Historia completa</td></tr>
<tr><td>Squash and merge</td><td>Todos los commits del PR → uno solo</td><td>Historia limpia en main (muy común)</td></tr>
<tr><td>Rebase and merge</td><td>Commits reaplicados linealmente</td><td>Historia lineal sin merge commits</td></tr></table>
<h2>Plantillas y protección</h2>
<ul><li><code>.github/pull_request_template.md</code> rellena la descripción automáticamente.</li>
<li><b>Branch protection / rulesets</b> (Settings → Branches): exigir revisiones, checks verdes, prohibir force push a main.</li>
<li><code>CODEOWNERS</code> asigna revisores automáticamente por ruta.</li></ul>`,
          quiz: [
            { q: '¿Qué hace escribir "Closes #42" en la descripción del PR?', a: ['Cierra el PR', 'Cierra el issue 42 al fusionar', 'Borra la rama', 'Nada'], c: 1, e: 'Palabras clave: close, closes, fixes, resolves + número.' },
            { q: '¿Qué método de merge convierte todos los commits del PR en uno?', a: ['Merge commit', 'Squash and merge', 'Rebase and merge', 'Fast-forward'], c: 1, e: 'Squash produce una historia limpia en la rama principal.' },
            { q: '¿Qué tipo de revisión bloquea la fusión?', a: ['Comment', 'Approve', 'Request changes', 'Draft'], c: 2, e: 'Request changes exige una nueva revisión tras corregir.' }
          ]
        },
        {
          id: 'issues-projects', title: 'Issues, Projects y Discussions', xp: 15,
          content: `
<h2>Issues</h2>
<p>Seguimiento de bugs, tareas e ideas. Buenas prácticas:</p>
<ul><li>Título específico; pasos para reproducir; comportamiento esperado vs actual; versión/entorno.</li>
<li><b>Labels</b> (bug, enhancement, good first issue…), <b>Assignees</b>, <b>Milestones</b>.</li>
<li>Plantillas en <code>.github/ISSUE_TEMPLATE/</code> (Markdown o formularios YAML).</li>
<li>Referencia cruzada con <code>#numero</code>; menciona personas con <code>@usuario</code>.</li>
<li>Sub-issues y tipos de issue para jerarquías (épicas → tareas).</li></ul>
<h2>Projects</h2>
<p>Tableros tipo Kanban y tablas conectadas a issues y PRs, con campos personalizados (prioridad, sprint, estimación), vistas, gráficos e <em>insights</em>. Automatizaciones: mover a “Done” cuando se cierra el issue, etc.</p>
<h2>Discussions</h2>
<p>Foro del repo para preguntas, ideas y anuncios que no son tareas. Se pueden convertir en issues.</p>
<h2>Wiki</h2>
<p>Documentación editable en el navegador, separada del código. Hoy se prefiere una carpeta <code>docs/</code> versionada con el código.</p>`,
          quiz: [
            { q: '¿Qué información debe llevar un buen reporte de bug?', a: ['Solo el título', 'Pasos para reproducir, esperado vs actual, entorno', 'Una captura y nada más', 'El nombre del culpable'], c: 1, e: 'Cuanto más reproducible, más rápido se arregla.' },
            { q: '¿Para qué sirve GitHub Projects?', a: ['Alojar sitios web', 'Organizar issues y PRs en tableros y tablas', 'Ejecutar tests', 'Publicar paquetes'], c: 1, e: 'Es la herramienta de planificación integrada.' }
          ]
        }
      ]
    },
    {
      id: 'actions', title: '6. Automatización', icon: '⚙️',
      lessons: [
        {
          id: 'github-actions', title: 'GitHub Actions: CI/CD', xp: 25,
          content: `
<p><b>GitHub Actions</b> ejecuta flujos de trabajo (workflows) en respuesta a eventos: push, PR, cron, manual… Se definen en YAML dentro de <code>.github/workflows/</code>.</p>
<h2>Anatomía de un workflow</h2>
<pre><code>name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - run: npm ci
      - run: npm test</code></pre>
<ul><li><b>on:</b> eventos disparadores (<code>push</code>, <code>pull_request</code>, <code>schedule</code>, <code>workflow_dispatch</code>).</li>
<li><b>jobs:</b> se ejecutan en paralelo salvo que uses <code>needs:</code>.</li>
<li><b>steps:</b> <code>uses</code> (acción del Marketplace) o <code>run</code> (comando).</li>
<li><b>matrix:</b> repite el job con distintas versiones/SO.</li></ul>
<h2>Secretos y variables</h2>
<p>Settings → Secrets and variables → Actions. Se usan como <code>\${{ secrets.MI_TOKEN }}</code>. Nunca se imprimen en logs. <code>GITHUB_TOKEN</code> viene incluido para interactuar con el propio repo.</p>
<h2>Despliegue (CD)</h2>
<pre><code>deploy:
  needs: test
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  environment: production
  steps:
    - uses: actions/checkout@v4
    - run: ./deploy.sh
      env:
        API_KEY: \${{ secrets.API_KEY }}</code></pre>
<div class="callout tip">Los <em>environments</em> permiten aprobaciones manuales y secretos por entorno (staging, production).</div>
<h2>Otros usos</h2>
<ul><li>Lint y formato automático.</li><li>Publicar paquetes (npm, PyPI, Docker → GitHub Packages).</li><li>Etiquetar issues, cerrar PRs inactivos, generar changelogs.</li><li>Dependabot y CodeQL (seguridad).</li></ul>`,
          quiz: [
            { q: '¿Dónde se guardan los workflows?', a: ['/workflows', '.github/workflows/', 'actions/', '.git/hooks'], c: 1, e: 'Cualquier .yml en esa carpeta es un workflow.' },
            { q: '¿Cómo se accede a un secreto en un workflow?', a: ['$SECRET', '${{ secrets.NOMBRE }}', 'secrets.get("NOMBRE")', 'No se puede'], c: 1, e: 'Los secretos se enmascaran automáticamente en los logs.' },
            { q: '¿Qué hace `needs: test` en un job?', a: ['Instala tests', 'Hace que el job espere a que test termine con éxito', 'Ejecuta el job dos veces', 'Ignora fallos'], c: 1, e: 'Sin needs los jobs corren en paralelo.' },
            { q: '¿Qué evento permite lanzar un workflow manualmente desde la web?', a: ['push', 'manual', 'workflow_dispatch', 'click'], c: 2, e: 'Aparece un botón “Run workflow” en la pestaña Actions.' }
          ]
        },
        {
          id: 'pages-releases', title: 'GitHub Pages, Releases y Packages', xp: 15,
          content: `
<h2>GitHub Pages</h2>
<p>Hosting gratuito de sitios estáticos. Settings → Pages → elige origen: rama (<code>main</code> raíz o carpeta <code>/docs</code>) o un workflow de Actions. URL: <code>https://usuario.github.io/repo/</code>. Si el repo se llama <code>usuario.github.io</code>, la URL es la raíz.</p>
<ul><li>Soporta dominios personalizados (archivo <code>CNAME</code> + DNS) con HTTPS.</li><li>Jekyll integrado; para React/Vue/Astro usa un workflow de build.</li></ul>
<div class="callout tip">Este mismo curso está pensado para publicarse desde la carpeta <code>docs/</code> con Pages.</div>
<h2>Releases y tags</h2>
<pre><code>git tag -a v1.0.0 -m "Primera versión estable"
git push origin v1.0.0        # o: git push --tags</code></pre>
<p>En GitHub, <em>Releases</em> convierte un tag en una publicación con notas (generables automáticamente), binarios adjuntos y changelog. Sigue <b>SemVer</b>: <code>MAJOR.MINOR.PATCH</code>.</p>
<h2>GitHub Packages</h2>
<p>Registro de paquetes (npm, Maven, NuGet, RubyGems, Docker/ghcr.io) ligado al repo. Se publica desde Actions con <code>GITHUB_TOKEN</code>.</p>
<h2>Codespaces y Copilot</h2>
<ul><li><b>Codespaces:</b> VS Code en la nube con el repo listo; configurable con <code>.devcontainer/</code>.</li><li><b>Copilot:</b> asistente de IA en el editor, en PRs (revisión y resúmenes) y en el chat de GitHub.</li></ul>`,
          quiz: [
            { q: '¿Qué versión en SemVer indica cambios incompatibles?', a: ['PATCH', 'MINOR', 'MAJOR', 'Ninguna'], c: 2, e: 'MAJOR rompe compatibilidad; MINOR añade; PATCH corrige.' },
            { q: '¿Cuál es la URL por defecto de Pages para el repo "blog" del usuario "ana"?', a: ['https://ana.github.io/blog/', 'https://github.com/ana/blog/pages', 'https://blog.ana.github.io', 'https://pages.github.com/ana/blog'], c: 0, e: 'usuario.github.io/repo, salvo que el repo se llame usuario.github.io.' }
          ],
          practice: {
            intro: 'Etiqueta una versión y súbela.',
            tasks: [
              { text: 'Repo con commit y remoto origin configurado y push hecho', check: function (s) { return s.remoteBranches.indexOf('origin/main') > -1; } },
              { text: 'Crea el tag v1.0.0 (git tag -a v1.0.0 -m "...")', check: function (s) { return s.tags.indexOf('v1.0.0') > -1; } },
              { text: 'Súbelo: git push origin v1.0.0', check: function (s, h) { return s.tags.indexOf('v1.0.0') > -1 && h.some(function (c) { return /^git push (origin v1\.0\.0|--tags)/.test(c); }); } }
            ]
          }
        }
      ]
    },
    {
      id: 'avanzado', title: '7. Git avanzado', icon: '🧠',
      lessons: [
        {
          id: 'deshacer', title: 'Deshacer: reset, revert, reflog', xp: 20,
          content: `
<table><tr><th>Situación</th><th>Comando</th><th>Reescribe historia</th></tr>
<tr><td>Cambiar mensaje/contenido del último commit</td><td><code>git commit --amend</code></td><td>Sí (solo si no lo subiste)</td></tr>
<tr><td>Deshacer un commit ya compartido</td><td><code>git revert &lt;hash&gt;</code></td><td>No (crea commit inverso)</td></tr>
<tr><td>Quitar el último commit, conservar cambios preparados</td><td><code>git reset --soft HEAD~1</code></td><td>Sí</td></tr>
<tr><td>Quitar el último commit, conservar cambios sin preparar</td><td><code>git reset HEAD~1</code> (mixed)</td><td>Sí</td></tr>
<tr><td>Tirar todo a la basura</td><td><code>git reset --hard HEAD~1</code></td><td>Sí ⚠️</td></tr>
<tr><td>Recuperar algo “perdido”</td><td><code>git reflog</code> + <code>git reset --hard &lt;hash&gt;</code></td><td>—</td></tr></table>
<div class="callout tip"><b>Casi nada se pierde en Git.</b> <code>git reflog</code> guarda por dónde ha pasado HEAD durante ~90 días, incluso commits “borrados”.</div>
<h2>Guardar trabajo a medias: stash</h2>
<pre><code>git stash            # guarda cambios y limpia el árbol
git stash list
git stash pop        # recupera y elimina de la pila
git stash apply      # recupera y la conserva</code></pre>
<h2>Traer un commit concreto</h2>
<pre><code>git cherry-pick &lt;hash&gt;</code></pre>`,
          quiz: [
            { q: 'Subiste un commit con un bug a main (compartida). ¿Qué usas?', a: ['git reset --hard', 'git revert', 'git commit --amend', 'git stash'], c: 1, e: 'revert no reescribe historia: crea un commit que deshace el anterior.' },
            { q: '¿Qué hace `git reset --soft HEAD~1`?', a: ['Borra el último commit y sus cambios', 'Quita el último commit dejando los cambios preparados', 'Sube el commit', 'Crea una rama'], c: 1, e: '--soft mantiene staging; --mixed lo limpia; --hard borra todo.' },
            { q: 'Hiciste reset --hard por error. ¿Cómo recuperas el commit?', a: ['Imposible', 'git reflog y reset al hash', 'git pull', 'Reinstalar Git'], c: 1, e: 'reflog registra todos los movimientos de HEAD.' }
          ],
          practice: {
            intro: 'Deshaz cambios de forma segura.',
            tasks: [
              { text: 'Crea un repo con dos commits', check: function (s) { return s.commits >= 2; } },
              { text: 'Revierte el último con git revert HEAD', check: function (s, h) { return h.some(function (c) { return /^git revert/.test(c); }) && s.commits >= 3; } },
              { text: 'Modifica un archivo, guárdalo con git stash y recupéralo con git stash pop', check: function (s, h) { return h.some(function (c) { return /^git stash( push| save)?$/.test(c); }) && h.some(function (c) { return /^git stash pop/.test(c); }); } }
            ]
          }
        },
        {
          id: 'buenas-practicas', title: 'Flujos de trabajo y buenas prácticas', xp: 15,
          content: `
<h2>Estrategias de ramas</h2>
<ul><li><b>GitHub Flow:</b> main siempre desplegable; rama por feature; PR; merge; deploy. Simple y el más usado.</li>
<li><b>Git Flow:</b> main + develop + feature/release/hotfix. Útil con versiones planificadas.</li>
<li><b>Trunk-based:</b> commits pequeños y frecuentes a main con feature flags. Requiere CI muy sólida.</li></ul>
<h2>Higiene del repositorio</h2>
<ul><li><code>README.md</code> con qué es, cómo instalar y cómo contribuir.</li><li><code>LICENSE</code> (MIT, Apache-2.0, GPL…). Sin licencia = todos los derechos reservados.</li>
<li><code>CONTRIBUTING.md</code>, <code>CODE_OF_CONDUCT.md</code>, <code>SECURITY.md</code>.</li><li>Ramas protegidas, revisiones obligatorias, CI en PRs.</li>
<li>Commits firmados (GPG/SSH) para el sello <em>Verified</em>.</li></ul>
<h2>Seguridad en GitHub</h2>
<ul><li><b>Dependabot:</b> alertas y PRs automáticos para dependencias vulnerables.</li><li><b>Secret scanning:</b> detecta tokens filtrados (y push protection los bloquea antes de subir).</li>
<li><b>CodeQL / code scanning:</b> análisis estático en Actions.</li><li><b>2FA</b> obligatorio para contribuidores activos.</li></ul>
<h2>Comandos que te salvan el día</h2>
<pre><code>git log --oneline --graph --all     # ver el árbol completo
git blame archivo                   # quién cambió cada línea
git bisect start                    # búsqueda binaria del commit que rompió algo
git worktree add ../otra-rama rama  # dos ramas a la vez en carpetas distintas
git clean -fd                       # borrar archivos sin seguimiento (¡cuidado!)</code></pre>`,
          quiz: [
            { q: 'En GitHub Flow, ¿qué debe cumplir main siempre?', a: ['Tener muchas ramas', 'Estar desplegable/estable', 'Estar vacía', 'No tener CI'], c: 1, e: 'Todo cambio entra por PR revisado y con checks verdes.' },
            { q: 'Un repo público sin archivo LICENSE…', a: ['Es de dominio público', 'Conserva todos los derechos: otros no pueden reutilizarlo legalmente', 'Usa MIT por defecto', 'No puede existir'], c: 1, e: 'Sin licencia explícita, el copyright por defecto lo restringe.' },
            { q: '¿Qué herramienta encuentra el commit que introdujo un bug por búsqueda binaria?', a: ['git blame', 'git bisect', 'git find', 'git grep'], c: 1, e: 'Marcas un commit bueno y uno malo; Git va probando el punto medio.' }
          ]
        }
      ]
    }
  ],

  glossary: [
    ['Blame', 'Muestra quién y en qué commit modificó cada línea de un archivo.'],
    ['Branch (rama)', 'Puntero móvil a un commit; línea de desarrollo independiente.'],
    ['CI/CD', 'Integración y entrega/despliegue continuos: automatizar tests y despliegues en cada cambio.'],
    ['Clone', 'Copia completa de un repositorio remoto, con toda su historia.'],
    ['Commit', 'Instantánea del proyecto con mensaje, autor, fecha y referencia a su(s) padre(s).'],
    ['Conflicto', 'Cuando dos cambios afectan las mismas líneas y Git no puede fusionarlos solo.'],
    ['Detached HEAD', 'Estado en el que HEAD apunta a un commit y no a una rama.'],
    ['Diff', 'Diferencias línea a línea entre dos estados.'],
    ['Fast-forward', 'Merge que solo mueve el puntero porque no hay divergencia.'],
    ['Fetch', 'Descargar objetos y referencias del remoto sin integrarlos.'],
    ['Fork', 'Copia de un repositorio en tu propia cuenta de GitHub.'],
    ['HEAD', 'Referencia al commit/rama en el que estás trabajando.'],
    ['Hash (SHA)', 'Identificador único de 40 caracteres hexadecimales de cada commit.'],
    ['Issue', 'Elemento de seguimiento (bug, tarea, idea) en GitHub.'],
    ['Merge', 'Integrar los cambios de una rama en otra.'],
    ['Origin', 'Nombre por defecto del remoto desde el que se clonó.'],
    ['Pull', 'Fetch + merge (o rebase) de la rama remota en la local.'],
    ['Pull Request (PR)', 'Propuesta de fusión con revisión y discusión en GitHub.'],
    ['Push', 'Subir commits locales a un remoto.'],
    ['Rebase', 'Reaplicar commits sobre otra base, produciendo historia lineal.'],
    ['Reflog', 'Registro de todos los movimientos de HEAD; permite recuperar commits.'],
    ['Remote (remoto)', 'Repositorio alojado en otro lugar (GitHub, GitLab, otro servidor).'],
    ['Repository', 'Proyecto con su historial completo de versiones.'],
    ['Revert', 'Commit nuevo que deshace los cambios de otro commit.'],
    ['SemVer', 'Versionado semántico MAJOR.MINOR.PATCH.'],
    ['Squash', 'Combinar varios commits en uno.'],
    ['Staging area (index)', 'Zona intermedia donde se preparan los cambios del próximo commit.'],
    ['Stash', 'Guardar temporalmente cambios sin hacer commit.'],
    ['Tag', 'Etiqueta fija sobre un commit, normalmente para versiones.'],
    ['Upstream', 'Rama remota que rastrea la local; o el repo original de un fork.'],
    ['Workflow', 'Archivo YAML de GitHub Actions que define una automatización.'],
    ['Working tree', 'Los archivos reales en tu disco.']
  ],

  cheatsheet: [
    ['Configuración', [['git config --global user.name "Nombre"', 'Nombre de autor'], ['git config --global user.email "mail"', 'Email de autor'], ['git config --list', 'Ver configuración']]],
    ['Empezar', [['git init', 'Nuevo repo'], ['git clone <url>', 'Copiar repo remoto'], ['git status', 'Estado del árbol']]],
    ['Cambios', [['git add <archivo> | .', 'Preparar'], ['git commit -m "msg"', 'Confirmar'], ['git commit -am "msg"', 'add + commit de rastreados'], ['git diff [--staged]', 'Ver diferencias'], ['git restore <archivo>', 'Descartar cambios'], ['git restore --staged <archivo>', 'Sacar del stage']]],
    ['Historia', [['git log --oneline --graph --all', 'Historia gráfica'], ['git show <hash>', 'Ver un commit'], ['git blame <archivo>', 'Autor por línea'], ['git reflog', 'Movimientos de HEAD']]],
    ['Ramas', [['git branch', 'Listar'], ['git switch -c <rama>', 'Crear y cambiar'], ['git switch <rama>', 'Cambiar'], ['git merge <rama>', 'Fusionar en la actual'], ['git rebase <rama>', 'Rebasar la actual'], ['git branch -d <rama>', 'Borrar']]],
    ['Remotos', [['git remote add origin <url>', 'Conectar'], ['git remote -v', 'Ver remotos'], ['git push -u origin main', 'Primer push'], ['git push', 'Subir'], ['git pull', 'Bajar e integrar'], ['git fetch', 'Bajar sin integrar']]],
    ['Deshacer', [['git commit --amend', 'Modificar último commit'], ['git revert <hash>', 'Commit inverso'], ['git reset --soft HEAD~1', 'Quitar commit, conservar stage'], ['git reset --hard HEAD~1', 'Quitar commit y cambios ⚠️'], ['git stash / git stash pop', 'Guardar/recuperar temporal'], ['git cherry-pick <hash>', 'Traer un commit']]],
    ['Tags', [['git tag -a v1.0.0 -m "msg"', 'Crear tag'], ['git push origin v1.0.0', 'Subir tag'], ['git tag', 'Listar']]],
    ['GitHub CLI', [['gh auth login', 'Autenticarse'], ['gh repo create', 'Crear repo'], ['gh pr create', 'Abrir PR'], ['gh pr checkout 12', 'Bajar PR'], ['gh issue list', 'Ver issues']]]
  ]
};
