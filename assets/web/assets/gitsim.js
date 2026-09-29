/* Simulador de Git en el navegador. Implementa un subconjunto de comandos con
   estado en memoria: árbol de trabajo, índice (staging), commits, ramas, remoto. */
(function (global) {
  'use strict';

  function GitSim() { this.reset(); }

  GitSim.prototype.reset = function () {
    this.repo = null;               // null hasta `git init` o `git clone`
    this.files = {};                // árbol de trabajo: nombre -> contenido
    this.history = [];              // comandos ejecutados
    this.cwd = 'proyecto';
  };

  GitSim.prototype._initRepo = function (opts) {
    this.repo = {
      staged: {}, commits: {}, branches: { main: null }, head: 'main', detached: false,
      remotes: {}, remoteBranches: {}, stash: [], tags: {}, seq: 0, upstream: {}
    };
    if (opts && opts.remote) {
      this.repo.remotes.origin = opts.remote;
    }
  };

  GitSim.prototype._hash = function () {
    this.repo.seq += 1;
    var s = (this.repo.seq * 2654435761 >>> 0).toString(16);
    return ('0000000' + s).slice(-7);
  };

  GitSim.prototype._snapshot = function () {
    var out = {};
    for (var k in this.repo.staged) out[k] = this.repo.staged[k];
    return out;
  };

  GitSim.prototype._headCommit = function () {
    if (!this.repo) return null;
    return this.repo.detached ? this.repo.head : this.repo.branches[this.repo.head];
  };

  GitSim.prototype._log = function (from) {
    var out = [], seen = {}, queue = from ? [from] : [];
    while (queue.length) {
      var h = queue.shift();
      if (!h || seen[h]) continue;
      seen[h] = true;
      var c = this.repo.commits[h];
      out.push(c);
      queue = queue.concat(c.parents);
    }
    return out;
  };

  GitSim.prototype._commitTree = function (hash) {
    return hash ? this.repo.commits[hash].tree : {};
  };

  GitSim.prototype._status = function () {
    var r = this.repo, headTree = this._commitTree(this._headCommit());
    var staged = [], modified = [], untracked = [], deleted = [];
    for (var f in this.files) {
      if (!(f in r.staged)) untracked.push(f);
      else if (r.staged[f] !== this.files[f]) modified.push(f);
    }
    for (var s in r.staged) {
      if (!(s in this.files)) deleted.push(s);
      if (headTree[s] !== r.staged[s]) staged.push(s);
    }
    for (var h in headTree) if (!(h in r.staged)) staged.push(h + ' (eliminado)');
    return { staged: staged, modified: modified, untracked: untracked, deleted: deleted };
  };

  GitSim.prototype.state = function () {
    if (!this.repo) return { initialized: false, files: Object.keys(this.files) };
    var st = this._status();
    return {
      initialized: true, files: Object.keys(this.files), branch: this.repo.detached ? 'HEAD (detached)' : this.repo.head,
      branches: Object.keys(this.repo.branches), commits: this._log(this._headCommit()).length,
      staged: st.staged, modified: st.modified, untracked: st.untracked,
      remotes: Object.keys(this.repo.remotes), remoteBranches: Object.keys(this.repo.remoteBranches),
      tags: Object.keys(this.repo.tags), stash: this.repo.stash.length,
      lastMessage: this._headCommit() ? this.repo.commits[this._headCommit()].message : null
    };
  };

  /* Ejecuta una línea y devuelve {out: [{text, cls}], ok} */
  GitSim.prototype.exec = function (line) {
    line = line.trim();
    if (!line) return { out: [], ok: true };
    this.history.push(line);
    var out = [], ok = true;
    var say = function (t, cls) { out.push({ text: t, cls: cls || '' }); };
    var err = function (t) { out.push({ text: t, cls: 'err' }); ok = false; };
    var args = this._tokenize(line), cmd = args.shift();
    try {
      switch (cmd) {
        case 'help': say(HELP); break;
        case 'clear': out.push({ text: '\u0000clear' }); break;
        case 'pwd': say('/home/user/' + this.cwd); break;
        case 'ls': {
          var names = Object.keys(this.files).sort();
          if (args[0] === '-a' && this.repo) names.unshift('.git/');
          say(names.length ? names.join('  ') : '(vacío)');
          break;
        }
        case 'touch': if (!args.length) err('touch: falta el nombre de archivo'); args.forEach(function (f) { if (!(f in this.files)) this.files[f] = ''; }, this); break;
        case 'echo': {
          var gt = args.indexOf('>'), ap = args.indexOf('>>');
          if (gt > -1) this.files[args[gt + 1]] = args.slice(0, gt).join(' ') + '\n';
          else if (ap > -1) this.files[args[ap + 1]] = (this.files[args[ap + 1]] || '') + args.slice(0, ap).join(' ') + '\n';
          else say(args.join(' '));
          break;
        }
        case 'cat': if (args[0] in this.files) say(this.files[args[0]] || '(archivo vacío)'); else err('cat: ' + args[0] + ': no existe'); break;
        case 'rm': if (args[0] in this.files) delete this.files[args[0]]; else err('rm: ' + args[0] + ': no existe'); break;
        case 'mkdir': case 'cd': say(''); break;
        case 'git': this._git(args, say, err); break;
        default: err(cmd + ': comando no encontrado. Escribe `help` para ver los disponibles.');
      }
    } catch (e) { err('error interno: ' + e.message); }
    if (!ok) return { out: out, ok: false };
    return { out: out, ok: true };
  };

  GitSim.prototype._tokenize = function (line) {
    var re = /"([^"]*)"|'([^']*)'|(\S+)/g, m, out = [];
    while ((m = re.exec(line))) out.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
    return out;
  };

  GitSim.prototype._git = function (a, say, err) {
    var sub = a.shift(), r = this.repo, self = this;
    if (!sub || sub === '--help' || sub === 'help') { say(HELP); return; }
    if (sub === 'init') {
      if (r) { say('Reinicializado repositorio Git existente en /home/user/' + this.cwd + '/.git/'); return; }
      this._initRepo(); say('Inicializado repositorio Git vacío en /home/user/' + this.cwd + '/.git/'); return;
    }
    if (sub === 'clone') {
      var url = a[0];
      if (!url) return err('fatal: debes especificar un repositorio a clonar');
      if (r) return err("fatal: ya estás dentro de un repositorio");
      var name = (a[1] || url.split('/').pop().replace(/\.git$/, ''));
      this.cwd = name;
      this._initRepo({ remote: url });
      this.files = { 'README.md': '# ' + name + '\n' };
      this.repo.staged = { 'README.md': this.files['README.md'] };
      var h = this._makeCommit('Initial commit', []);
      this.repo.branches.main = h; this.repo.remoteBranches['origin/main'] = h; this.repo.upstream.main = 'origin/main';
      say("Clonando en '" + name + "'...\nremote: Enumerando objetos: 3, listo.\nRecibiendo objetos: 100% (3/3), listo.");
      return;
    }
    if (sub === 'config') { say(a[0] === '--global' ? 'Configuración global actualizada.' : 'Configuración actualizada.'); return; }
    if (sub === '--version' || sub === 'version') { say('git version 2.45.0 (simulado)'); return; }
    if (!r) return err('fatal: no es un repositorio git (ni ninguno de los directorios superiores): .git');

    switch (sub) {
      case 'status': {
        var st = this._status();
        say('En la rama ' + (r.detached ? 'HEAD desacoplado en ' + r.head : r.head));
        if (r.upstream[r.head]) say("Tu rama está al día con '" + r.upstream[r.head] + "'.");
        if (!this._headCommit()) say('\nNo hay commits todavía\n');
        if (st.staged.length) say('\nCambios a ser confirmados:\n  (usa "git restore --staged <archivo>..." para sacar del área de stage)\n' + st.staged.map(function (f) { return '\tnuevo/modificado: ' + f; }).join('\n'), 'prompt');
        if (st.modified.length) say('\nCambios no rastreados para el commit:\n  (usa "git add <archivo>..." para actualizar lo que será confirmado)\n' + st.modified.map(function (f) { return '\tmodificado: ' + f; }).join('\n'), 'err');
        if (st.untracked.length) say('\nArchivos sin seguimiento:\n  (usa "git add <archivo>..." para incluirlo a lo que se será confirmado)\n' + st.untracked.map(function (f) { return '\t' + f; }).join('\n'), 'err');
        if (!st.staged.length && !st.modified.length && !st.untracked.length) say('\nnada para hacer commit, el árbol de trabajo está limpio');
        break;
      }
      case 'add': {
        if (!a.length) return err('Nada especificado, nada agregado. Quizá quisiste decir "git add ."?');
        var files = (a[0] === '.' || a[0] === '-A' || a[0] === '--all') ? Object.keys(this.files) : a;
        files.forEach(function (f) {
          if (f in self.files) r.staged[f] = self.files[f];
          else if (f in r.staged) delete r.staged[f];
          else err("fatal: la ruta '" + f + "' no coincide con ningún archivo");
        });
        break;
      }
      case 'commit': {
        var mi = a.indexOf('-m'), msg = mi > -1 ? a[mi + 1] : null;
        var all = a.indexOf('-a') > -1 || a.indexOf('-am') > -1;
        if (a.indexOf('-am') > -1) msg = a[a.indexOf('-am') + 1];
        if (all) for (var f in r.staged) if (f in this.files) r.staged[f] = this.files[f];
        if (a.indexOf('--amend') > -1) {
          var hc = this._headCommit();
          if (!hc) return err('fatal: no hay nada que enmendar');
          r.commits[hc].message = msg || r.commits[hc].message; r.commits[hc].tree = this._snapshot();
          say('[' + r.head + ' ' + hc + '] ' + r.commits[hc].message + ' (enmendado)'); return;
        }
        if (!msg) return err('Aborting commit due to empty commit message. Usa: git commit -m "mensaje"');
        var st2 = this._status();
        if (!st2.staged.length) return err('nada para hacer commit (usa "git add" para incluir archivos en el stage)');
        var hash = this._makeCommit(msg, this._headCommit() ? [this._headCommit()] : []);
        if (r.detached) r.head = hash; else r.branches[r.head] = hash;
        say('[' + r.head + (Object.keys(r.commits).length === 1 ? ' (commit-raíz)' : '') + ' ' + hash + '] ' + msg + '\n ' + st2.staged.length + ' archivo(s) cambiado(s)');
        break;
      }
      case 'log': {
        var lg = this._log(this._headCommit());
        if (!lg.length) return err("fatal: tu rama actual '" + r.head + "' no tiene commits todavía");
        var oneline = a.indexOf('--oneline') > -1;
        lg.forEach(function (c) {
          var refs = [];
          for (var b in r.branches) if (r.branches[b] === c.hash) refs.push(b === r.head ? 'HEAD -> ' + b : b);
          for (var rb in r.remoteBranches) if (r.remoteBranches[rb] === c.hash) refs.push(rb);
          for (var t in r.tags) if (r.tags[t] === c.hash) refs.push('tag: ' + t);
          var ref = refs.length ? ' (' + refs.join(', ') + ')' : '';
          if (oneline) say(c.hash + ref + ' ' + c.message, 'warn');
          else say('commit ' + c.hash + ref + '\nAuthor: Tú <tu@email.com>\nDate:   ' + c.date + '\n\n    ' + c.message + '\n', 'warn');
        });
        break;
      }
      case 'branch': {
        if (!a.length || a[0] === '-a' || a[0] === '--list') {
          Object.keys(r.branches).sort().forEach(function (b) { say((b === r.head ? '* ' : '  ') + b, b === r.head ? 'prompt' : ''); });
          if (a[0] === '-a') Object.keys(r.remoteBranches).forEach(function (b) { say('  remotes/' + b, 'err'); });
          return;
        }
        if (a[0] === '-d' || a[0] === '-D') {
          if (!(a[1] in r.branches)) return err("error: la rama '" + a[1] + "' no existe");
          if (a[1] === r.head) return err("error: no se puede borrar la rama '" + a[1] + "' en la que estás");
          delete r.branches[a[1]]; say('Eliminada la rama ' + a[1]); return;
        }
        if (a[0] === '-m' || a[0] === '-M') { var nn = a[a.length - 1]; r.branches[nn] = r.branches[r.head]; delete r.branches[r.head]; r.head = nn; return; }
        if (a[0] in r.branches) return err("fatal: ya existe una rama llamada '" + a[0] + "'");
        r.branches[a[0]] = this._headCommit(); break;
      }
      case 'checkout': case 'switch': {
        if (a[0] === '-b' || a[0] === '-c') {
          if (a[1] in r.branches) return err("fatal: ya existe una rama llamada '" + a[1] + "'");
          r.branches[a[1]] = this._headCommit(); r.head = a[1]; r.detached = false;
          say("Cambiado a nueva rama '" + a[1] + "'"); return;
        }
        if (sub === 'checkout' && a[0] === '--') { a.slice(1).forEach(function (f) { if (f in r.staged) self.files[f] = r.staged[f]; }); return; }
        if (sub === 'checkout' && a[0] in this.files && !(a[0] in r.branches)) { this.files[a[0]] = r.staged[a[0]]; return; }
        var target = a[0];
        if (!target) return err('fatal: debes indicar una rama');
        if (target in r.branches) {
          r.head = target; r.detached = false; this._loadTree(r.branches[target]);
          say("Cambiado a rama '" + target + "'"); return;
        }
        if (target in r.commits) { r.head = target; r.detached = true; this._loadTree(target); say('Nota: cambiando a ' + target + ' (HEAD desacoplado).', 'warn'); return; }
        err("error: la ruta '" + target + "' no coincide con ningún archivo o rama conocida por git");
        break;
      }
      case 'merge': {
        var other = a.filter(function (x) { return x[0] !== '-'; })[0];
        if (!(other in r.branches)) return err('merge: ' + other + ' - no es algo que se pueda fusionar');
        var oh = r.branches[other], ch = this._headCommit();
        if (oh === ch) return say('Ya está actualizado.');
        var ancestors = this._log(oh).map(function (c) { return c.hash; });
        if (ancestors.indexOf(ch) > -1 && a.indexOf('--no-ff') === -1) {
          r.branches[r.head] = oh; this._loadTree(oh); say('Actualizando ' + (ch || '(raíz)') + '..' + oh + '\nFast-forward'); return;
        }
        var cur = this._log(ch).map(function (c) { return c.hash; });
        if (cur.indexOf(oh) > -1) return say('Ya está actualizado.');
        var tree = {}, k;
        for (k in this._commitTree(ch)) tree[k] = this._commitTree(ch)[k];
        for (k in this._commitTree(oh)) tree[k] = this._commitTree(oh)[k];
        r.staged = tree; this.files = Object.assign({}, tree);
        var mh = this._makeCommit("Merge branch '" + other + "' into " + r.head, [ch, oh]);
        r.branches[r.head] = mh;
        say("Merge realizado por la estrategia 'ort'.\n [" + r.head + ' ' + mh + "] Merge branch '" + other + "'");
        break;
      }
      case 'rebase': {
        var onto = a[0];
        if (!(onto in r.branches)) return err('fatal: rama inválida: ' + onto);
        r.branches[r.head] = r.branches[onto]; // simplificación didáctica
        say('Rebase exitoso y actualizado refs/heads/' + r.head + '.'); break;
      }
      case 'remote': {
        if (!a.length) { Object.keys(r.remotes).forEach(function (n) { say(n); }); return; }
        if (a[0] === '-v') { Object.keys(r.remotes).forEach(function (n) { say(n + '\t' + r.remotes[n] + ' (fetch)\n' + n + '\t' + r.remotes[n] + ' (push)'); }); return; }
        if (a[0] === 'add') { if (!a[2]) return err('uso: git remote add <nombre> <url>'); r.remotes[a[1]] = a[2]; return; }
        if (a[0] === 'remove' || a[0] === 'rm') { delete r.remotes[a[1]]; return; }
        err('error: subcomando desconocido: ' + a[0]); break;
      }
      case 'push': {
        var remote = a.filter(function (x) { return x[0] !== '-'; })[0] || 'origin';
        var br = a.filter(function (x) { return x[0] !== '-'; })[1] || r.head;
        if (!r.remotes[remote]) return err("fatal: '" + remote + "' no parece ser un repositorio git. Usa: git remote add origin <url>");
        if (!(br in r.branches)) return err("error: rama origen '" + br + "' no coincide con ninguna rama");
        if (!r.branches[br]) return err('error: no hay commits que subir');
        var setU = a.indexOf('-u') > -1 || a.indexOf('--set-upstream') > -1;
        if (!r.upstream[br] && !setU) return err("fatal: la rama actual " + br + " no tiene una rama upstream.\nPara subir la rama actual y configurar el remoto como upstream, usa:\n\n    git push --set-upstream " + remote + ' ' + br + '\n\n(o `git push -u ' + remote + ' ' + br + '`)');
        var forced = a.indexOf('--force') > -1 || a.indexOf('-f') > -1 || a.indexOf('--force-with-lease') > -1;
        var rb = remote + '/' + br, cur2 = this._log(r.branches[br]).map(function (c) { return c.hash; });
        if (r.remoteBranches[rb] && cur2.indexOf(r.remoteBranches[rb]) === -1 && !forced) return err('! [rejected]  ' + br + ' -> ' + br + ' (non-fast-forward)\nerror: falló el push. Haz `git pull` primero para integrar los cambios remotos.');
        var was = r.remoteBranches[rb];
        r.remoteBranches[rb] = r.branches[br];
        if (setU) { r.upstream[br] = rb; }
        say('Enumerando objetos: listo.\nTo ' + r.remotes[remote] + '\n ' + (was ? was + '..' + r.branches[br] : '* [nueva rama]') + '  ' + br + ' -> ' + br + (setU ? "\nRama '" + br + "' configurada para rastrear '" + rb + "'." : ''));
        break;
      }
      case 'fetch': {
        if (!Object.keys(r.remotes).length) return err("fatal: no hay remotos configurados");
        say('From ' + r.remotes[Object.keys(r.remotes)[0]] + '\n * [actualizado]'); break;
      }
      case 'pull': {
        if (!Object.keys(r.remotes).length) return err("fatal: no hay remotos configurados");
        var up = r.upstream[r.head] || 'origin/' + r.head;
        if (!r.remoteBranches[up]) return err("fatal: no hay información de rastreo para la rama '" + r.head + "'. Usa: git pull origin " + r.head);
        if (r.remoteBranches[up] === r.branches[r.head]) return say('Ya está actualizado.');
        var mine = this._log(r.branches[r.head]).map(function (c) { return c.hash; });
        if (mine.indexOf(r.remoteBranches[up]) > -1) return say('Ya está actualizado.');
        r.branches[r.head] = r.remoteBranches[up]; this._loadTree(r.branches[r.head]); say('Actualizando... Fast-forward'); break;
      }
      case 'diff': {
        var st3 = this._status(), any = false;
        var showStaged = a.indexOf('--staged') > -1 || a.indexOf('--cached') > -1;
        var list = showStaged ? st3.staged : st3.modified;
        list.forEach(function (f) {
          any = true; var name = f.replace(' (eliminado)', '');
          var before = showStaged ? (self._commitTree(self._headCommit())[name] || '') : (r.staged[name] || '');
          var after = showStaged ? (r.staged[name] || '') : (self.files[name] || '');
          say('diff --git a/' + name + ' b/' + name + '\n--- a/' + name + '\n+++ b/' + name);
          before.split('\n').filter(Boolean).forEach(function (l) { say('-' + l, 'err'); });
          after.split('\n').filter(Boolean).forEach(function (l) { say('+' + l, 'prompt'); });
        });
        if (!any) say('');
        break;
      }
      case 'restore': {
        if (a[0] === '--staged') { a.slice(1).forEach(function (f) { var ht = self._commitTree(self._headCommit()); if (f in ht) r.staged[f] = ht[f]; else delete r.staged[f]; }); return; }
        a.forEach(function (f) { if (f in r.staged) self.files[f] = r.staged[f]; else err("error: la ruta '" + f + "' no tiene seguimiento"); }); break;
      }
      case 'reset': {
        var hard = a.indexOf('--hard') > -1, soft = a.indexOf('--soft') > -1;
        var ref = a.filter(function (x) { return x[0] !== '-'; })[0];
        if (ref && /^HEAD~\d+$/.test(ref)) {
          var n = parseInt(ref.slice(5), 10), lg2 = this._log(this._headCommit());
          if (n >= lg2.length) return err('fatal: revisión ambigua: ' + ref);
          r.branches[r.head] = lg2[n].hash;
          if (!soft) r.staged = Object.assign({}, this._commitTree(lg2[n].hash));
          if (hard) this.files = Object.assign({}, this._commitTree(lg2[n].hash));
          say('HEAD está ahora en ' + lg2[n].hash + ' ' + lg2[n].message); return;
        }
        if (ref && r.commits[ref]) {   // git reset [--soft|--mixed|--hard] <hash>
          var target = r.commits[ref];
          if (r.detached) r.head = ref; else r.branches[r.head] = ref;
          if (!soft) r.staged = Object.assign({}, target.tree);
          if (hard) this.files = Object.assign({}, target.tree);
          say('HEAD está ahora en ' + ref + ' ' + target.message); return;
        }
        if (ref && ref !== 'HEAD') { var ht2 = this._commitTree(this._headCommit()); if (ref in ht2) r.staged[ref] = ht2[ref]; else delete r.staged[ref]; return; }
        if (hard) { r.staged = Object.assign({}, this._commitTree(this._headCommit())); this.files = Object.assign({}, r.staged); say('HEAD está ahora en ' + this._headCommit()); return; }
        r.staged = Object.assign({}, this._commitTree(this._headCommit())); break;
      }
      case 'revert': {
        var lg3 = this._log(this._headCommit());
        var tgt = a[0] === 'HEAD' ? lg3[0] : r.commits[a[0]];
        if (!tgt) return err('fatal: revisión inválida: ' + a[0]);
        var parentTree = tgt.parents.length ? this._commitTree(tgt.parents[0]) : {};
        r.staged = Object.assign({}, parentTree); this.files = Object.assign({}, parentTree);
        var rh = this._makeCommit('Revert "' + tgt.message + '"', [this._headCommit()]);
        r.branches[r.head] = rh; say('[' + r.head + ' ' + rh + '] Revert "' + tgt.message + '"'); break;
      }
      case 'stash': {
        if (!a.length || a[0] === 'push' || a[0] === 'save') {
          var st4 = this._status();
          if (!st4.modified.length && !st4.staged.length) return say('No hay cambios locales que guardar');
          r.stash.push({ files: Object.assign({}, this.files), staged: Object.assign({}, r.staged) });
          r.staged = Object.assign({}, this._commitTree(this._headCommit())); this.files = Object.assign({}, r.staged);
          say('Directorio de trabajo y estado de índice guardados WIP on ' + r.head); return;
        }
        if (a[0] === 'pop' || a[0] === 'apply') {
          if (!r.stash.length) return err('No hay entradas de stash');
          var s2 = a[0] === 'pop' ? r.stash.pop() : r.stash[r.stash.length - 1];
          this.files = s2.files; r.staged = s2.staged; say('Cambios restaurados.'); return;
        }
        if (a[0] === 'list') { r.stash.forEach(function (_, i) { say('stash@{' + i + '}: WIP on ' + r.head); }); return; }
        err('error: subcomando de stash desconocido'); break;
      }
      case 'tag': {
        if (!a.length) { Object.keys(r.tags).forEach(function (t) { say(t); }); return; }
        var tn = a[0] === '-a' ? a[1] : a[0];
        if (!this._headCommit()) return err('fatal: no hay commits que etiquetar');
        r.tags[tn] = this._headCommit(); break;
      }
      case 'show': { var sc = r.commits[a[0]] || r.commits[this._headCommit()]; if (!sc) return err('fatal: revisión inválida'); say('commit ' + sc.hash + '\n\n    ' + sc.message + '\n\nArchivos: ' + Object.keys(sc.tree).join(', '), 'warn'); break; }
      case 'rm': { a.forEach(function (f) { delete r.staged[f]; delete self.files[f]; say('rm ' + "'" + f + "'"); }); break; }
      case 'mv': { if (a[0] in this.files) { this.files[a[1]] = this.files[a[0]]; delete this.files[a[0]]; r.staged[a[1]] = r.staged[a[0]]; delete r.staged[a[0]]; } break; }
      case 'cherry-pick': { var cp = r.commits[a[0]]; if (!cp) return err('fatal: revisión inválida: ' + a[0]); Object.assign(r.staged, cp.tree); Object.assign(this.files, cp.tree); var nh = this._makeCommit(cp.message, [this._headCommit()]); r.branches[r.head] = nh; say('[' + r.head + ' ' + nh + '] ' + cp.message); break; }
      case 'blame': say(a[0] ? (this._headCommit() || '0000000') + ' (Tú) ' + (this.files[a[0]] || '') : 'uso: git blame <archivo>'); break;
      case 'reflog': this._log(this._headCommit()).forEach(function (c, i) { say(c.hash + ' HEAD@{' + i + '}: ' + c.message, 'warn'); }); break;
      default: err("git: '" + sub + "' no es un comando de git (en este simulador). Escribe `help`.");
    }
  };

  GitSim.prototype._makeCommit = function (msg, parents) {
    var h = this._hash();
    this.repo.commits[h] = { hash: h, message: msg, parents: parents.filter(Boolean), tree: this._snapshot(), date: new Date().toISOString().slice(0, 19).replace('T', ' ') };
    return h;
  };

  GitSim.prototype._loadTree = function (hash) {
    var tree = this._commitTree(hash), st = this._status();
    this.repo.staged = Object.assign({}, tree);
    // conserva archivos sin seguimiento
    var keep = {};
    st.untracked.forEach(function (f) { keep[f] = this.files[f]; }, this);
    this.files = Object.assign({}, tree, keep);
  };

  var HELP = [
    'Comandos de shell: ls, touch <f>, echo "texto" > <f>, echo "texto" >> <f>, cat <f>, rm <f>, clear, help',
    'Comandos git soportados:',
    '  init, clone, status, add, commit -m, log [--oneline], diff [--staged], branch, checkout, switch,',
    '  merge, rebase, remote (add/-v), push [-u], pull, fetch, restore, reset, revert, stash, tag,',
    '  show, rm, mv, cherry-pick, reflog, config, blame'
  ].join('\n');

  global.GitSim = GitSim;
})(window);
