/* ============================================================
   GitHub PRO — motor de las herramientas
   Proyecto = ficha del proyecto guardada una sola vez (Store, prefijo gh:)
   Tools    = utilidades de UI (nav, copiar al portapapeles, escape, verdict)
   Depende de engine.js (Store). No toca document al cargarse: solo
   dentro de funciones, para poder probarlo con node.
   ============================================================ */

/* ---------------- Ficha del proyecto ---------------- */
var Proyecto = {
  campos: [
    { k: 'usuario',   l: 'Usuario u organización de GitHub', ph: 'alfonsommc311-boop' },
    { k: 'repo',      l: 'Nombre del repositorio',           ph: 'metrados-pro' },
    { k: 'desc',      l: 'Qué hace el proyecto (una frase)', ph: 'App formativa de metrados para obra pública', wide: true },
    { k: 'tipo',      l: 'Tipo de proyecto',                 opts: ['Flutter (app Android)', 'Python (servidor MCP)', 'Node / JavaScript', 'Web estático (HTML)', 'Otro'] },
    { k: 'rama',      l: 'Rama principal',                   ph: 'main' },
    { k: 'licencia',  l: 'Licencia',                         opts: ['MIT', 'Apache-2.0', 'GPL-3.0', 'Sin licencia (todos los derechos reservados)'] },
    { k: 'visib',     l: 'Visibilidad',                      opts: ['Público', 'Privado'] },
    { k: 'autor',     l: 'Autor (nombre y cargo)',           ph: 'Alfonso, ingeniero civil' }
  ],

  get: function () { return Store.get('proyecto', {}); },
  set: function (o) { Store.set('proyecto', o); },

  campo: function (k) {
    var v = this.get()[k];
    return (v === undefined || v === null || v === '') ? null : v;
  },

  /* devuelve el valor o un marcador visible para que nadie copie un texto incompleto */
  v: function (k, alt) {
    var x = this.campo(k);
    if (x !== null) return x;
    return alt || ('[' + k.toUpperCase() + ' - COMPLETAR]');
  },

  url: function () {
    return 'https://github.com/' + this.v('usuario', 'USUARIO') + '/' + this.v('repo', 'REPO');
  },

  /* lista de etiquetas de los campos que faltan (vacía = ficha completa) */
  completa: function () {
    var o = this.get(), faltan = [];
    this.campos.forEach(function (c) { if (!o[c.k]) faltan.push(c.l); });
    return faltan;
  },

  /* pinta el formulario de la ficha dentro de un contenedor */
  formulario: function (host, onSave) {
    var o = this.get();
    var grid = document.createElement('div');
    grid.className = 'fgrid';
    this.campos.forEach(function (c) {
      var f = document.createElement('div');
      f.className = 'field' + (c.wide ? ' wide' : '');
      var lab = document.createElement('label');
      lab.textContent = c.l;
      f.appendChild(lab);
      var inp;
      if (c.opts) {
        inp = document.createElement('select');
        var o0 = document.createElement('option'); o0.value = ''; o0.textContent = '— elegir —'; inp.appendChild(o0);
        c.opts.forEach(function (op) { var e = document.createElement('option'); e.value = op; e.textContent = op; inp.appendChild(e); });
      } else {
        inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = c.ph || '';
        inp.autocomplete = 'off';
      }
      inp.id = 'f_' + c.k;
      inp.value = o[c.k] || (c.k === 'rama' ? '' : '');
      f.appendChild(inp);
      grid.appendChild(f);
    });
    host.appendChild(grid);
    var row = document.createElement('div');
    row.className = 'btnrow';
    var b = document.createElement('button');
    b.className = 'btn gold sm'; b.type = 'button'; b.textContent = 'Guardar ficha';
    var aviso = document.createElement('div'); aviso.className = 'copied'; aviso.style.display = 'none';
    b.onclick = function () {
      var n = {};
      Proyecto.campos.forEach(function (c) { n[c.k] = String(document.getElementById('f_' + c.k).value).trim(); });
      if (n.repo) n.repo = n.repo.replace(/\s+/g, '-');
      Proyecto.set(n);
      aviso.textContent = 'Ficha guardada en este dispositivo.'; aviso.style.display = '';
      if (onSave) onSave(n);
    };
    row.appendChild(b);
    var b2 = document.createElement('button');
    b2.className = 'btn ghost sm'; b2.type = 'button'; b2.textContent = 'Borrar ficha';
    b2.onclick = function () {
      Proyecto.set({});
      Proyecto.campos.forEach(function (c) { document.getElementById('f_' + c.k).value = ''; });
      aviso.textContent = 'Ficha borrada.'; aviso.style.display = '';
      if (onSave) onSave({});
    };
    row.appendChild(b2);
    host.appendChild(row);
    host.appendChild(aviso);
  }
};

/* ---------------- Utilidades de interfaz ---------------- */
var Tools = {
  paginas: [
    { href: 'herramientas.html', t: '🧰 Ficha' },
    { href: 'terminal.html',     t: '⌨️ Terminal' },
    { href: 'comandos.html',     t: '🔎 Comandos' },
    { href: 'gitignore.html',    t: '🚫 .gitignore' },
    { href: 'workflow.html',     t: '⚙️ Workflow' },
    { href: 'sos.html',          t: '🆘 SOS Git' },
    { href: 'checklist.html',    t: '🛡️ Checklist' },
    { href: 'plantillas.html',   t: '✍️ Plantillas' },
    { href: 'glosario.html',     t: '📖 Glosario' }
  ],

  /* barra de navegación entre herramientas; marca la actual con la clase on */
  nav: function (activa) {
    var n = document.createElement('nav');
    n.className = 'toolbar';
    this.paginas.forEach(function (p) {
      var a = document.createElement('a');
      a.href = p.href;
      a.textContent = p.t;
      if (p.href === activa) a.className = 'on';
      n.appendChild(a);
    });
    return n;
  },

  /* copiar con triple fallback: clipboard API -> execCommand -> selección manual */
  copiar: function (texto, aviso) {
    function ok() {
      if (typeof aviso === 'function') { aviso(true); return; }
      if (aviso) { aviso.textContent = 'Copiado al portapapeles.'; aviso.style.display = ''; }
    }
    function manual() {
      if (typeof aviso === 'function') { aviso(false); return; }
      if (aviso) {
        aviso.textContent = 'No se pudo copiar automáticamente: mantén pulsado el texto y usa Copiar.';
        aviso.style.display = '';
      }
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(ok, function () { Tools._exec(texto, ok, manual); });
        return;
      }
    } catch (e) { /* sigue al fallback */ }
    this._exec(texto, ok, manual);
  },

  _exec: function (texto, ok, manual) {
    try {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, texto.length);
      var hecho = document.execCommand('copy');
      document.body.removeChild(ta);
      if (hecho) { ok(); return; }
    } catch (e) { /* cae a manual */ }
    manual();
  },

  /* escape de HTML para textos que escribe el usuario */
  esc: function (s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  },

  val: function (id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : '';
  },

  /* elemento verdict listo para insertar */
  verdict: function (tipo, texto) {
    var d = document.createElement('div');
    d.className = 'verdict v-' + tipo;
    d.textContent = texto;
    return d;
  },

  /* bloque <pre> con botón copiar */
  bloque: function (host, texto, titulo) {
    if (titulo) { var h = document.createElement('div'); h.className = 'hint'; h.textContent = titulo; host.appendChild(h); }
    var pre = document.createElement('pre');
    pre.textContent = texto;
    host.appendChild(pre);
    var row = document.createElement('div'); row.className = 'btnrow';
    var b = document.createElement('button'); b.className = 'btn ghost sm'; b.type = 'button'; b.textContent = 'Copiar';
    var aviso = document.createElement('div'); aviso.className = 'copied'; aviso.style.display = 'none';
    b.onclick = function () { Tools.copiar(texto, aviso); };
    row.appendChild(b); host.appendChild(row); host.appendChild(aviso);
    return pre;
  },

  /* normaliza para búsquedas: minúsculas y sin tildes */
  clave: function (t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  },

  hoy: function () { return new Date(); }
};
