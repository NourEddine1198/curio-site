/* The worlds section: tap a world, its first board builds piece by piece.

   Approved by Nounouti on 16 Nov as "option 4" plus two additions of his: the
   other nine boards of that world sit underneath as still thumbnails, and that
   strip swipes itself every 2.5 s. The world also advances on its own until the
   visitor taps, so the section works for the many people who never tap.

   Prototype and the six options it was chosen from:
   products/sticker puzzle/worlds-options/ (option-4.html, option4.js, engine.js)

   ⛔ EVERY class and id here is namespaced rkw-*. The page already owns .world,
   .worlds, .strip, .chip, and the scrolling build above owns rk-* including
   rk-on and rk-done. An unprefixed merge breaks both.

   The page hands its own world data over in window.RK_WORLDS, set by the inline
   script, so the names and the ten picture titles have exactly one home.
*/
(function () {
  'use strict';

  var CFG = {
    swipe: 2500,   // his number: the thumbnail strip advances this often
    hold: 9500,    // a finished board holds this long before the world turns
    step: 58,      // ms between one piece taking off and the next
    fly: 500,      // ms a piece spends in the air
    auto: true     // the world advances on its own until the first tap
  };

  /* The board that builds for each world.
     `level` is its place in that world's ten (0-based) — the caption takes the
     name from there and the thumbnail strip leaves that one out, so changing a
     board here needs no other edit.
     ⛔ Animals is the FOX, not the elephant: the elephant already builds itself
     in the scrolling section higher up the page, and watching the same animal
     assemble twice makes the second one look like a repeat rather than a
     second thing you get. */
  var WBASE = '/products/rakibni/worlds/';
  var HERO = {
    algeria: { pack: 'DZ07-Maqam-Chahid', n: 38, level: 0, base: WBASE },
    animals: { pack: 'A03-Fox', n: 21, level: 1, base: WBASE },
    vehicles: { pack: 'V01-4X4', n: 32, level: 0, base: WBASE }
  };
  var EASE = 'cubic-bezier(.16,1,.3,1)';

  var host = document.getElementById('rkw');
  var DATA = window.RK_WORLDS;
  if (!host || !DATA || !DATA.worlds || !DATA.order) return;

  var W = DATA.worlds, ORDER = DATA.order;
  function byKey(k) {
    for (var i = 0; i < W.length; i++) if (W[i].key === k) return W[i];
    return null;
  }
  function el(t, c, h) {
    var e = document.createElement(t);
    if (c) e.className = c;
    if (h != null) e.innerHTML = h;
    return e;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ===================== the build engine ===================== */
  function mount(box, pack, base) {
    var api = { ready: false, el: box };
    box.className = 'rkw-stage';
    var wrap = el('div', 'rkw-wrap');
    box.appendChild(wrap);

    function go(d) {
      api.data = d;
      wrap.style.aspectRatio = d.board.w + ' / ' + d.board.h;

      var b = new Image();
      b.src = base + pack + '/board.webp';
      b.className = 'rkw-b';
      b.alt = '';
      b.decoding = 'async';
      // The pieces fly on a timer, not when their picture arrives, so on a slow
      // phone a piece can be in the air before the board it lands on exists.
      // The board goes first; the thumbnail strip below gets 'low' to match.
      b.fetchPriority = 'high';
      wrap.appendChild(b);

      var fin = new Image();
      fin.src = base + pack + '/finished.webp';
      fin.className = 'rkw-f';
      fin.alt = '';
      fin.loading = 'lazy';
      fin.decoding = 'async';
      wrap.appendChild(fin);
      api.fin = fin;

      // top of the board down, so the eye follows a sensible order
      var order = d.pieces.slice().sort(function (x, y) {
        return (x.by - y.by) || (y.bx - x.bx);
      });
      api.pcs = order.map(function (p) {
        var im = new Image();
        im.src = base + pack + '/p' + pad(p.n) + '.webp';
        im.className = 'rkw-p';
        im.alt = '';
        im.decoding = 'async';
        im.style.left = (p.bx * 100) + '%';
        im.style.top = (p.by * 100) + '%';
        im.style.width = (p.bw * 100) + '%';
        im.style.height = (p.bh * 100) + '%';
        wrap.appendChild(im);
        return { im: im, p: p };
      });
      api.ready = true;
      api.reset();
      if (api.onready) api.onready();
    }

    // each pack registers itself as window.RAKIBNI["<pack>"]
    if (window.RAKIBNI && window.RAKIBNI[pack]) {
      setTimeout(function () { go(window.RAKIBNI[pack]); }, 0);
    } else {
      var s = document.createElement('script');
      s.src = base + pack + '/pieces.js';
      s.onload = function () {
        if (window.RAKIBNI && window.RAKIBNI[pack]) go(window.RAKIBNI[pack]);
      };
      document.head.appendChild(s);
    }

    /* where a piece waits: on the printed sheet, below the board */
    function park(p) {
      var k = api.data.paper.w / api.data.board.w;
      return 'translate(' + ((p.sx - p.bx) * 100 * k).toFixed(1) + '%,'
        + (((p.sy - p.by) * 100) + 118).toFixed(1) + '%) scale(.94)';
    }

    api.reset = function () {
      if (!api.ready) return;
      api.pcs.forEach(function (pc) {
        pc.im.style.transition = 'none';
        pc.im.style.opacity = '0';
        pc.im.style.transform = park(pc.p);
        pc.im.classList.add('rkw-air');
      });
      api.fin.style.transition = 'none';
      api.fin.style.opacity = '0';
      void wrap.offsetWidth;
    };

    api.play = function (done) {
      if (!api.ready) return;
      api.pcs.forEach(function (pc, i) {
        pc.t = setTimeout(function () {
          pc.im.style.transition = 'opacity ' + (CFG.fly * 0.45) + 'ms linear,'
            + ' transform ' + CFG.fly + 'ms ' + EASE;
          pc.im.style.opacity = '1';
          pc.im.style.transform = 'none';
          setTimeout(function () {
            pc.im.classList.remove('rkw-air');
          }, CFG.fly * 0.82);
        }, i * CFG.step);
      });
      api.tEnd = setTimeout(function () {
        api.fin.style.transition = 'opacity 520ms ease';
        api.fin.style.opacity = '1';
        if (done) done();
      }, api.pcs.length * CFG.step + CFG.fly + 120);
    };

    api.replay = function (done) {
      api.pcs && api.pcs.forEach(function (pc) { clearTimeout(pc.t); });
      clearTimeout(api.tEnd);
      api.reset();
      api.play(done);
    };
    return api;
  }

  /* ===================== the section ===================== */
  var pick = el('div', 'rkw-pick');
  var stage = el('div', 'rkw-stageHost');
  var cap = el('p', 'rkw-cap');
  var more = el('div', 'rkw-more');
  var moreT = el('div', 'rkw-moreT', '9 لوحات أخرى في هذا العالم')  /* تصاور -> لوحات, his word swap 23 Nov */;
  var strip = el('div', 'rkw-strip');
  more.appendChild(moreT);
  more.appendChild(strip);
  host.appendChild(pick);
  host.appendChild(stage);
  host.appendChild(cap);
  host.appendChild(more);

  var state = { world: null, tapped: false, timer: null, swipe: null, apis: {} };

  ORDER.forEach(function (k) {
    var w = byKey(k), b = el('button', 'rkw-b-btn');
    b.type = 'button';
    b.setAttribute('aria-label', w.name);
    var im = new Image();
    im.src = '/products/rakibni/pouch-' + k + '.webp';
    im.width = 622;
    im.height = 640;
    im.alt = '';
    im.loading = 'lazy';
    b.appendChild(im);
    b.appendChild(el('span', null, w.short));
    b.onclick = function () {
      state.tapped = true;
      clearTimeout(state.timer);
      open(k);
    };
    pick.appendChild(b);
  });

  function fillStrip(k) {
    var w = byKey(k);
    strip.innerHTML = '';
    strip.scrollLeft = 0;
    for (var i = 0; i < 10; i++) {
      // "the other nine" - whichever one is building above is left out
      if (i === HERO[k].level) continue;
      var f = el('figure');
      var im = new Image();
      im.src = '/products/rakibni/p/' + k + '-' + pad(i + 1) + '.webp';
      // ⛔ width/height stay at the ORIGINAL 560×455 on purpose. They only
      // reserve the box the browser draws, so keeping them is what stops the
      // layout shifting now the files themselves are 368×299.
      im.width = 560;
      im.height = 455;
      im.loading = 'lazy';
      im.decoding = 'async';
      // nothing in the build waits for these, so they must not compete with
      // the board and its pieces for the connection
      im.fetchPriority = 'low';
      im.alt = w.name + '، المستوى ' + (i + 1) + ': ' + w.pics[i];
      f.appendChild(im);
      f.appendChild(el('figcaption', null, '<b>' + (i + 1) + '</b>' + w.pics[i]));
      strip.appendChild(f);
    }
    startSwipe();
  }

  /* browsers disagree about which way scrollLeft counts inside an RTL box,
     so ask this element once instead of trusting a rule */
  function rtlSign() {
    if (strip.__sign) return strip.__sign;
    var was = strip.scrollLeft;
    strip.scrollLeft = 40;
    strip.__sign = strip.scrollLeft > 0 ? 1 : -1;
    strip.scrollLeft = was;
    return strip.__sign;
  }

  function startSwipe() {
    clearInterval(state.swipe);
    var i = 0, paused = 0;
    ['pointerdown', 'wheel', 'touchstart'].forEach(function (ev) {
      strip.addEventListener(ev, function () {
        paused = Date.now() + 6000;   // a reader who touches it owns it
      }, { passive: true });
    });
    state.swipe = setInterval(function () {
      if (Date.now() < paused || !strip.firstChild) return;
      var step = strip.firstChild.getBoundingClientRect().width + 8;
      var span = strip.scrollWidth - strip.clientWidth;
      if (span <= 0) return;
      i = (i + 1) % (Math.ceil(span / step) + 1);
      strip.scrollTo({ left: rtlSign() * i * step, behavior: 'smooth' });
    }, CFG.swipe);
  }

  function open(k) {
    if (state.world === k) return;
    state.world = k;
    var w = byKey(k), h = HERO[k];
    [].forEach.call(pick.children, function (x, i) {
      x.classList.toggle('on', ORDER[i] === k);
      x.setAttribute('aria-pressed', ORDER[i] === k ? 'true' : 'false');
    });
    cap.innerHTML = '<span>' + w.name + '</span><b>' + w.pics[h.level] + '</b>'
      + '<em>' + h.n + ' قطعة</em>';
    fillStrip(k);

    Object.keys(state.apis).forEach(function (x) {
      state.apis[x].el.style.display = x === k ? '' : 'none';
    });
    if (state.apis[k]) { state.apis[k].replay(after); return; }
    var box = el('div');
    stage.appendChild(box);
    var api = mount(box, h.pack, h.base);
    api.onready = function () { api.replay(after); };
    api.el = box;
    state.apis[k] = api;
  }

  function after() {
    if (!CFG.auto || state.tapped) return;
    state.timer = setTimeout(function () {
      open(ORDER[(ORDER.indexOf(state.world) + 1) % ORDER.length]);
    }, CFG.hold);
  }

  /* nothing is fetched until the section is actually near the screen */
  if (location.hash === '#worlds') {
    open('animals');                 // someone linked straight here
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, io) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      open('animals');          // the lightest board, so the first build is quick
    }, { rootMargin: '300px' }).observe(host);
  } else {
    open('animals');
  }
})();
