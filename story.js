// Scroll story: the step nearest the middle of the viewport picks the phone
// screen. Each screen runs a short scripted "finger" demo and loops while it
// stays active. Screens are static markup; nothing here talks to a server.
(function () {
  var screensEl = document.getElementById('screens');
  if (!screensEl) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var steps = [].slice.call(document.querySelectorAll('.step'));
  var screens = [].slice.call(screensEl.querySelectorAll('.screen'));
  var finger = document.getElementById('finger');
  var active = null, timers = [], loopTimer = null;

  function $(id) { return document.getElementById(id); }
  function later(fn, ms) { var t = setTimeout(fn, reduce ? 0 : ms); timers.push(t); return t; }
  function clearAll() { timers.forEach(clearTimeout); timers = []; clearTimeout(loopTimer); }

  // ---- finger, in native 390x844 coordinates ----
  function scale() { return screensEl.getBoundingClientRect().width / 390; }
  function centerOf(el) {
    var r = el.getBoundingClientRect(), s = screensEl.getBoundingClientRect(), k = scale();
    return { x: (r.left - s.left) / k + r.width / k / 2, y: (r.top - s.top) / k + r.height / k / 2 };
  }
  function fingerAt(el, dx, dy, instant) {
    var c = centerOf(el);
    if (instant) finger.style.transition = 'none';
    finger.style.left = (c.x + (dx || 0)) + 'px';
    finger.style.top = (c.y + (dy || 0)) + 'px';
    if (instant) { void finger.offsetWidth; finger.style.transition = ''; }
  }
  function fShow() { finger.classList.add('show'); }
  function fHide() { finger.classList.remove('show', 'press'); }
  function fPress() { finger.classList.add('press'); }
  function fRelease() { finger.classList.remove('press'); }
  // Move to el, press, run fn, release. Returns when the release happens.
  function tap(el, at, fn, dx, dy) {
    later(function () { fShow(); fingerAt(el, dx, dy); }, at);
    later(function () { fPress(); el.classList.add('tap'); }, at + 520);
    later(function () { el.classList.remove('tap'); fRelease(); if (fn) fn(); }, at + 700);
    return at + 700;
  }

  // ---- confetti pieces ----
  var colors = ['#FF6B35', '#4ADE80', '#3B82F6', '#F59E0B', '#FFD666', '#F472B6', '#A78BFA'];
  [].slice.call(document.querySelectorAll('.confetti')).forEach(function (c) {
    for (var i = 0; i < 34; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.45) + 's';
      p.style.animationDuration = (1.4 + Math.random() * 0.9) + 's';
      c.appendChild(p);
    }
  });
  function burst(c) { c.classList.remove('go'); void c.offsetWidth; c.classList.add('go'); }

  // ---- poll grid cells (6 rows x 4 days) ----
  var grid = $('p-grid');
  var hours = ['5PM', '6PM', '7PM', '8PM', '9PM', '10PM'];
  var cells = [];
  hours.forEach(function (h, r) {
    var l = document.createElement('span'); l.className = 'gt'; l.textContent = h; grid.appendChild(l);
    for (var d = 0; d < 4; d++) { var c = document.createElement('span'); c.className = 'cell'; grid.appendChild(c); cells.push(c); }
  });
  function cell(r, d) { return cells[r * 4 + d]; }
  // what everyone else painted: [row, day, level]
  var others = [[2, 1, 3], [3, 1, 3], [4, 1, 3], [1, 1, 2], [5, 1, 2], [2, 2, 2], [3, 2, 2], [4, 2, 1], [3, 0, 1], [4, 0, 1], [1, 3, 1]];

  // ---- screen scripts: reset state, schedule the demo, return its length ----
  var scripts = {
    home: function () {
      var card = $('home-card'), slide = $('home-slide'), back = $('home-backdrop');
      var opts = [].slice.call(slide.querySelectorAll('.so')), optIn = slide.querySelector('.so[data-k="in"]');
      card.classList.remove('held'); slide.classList.remove('on'); back.classList.remove('on');
      opts.forEach(function (o) { o.classList.remove('on'); });
      $('home-badge').hidden = true; $('home-you').hidden = true; $('home-count').textContent = '3';
      later(function () { fShow(); fingerAt(card, 40, 10); }, 500);
      later(function () { fPress(); card.classList.add('held'); }, 1000);
      later(function () { slide.classList.add('on'); back.classList.add('on'); }, 1450);
      later(function () { fingerAt(optIn, 0, 4); }, 1900);
      later(function () { optIn.classList.add('on'); }, 2250);
      later(function () {
        fRelease(); slide.classList.remove('on'); back.classList.remove('on'); card.classList.remove('held');
        var b = $('home-badge'); b.hidden = false; b.classList.add('pop');
        var y = $('home-you'); y.hidden = false; y.classList.add('pop');
        $('home-count').textContent = '4';
      }, 2800);
      later(fHide, 3200);
      return 5600;
    },

    detail: function () {
      var segs = {}; [].slice.call($('d-rsvp').querySelectorAll('.rs')).forEach(function (s) { segs[s.dataset.k] = s; s.classList.remove('on'); });
      $('d-you').hidden = true; $('d-you-row').hidden = true; $('d-going-n').textContent = '3'; $('d-msg').hidden = true;
      $('d-ptext').textContent = 'Alex, Jordan, Morgan are going';
      function pick(k) {
        Object.keys(segs).forEach(function (x) { segs[x].classList.toggle('on', x === k); });
        var inn = k === 'in';
        $('d-you').hidden = !inn; $('d-you-row').hidden = !inn; $('d-going-n').textContent = inn ? '4' : '3';
        $('d-ptext').textContent = inn ? 'You, Alex, Jordan +1 going' : k === 'maybe' ? "3 going · you're a maybe" : "3 going · you can't make it";
      }
      var t = tap(segs.in, 500, function () { pick('in'); });
      later(function () { var m = $('d-msg'); m.hidden = false; m.classList.add('pop'); }, t + 500);
      t = tap(segs.maybe, t + 1300, function () { pick('maybe'); });
      t = tap(segs.no, t + 1100, function () { pick('no'); });
      t = tap(segs.in, t + 1100, function () { pick('in'); });
      later(fHide, t + 500);
      return t + 2400;
    },

    poll: function () {
      cells.forEach(function (c) { c.className = 'cell'; });
      $('p-check').classList.remove('on'); $('p-seg4').classList.remove('on'); $('p-best').hidden = true; $('p-radio').classList.remove('on');
      $('p-hint').textContent = '3 of 4 answered · waiting on you';
      others.forEach(function (o, i) { later(function () { cell(o[0], o[1]).classList.add('h' + o[2]); }, 300 + i * 70); });
      // you paint Fri 7–9 PM
      var start = cell(2, 1), path = [cell(2, 1), cell(3, 1), cell(4, 1)];
      later(function () { fShow(); fingerAt(start); }, 1500);
      later(fPress, 2000);
      path.forEach(function (c, i) {
        later(function () { fingerAt(c); c.classList.add('me'); if (c.classList.contains('h3')) c.classList.add('hot'); }, 2100 + i * 330);
      });
      later(fRelease, 3300);
      later(fHide, 3600);
      later(function () {
        $('p-check').classList.add('on'); $('p-seg4').classList.add('on');
        $('p-hint').textContent = "4 of 4 answered · everyone's in";
        var b = $('p-best'); b.hidden = false; b.classList.add('pop');
      }, 3900);
      later(function () { $('p-radio').classList.add('on'); }, 4600);
      tap($('p-lock'), 5000);
      later(fHide, 6000);
      return 7600;
    },

    plan: function () {
      var rows = [].slice.call($('plan-tl').querySelectorAll('.trow'));
      rows.forEach(function (r) { r.classList.remove('show'); });
      $('plan-gap').classList.remove('closed');
      $('plan-movie').style.height = '132px'; $('plan-movie-sub').textContent = '2 hr 10 · tickets bought';
      rows.forEach(function (r, i) { later(function () { r.classList.add('show'); }, 300 + i * 230); });
      var gapEl = $('plan-gap').querySelector('.free');
      var t = tap(gapEl, 3000, function () {
        $('plan-gap').classList.add('closed');
        $('plan-movie').style.height = '152px'; $('plan-movie-sub').textContent = '2 hr 30 · tickets bought';
      });
      later(fHide, t + 500);
      return t + 2600;
    },

    cars: function () {
      var s1 = $('c-seat1'), s2 = $('c-seat2');
      s1.className = 'seat'; s1.textContent = ''; s2.className = 'seat'; s2.textContent = ''; s2.style.removeProperty('--c');
      $('c-alex-sub').textContent = 'Leaves 6:25 · from the meetup'; $('c-hint1').style.opacity = '1';
      $('c-needs').classList.remove('gone'); $('c-count').textContent = '2 cars · 5 seats open';
      var t = tap(s1, 600, function () {
        s1.className = 'seat full you'; s1.textContent = 'C';
        $('c-alex-sub').textContent = 'Leaves 6:25 · picks you up 6:40'; $('c-hint1').style.opacity = '0';
        $('c-count').textContent = '2 cars · 4 seats open';
      });
      t = tap($('c-pull'), t + 1200, function () {
        $('c-needs').classList.add('gone');
        later(function () { s2.style.setProperty('--c', '#F472B6'); s2.className = 'seat full'; s2.textContent = 'J'; $('c-count').textContent = '2 cars · 3 seats open'; }, 250);
      });
      later(fHide, t + 500);
      return t + 2600;
    },

    live: function () {
      var cta = $('l-cta'), now = $('l-now');
      cta.textContent = 'Picked up Jordan'; now.classList.remove('swap');
      $('l-label').textContent = 'NEXT STOP · PICKUP 2 OF 2'; $('l-title').textContent = 'Jordan'; $('l-nsub').textContent = '1498 Maple Hills Drive';
      $('l-facts').style.display = ''; $('l-dirtext').textContent = '1498 Maple Hills Drive'; $('l-sub').textContent = '1 of 2 picked up · 1 to go';
      $('l-t-jordan').className = 'trow2 current'; $('l-t-dest').className = 'trow2';
      var js = $('l-jstate'); js.textContent = 'WAITING'; js.style.color = '#71717A';
      var t = tap(cta, 900, function () {
        $('l-t-jordan').className = 'trow2 done'; $('l-t-dest').className = 'trow2 current';
        js.textContent = 'PICKED UP'; js.style.color = '#4ADE80'; $('l-sub').textContent = '2 of 2 picked up · heading over';
        now.classList.add('swap');
        later(function () {
          $('l-label').textContent = "NEXT STOP · EVERYONE'S IN"; $('l-title').textContent = 'Nacho House'; $('l-nsub').textContent = 'arrive by 7:00 PM';
          $('l-facts').style.display = 'none'; $('l-dirtext').textContent = '212 Main St, Salt Lake City';
          now.classList.remove('swap'); cta.textContent = "I've arrived at Nacho House";
        }, 300);
      });
      t = tap(cta, t + 1600, function () {
        $('l-t-dest').className = 'trow2 done'; $('l-label').textContent = 'YOU MADE IT'; $('l-sub').textContent = 'Everyone in your car is here';
        cta.textContent = "We're all here 🎉"; burst($('l-conf'));
      });
      later(fHide, t + 500);
      return t + 3200;
    },

    invite: function () {
      var e = $('i-emoji'); e.classList.remove('pop'); void e.offsetWidth;
      $('i-youin').hidden = true; $('i-cta').innerHTML = "I'M IN &nbsp;🌮"; $('i-ghost').textContent = "Can't make it";
      later(function () { e.classList.add('pop'); }, 150);
      var t = tap($('i-cta'), 1500, function () {
        var y = $('i-youin'); y.hidden = false; y.classList.add('pop');
        $('i-cta').textContent = 'OPEN THE PLAN'; $('i-ghost').textContent = "Can't make it anymore"; burst($('i-conf'));
      });
      later(fHide, t + 500);
      return t + 3400;
    },
  };

  function run(key) {
    clearAll(); fHide();
    var dur = scripts[key] ? scripts[key]() : 3000;
    loopTimer = setTimeout(function () { if (active === key) run(key); }, reduce ? 999999 : dur + 1600);
  }

  function activate(key) {
    if (key === active) return;
    active = key;
    steps.forEach(function (s) { s.classList.toggle('on', s.dataset.screen === key); });
    screens.forEach(function (s) {
      var on = s.dataset.screen === key;
      if (s.classList.contains('on') && !on) { s.classList.add('leaving'); setTimeout(function () { s.classList.remove('leaving'); }, 600); }
      s.classList.toggle('on', on);
    });
    run(key);
  }

  // Pick the step whose box is nearest the viewport's middle.
  var ticking = false;
  function update() {
    ticking = false;
    var mid = window.innerHeight * 0.5, best = null, bestD = Infinity;
    steps.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var d = (r.top <= mid && r.bottom >= mid) ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (d < bestD) { bestD = d; best = s; }
    });
    if (best) activate(best.dataset.screen);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearAll(); else if (active) run(active); });
  update();
})();
