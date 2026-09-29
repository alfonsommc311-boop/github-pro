/* ============================================================
   GitHub PRO — motor de aprendizaje
   Speak  = narración por voz (TTS nativo de Android + fallback navegador)
   Lesson = framework de lecciones (materiales, pasos dibujados, fichas, quiz)
   Catalogo global de lecciones para buscador / progreso
   ============================================================ */

/* ---------------- Utilidades de almacenamiento (progreso) ---------------- */
var Store = {
  get: function (k, def) {
    try { var v = localStorage.getItem('gh:' + k); return v == null ? def : JSON.parse(v); }
    catch (e) { return def; }
  },
  set: function (k, v) {
    try { localStorage.setItem('gh:' + k, JSON.stringify(v)); } catch (e) {}
  }
};

/* ---------------- Voz / narración (TTS nativo con cola secuencial) ----------------
   - say(texto, btn)          → lee un texto suelto (toggle play/stop)
   - playQueue(items, onhl)   → lee items=[{text, el}] en orden, resaltando el actual
   - setRate(r)               → 0.2 (lento) … 1.0 (rápido); por defecto 0.5
   El shell Flutter responde llamando window.__ttsDone() al terminar cada frase. */
var Speak = {
  playing: false,
  btn: null,
  queue: [],
  qi: -1,
  onHighlight: null,
  rate: 0.5,

  _bridge: function (cmd, text) {
    try {
      if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
        window.flutter_inappwebview.callHandler('tts', { cmd: cmd, text: text || '', rate: this.rate });
      } else if (window.speechSynthesis) {
        if (cmd === 'stop') { window.speechSynthesis.cancel(); }
        else if (cmd === 'rate') { /* el fallback aplica rate por utterance */ }
        else {
          window.speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES';
          u.rate = 0.6 + this.rate * 0.9; // mapea 0.2..1.0 → ~0.78..1.5
          u.onend = function () { Speak.done(); };
          window.speechSynthesis.speak(u);
        }
      }
    } catch (e) {}
  },

  setRate: function (r) {
    this.rate = Math.max(0.2, Math.min(1.0, r));
    Store.set('rate', this.rate);
    this._bridge('rate', '');
  },

  // lectura simple (un botón que alterna)
  say: function (text, btn) {
    if (this.playing) { this.stop(); return; }
    this.queue = []; this.qi = -1; this.onHighlight = null;
    this.playing = true; this.btn = btn;
    if (btn) btn.innerHTML = '⏸ Detener';
    this._bridge('speak', text);
  },

  // lectura secuencial de varias secciones
  playQueue: function (items, onHighlight, btn) {
    if (this.playing) { this.stop(); return; }
    this.queue = items || []; this.qi = -1;
    this.onHighlight = onHighlight || null;
    this.playing = true; this.btn = btn;
    if (btn) btn.innerHTML = '⏸ Detener lección';
    this._next();
  },

  _next: function () {
    this.qi++;
    if (!this.playing || this.qi >= this.queue.length) { this.stop(); return; }
    var item = this.queue[this.qi];
    if (this.onHighlight) this.onHighlight(this.qi, item);
    this._bridge('speak', item.text);
  },

  stop: function () {
    this.playing = false;
    var hadQueue = this.queue.length > 0;
    this.queue = []; this.qi = -1;
    if (this.onHighlight) this.onHighlight(-1, null);
    this.onHighlight = null;
    if (this.btn) this.btn.innerHTML = this.btn.dataset.lbl || '🔊 Escuchar';
    this.btn = null;
    this._bridge('stop', '');
  },

  // invocado por el shell Flutter al terminar cada frase
  done: function () {
    if (this.playing && this.queue.length && this.qi < this.queue.length - 1) {
      this._next();
      return;
    }
    this.playing = false;
    if (this.onHighlight) this.onHighlight(-1, null);
    this.onHighlight = null;
    if (this.btn) this.btn.innerHTML = this.btn.dataset.lbl || '🔊 Escuchar';
    this.btn = null;
    this.queue = []; this.qi = -1;
  }
};
if (typeof window !== 'undefined') {
  window.__ttsDone = function () { Speak.done(); };
  Speak.rate = Store.get('rate', 0.5);
}

/* ---------------- Conversión de HTML a texto narrable ---------------- */
function toSpeech(html) {
  var d = document.createElement('div');
  d.innerHTML = html.replace(/<li>/g, '<li>• ');
  var t = d.textContent || d.innerText || '';
  return t.replace(/\s+/g, ' ').replace(/•/g, '. ').trim();
}

/* ============================================================
   Framework de Lección
   ============================================================ */
var Lesson = (function () {
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function start(spec) {
    document.title = (spec.title || 'Lección') + ' · GitHub PRO';
    var ttEl = document.getElementById('tt');
    if (ttEl) ttEl.textContent = spec.title || '';

    var root = document.getElementById('lesson');
    root.innerHTML = '';

    // Encabezado
    if (spec.area) root.appendChild(el('div', 'area-badge', (spec.areaIcon ? spec.areaIcon + ' ' : '') + spec.area));
    root.appendChild(el('h1', 'lesson-title', (spec.icon ? spec.icon + ' ' : '') + spec.title));
    if (spec.subtitle) root.appendChild(el('div', 'lesson-sub', spec.subtitle));
    if (spec.norma) root.appendChild(el('div', 'norma-tag', '📌 ' + spec.norma));

    // Barra de audio de la lección completa + velocidad
    var bar = el('div', 'audiobar');
    var playAll = el('button', 'btn primary', '▶ Escuchar lección completa');
    playAll.type = 'button';
    playAll.dataset.lbl = '▶ Escuchar lección completa';

    var speed = el('div', 'speed');
    speed.innerHTML = '<span>🐢</span>';
    var slider = el('input');
    slider.type = 'range'; slider.min = '0.2'; slider.max = '1.0'; slider.step = '0.1';
    slider.value = Speak.rate;
    slider.oninput = function () { Speak.setRate(parseFloat(slider.value)); };
    speed.appendChild(slider);
    speed.appendChild(el('span', null, '🐇'));
    bar.appendChild(playAll);
    bar.appendChild(speed);
    root.appendChild(bar);

    // Intro
    var sectionEls = [];
    var queue = [];
    if (spec.intro) {
      var introBox = el('div', 'intro');
      introBox.innerHTML = spec.intro;
      root.appendChild(introBox);
      queue.push({ text: toSpeech(spec.intro), el: introBox });
      sectionEls.push(introBox);
    }

    // Ilustración de la lección (librería local assets/img/<fig>.svg)
    if (spec.fig) {
      var figBox = el('div', 'fig');
      var img = document.createElement('img');
      img.src = 'assets/img/' + spec.fig + '.svg';
      img.alt = spec.figcap || spec.title || '';
      img.loading = 'lazy';
      img.onerror = function () { figBox.style.display = 'none'; };
      figBox.appendChild(img);
      if (spec.figcap) figBox.appendChild(el('div', 'fig-cap', '🖼️ ' + spec.figcap));
      root.appendChild(figBox);
    }

    // Materiales y herramientas (lista marcable, se guarda por lección)
    if (spec.materials && spec.materials.length) {
      var matBox = el('div', 'materials');
      var mh = el('div', 'mat-head');
      mh.innerHTML = '<span>✅ Antes de empezar: ten esto claro</span>';
      var mb = el('button', 'mini-audio', '🔊'); mb.type = 'button'; mb.dataset.lbl = '🔊';
      var matText = 'Antes de empezar, ten esto claro. ' + spec.materials.map(function (m) {
        return typeof m === 'string' ? m : (m.t + '. ' + (m.d || ''));
      }).join('. ');
      mb.onclick = function () { Speak.say(matText, mb); };
      mh.appendChild(mb);
      matBox.appendChild(mh);

      var checked = Store.get('mat:' + (spec.id || 'x'), {});
      var mul = el('ul', 'mat-list');
      spec.materials.forEach(function (m, mi) {
        var t = typeof m === 'string' ? m : m.t;
        var d = typeof m === 'string' ? '' : (m.d || '');
        var li = el('li', 'mat-item' + (checked[mi] ? ' has' : ''));
        li.innerHTML = '<span class="mat-box">' + (checked[mi] ? '✔' : '') + '</span>' +
          '<span class="mat-txt"><b>' + t + '</b>' + (d ? ' — ' + d : '') + '</span>';
        li.onclick = function () {
          checked[mi] = !checked[mi];
          li.classList.toggle('has', !!checked[mi]);
          li.querySelector('.mat-box').textContent = checked[mi] ? '✔' : '';
          Store.set('mat:' + (spec.id || 'x'), checked);
        };
        mul.appendChild(li);
      });
      matBox.appendChild(mul);
      root.appendChild(matBox);
    }

    // Secciones
    (spec.sections || []).forEach(function (s, i) {
      var sec = el('div', 'sec');
      var head = el('div', 'sec-head');
      head.appendChild(el('h2', null, s.h));
      var sb = el('button', 'mini-audio', '🔊');
      sb.type = 'button'; sb.title = 'Escuchar esta parte';
      sb.dataset.lbl = '🔊';
      var narration = s.audio || toSpeech(s.html);
      sb.onclick = function () { Speak.say(narration, sb); };
      head.appendChild(sb);
      sec.appendChild(head);
      var body = el('div', 'sec-body');
      body.innerHTML = s.html;
      sec.appendChild(body);
      root.appendChild(sec);
      sectionEls.push(sec);
      queue.push({ text: (s.h + '. ') + narration, el: sec });
    });

    // Paso a paso ilustrado (cada paso trae su propio dibujo SVG)
    if (spec.steps && spec.steps.length) {
      root.appendChild(el('div', 'block-title', '🖼️ Explicación ilustrada paso a paso'));
      var stepsBox = el('div', 'steps');
      spec.steps.forEach(function (s, si) {
        var st = el('div', 'step');
        var draw = el('div', 'step-draw');
        draw.innerHTML = s.svg || '';
        st.appendChild(draw);

        var txt = el('div', 'step-txt');
        var sh = el('div', 'step-head');
        sh.innerHTML = '<span class="step-n">Paso ' + (si + 1) + '</span><span class="step-t">' + s.t + '</span>';
        var sab = el('button', 'mini-audio', '🔊'); sab.type = 'button'; sab.dataset.lbl = '🔊';
        var sTxt = 'Paso ' + (si + 1) + '. ' + s.t + '. ' + toSpeech(s.d || '');
        sab.onclick = function () { Speak.say(sTxt, sab); };
        sh.appendChild(sab);
        txt.appendChild(sh);
        txt.appendChild(el('div', 'step-d', s.d || ''));
        if (s.tip) txt.appendChild(el('div', 'step-tip', '💡 ' + s.tip));
        st.appendChild(txt);

        stepsBox.appendChild(st);
        sectionEls.push(st);
        queue.push({ text: sTxt + (s.tip ? '. Consejo: ' + s.tip : ''), el: st });
      });
      root.appendChild(stepsBox);
    }

    // Errores frecuentes (lo que arruina el trabajo y cómo evitarlo)
    if (spec.errors && spec.errors.length) {
      root.appendChild(el('div', 'block-title', '⚠️ Errores que cuestan horas (y cómo evitarlos)'));
      var errBox = el('div', 'errors');
      spec.errors.forEach(function (e) {
        var row = el('div', 'err');
        row.innerHTML = '<div class="err-bad">✘ ' + (typeof e === 'string' ? e : e.bad) + '</div>' +
          (typeof e === 'string' ? '' : '<div class="err-fix">✔ ' + (e.fix || '') + '</div>');
        errBox.appendChild(row);
      });
      root.appendChild(errBox);
    }

    // Reproducción secuencial con resaltado
    function highlight(idx) {
      sectionEls.forEach(function (e, k) { e.classList.toggle('speaking', k === idx); });
      if (idx >= 0 && sectionEls[idx]) {
        sectionEls[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    playAll.onclick = function () { Speak.playQueue(queue, highlight, playAll); };

    // Puntos clave
    if (spec.keypoints && spec.keypoints.length) {
      var kp = el('div', 'keypoints');
      var kph = el('div', 'kp-head');
      kph.innerHTML = '<span>🎯 Puntos clave para recordar</span>';
      var kpb = el('button', 'mini-audio', '🔊'); kpb.type = 'button'; kpb.dataset.lbl = '🔊';
      var kpText = 'Puntos clave. ' + spec.keypoints.join('. ');
      kpb.onclick = function () { Speak.say(kpText, kpb); };
      kph.appendChild(kpb);
      kp.appendChild(kph);
      var ul = el('ul');
      spec.keypoints.forEach(function (p) { ul.appendChild(el('li', null, p)); });
      kp.appendChild(ul);
      root.appendChild(kp);
    }

    // Comandos y rutas clave (reutiliza el estilo de fórmulas de la familia)
    var cmds = spec.commands || spec.formulas;
    if (cmds && cmds.length) {
      root.appendChild(el('div', 'block-title', '⌨️ Comandos y rutas clave'));
      var fbox = el('div', 'formulas');
      cmds.forEach(function (f) {
        var row = el('div', 'formula');
        row.innerHTML = '<div class="f-eq"><code>' + f.eq + '</code></div><div class="f-desc">' + (f.desc || '') + '</div>';
        fbox.appendChild(row);
      });
      root.appendChild(fbox);
    }

    // Flashcards
    if (spec.flashcards && spec.flashcards.length) {
      root.appendChild(el('div', 'block-title', '🃏 Fichas de repaso'));
      var fcWrap = el('div', 'flashwrap');
      spec.flashcards.forEach(function (c) {
        var card = el('div', 'flash');
        card.innerHTML = '<div class="flash-inner"><div class="flash-face flash-q">' +
          '<span class="flash-tag">PREGUNTA</span><div>' + c.q + '</div><span class="flash-hint">toca para ver respuesta</span></div>' +
          '<div class="flash-face flash-a"><span class="flash-tag">RESPUESTA</span><div>' + c.a + '</div></div></div>';
        card.onclick = function (e) {
          if (e.target.closest('.flash-audio')) return;
          card.classList.toggle('flip');
        };
        // botón de audio en la ficha
        var fab = el('button', 'flash-audio', '🔊'); fab.type = 'button'; fab.dataset.lbl = '🔊';
        fab.onclick = function (ev) { ev.stopPropagation(); Speak.say(c.q + '. Respuesta: ' + c.a, fab); };
        card.appendChild(fab);
        fcWrap.appendChild(card);
      });
      root.appendChild(fcWrap);
    }

    // Quiz
    if (spec.quiz && spec.quiz.length) {
      root.appendChild(el('div', 'block-title', '✅ Autoevaluación'));
      var quizBox = el('div', 'quiz');
      var state = { answered: 0, correct: 0 };
      var scoreEl = el('div', 'quiz-score', '');
      spec.quiz.forEach(function (q, qi) {
        var qb = el('div', 'qitem');
        var qhead = el('div', 'q-head');
        qhead.appendChild(el('div', 'q-text', (qi + 1) + '. ' + q.q));
        var qa = el('button', 'mini-audio', '🔊'); qa.type = 'button'; qa.dataset.lbl = '🔊';
        qa.onclick = function () { Speak.say(q.q + '. Opciones: ' + q.opts.join('. '), qa); };
        qhead.appendChild(qa);
        qb.appendChild(qhead);
        var opts = el('div', 'opts');
        var locked = false;
        q.opts.forEach(function (opt, oi) {
          var b = el('button', 'opt', opt); b.type = 'button';
          b.onclick = function () {
            if (locked) return;
            locked = true;
            state.answered++;
            var correct = (oi === q.correct);
            if (correct) { state.correct++; b.classList.add('ok'); }
            else {
              b.classList.add('bad');
              var btns = opts.querySelectorAll('.opt');
              if (btns[q.correct]) btns[q.correct].classList.add('ok');
            }
            var why = el('div', 'why ' + (correct ? 'why-ok' : 'why-bad'),
              (correct ? '✔ Correcto. ' : '✘ Incorrecto. ') + (q.why || ''));
            qb.appendChild(why);
            scoreEl.textContent = '📊 Puntaje: ' + state.correct + ' / ' + spec.quiz.length;
          };
          opts.appendChild(b);
        });
        qb.appendChild(opts);
        quizBox.appendChild(qb);
      });
      quizBox.appendChild(scoreEl);
      root.appendChild(quizBox);
    }

    // Navegación entre lecciones (anterior / siguiente)
    if (typeof CATALOG !== 'undefined' && spec.id) {
      var flat = [];
      CATALOG.forEach(function (a) { a.lessons.forEach(function (l) { flat.push(l); }); });
      var idx = flat.findIndex(function (l) { return l.id === spec.id; });
      var nav = el('div', 'lesson-nav');
      if (idx > 0) {
        var prev = el('a', 'nav-btn prev', '← ' + flat[idx - 1].t);
        prev.href = 'lesson.html?l=' + flat[idx - 1].id;
        nav.appendChild(prev);
      } else { nav.appendChild(el('span')); }
      if (idx >= 0 && idx < flat.length - 1) {
        var next = el('a', 'nav-btn next', flat[idx + 1].t + ' →');
        next.href = 'lesson.html?l=' + flat[idx + 1].id;
        nav.appendChild(next);
      }
      root.appendChild(nav);
    }

    // Marcar como leída
    if (spec.id) {
      var done = Store.get('read', {});
      done[spec.id] = true;
      Store.set('read', done);
    }
  }

  return { start: start };
})();
