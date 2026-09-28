/* Lógica de la aplicación: enrutado por hash, progreso en localStorage,
   quizzes, terminal de práctica y vistas auxiliares. */
(function () {
  'use strict';
  var COURSE = window.COURSE;
  var $app = document.getElementById('app');
  var KEY = 'githubpro.progress';

  /* ---------- progreso ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* modo privado */ } }
  var progress = load();
  progress.done = progress.done || {};       // lessonId -> {quiz: bool, practice: bool}
  progress.xp = progress.xp || 0;
  progress.days = progress.days || [];

  function touchStreak() {
    var today = new Date().toISOString().slice(0, 10);
    if (progress.days.indexOf(today) === -1) { progress.days.push(today); save(progress); }
  }
  function streak() {
    var n = 0, d = new Date();
    for (;;) {
      var iso = d.toISOString().slice(0, 10);
      if (progress.days.indexOf(iso) === -1) break;
      n++; d.setDate(d.getDate() - 1);
    }
    return n;
  }

  var allLessons = [];
  COURSE.modules.forEach(function (m) { m.lessons.forEach(function (l) { l.module = m; allLessons.push(l); }); });

  function isDone(l) {
    var d = progress.done[l.id];
    return !!(d && d.quiz && (!l.practice || d.practice));
  }
  function markPart(l, part) {
    progress.done[l.id] = progress.done[l.id] || {};
    if (!progress.done[l.id][part]) {
      progress.done[l.id][part] = true;
      progress.xp += part === 'quiz' ? l.xp : Math.round(l.xp / 2);
      touchStreak(); save(progress); renderSidebar();
    }
  }

  /* ---------- sidebar ---------- */
  function renderSidebar() {
    var ul = document.getElementById('module-list'), html = '';
    var cur = location.hash.replace('#/leccion/', '');
    COURSE.modules.forEach(function (m) {
      html += '<li class="mod-title">' + m.icon + ' ' + m.title + '</li>';
      m.lessons.forEach(function (l) {
        html += '<li><a href="#/leccion/' + l.id + '" class="' + (isDone(l) ? 'done' : 'todo') + (cur === l.id ? ' active' : '') + '">' + l.title + '</a></li>';
      });
    });
    ul.innerHTML = html;
    var n = allLessons.filter(isDone).length, pct = Math.round(100 * n / allLessons.length);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent = pct + '% completado (' + n + '/' + allLessons.length + ')';
    document.getElementById('xp-badge').textContent = progress.xp + ' XP';
    document.getElementById('streak-badge').textContent = '🔥 ' + streak();
  }

  /* ---------- vistas ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function viewHome() {
    var n = allLessons.filter(isDone).length;
    var next = allLessons.filter(function (l) { return !isDone(l); })[0];
    var html = '<h1>Aprende Git y GitHub de cero a pro 🐙</h1>' +
      '<p class="muted">' + allLessons.length + ' lecciones con teoría, quiz y práctica en una terminal simulada. Tu progreso se guarda en este navegador.</p>';
    if (next) html += '<p><a class="btn" href="#/leccion/' + next.id + '">' + (n ? 'Continuar: ' : 'Empezar: ') + esc(next.title) + ' →</a></p>';
    else html += '<div class="callout tip"><b>¡Curso completado!</b> Has terminado todas las lecciones. Sigue practicando en la terminal libre o repasa la chuleta.</div>';
    COURSE.modules.forEach(function (m) {
      html += '<h2>' + m.icon + ' ' + esc(m.title) + '</h2><div class="grid">';
      m.lessons.forEach(function (l) {
        html += '<a class="card lesson-card" href="#/leccion/' + l.id + '"><span class="tag' + (isDone(l) ? ' done' : '') + '">' + (isDone(l) ? '✓ Completada' : l.xp + ' XP') + '</span>' +
          '<h3>' + esc(l.title) + '</h3><small class="muted">' + l.quiz.length + ' preguntas' + (l.practice ? ' · práctica' : '') + '</small></a>';
      });
      html += '</div>';
    });
    $app.innerHTML = html;
  }

  function viewLesson(id) {
    var l = allLessons.filter(function (x) { return x.id === id; })[0];
    if (!l) return viewHome();
    var idx = allLessons.indexOf(l), prev = allLessons[idx - 1], next = allLessons[idx + 1];
    var d = progress.done[l.id] || {};
    var html = '<small class="muted">' + l.module.icon + ' ' + esc(l.module.title) + '</small><h1>' + esc(l.title) + '</h1>' +
      '<div class="lesson-body">' + l.content + '</div>';
    html += '<div class="card quiz" id="quiz"><h2 style="margin-top:0">📝 Quiz' + (d.quiz ? ' <span class="tag done">✓ superado</span>' : '') + '</h2>';
    l.quiz.forEach(function (q, i) {
      html += '<div class="q" data-i="' + i + '"><p><b>' + (i + 1) + '. ' + esc(q.q) + '</b></p>';
      q.a.forEach(function (a, j) { html += '<label><input type="radio" name="q' + i + '" value="' + j + '"> ' + esc(a) + '</label>'; });
      html += '<div class="explain"></div></div>';
    });
    html += '<button class="btn" id="check-quiz">Comprobar</button> <span id="quiz-result" class="result"></span></div>';
    if (l.practice) {
      html += '<div class="card" id="practice"><h2 style="margin-top:0">⌨️ Práctica' + (d.practice ? ' <span class="tag done">✓ completada</span>' : '') + '</h2><p>' + esc(l.practice.intro) + ' Escribe <code>help</code> para ver los comandos.</p>' +
        '<div id="tasks">' + l.practice.tasks.map(function (t, i) { return '<div class="task" data-i="' + i + '">☐ ' + esc(t.text) + '</div>'; }).join('') + '</div>' +
        terminalHTML() + '</div>';
    }
    html += '<div class="lesson-nav">' + (prev ? '<a class="btn secondary" href="#/leccion/' + prev.id + '">← ' + esc(prev.title) + '</a>' : '<span></span>') +
      (next ? '<a class="btn" href="#/leccion/' + next.id + '">' + esc(next.title) + ' →</a>' : '<a class="btn" href="#/">Inicio</a>') + '</div>';
    $app.innerHTML = html;

    document.getElementById('check-quiz').onclick = function () {
      var correct = 0;
      l.quiz.forEach(function (q, i) {
        var box = $app.querySelector('.q[data-i="' + i + '"]');
        var sel = box.querySelector('input:checked');
        box.querySelectorAll('label').forEach(function (lb) { lb.classList.remove('correct', 'wrong'); });
        var labels = box.querySelectorAll('label');
        labels[q.c].classList.add('correct');
        if (sel && +sel.value === q.c) correct++; else if (sel) labels[+sel.value].classList.add('wrong');
        box.querySelector('.explain').textContent = q.e;
      });
      var res = document.getElementById('quiz-result');
      var passed = correct === l.quiz.length;
      res.textContent = correct + '/' + l.quiz.length + (passed ? ' ¡Perfecto! +' + l.xp + ' XP' : ' — revisa las explicaciones e inténtalo de nuevo');
      res.className = 'result ' + (passed ? 'ok' : 'bad');
      if (passed) markPart(l, 'quiz');
    };

    if (l.practice) mountTerminal(l);
    window.scrollTo(0, 0);
  }

  /* ---------- terminal ---------- */
  function terminalHTML() {
    return '<div class="term" id="term"></div><div class="term-input"><input id="term-in" placeholder="$ git status" autocomplete="off" spellcheck="false"><button class="btn secondary" id="term-reset" title="Reiniciar simulador">↺</button></div>' +
      '<div class="state-view" id="state-view"></div>';
  }

  function mountTerminal(lesson) {
    var sim = new GitSim(), term = document.getElementById('term'), input = document.getElementById('term-in');
    var hist = [], hpos = 0;
    function print(text, cls) {
      if (text === '\u0000clear') { term.innerHTML = ''; return; }
      var div = document.createElement('div'); div.className = 'line ' + (cls || ''); div.textContent = text; term.appendChild(div);
      term.scrollTop = term.scrollHeight;
    }
    function renderState() {
      var s = sim.state(), v = document.getElementById('state-view');
      if (!v) return;
      if (!s.initialized) { v.innerHTML = '<div><b>Repo</b>sin inicializar</div><div><b>Archivos</b>' + (s.files.join(', ') || '—') + '</div>'; return; }
      v.innerHTML = '<div><b>Rama</b>' + esc(s.branch) + ' (' + s.commits + ' commits)</div>' +
        '<div><b>Archivos</b>' + (s.files.map(esc).join(', ') || '—') + '</div>' +
        '<div><b>Staged</b>' + (s.staged.map(esc).join(', ') || '—') + '</div>' +
        '<div><b>Modificados</b>' + (s.modified.map(esc).join(', ') || '—') + '</div>' +
        '<div><b>Sin seguimiento</b>' + (s.untracked.map(esc).join(', ') || '—') + '</div>' +
        '<div><b>Ramas</b>' + s.branches.map(esc).join(', ') + '</div>' +
        '<div><b>Remotos</b>' + (s.remotes.map(esc).join(', ') || '—') + (s.remoteBranches.length ? ' → ' + s.remoteBranches.map(esc).join(', ') : '') + '</div>' +
        (s.tags.length ? '<div><b>Tags</b>' + s.tags.map(esc).join(', ') + '</div>' : '') +
        (s.stash ? '<div><b>Stash</b>' + s.stash + ' entrada(s)</div>' : '');
    }
    function checkTasks() {
      if (!lesson || !lesson.practice) return;
      var s = sim.state(), all = true;
      lesson.practice.tasks.forEach(function (t, i) {
        var el = $app.querySelector('.task[data-i="' + i + '"]');
        var ok = false;
        try { ok = !!t.check(s, sim.history); } catch (e) { ok = false; }
        if (ok && !el.classList.contains('done')) { el.classList.add('done'); el.textContent = '☑ ' + t.text; }
        if (!el.classList.contains('done')) all = false; // una tarea cumplida se conserva aunque el estado cambie después
      });
      if (all) {
        markPart(lesson, 'practice');
        if (!document.getElementById('practice-ok')) {
          var p = document.createElement('div'); p.id = 'practice-ok'; p.className = 'callout tip'; p.innerHTML = '<b>¡Práctica completada!</b> +' + Math.round(lesson.xp / 2) + ' XP';
          document.getElementById('tasks').appendChild(p);
        }
      }
    }
    function run(line) {
      print('$ ' + line, 'prompt');
      var r = sim.exec(line);
      r.out.forEach(function (o) { print(o.text, o.cls); });
      renderState(); checkTasks();
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var v = input.value; input.value = ''; if (v.trim()) { hist.push(v); hpos = hist.length; run(v); } }
      else if (e.key === 'ArrowUp') { if (hpos > 0) { hpos--; input.value = hist[hpos]; } e.preventDefault(); }
      else if (e.key === 'ArrowDown') { if (hpos < hist.length - 1) { hpos++; input.value = hist[hpos]; } else { hpos = hist.length; input.value = ''; } e.preventDefault(); }
    });
    document.getElementById('term-reset').onclick = function () {
      sim.reset(); term.innerHTML = ''; print('Simulador reiniciado. Escribe `help` para ver los comandos.', 'warn'); renderState();
      $app.querySelectorAll('.task').forEach(function (el, i) { el.classList.remove('done'); el.textContent = '☐ ' + lesson.practice.tasks[i].text; });
      var ok = document.getElementById('practice-ok'); if (ok) ok.remove();
    };
    print('Terminal simulada de Git. Estás en /home/user/proyecto. Escribe `help` para ver los comandos.', 'warn');
    renderState();
    input.focus();
    window.__sim = sim; // útil para depurar
  }

  function viewTerminal() {
    $app.innerHTML = '<h1>⌨️ Terminal libre</h1><p class="muted">Practica lo que quieras. El simulador soporta un subconjunto de Git: repos, staging, commits, ramas, merge, remotos, push/pull, stash, tags, reset y revert.</p><div class="card">' + terminalHTML() + '</div>';
    mountTerminal(null);
  }

  function viewGlossary() {
    var html = '<h1>📖 Glosario</h1><input class="search" id="gsearch" placeholder="Buscar término…"><dl class="glossary" id="glist"></dl>';
    $app.innerHTML = html;
    function render(q) {
      q = (q || '').toLowerCase();
      document.getElementById('glist').innerHTML = COURSE.glossary.filter(function (g) { return !q || (g[0] + ' ' + g[1]).toLowerCase().indexOf(q) > -1; })
        .map(function (g) { return '<dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd>'; }).join('') || '<p class="muted">Sin resultados.</p>';
    }
    document.getElementById('gsearch').oninput = function (e) { render(e.target.value); };
    render('');
  }

  function viewCheatsheet() {
    var html = '<h1>📋 Chuleta de comandos</h1><div class="cheat">';
    COURSE.cheatsheet.forEach(function (sec) {
      html += '<h3>' + esc(sec[0]) + '</h3><table>' + sec[1].map(function (r) { return '<tr><td><code>' + esc(r[0]) + '</code></td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>';
    });
    $app.innerHTML = html + '</div>';
  }

  /* ---------- router ---------- */
  function route() {
    var h = location.hash || '#/';
    document.getElementById('sidebar').classList.remove('open');
    if (h.indexOf('#/leccion/') === 0) viewLesson(h.slice(10));
    else if (h === '#/terminal') viewTerminal();
    else if (h === '#/glosario') viewGlossary();
    else if (h === '#/cheatsheet') viewCheatsheet();
    else viewHome();
    renderSidebar();
  }
  window.addEventListener('hashchange', route);

  /* ---------- tema y menú ---------- */
  var theme;
  try { theme = localStorage.getItem('githubpro.theme'); } catch (e) { theme = null; }
  if (!theme) theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-btn').onclick = function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('githubpro.theme', theme); } catch (e) { /* ignorar */ }
  };
  document.getElementById('menu-btn').onclick = function () { document.getElementById('sidebar').classList.toggle('open'); };

  touchStreak();
  route();
})();
