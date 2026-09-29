#!/usr/bin/env node
/* Validador de lecciones de GitHub PRO.
   Uso: node scripts/validar.js            -> valida todas las lecciones del catálogo
        node scripts/validar.js <id> [id]  -> valida solo esas
   Comprueba: archivo existe, sintaxis JS, una sola llamada Lesson.start, campos
   obligatorios, area/areaIcon/icon iguales al catálogo, tamaño 6-20 KB, comillas
   curvas, HTML permitido, quiz con correct válido y repartido, tildes presentes. */
var fs = require('fs'), path = require('path'), vm = require('vm');
var ROOT = path.join(__dirname, '..', 'assets', 'web');

function cargarCatalogo() {
  var ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', 'catalog.js'), 'utf8'), ctx);
  return ctx.CATALOG;
}

var TAGS_OK = ['p', 'b', 'i', 'br', 'ul', 'ol', 'li', 'table', 'tr', 'th', 'td', 'span', 'code', 'strong', 'em', 'thead', 'tbody'];

function validar(id, catInfo) {
  var errs = [], warns = [];
  var file = path.join(ROOT, 'lessons', id + '.js');
  if (!fs.existsSync(file)) return { id: id, errs: ['no existe el archivo'], warns: [] };
  var src = fs.readFileSync(file, 'utf8');
  var kb = Buffer.byteLength(src, 'utf8') / 1024;
  if (kb > 20) errs.push('pesa ' + kb.toFixed(1) + ' KB (máximo 20)');
  if (kb < 6 && id !== 'examen-integrador') warns.push('pesa solo ' + kb.toFixed(1) + ' KB (objetivo 10-14)');
  if (/[“”‘’]/.test(src)) errs.push('contiene comillas tipográficas curvas');
  if ((src.match(/Lesson\.start\(/g) || []).length !== 1) errs.push('debe haber exactamente una llamada Lesson.start');
  if (!/\}\);\s*$/.test(src)) errs.push('no termina en });');
  if (!/[áéíóúñ¿¡]/.test(src)) errs.push('prosa sin tildes ni ñ');

  var spec = null;
  try {
    var ctx = { Lesson: { start: function (s) { spec = s; } } };
    vm.createContext(ctx);
    vm.runInContext(src, ctx, { filename: id + '.js' });
  } catch (e) { errs.push('error de sintaxis: ' + e.message); return { id: id, errs: errs, warns: warns }; }
  if (!spec) { errs.push('Lesson.start no se ejecutó'); return { id: id, errs: errs, warns: warns }; }

  if (spec.id !== id) errs.push('id "' + spec.id + '" distinto del nombre de archivo');
  ['title', 'subtitle', 'norma', 'intro'].forEach(function (k) { if (!spec[k]) errs.push('falta ' + k); });
  if (catInfo) {
    if (spec.area !== catInfo.area) errs.push('area no coincide con el catálogo: "' + spec.area + '"');
    if (spec.areaIcon !== catInfo.areaIcon) errs.push('areaIcon no coincide con el catálogo: "' + spec.areaIcon + '"');
    if (spec.icon !== catInfo.icon) errs.push('icon no coincide con el catálogo: "' + spec.icon + '"');
  }
  if (!Array.isArray(spec.sections) || spec.sections.length < 3) errs.push('sections: mínimo 3');
  if (!Array.isArray(spec.keypoints) || spec.keypoints.length < 4) errs.push('keypoints: mínimo 4');
  if (!Array.isArray(spec.quiz) || spec.quiz.length < 3) errs.push('quiz: mínimo 3 preguntas');
  if (id !== 'examen-integrador') {
    if (!Array.isArray(spec.flashcards) || spec.flashcards.length < 3) errs.push('flashcards: mínimo 3');
    if (!Array.isArray(spec.errors) || spec.errors.length < 2) errs.push('errors: mínimo 2');
    if (!Array.isArray(spec.materials) || spec.materials.length < 2) errs.push('materials: mínimo 2');
  }
  if (spec.steps || spec.fig || spec.formulas) warns.push('usa steps/fig/formulas (no previstos en esta app; commands en su lugar)');

  var html = (spec.intro || '') + (spec.sections || []).map(function (s) { return s.html || ''; }).join('');
  var tags = {};
  (html.match(/<\/?([a-zA-Z0-9]+)/g) || []).forEach(function (t) { tags[t.replace(/[<\/]/g, '').toLowerCase()] = 1; });
  Object.keys(tags).forEach(function (t) { if (TAGS_OK.indexOf(t) === -1) errs.push('etiqueta HTML no permitida: <' + t + '>'); });
  if (html.indexOf('<table') === -1) warns.push('sin tabla en las secciones');
  if (/class="(?!hl")/.test(html)) errs.push('clase HTML distinta de "hl"');
  if (!/docs\.github\.com|documentaci[oó]n oficial/i.test(spec.norma + html)) warns.push('no remite a docs.github.com');

  var dist = { 0: 0, 1: 0, 2: 0 };
  (spec.quiz || []).forEach(function (q, i) {
    if (!q.q || !Array.isArray(q.opts) || q.opts.length < 3) errs.push('quiz ' + (i + 1) + ': faltan q u opts (mínimo 3)');
    else if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.opts.length) errs.push('quiz ' + (i + 1) + ': correct inválido');
    else dist[q.correct] = (dist[q.correct] || 0) + 1;
    if (!q.why) warns.push('quiz ' + (i + 1) + ': sin why');
  });
  if ((spec.quiz || []).length >= 3 && (dist[0] === 0 || dist[1] === 0 || dist[2] === 0)) warns.push('correct no repartido entre 0, 1 y 2 (' + dist[0] + '/' + dist[1] + '/' + dist[2] + ')');
  (spec.sections || []).forEach(function (s, i) { if (!s.h || !s.html) errs.push('section ' + (i + 1) + ': falta h o html'); });
  return { id: id, errs: errs, warns: warns, kb: kb };
}

var CATALOG = cargarCatalogo();
var info = {};
CATALOG.forEach(function (a) { a.lessons.forEach(function (l) { info[l.id] = { area: a.area, areaIcon: a.icon, icon: l.icon }; }); });
var ids = process.argv.slice(2);
if (!ids.length) ids = Object.keys(info);
var fallos = 0, faltan = 0;
ids.forEach(function (id) {
  if (!info[id]) { console.log('✘ ' + id + ': no está en el catálogo'); fallos++; return; }
  var r = validar(id, info[id]);
  if (r.errs.length && r.errs[0] === 'no existe el archivo') { faltan++; if (process.argv.length > 2) console.log('✘ ' + id + ': no existe'); return; }
  var mark = r.errs.length ? '✘' : (r.warns.length ? '⚠' : '✔');
  if (r.errs.length) fallos++;
  console.log(mark + ' ' + id + (r.kb ? ' (' + r.kb.toFixed(1) + ' KB)' : ''));
  r.errs.forEach(function (e) { console.log('    ERROR: ' + e); });
  r.warns.forEach(function (w) { console.log('    aviso: ' + w); });
});
console.log('\n' + (ids.length - fallos - faltan) + ' válidas, ' + fallos + ' con errores, ' + faltan + ' sin escribir de ' + ids.length);
process.exit(fallos ? 1 : 0);
