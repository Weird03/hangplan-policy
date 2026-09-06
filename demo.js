// Homepage phone demo: loops RSVP → poll grid → plan → cars → live → money.
(function () {
  var demo = document.getElementById('demo');
  if (!demo) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scenes = Array.prototype.slice.call(demo.querySelectorAll('.scene'));
  var dots = Array.prototype.slice.call(demo.querySelectorAll('.dots i'));
  var features = Array.prototype.slice.call(document.querySelectorAll('.feature[data-feature]'));
  var order = ['rsvp', 'poll', 'plan', 'cars', 'live', 'money'];
  var timers = [];
  var idx = 0;

  function later(fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function q(scene, sel) { return scene.querySelector(sel); }
  function qa(scene, sel) { return Array.prototype.slice.call(scene.querySelectorAll(sel)); }

  // Build the poll grid cells once (4 days × 5 rows).
  var grid = demo.querySelector('.grid');
  var times = ['5p', '6p', '7p', '8p', '9p'];
  times.forEach(function (t) {
    var l = document.createElement('div'); l.className = 'gt'; l.textContent = t; grid.appendChild(l);
    for (var d = 0; d < 4; d++) { var c = document.createElement('div'); c.className = 'cell'; grid.appendChild(c); }
  });
  // Confetti pieces once.
  var conf = demo.querySelector('.confetti');
  var colors = ['#FF6B35', '#4ADE80', '#3B82F6', '#F59E0B', '#FFD666', '#F472B6'];
  for (var i = 0; i < 26; i++) {
    var p = document.createElement('i');
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    p.style.animationDuration = (1.3 + Math.random() * 0.8) + 's';
    conf.appendChild(p);
  }

  // ---- scene scripts: each returns total ms it wants on screen ----
  var scripts = {
    rsvp: function (s) {
      var opts = qa(s, '.opt'), tap = q(s, '.tap'), faces = q(s, '.faces'), you = q(s, '.face.you'), count = q(s, '.count');
      var lefts = ['16%', '50%', '84%'];
      var counts = ['4 going', '3 going · 1 maybe', "3 going · 1 can't"];
      var cls = ['', 'maybe', 'no'];
      opts.forEach(function (o) { o.classList.remove('sel'); });
      faces.classList.remove('show'); you.className = 'face f4 you';
      function pick(i) {
        tap.style.left = lefts[i];
        tap.classList.remove('go'); void tap.offsetWidth; tap.classList.add('go');
        later(function () {
          opts.forEach(function (o, k) { o.classList.toggle('sel', k === i); });
          you.className = 'face f4 you ' + cls[i];
          count.textContent = counts[i];
          faces.classList.add('show');
        }, 180);
      }
      later(function () { pick(0); }, 500);
      later(function () { pick(1); }, 1900);
      later(function () { pick(2); }, 3200);
      later(function () { pick(0); }, 4500);
      return 6000;
    },
    poll: function (s) {
      var cells = qa(s, '.cell'), best = q(s, '.best');
      cells.forEach(function (c) { c.className = 'cell'; });
      best.classList.remove('show');
      // paint order: [row, col] → strokes on Fri (col 1) and Sat (col 2) evenings
      var strokes = [
        [[2, 1], [3, 1], [4, 1]],            // you: Fri 7–9
        [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2]], // friend 2
        [[2, 1], [3, 1], [2, 2], [3, 2], [4, 2]], // friend 3
      ];
      var t = 400;
      strokes.forEach(function (stroke) {
        stroke.forEach(function (rc) {
          later(function () {
            var c = cells[rc[0] * 4 + rc[1]];
            var lvl = Math.min(3, (parseInt(c.dataset.n || '0', 10) + 1));
            c.dataset.n = lvl; c.className = 'cell p' + lvl;
          }, t);
          t += 110;
        });
        t += 350;
      });
      later(function () { best.classList.add('show'); }, t + 200);
      cells.forEach(function (c) { delete c.dataset.n; });
      return t + 2200;
    },
    plan: function (s) {
      var rows = qa(s, '.stop, .drive');
      rows.forEach(function (r) { r.classList.remove('show'); });
      var t = 400;
      rows.forEach(function (r) { later(function () { r.classList.add('show'); }, t); t += r.classList.contains('stop') ? 520 : 300; });
      return t + 1900;
    },
    cars: function (s) {
      var seats = ['.s1', '.s2', '.s5', '.s3', '.s6'];
      qa(s, '.seat').forEach(function (x) { x.classList.remove('full', 'you'); });
      var t = 500;
      seats.forEach(function (sel, i) {
        later(function () {
          var el = q(s, sel); el.classList.add('full');
          if (i === 3) el.classList.add('you');
        }, t);
        t += 420;
      });
      return t + 1800;
    },
    live: function (s) {
      var card = q(s, '.live');
      card.classList.remove('arrived'); conf.classList.remove('go');
      later(function () {
        card.classList.add('arrived');
        conf.classList.remove('go'); void conf.offsetWidth; conf.classList.add('go');
      }, 1700);
      return 4600;
    },
    money: function (s) {
      var exps = qa(s, '.exp'), owe = q(s, '.owe');
      exps.forEach(function (e) { e.classList.remove('show'); }); owe.classList.remove('paid');
      later(function () { exps[0].classList.add('show'); }, 400);
      later(function () { exps[1].classList.add('show'); }, 1000);
      later(function () { owe.classList.add('paid'); }, 2600);
      return 4600;
    },
  };

  function show(i) {
    clear();
    idx = i % order.length;
    var key = order[idx];
    scenes.forEach(function (s) { s.classList.toggle('on', s.dataset.scene === key); });
    dots.forEach(function (d) { d.classList.toggle('on', d.dataset.scene === key); });
    features.forEach(function (f) { f.classList.toggle('active', f.dataset.feature === key); });
    var scene = scenes.filter(function (s) { return s.dataset.scene === key; })[0];
    var dur = scripts[key](scene);
    later(function () { show(idx + 1); }, dur);
  }

  dots.forEach(function (d) { d.addEventListener('click', function () { show(order.indexOf(d.dataset.scene)); }); });
  features.forEach(function (f) { f.addEventListener('click', function () {
    show(order.indexOf(f.dataset.feature));
    demo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }); });

  // Pause when the tab is hidden so the loop doesn't drift.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clear(); else show(idx);
  });

  show(0);
})();
