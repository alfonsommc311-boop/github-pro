Lesson.start({
  id: 'examen-integrador', area: 'Casos completos y examen', areaIcon: '🏆', icon: '🎓',
  title: 'Examen integrador',
  subtitle: 'Veinte situaciones reales que recorren las doce áreas del curso.',
  norma: 'Responde cada situación como si estuviera pasando en tu repositorio: primero diagnostica, luego elige el remedio que no destruye nada. Ante cualquier duda sobre una pantalla o un plan, verifica en docs.github.com porque la interfaz cambia.',
  intro: '<p>Este examen no pregunta definiciones: plantea <span class="hl">veinte situaciones</span> como las que enfrentas al construir y publicar tus aplicativos con Claude Code, y en cada una hay que decidir qué hacer. Recorre las doce áreas del curso, desde qué guarda un commit hasta cómo revisar un pull request abierto por un asistente, pasando por comandos exactos, Actions, Pages, SemVer, secretos filtrados, reflog y la CLI <code>gh</code>. Cada explicación indica en qué lección repasar si fallaste. Importa porque saber Git no es recordar comandos, es <b>elegir bien bajo presión</b> cuando un push es rechazado o una clave acaba en la historia.</p>',
  materials: [
    { t: 'Las once áreas anteriores', d: 'este examen presupone haber recorrido las lecciones; cada respuesta indica dónde repasar.' },
    { t: 'Los tres casos completos', d: 'publicar una app, recuperar un commit perdido y contribuir a un proyecto abierto resumen el método que aquí se evalúa.' }
  ],
  sections: [
    { h: 'Cómo rendirlo',
      html: '<p>Reserva unos minutos sin interrupciones y responde las veinte preguntas de corrido, sin consultar las lecciones: el objetivo es medir qué decides solo. Lee cada situación completa antes de mirar las opciones; casi todas describen un síntoma (un mensaje de Git, una pantalla de GitHub, un check en rojo) y lo que se evalúa es <span class="hl">identificar la causa antes de elegir el remedio</span>. Entre las opciones siempre hay una que "funciona" pero destruye algo (un force push, un reset --hard, borrar historia) y otra que parece prudente pero no resuelve (hacer el repo privado, cerrar el PR). La correcta es la que resuelve sin perder trabajo propio ni ajeno.</p>' },
    { h: 'Cómo leer tu puntaje',
      html: '<table><tr><th>Aciertos</th><th>Lectura</th><th>Qué hacer</th></tr><tr><td>18 a 20</td><td>Dominas el oficio: comandos, web y criterio</td><td>Pasa a los casos completos y aplica el método en tus repos reales</td></tr><tr><td>14 a 17</td><td>Base sólida con lagunas puntuales</td><td>Repasa solo las lecciones que nombra cada explicación fallada</td></tr><tr><td>10 a 13</td><td>Conoces los comandos pero dudas en las situaciones</td><td>Practica en la Terminal simulada y en SOS Git; vuelve a rendir en una semana</td></tr><tr><td>Menos de 10</td><td>Faltan fundamentos</td><td>Recorre de nuevo las áreas 1 a 4 antes de seguir</td></tr></table><p>Más útil que el total es el <b>patrón</b> de fallos: si los errores se concentran en Actions y Pages, el problema es de publicación; si están en reflog, reset y push rechazado, es de calma ante los accidentes. Anota las lecciones que aparecen en los <i>why</i> de las preguntas falladas y repásalas en ese orden.</p>' },
    { h: 'Qué cubre',
      html: '<p>Mínimo una situación por área: fundamentos, primer repositorio, ramas y fusiones, remotos, pull requests, issues y proyectos, Actions, publicación, Git avanzado, seguridad y flujos, asistentes y CLI, casos completos. Varias exigen el <b>comando exacto</b>; varias preguntan <b>qué revisar en un PR</b>; hay una de secretos filtrados, una de reflog, una de Actions, una de Pages, una de SemVer y una de Claude Code. No hay trampas de memoria: cuando una cifra o una ruta de la interfaz puede haber cambiado, la respuesta correcta remite a verificar en docs.github.com.</p>' }
  ],
  errors: [
    { bad: 'Elegir la opción que "arregla rápido" (push --force, reset --hard, borrar la rama) sin haber diagnosticado.', fix: 'Lee el síntoma, identifica la causa y elige el remedio reversible: revert, reflog, rama de rescate, --force-with-lease solo en ramas propias.' },
    { bad: 'Rendir el examen con las lecciones abiertas y creer que el puntaje mide lo aprendido.', fix: 'Responde de corrido sin consultar; luego repasa las lecciones que nombran las explicaciones de lo que fallaste.' }
  ],
  keypoints: [
    'Casi nada se pierde en Git; lo que se pierde es la calma: diagnostica antes de mover.',
    'Un commit pequeño con buen mensaje vale más que diez "cambios varios".',
    'Nada entra a main sin PR, sin revisión del diff y sin checks en verde, aunque lo haya escrito una IA.',
    'Un secreto subido se revoca; borrarlo en un commit posterior no lo saca de la historia.',
    'Los binarios van en la release, los secretos en Actions, las rutas de Pages son relativas.'
  ],
  flashcards: [
    { q: '¿Cuál es el único push forzado aceptable?', a: 'git push --force-with-lease sobre una rama propia que reescribiste a propósito; nunca sobre main ni sobre ramas compartidas.' },
    { q: '¿Qué tres pestañas del PR se revisan antes de fusionar?', a: 'Files changed (el diff completo), Checks (CI en verde) y Conversation (hilos resueltos).' },
    { q: 'Se subió una clave de API al repo. ¿Primer paso?', a: 'Revocarla o rotarla en el proveedor; después limpiar la historia y proteger con .gitignore y secretos de Actions.' },
    { q: 'Con SemVer, ¿qué número sube al corregir un error sin cambiar la API?', a: 'PATCH: de 1.1.0 a 1.1.1.' }
  ],
  quiz: [
    { q: 'Tu laptop con metrados-pro se malogra. Habías hecho commits todos los días pero nunca git push. ¿Qué queda en GitHub?', opts: ['Nada: los commits viven solo en la carpeta .git local hasta que se suben', 'Todo, porque GitHub sincroniza cada commit automáticamente', 'Solo los archivos, sin la historia'], correct: 0,
      why: 'Git es local; GitHub recibe únicamente lo que se empuja. Repasa "Qué son Git y GitHub" y "Crear un repo y primer push".' },
    { q: 'Cambiaste un archivo de word-mcp y quieres saber exactamente qué entrará en el próximo commit, no lo que sigue sin preparar. ¿Qué comando?', opts: ['git diff', 'git diff --staged', 'git log -p'], correct: 1,
      why: 'git diff compara árbol de trabajo con stage; --staged compara stage con HEAD, que es lo que se confirmará. Repasa "status, diff y log".' },
    { q: 'Antes del primer commit de una app Flutter, git status lista build/, .dart_tool/ y key.properties. ¿Qué haces?', opts: ['git add . y borrarlos en el siguiente commit', 'Hacer el repo privado y seguir', 'Escribir .gitignore con esas rutas, comprobar con git status y recién entonces git add .'], correct: 2,
      why: 'Lo que entra en un commit queda en la historia aunque lo borres; el .gitignore va antes del primer add. Repasa ".gitignore y qué no subir jamás".' },
    { q: 'Estás en feature/igv y ejecutas git merge main para "subir tu trabajo a main". ¿Qué ocurrió realmente?', opts: ['main recibió tus commits', 'Trajiste main hacia tu rama; main no cambió: el merge se hace desde la rama destino', 'Git rechazó el comando por estar en la rama equivocada'], correct: 1,
      why: 'git merge <rama> incorpora esa rama en la rama actual. Para llevar feature a main: git switch main y git merge feature/igv. Repasa "Merge: fast-forward y de tres vías".' },
    { q: 'Al fusionar, catalog.js muestra <<<<<<< HEAD, ======= y >>>>>>> feature/lote-3. ¿Qué haces?', opts: ['Borrar los marcadores y hacer commit tal cual', 'Ejecutar git merge --continue sin tocar el archivo', 'Decidir qué queda de cada bloque, borrar los marcadores, git add y git commit'], correct: 2,
      why: 'Arriba está tu versión, abajo la que llega; hay que resolver a mano y luego confirmar. Repasa "Resolver conflictos".' },
    { q: 'Hiciste git rebase main en tu rama personal claude/lote-5 (ya subida antes) y ahora git push es rechazado. ¿Comando correcto?', opts: ['git push --force-with-lease origin claude/lote-5', 'git push --force origin main', 'git reset --hard origin/claude/lote-5 y perder el rebase'], correct: 0,
      why: 'El rebase cambió los hashes; en una rama propia se reemplaza la punta con --force-with-lease, que falla si alguien subió entretanto. Repasa "Rebase y cuándo no usarlo".' },
    { q: 'git push por HTTPS responde "Authentication failed" aunque la contraseña es correcta. ¿Causa más probable?', opts: ['La rama está protegida', 'GitHub no acepta la contraseña por HTTPS: necesitas un token personal (o SSH) y el token puede haber caducado', 'El repositorio es público'], correct: 1,
      why: 'Por HTTPS se autentica con Personal Access Token guardado en el gestor de credenciales, o con clave SSH. Repasa "Autenticación: token, SSH y gh".' },
    { q: 'Claude Code abrió un PR desde claude/lecciones-area-7 hacia main. ¿Qué es lo mínimo que revisas antes de fusionar?', opts: ['El título y la cantidad de commits', 'Que el asistente haya puesto Co-Authored-By', 'La pestaña Files changed completa, los checks en verde y probar el cambio'], correct: 2,
      why: 'El asistente puede equivocarse; el diff lo revisa una persona, con CI en verde y prueba real. Repasa "Anatomía de un pull request" y "Claude Code y GitHub".' },
    { q: 'Rocío revisa un PR de Mateo y encuentra una línea que se puede mejorar con un cambio concreto. ¿Cuál es la forma más eficiente de proponerlo?', opts: ['Un bloque suggestion en el comentario de línea, que Mateo aplica con un clic', 'Aprobar y corregirlo ella después en main', 'Cerrar el PR y pedirle que lo reabra'], correct: 0,
      why: 'Las suggestions convierten el comentario en un commit aplicable desde la web. Repasa "Revisar código con criterio".' },
    { q: 'Un PR de 14 commits "wip" está listo. Quieres que main conserve un solo commit limpio con el mensaje del PR. ¿Qué estrategia eliges en el botón de merge?', opts: ['Merge commit', 'Rebase and merge', 'Squash and merge'], correct: 2,
      why: 'Squash aplasta todos los commits del PR en uno en main; rebase los reaplica uno a uno; merge commit los conserva más uno de fusión. Repasa "Estrategias de merge".' },
    { q: 'Un usuario de metrados-pro abre un issue con el título "no funciona". ¿Qué le pides para que se pueda resolver?', opts: ['Que lo cierre y escriba por correo', 'Pasos para reproducir, comportamiento esperado vs actual, versión y dispositivo, captura', 'Que ponga +1 en otros issues parecidos'], correct: 1,
      why: 'Un issue resoluble describe cómo reproducir, qué esperaba y qué pasó, y en qué entorno. Repasa "Issues que se resuelven".' },
    { q: 'Tu workflow de Actions falla en el paso run: node scripts/validar.js con "no such file or directory". ¿Qué falta casi seguro?', opts: ['Cambiar a windows-latest', 'Un secreto con la ruta del script', 'El paso uses: actions/checkout@v4 al inicio: el runner nace vacío'], correct: 2,
      why: 'El repositorio no se clona solo en el runner; sin checkout no hay archivos. Repasa "Qué es un workflow" y "Anatomía del YAML".' },
    { q: 'Necesitas que Actions firme el APK con tu keystore. ¿Dónde lo guardas?', opts: ['En Settings → Secrets and variables → Actions, codificado en base64, y lo decodificas en el runner', 'En android/app/ dentro del repo, con el .gitignore después', 'En una variable de repositorio para poder verla en los logs'], correct: 0,
      why: 'Los secretos se cifran y se enmascaran; una variable es visible y el repo queda en la historia. Repasa "Secretos, variables y entornos".' },
    { q: 'Publicaste cotizador-web en Pages y la página sale en blanco; la consola muestra 404 en /assets/app.js. ¿Causa?', opts: ['Pages no sirve JavaScript', 'Bajo usuario.github.io/cotizador-web/ las rutas absolutas apuntan a la raíz del dominio: deben ser relativas', 'Falta el archivo CNAME'], correct: 1,
      why: 'El sitio se sirve bajo /repo/, así que /assets/... busca fuera del proyecto. Repasa "GitHub Pages".' },
    { q: 'metrados-pro está en v1.1.0. Corriges un error del quiz sin añadir funciones ni romper nada. ¿Cuál es la siguiente versión?', opts: ['v2.0.0', 'v1.2.0', 'v1.1.1'], correct: 2,
      why: 'SemVer: MAJOR rompe compatibilidad, MINOR añade, PATCH corrige. Repasa "Tags, releases y SemVer".' },
    { q: 'Ejecutaste git reset --hard HEAD~3 en tu rama y perdiste tres commits que sí querías. ¿Cómo los recuperas?', opts: ['git reflog para hallar el hash anterior y git reset --hard <hash> (o git branch rescate <hash>)', 'git revert HEAD~3', 'Es imposible: reescribe los cambios'], correct: 0,
      why: 'Los commits siguen en el repositorio; el reflog registra por dónde pasó HEAD. Repasa "reset, revert y reflog" y el caso "Recuperar un commit perdido".' },
    { q: 'El quiz se rompió en algún punto de los últimos 40 commits y no sabes cuál. ¿Herramienta más eficiente?', opts: ['Leer los 40 diffs uno por uno', 'git bisect start, marcar bad y good, y probar en cada punto medio', 'git blame sobre todo el proyecto'], correct: 1,
      why: 'bisect hace búsqueda binaria: unos seis pasos para 40 commits. Repasa "bisect, blame y arqueología".' },
    { q: 'Descubres que hace tres commits subiste una clave de API de word-mcp a GitHub. ¿Primer paso?', opts: ['Borrar la clave en un commit nuevo y hacer push', 'Hacer el repo privado', 'Revocar o rotar la clave en el proveedor; después limpiar la historia y prevenir con .gitignore y secretos'], correct: 2,
      why: 'Borrarla en un commit posterior no la saca de la historia y un repo privado no deshace la filtración; la clave ya está comprometida. Repasa "Secret scanning y push protection".' },
    { q: 'Trabajas solo con Claude Code en tus apps formativas. ¿Qué flujo de ramas conviene?', opts: ['GitHub Flow: main desplegable, una rama por tarea (las claude/...), PR, CI y squash', 'Git Flow completo con develop, release y hotfix', 'Todo directo en main sin ramas'], correct: 0,
      why: 'Git Flow añade ceremonia innecesaria para una persona; trabajar directo en main pierde revisión y CI. Repasa "GitHub Flow, Git Flow y trunk-based".' },
    { q: 'Quieres fusionar desde la terminal el PR número 27 abierto por Claude Code, después de revisarlo. ¿Comando?', opts: ['git merge 27', 'gh pr merge 27 --squash', 'git push origin pr/27'], correct: 1,
      why: 'gh opera sobre GitHub (PR, issues, releases); git opera sobre la historia local. Repasa "GitHub CLI: gh".' }
  ]
});
