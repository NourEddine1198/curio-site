/* ===========================================================================
   REBUILT FILE - DO NOT EDIT BY HAND.
   Source:  products/sticker puzzle/scroll-demo/demo.js
   Rebuild: python -I "<scratchpad>/make_build_js.py"
   Edit the prototype, then rebuild, so the two never drift apart.
   =========================================================================== */
/* ركّبني — «كيفاش يخدم؟» as a pinned, scrubbed scroll section.
 *
 * No library. The pin is native `position: sticky`; the only thing the script does is turn
 * one number — how far you have scrolled through the section, 0 to 1 — into a transform on
 * each piece. Nothing is remembered between frames, so scrolling back up is exact by
 * construction: the picture at scroll position x is always the same picture.
 *
 * Everything animated is `transform` / `opacity` only. Nothing here reads or changes layout
 * mid-scroll except one bounding-rect read at the top of each frame.
 */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var K = 1000;                 // world units -> px (the world is 1.0 unit wide = 1000 px)

  /* ---------------------------------------------------------------------- the feels ----- */
  var FEELS = {
    d: { scroll: 2.4, paper: true,  tour: true },                                  // the tour
    a: { scroll: 2.2, paper: true,  closeup: true,  win: 0.115, build: [0.46, 0.80] },
    b: { scroll: 1.8, paper: true,  closeup: false, win: 0.100, build: [0.08, 0.82] },
    c: { scroll: 1.2, paper: false, closeup: false, win: 0.085, build: [0.06, 0.84] }
  };
  var CAPS = {
    d: [[0, 0.13], [0.15, 0.42], [0.45, 0.80], [0.845, 1.01]],
    a: [[0, 0.15], [0.175, 0.43], [0.46, 0.83], [0.86, 1.01]],
    b: [[0, 0.12], [0.145, 0.45], [0.48, 0.85], [0.88, 1.01]],
    c: [[0, 0.10], [0.125, 0.42], [0.45, 0.86], [0.89, 1.01]]
  };

  /* How the tour is paced, as fractions of the whole scroll. The beats are named because the
     feeling Nounouti asked for lives in their ORDER and their easing, not in the movement:
     land somewhere, be still while the work happens, move on briskly, and at the very end
     pull back slowly off a picture that is ALREADY finished, then hold. */
  var TOUR = {
    establish: 0.11,   // both objects on screen before the tour starts
    arrive:    0.085,  // settling onto the first region: ease-out, the longest single move
    move:      0.075,  // region to region: brisk, nobody should study it
    arc:       0.55,   // how far the move between regions swings back toward the whole view
    beat:      0.022,  // the last piece has landed. a breath before the camera moves at all
    reveal:    0.165,  // the pull-back: slower than any earlier move, with a long tail
    hold:      0.115,  // stillness on the finished picture. this is where the feeling lives
    pad:       0.05    // margin around a region, in world units
  };

  /* ---------------------------------------------------------------------- easing -------- */
  function clamp(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function inOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* Real cubic-bezier curves, so a camera move can say what it means rather than settle for
     whichever ease happens to be lying around. Solved by bisection: a handful of iterations
     on one number, once per frame. */
  function bezier(x1, y1, x2, y2) {
    function cx(t, a, b) { return 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var lo = 0, hi = 1, t = x, i, v;
      for (i = 0; i < 18; i++) {
        v = cx(t, x1, x2);
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return cx(t, y1, y2);
    };
  }
  var EASE = {
    // the page's own house curve: quick away, long soft settle. arriving somewhere.
    arrive: bezier(0.16, 1, 0.3, 1),
    // a transition, not a moment
    move:   bezier(0.65, 0, 0.35, 1),
    // eases out of stillness, then decelerates for a very long time
    reveal: bezier(0.3, 0, 0.08, 1),
    hold:   function () { return 1; }
  };
  function lerp(a, b, t) { return a + (b - a) * t; }
  function span(p, a, b) { return clamp((p - a) / (b - a || 1e-6)); }

  /* ------------------------------------------------------------------------ state ------- */
  var el = {};
  ['rail', 'stage', 'field', 'world', 'board', 'paper', 'boardImg', 'paperImg', 'pieces',
   'caps', 'bar', 'skip', 'tagPaper', 'tagBoard', 'fps'].forEach(function (id) {
    el[id] = document.getElementById('rk-' + id);
  });
  if (!el.rail || !el.stage || !el.caps) return;   // section not on this page - do nothing
  var capEls = [].slice.call(el.caps.querySelectorAll('.rk-cap'));

  var opt = { shadow: true, smooth: true, fps: false };
  var feelName = 'a', boardName = 'A02-Elephant';
  var data = null, nodes = [], L = null, cam = [], sched = [], lead = [], regions = null;
  var cur = 0, target = 0, running = false, armed = false;

  /* -------------------------------------------------------------------- building -------- */
  function buildPieces() {
    el.pieces.textContent = '';
    nodes = data.pieces.map(function (p) {
      var d = document.createElement('div');
      d.className = 'rk-piece';
      var img = new Image();
      // held back until the reader is near the section, so the pictures at the top of the
      // page are never made to wait for a quarter of a megabyte they cannot see yet
      img.dataset.src = '/products/rakibni/build/' + boardName + '/p' + String(p.n).padStart(2, '0') + '.webp';
      img.alt = '';
      img.decoding = 'async';
      img.fetchPriority = 'low';
      d.appendChild(img);
      if (opt.shadow) d.style.filter = 'drop-shadow(0 3px 5px rgba(0,0,0,.33))';
      el.pieces.appendChild(d);
      // a small, stable tilt so the pieces do not all move like one block
      p._tilt = ((p.n * 37) % 13) - 6;
      return d;
    });
  }

  function loadBoard(name) {
    boardName = name;
    data = window.RAKIBNI[name];
    el.boardImg.dataset.src = '/products/rakibni/build/' + name + '/board.webp';
    el.paperImg.dataset.src = '/products/rakibni/build/' + name + '/sheet.webp';
    buildPieces();
    layout();
    if (armed) preload();
  }

  function preload() {
    armed = true;
    var q = [el.boardImg, el.paperImg].concat(
      [].slice.call(el.pieces.querySelectorAll('img')));
    q.forEach(function (img) {
      if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
    });
  }

  /* --------------------------------------------------------------------- layout --------- */
  /* World coordinates: x and y are both measured in units of the world's WIDTH, so the world
     is 1.0 wide and `wh` tall. The camera turns that into pixels. */
  function layout() {
    if (!data) return;
    var f = FEELS[feelName];
    var fw = el.field.clientWidth, fh = el.field.clientHeight;

    /* THE ONE RULE OF THIS LAYOUT: the board and the sticker sheet are two printed objects, and
       they are drawn at ONE AND THE SAME SCALE — `u` world units per printed pixel, used for
       both. That is what makes a piece exactly the size of its hole while it is still lying on
       the paper, which is the entire promise of the product. Give the two objects their own
       scales and the pieces grow as they travel, which quietly says the opposite.
       (The two pages are NOT the same size: the board prints 240 x 210 mm and the sheet
       260 x 210 mm. Same height, so at one scale their heights match and the sheet is the
       wider of the two on screen. That is the truth, and the drawing should show it.) */
    var bpx = data.board.px, ppx = data.paper.px, u, gap;

    if (!f.paper) {
      u = 1 / bpx[0];
      L = { wh: u * bpx[1], board: { x: 0, y: 0, w: 1, h: u * bpx[1] }, paper: null };
    } else if (fw / Math.max(fh, 1) < 1.15) {        // phone / portrait: board above, paper below
      gap = 0.045;
      u = 1 / Math.max(bpx[0], ppx[0]);              // the wider of the two spans the world
      L = { wh: u * bpx[1] + gap + u * ppx[1],
            board: { x: (1 - u * bpx[0]) / 2, y: 0, w: u * bpx[0], h: u * bpx[1] },
            paper: { x: (1 - u * ppx[0]) / 2, y: u * bpx[1] + gap, w: u * ppx[0], h: u * ppx[1] } };
    } else {                                          // desktop: board left, paper right (RTL: source on the right)
      gap = 0.04;
      u = (1 - gap) / (bpx[0] + ppx[0]);
      var tall = u * Math.max(bpx[1], ppx[1]);
      L = { wh: tall,
            board: { x: 0, y: (tall - u * bpx[1]) / 2, w: u * bpx[0], h: u * bpx[1] },
            paper: { x: u * bpx[0] + gap, y: (tall - u * ppx[1]) / 2, w: u * ppx[0], h: u * ppx[1] } };
    }

    el.world.style.width = K + 'px';
    el.world.style.height = (L.wh * K) + 'px';
    put(el.board, L.board);
    el.paper.style.display = L.paper ? '' : 'none';
    el.tagPaper.style.display = L.paper ? '' : 'none';
    if (L.paper) put(el.paper, L.paper);

    data.pieces.forEach(function (p, i) {
      var n = nodes[i];
      n.style.left = ((L.board.x + p.bx * L.board.w) * K) + 'px';
      n.style.top = ((L.board.y + p.by * L.board.h) * K) + 'px';
      n.style.width = (p.bw * L.board.w * K) + 'px';
      n.style.height = (p.bh * L.board.h * K) + 'px';
    });

    // the two labels, parked just outside their object
    el.tagBoard.style.left = (L.board.x * K + 10) + 'px';
    el.tagBoard.style.top = ((L.board.y + L.board.h) * K - 30) + 'px';
    if (L.paper) {
      el.tagPaper.style.left = (L.paper.x * K + 10) + 'px';
      el.tagPaper.style.top = (L.paper.y * K - 28) + 'px';
    }

    // Not an assumption — a check. If a later change ever draws the two objects at different
    // scales again, the pieces would resize in flight and this says so out loud.
    if (L.paper && Math.abs(pieceScaleOnPaper() - 1) > 0.002) {
      console.warn('ركّبني: board and sheet are not at the same scale — pieces will change size ' +
                   'as they travel (factor ' + pieceScaleOnPaper().toFixed(3) + ')');
    }

    plan();
    ticks();
    el.rail.style.height = 'calc(100svh + ' + (f.scroll * 100) + 'svh)';
    draw(cur, true);
  }

  /* How big a piece is while it lies on the paper, next to how big it is in its hole.
     With the layout above this is 1 — computed, never assumed, so it cannot drift. */
  function pieceScaleOnPaper() {
    if (!L || !L.paper) return 1;
    return (L.paper.w / data.paper.px[0]) / (L.board.w / data.board.px[0]);
  }
  function put(node, r) {
    node.style.left = (r.x * K) + 'px'; node.style.top = (r.y * K) + 'px';
    node.style.width = (r.w * K) + 'px'; node.style.height = (r.h * K) + 'px';
  }

  /* ------------------------------------------------ camera rects + the piece schedule ---- */
  function holeRect(ids, pad) {                   // world rect around some holes
    var x0 = 9, y0 = 9, x1 = -9, y1 = -9;
    ids.forEach(function (i) {
      var p = data.pieces[i];
      x0 = Math.min(x0, L.board.x + p.bx * L.board.w);
      y0 = Math.min(y0, L.board.y + p.by * L.board.h);
      x1 = Math.max(x1, L.board.x + (p.bx + p.bw) * L.board.w);
      y1 = Math.max(y1, L.board.y + (p.by + p.bh) * L.board.h);
    });
    return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
  }

  /* Group the holes into contiguous patches of board — the "grids" Nounouti described.
     Plain k-means on the hole centres, with a spread-out deterministic start so the same
     board always gives the same regions. How many: follows the board rather than a fixed
     number, aiming at a satisfying handful each (17 -> 3, 38 -> 5, 45 -> 6). */
  function regionsOf(n) {
    var k = Math.max(2, Math.min(6, Math.round(Math.sqrt(n / 1.5))));
    var pt = data.pieces.map(function (p) { return [p.bx + p.bw / 2, p.by + p.bh / 2]; });

    var seeds = [0], i, j, c, best, bd, d;
    for (i = 1; i < pt.length; i++) if (pt[i][0] + pt[i][1] < pt[seeds[0]][0] + pt[seeds[0]][1]) seeds[0] = i;
    while (seeds.length < k) {                       // each new seed as far as possible from the rest
      best = -1; bd = -1;
      for (i = 0; i < pt.length; i++) {
        if (seeds.indexOf(i) >= 0) continue;
        d = Math.min.apply(null, seeds.map(function (sx) { return Math.hypot(pt[i][0] - pt[sx][0], pt[i][1] - pt[sx][1]); }));
        if (d > bd) { bd = d; best = i; }
      }
      seeds.push(best);
    }
    var cen = seeds.map(function (sx) { return [pt[sx][0], pt[sx][1]]; });
    var own = new Array(pt.length);
    for (var pass = 0; pass < 24; pass++) {
      for (i = 0; i < pt.length; i++) {
        best = 0; bd = 1e9;
        for (c = 0; c < k; c++) {
          d = Math.hypot(pt[i][0] - cen[c][0], pt[i][1] - cen[c][1]);
          if (d < bd) { bd = d; best = c; }
        }
        own[i] = best;
      }
      for (c = 0; c < k; c++) {
        var sx = 0, sy = 0, m = 0;
        for (i = 0; i < pt.length; i++) if (own[i] === c) { sx += pt[i][0]; sy += pt[i][1]; m++; }
        if (m) cen[c] = [sx / m, sy / m];
      }
    }

    var groups = [];
    for (c = 0; c < k; c++) {
      var ids = [];
      for (i = 0; i < pt.length; i++) if (own[i] === c) ids.push(i);
      if (!ids.length) continue;
      // biggest piece first inside a region: the shape of that patch arrives at once
      ids.sort(function (a, b) { return data.pieces[b].area_mm2 - data.pieces[a].area_mm2; });
      groups.push({ ids: ids, cx: cen[c][0], cy: cen[c][1] });
    }
    // tour right to left, the way the page reads — which on the Elephant also means it ends
    // on the head, with the eye as the last thing to arrive
    groups.sort(function (a, b) { return b.cx - a.cx; });
    return groups;
  }

  function planTour() {
    var n = data.pieces.length, R = regionsOf(n);
    var WIDE = { x: -0.03, y: -0.03, w: 1.06, h: L.wh + 0.06 };
    var BOARD = { x: L.board.x, y: L.board.y, w: L.board.w, h: L.board.h };

    var moves = (R.length - 1) * TOUR.move;
    var solving = 1 - TOUR.establish - TOUR.arrive - moves - TOUR.beat - TOUR.reveal - TOUR.hold;
    sched = new Array(n);
    cam = [[0, WIDE, EASE.hold], [TOUR.establish, WIDE, EASE.arrive]];

    var t = TOUR.establish;
    R.forEach(function (g, gi) {
      var moveDur = gi === 0 ? TOUR.arrive : TOUR.move;
      var arriveAt = t + moveDur;
      var solveFor = solving * (g.ids.length / n);
      var rect = holeRect(g.ids, TOUR.pad);

      if (gi > 0) {
        /* Moving between regions swings back out towards the whole scene and in again, rather
           than sliding sideways. It costs nothing in time and it buys the one thing this mode
           otherwise loses: at the top of that swing the sheet is on screen, so the next
           region's pieces are SEEN leaving the paper instead of appearing from nowhere. */
        var prev = cam[cam.length - 1][1];
        var box = {
          x: Math.min(prev.x, rect.x) - 0.02, y: Math.min(prev.y, rect.y) - 0.02,
          w: Math.max(prev.x + prev.w, rect.x + rect.w) - Math.min(prev.x, rect.x) + 0.04,
          h: Math.max(prev.y + prev.h, rect.y + rect.h) - Math.min(prev.y, rect.y) + 0.04
        };
        var k = TOUR.arc;
        cam.push([t + moveDur * 0.45, {
          x: lerp(box.x, WIDE.x, k), y: lerp(box.y, WIDE.y, k),
          w: lerp(box.w, WIDE.w, k), h: lerp(box.h, WIDE.h, k)
        }, EASE.move]);
      }
      cam.push([arriveAt, rect, EASE.hold]);           // hold: the camera is STILL while it solves
      cam.push([arriveAt + solveFor, rect, gi === R.length - 1 ? EASE.hold : EASE.move]);

      // The pieces of this region start lifting a little BEFORE the camera has settled, so on
      // the first region you watch them leave the paper while the view is still wide. They all
      // land inside the still stretch.
      // start lifting while the view is at its widest, which is mid-move
      var startAt = t + moveDur * (gi === 0 ? 0.45 : 0.3);
      var endAt = arriveAt + solveFor;
      var m = g.ids.length;
      var win = Math.min(0.11, (endAt - startAt) * (m > 2 ? 0.55 : 0.8));
      var step = m > 1 ? (endAt - startAt - win) / (m - 1) : 0;
      g.ids.forEach(function (idx, j) { sched[idx] = [startAt + j * step, startAt + j * step + win]; });

      g.endAt = t = arriveAt + solveFor;
    });

    // every piece is home; a breath; then the slow pull-back onto a FINISHED picture; then hold
    cam.push([t + TOUR.beat, cam[cam.length - 1][1], EASE.reveal]);
    cam.push([t + TOUR.beat + TOUR.reveal, BOARD, EASE.hold]);
    cam.push([1, BOARD, EASE.hold]);
    regions = R;
  }

  function plan() {
    var f = FEELS[feelName], n = data.pieces.length;
    regions = null;
    if (f.tour) { lead = []; planTour(); return; }

    // order: biggest first, so the shape of the picture arrives early and the last pieces
    // are the small details — which is also how a child tends to do it.
    var order = data.pieces.map(function (p, i) { return i; })
                           .sort(function (a, b) { return data.pieces[b].area_mm2 - data.pieces[a].area_mm2; });

    // the close-up stars: the biggest piece and its nearest neighbour, so the two holes are
    // always next to each other and the camera can get close enough to read the numbers
    lead = [];
    if (f.closeup) {
      var big = order[0], bp = data.pieces[big];
      var bcx = bp.bx + bp.bw / 2, bcy = bp.by + bp.bh / 2, best = -1, bd = 1e9;
      data.pieces.forEach(function (p, i) {
        if (i === big) return;
        var d = Math.hypot(p.bx + p.bw / 2 - bcx, p.by + p.bh / 2 - bcy);
        if (d < bd && p.area_mm2 > bp.area_mm2 * 0.12) { bd = d; best = i; }
      });
      lead = [big, best];
      order = order.filter(function (i) { return lead.indexOf(i) < 0; });
    }

    sched = new Array(n);
    lead.forEach(function (idx, j) { sched[idx] = [0.145 + j * 0.10, 0.145 + j * 0.10 + 0.145]; });
    var a = f.build[0], b = f.build[1], w = Math.min(f.win, (b - a) * 0.9);
    var step = order.length > 1 ? (b - a - w) / (order.length - 1) : 0;
    order.forEach(function (idx, j) { sched[idx] = [a + j * step, a + j * step + w]; });

    var WIDE = { x: -0.03, y: -0.03, w: 1.06, h: L.wh + 0.06 };
    var BOARD = { x: L.board.x, y: L.board.y, w: L.board.w, h: L.board.h };
    if (f.closeup) {
      var CLOSE = holeRect(lead, 0.045);
      cam = [[0, WIDE], [0.10, WIDE], [0.235, CLOSE], [0.40, CLOSE],
             [0.55, WIDE], [0.80, WIDE], [0.93, BOARD], [1, BOARD]];
    } else if (f.paper) {
      cam = [[0, WIDE], [0.78, WIDE], [0.93, BOARD], [1, BOARD]];
    } else {
      cam = [[0, BOARD], [1, BOARD]];
    }
  }

  /* A notch on the progress bar as each region is finished: progress you can see rather
     than only feel. Deliberately almost nothing — a celebration this product has not earned
     yet would be worse than none. */
  function ticks() {
    [].slice.call(el.stage.querySelectorAll('.rk-tick')).forEach(function (t) { t.remove(); });
    if (!regions) return;
    regions.slice(0, -1).forEach(function (g) {
      var t = document.createElement('i');
      t.className = 'rk-tick';
      t.style.right = (g.endAt * 100).toFixed(2) + '%';
      el.stage.appendChild(t);
    });
  }

  /* ----------------------------------------------------------------------- drawing ------- */
  function camAt(p) {
    var i = 0;
    while (i < cam.length - 2 && p > cam[i + 1][0]) i++;
    var ease = cam[i][2] || inOutCubic;              // each segment carries its own curve
    var t = ease(span(p, cam[i][0], cam[i + 1][0])), A = cam[i][1], B = cam[i + 1][1];
    return { x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t), w: lerp(A.w, B.w, t), h: lerp(A.h, B.h, t) };
  }

  function draw(p, force) {
    var fw = el.field.clientWidth, fh = el.field.clientHeight;
    if (!fw || !fh || !L) return;

    var r = camAt(p);
    var s = Math.min(fw / (r.w * K), fh / (r.h * K));
    var tx = fw / 2 - s * (r.x + r.w / 2) * K;
    var ty = fh / 2 - s * (r.y + r.h / 2) * K;
    el.world.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ')';

    // A piece does not change size on its way to its hole — it is the same printed piece the
    // whole time. This comes out at 1 because the layout draws both pages at one scale; it is
    // worked out rather than written as 1 so that it stays honest if the layout ever changes.
    var ps = pieceScaleOnPaper();
    var liftY = L.board.h * K * 0.055;

    for (var i = 0; i < nodes.length; i++) {
      var pc = data.pieces[i], w = sched[i];
      var u = outCubic(span(p, w[0], w[1]));
      var n = nodes[i];
      if (u >= 1) {                                  // home: no transform at all, so it lands
        if (n._u !== 1) { n.style.transform = 'none'; n._u = 1; }   // exactly on its hole
        continue;
      }
      n._u = u;
      var bcx = (L.board.x + (pc.bx + pc.bw / 2) * L.board.w) * K;
      var bcy = (L.board.y + (pc.by + pc.bh / 2) * L.board.h) * K;
      var scx, scy;
      if (L.paper) {
        scx = (L.paper.x + (pc.sx + pc.sw / 2) * L.paper.w) * K;
        scy = (L.paper.y + (pc.sy + pc.sh / 2) * L.paper.h) * K;
      } else {                                        // feel C: dealt in from below the board
        scx = bcx;
        scy = (L.board.y + L.board.h) * K + L.board.h * K * 0.42;
      }
      var lift = Math.sin(Math.PI * u);
      var dx = lerp(scx, bcx, u) - bcx;
      var dy = lerp(scy, bcy, u) - bcy - lift * liftY;
      // the piece keeps its size the whole way; the only swell is the moment it is picked
      // up off the paper, which reads as lifting rather than as growing
      var sc = ps * (1 + 0.1 * lift);
      var rot = (pc.turn + pc._tilt) * (1 - u);
      n.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0) rotate(' +
                          rot.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
    }

    // the paper steps aside once it is empty
    if (L.paper) {
      var out = span(p, 0.86, 1);
      el.paper.style.transform = 'translate3d(0,' + (out * 14).toFixed(1) + '%,0)';
      el.paper.style.opacity = (1 - out).toFixed(3);
      el.tagPaper.style.opacity = (1 - span(p, 0.12, 0.2)) * (1 - out);
    }
    el.tagBoard.style.opacity = (1 - span(p, 0.12, 0.2)).toFixed(3);

    var win = CAPS[feelName];
    for (var c = 0; c < capEls.length; c++) {
      var ci = win[c], o = Math.min(span(p, ci[0], ci[0] + 0.045), 1 - span(p, ci[1] - 0.045, ci[1]));
      if (c === 0 && p < 0.02) o = 1;
      capEls[c].style.opacity = o.toFixed(3);
      capEls[c].style.transform = 'translate3d(0,' + ((1 - o) * 10).toFixed(1) + 'px,0)';
    }
    el.bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    el.skip.style.opacity = (1 - span(p, 0.86, 0.96)).toFixed(2);
    el.skip.style.pointerEvents = p > 0.95 ? 'none' : 'auto';
  }

  /* ------------------------------------------------------------------------- loop -------- */
  var frames = 0, slow = 0, t0 = performance.now(), worst = 0, last = t0;
  function tick() {
    if (!running) return;
    var rect = el.rail.getBoundingClientRect();                      // the only layout read
    var travel = el.rail.offsetHeight - el.stage.offsetHeight;
    target = clamp(travel > 0 ? -rect.top / travel : 0);
    var nowT = performance.now(), step = Math.min(64, nowT - last);
    // chase the real scroll position over about a tenth of a second, measured in time rather
    // than in frames, so a slow phone and a fast one settle after the same moment
    cur = opt.smooth ? cur + (target - cur) * (1 - Math.pow(1 - 0.18, step / 16.67)) : target;
    if (Math.abs(target - cur) < 0.00015) cur = target;
    draw(cur);

    if (opt.fps) {
      frames++; if (step > 20) slow++; if (step > worst) worst = step;
      if (nowT - t0 > 500) {
        el.fps.textContent = (frames * 1000 / (nowT - t0)).toFixed(0) + ' fps\n' +
          'worst ' + worst.toFixed(1) + ' ms\n' + 'slow ' + slow + '/' + frames +
          '\npieces ' + nodes.length;
        frames = 0; slow = 0; worst = 0; t0 = nowT;
      }
    }
    last = nowT;
    requestAnimationFrame(tick);
  }
  function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } }
  function stop() { running = false; }

  /* -------------------------------------------------------------------- wiring ---------- */
  function setFeel(f) {
    feelName = f;
    document.documentElement.setAttribute('data-feel', f);
    layout();
  }
  function setOpt(k, v) {
    opt[k] = v;
    if (k === 'shadow') {
      el.pieces.style.filter = '';
      nodes.forEach(function (n) { n.style.filter = v ? 'drop-shadow(0 3px 5px rgba(0,0,0,.33))' : ''; });
    }
  }

  el.skip.onclick = function () {
    var y = el.rail.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  var ro = new ResizeObserver(function () { layout(); });

  /* Is the reader close enough to the section to be worth waking it up — and fetching its
     pictures? Deliberately a plain scroll listener rather than an IntersectionObserver: the
     observer only reports on a rendering step, so on a page the browser has decided not to
     draw it may never report at all, and then the section would sit there empty. A scroll
     event always arrives. */
  function near() {
    var r = el.rail.getBoundingClientRect();
    return r.top < innerHeight * 2.5 && r.bottom > -innerHeight * 1.5;
  }
  function check() { if (near()) { preload(); start(); } else stop(); }

  function boot() {
    // Someone who asked their phone for less motion keeps the still version that is already
    // on the page. Nothing is hidden from them: it carries the finished picture and all three
    // steps in words.
    if (RM.matches) return;
    document.documentElement.classList.add('rk-on');
    setFeel('b');   // LOCKED 15 Nov 2026 - Nounouti's pick. D (the tour) stays in the panel to compare.
    setOpt('smooth', true);
    loadBoard('A02-Elephant');
    setOpt('shadow', true);
    ro.observe(el.field);
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', function () { setTimeout(layout, 220); });
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  }
  window.__rk = { draw: draw, layout: layout, feels: FEELS };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
