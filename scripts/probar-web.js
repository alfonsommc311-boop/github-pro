#!/usr/bin/env node
/* Prueba de navegador de GitHub PRO (assets/web).
   Requiere: npm i playwright-core (o playwright) y un Chromium accesible.
   Uso: node scripts/probar-web.js [ruta-a-chromium]
   Comprueba: home, las 55 lecciones (sin errores de consola, quiz respondible,
   navegación anterior/siguiente), las 9 herramientas y los retos de la terminal. */
var path = require('path'), fs = require('fs'), vm = require('vm');
var { spawn } = require('child_process');
var pw;
try { pw = require('playwright-core'); } catch (e) { try { pw = require('playwright'); } catch (e2) { console.error('Instala playwright-core: npm i playwright-core'); process.exit(2); } }

var ROOT = path.join(__dirname, '..', 'assets', 'web');
var PORT = 8765 + Math.floor(Math.random() * 200);
var BASE = 'http://localhost:' + PORT + '/';
var exe = process.argv[2] || process.env.CHROMIUM || undefined;

/* Retos: mismos comandos que un alumno escribiría */
var RETOS = {
  'primer-repo': ['git init', 'echo "# metrados-pro" > README.md', 'git add README.md', 'git commit -m "Crea el README"', 'echo "build/" > .gitignore', 'git add .', 'git commit -m "Añade .gitignore"', 'git log --oneline'],
  'ciclo-diario': ['git init', 'touch app.js', 'git add .', 'git commit -m "init"', 'echo "console.log(1)" >> app.js', 'git status', 'git diff', 'git add app.js', 'git diff --staged', 'git commit -m "Añade log"'],
  'rama': ['git init', 'touch a', 'git add .', 'git commit -m "init"', 'git switch -c feature/login', 'touch login.js', 'git add .', 'git commit -m "login"', 'git switch main', 'git branch'],
  'merge': ['git init', 'touch a', 'git add .', 'git commit -m "init"', 'git checkout -b feature/nav', 'touch nav.js', 'git add .', 'git commit -m "nav"', 'git checkout main', 'git merge feature/nav', 'git branch -d feature/nav', 'git log --oneline'],
  'remoto': ['git init', 'touch a', 'git add .', 'git commit -m "init"', 'git remote add origin https://github.com/u/metrados-pro.git', 'git remote -v', 'git push -u origin main', 'touch b', 'git add .', 'git commit -m "b"', 'git push'],
  'fork': ['git clone https://github.com/tu-usuario/mcp-utils.git', 'git remote add upstream https://github.com/comunidad/mcp-utils.git', 'git switch -c fix/encoding', 'echo "x" >> README.md', 'git commit -am "fix encoding"', 'git push -u origin fix/encoding'],
  'deshacer': ['git init', 'touch a', 'git add .', 'git commit -m "1"', 'touch b', 'git add .', 'git commit -m "2"', 'git revert HEAD', 'echo "z" >> a', 'git stash', 'git stash pop', 'git reflog'],
  'reset': ['git init', 'touch a', 'git add .', 'git commit -m "1"', 'touch b', 'git add .', 'git commit -m "2"', 'touch c', 'git add .', 'git commit -m "3"', 'git reset --hard HEAD~1', 'git reflog', '__RESET_TO_LOST__'],
  'release': ['git init', 'touch a', 'git add .', 'git commit -m "init"', 'git remote add origin https://github.com/u/r.git', 'git push -u origin main', 'git tag -a v1.0.0 -m "v1"', 'git push origin v1.0.0']
};

(async function () {
  var srv = spawn('python3', ['-m', 'http.server', String(PORT), '-d', ROOT], { stdio: 'ignore' });
  await new Promise(function (r) { setTimeout(r, 900); });
  var browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
  var page = await browser.newPage();
  var errors = [], pagina = '';
  page.on('pageerror', function (e) { errors.push(pagina + ': pageerror ' + e.message); });
  page.on('console', function (m) { if (m.type() === 'error') errors.push(pagina + ': console ' + m.text()); });
  page.on('response', function (r) { if (r.status() >= 400) errors.push(pagina + ': HTTP ' + r.status() + ' ' + r.url()); });

  var ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', 'catalog.js'), 'utf8'), ctx);
  var ids = []; ctx.CATALOG.forEach(function (a) { a.lessons.forEach(function (l) { ids.push(l.id); }); });

  pagina = 'index'; await page.goto(BASE + 'index.html');
  var cards = await page.$$eval('a.card', function (els) { return els.length; });
  if (cards !== ids.length) errors.push('index: ' + cards + ' tarjetas, esperadas ' + ids.length);
  await page.fill('#q', 'reflog'); await page.waitForTimeout(50);
  var visibles = await page.$$eval('a.card', function (els) { return els.filter(function (e) { return e.style.display !== 'none'; }).length; });
  if (!visibles) errors.push('index: la búsqueda "reflog" no muestra tarjetas');

  var xp = 0;
  for (var i = 0; i < ids.length; i++) {
    pagina = 'leccion/' + ids[i];
    await page.goto(BASE + 'lesson.html?l=' + ids[i]);
    await page.waitForSelector('.quiz .opt', { timeout: 8000 });
    var titulo = await page.textContent('.lesson-title');
    if (!titulo || titulo.length < 4) errors.push(pagina + ': sin título');
    var nSec = await page.$$eval('.sec', function (e) { return e.length; });
    if (nSec < 3) errors.push(pagina + ': solo ' + nSec + ' secciones');
    if (ids[i] !== 'examen-integrador') {
      var nErr = await page.$$eval('.err', function (e) { return e.length; });
      if (!nErr) errors.push(pagina + ': sin bloque de errores');
      var nCmd = await page.$$eval('.formula', function (e) { return e.length; });
      var nFlash = await page.$$eval('.flash', function (e) { return e.length; });
      if (!nFlash) errors.push(pagina + ': sin flashcards');
    }
    // responde el quiz correctamente
    var res = await page.evaluate(function () {
      var items = document.querySelectorAll('.qitem'), ok = 0;
      items.forEach(function (q) {
        var btns = q.querySelectorAll('.opt');
        // la respuesta correcta no se conoce desde el DOM: pulsa la primera y comprueba que aparece feedback
        btns[0].click();
        if (q.querySelector('.why')) ok++;
      });
      return { total: items.length, feedback: ok, score: (document.querySelector('.quiz-score') || {}).textContent };
    });
    if (res.total < 3 || res.feedback !== res.total) errors.push(pagina + ': quiz sin feedback (' + res.feedback + '/' + res.total + ')');
    // flip de una flashcard y audio de sección no deben fallar
    await page.evaluate(function () { var f = document.querySelector('.flash'); if (f) f.click(); var b = document.querySelector('.mini-audio'); if (b) { b.click(); b.click(); } });
    // navegación
    var nav = await page.$$eval('.lesson-nav a', function (e) { return e.map(function (a) { return a.getAttribute('href'); }); });
    if (i > 0 && !nav.some(function (h) { return h.indexOf(ids[i - 1]) > -1; })) errors.push(pagina + ': falta enlace a la anterior');
    if (i < ids.length - 1 && !nav.some(function (h) { return h.indexOf(ids[i + 1]) > -1; })) errors.push(pagina + ': falta enlace a la siguiente');
  }
  pagina = 'index-progreso'; await page.goto(BASE + 'index.html');
  var prog = await page.textContent('#ptxt');
  if (prog.indexOf(ids.length + ' de ' + ids.length) === -1) errors.push('progreso no marca todas leídas: ' + prog);

  // Herramientas
  pagina = 'herramientas'; await page.goto(BASE + 'herramientas.html');
  await page.fill('#f_usuario', 'alfonsommc311-boop'); await page.fill('#f_repo', 'metrados-pro'); await page.fill('#f_desc', 'App formativa de metrados');
  await page.selectOption('#f_tipo', 'Flutter (app Android)'); await page.fill('#f_rama', 'main'); await page.selectOption('#f_licencia', 'MIT'); await page.selectOption('#f_visib', 'Público'); await page.fill('#f_autor', 'Alfonso');
  await page.click('text=Guardar ficha');
  if ((await page.textContent('#estado')).indexOf('Ficha completa') === -1) errors.push('herramientas: la ficha no se marca completa');
  var hub = await page.$$eval('#hub a.card', function (e) { return e.length; });
  if (hub !== 8) errors.push('herramientas: hub con ' + hub + ' tarjetas');

  pagina = 'glosario'; await page.goto(BASE + 'glosario.html');
  await page.fill('#q', 'reflog'); await page.waitForTimeout(50);
  if ((await page.textContent('#cuenta')).indexOf('0 de') === 0) errors.push('glosario: búsqueda sin resultados');
  await page.click('.pill:nth-child(2)');

  pagina = 'comandos'; await page.goto(BASE + 'comandos.html');
  await page.fill('#q', 'deshacer commit'); await page.waitForTimeout(50);
  if ((await page.textContent('#cuenta')).indexOf('0 de') === 0) errors.push('comandos: "deshacer commit" sin resultados');
  await page.click('.prob .btn');

  pagina = 'gitignore'; await page.goto(BASE + 'gitignore.html');
  await page.click('#gen');
  var gi = await page.textContent('#out pre');
  if (gi.indexOf('.dart_tool/') === -1 || gi.indexOf('.env') === -1) errors.push('gitignore: falta contenido de Flutter o común');

  pagina = 'workflow'; await page.goto(BASE + 'workflow.html');
  var nObj = await page.$$eval('#objetivo .pill', function (e) { return e.length; });
  for (var k = 0; k < nObj; k++) {
    await page.click('#objetivo .pill:nth-child(' + (k + 1) + ')'); await page.click('#gen');
    var y = await page.textContent('#out pre');
    if (y.indexOf('jobs:') === -1 || y.indexOf('on:') === -1) errors.push('workflow: objetivo ' + k + ' sin jobs/on');
  }

  pagina = 'sos'; await page.goto(BASE + 'sos.html');
  await page.fill('#q', 'clave'); await page.waitForTimeout(50);
  if ((await page.textContent('#cuenta')).indexOf('0 de') === 0) errors.push('sos: "clave" sin resultados');

  pagina = 'checklist'; await page.goto(BASE + 'checklist.html');
  var listas = await page.$$eval('#tipo option', function (e) { return e.map(function (o) { return o.value; }); });
  for (var li = 0; li < listas.length; li++) {
    await page.selectOption('#tipo', listas[li]);
    var boxes = await page.$$('.chk input');
    for (var b = 0; b < boxes.length; b++) await boxes[b].check();
    if ((await page.textContent('#verdict')).indexOf('Lista completa') === -1) errors.push('checklist ' + listas[li] + ': no llega a completa');
  }

  pagina = 'plantillas'; await page.goto(BASE + 'plantillas.html');
  var nPl = await page.$$eval('#tipos .pill', function (e) { return e.length; });
  for (var p = 0; p < nPl; p++) {
    await page.click('#tipos .pill:nth-child(' + (p + 1) + ')');
    var txt = await page.textContent('#out pre');
    if (txt.length < 100) errors.push('plantillas: plantilla ' + p + ' muy corta');
    if (txt.indexOf('COMPLETAR') > -1) errors.push('plantillas: plantilla ' + p + ' con COMPLETAR pese a ficha llena');
  }

  // Terminal: todos los retos
  for (var rid in RETOS) {
    pagina = 'terminal/' + rid;
    await page.goto(BASE + 'terminal.html?reto=' + rid);
    await page.waitForSelector('#term-in');
    var cmds = RETOS[rid];
    for (var c = 0; c < cmds.length; c++) {
      var cmd = cmds[c];
      if (cmd === '__RESET_TO_LOST__') {
        var hash = await page.evaluate(function () { var o = window.__sim.repo.commits; var k = Object.keys(o); return k[k.length - 1]; });
        cmd = 'git reset --hard ' + hash;
      }
      await page.fill('#term-in', cmd); await page.press('#term-in', 'Enter');
    }
    var pend = await page.$$eval('.task:not(.done)', function (e) { return e.map(function (x) { return x.textContent; }); });
    if (pend.length) errors.push(pagina + ': tareas pendientes: ' + pend.join(' | '));
    if (!(await page.$('#reto-ok'))) errors.push(pagina + ': no se marcó completado');
  }
  pagina = 'terminal-libre'; await page.goto(BASE + 'terminal.html?reto=libre');
  await page.fill('#term-in', 'help'); await page.press('#term-in', 'Enter');
  await page.fill('#term-in', 'git status'); await page.press('#term-in', 'Enter');
  if ((await page.textContent('#term')).indexOf('no es un repositorio') === -1) errors.push('terminal libre: git status sin repo no avisa');

  // móvil: sin desborde horizontal en una lección
  await page.setViewportSize({ width: 390, height: 800 });
  pagina = 'movil'; await page.goto(BASE + 'lesson.html?l=' + ids[3]);
  await page.waitForSelector('.quiz .opt');
  var over = await page.evaluate(function () { return document.documentElement.scrollWidth - document.documentElement.clientWidth; });
  if (over > 2) errors.push('móvil: desborde horizontal de ' + over + 'px');
  if (process.env.CAPTURAS) {
    await page.screenshot({ path: path.join(process.env.CAPTURAS, 'leccion-movil.png') });
    await page.goto(BASE + 'index.html'); await page.screenshot({ path: path.join(process.env.CAPTURAS, 'home-movil.png') });
    await page.goto(BASE + 'terminal.html'); await page.screenshot({ path: path.join(process.env.CAPTURAS, 'terminal-movil.png') });
  }

  await browser.close(); srv.kill();
  if (errors.length) { console.log('ERRORES (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('TODO OK: ' + ids.length + ' lecciones, 9 herramientas, ' + Object.keys(RETOS).length + ' retos de terminal, vista móvil sin desborde.');
})().catch(function (e) { console.error(e); process.exit(1); });
