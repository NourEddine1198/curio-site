/* =============================================================================
   REVIEW NOTES - click anywhere on the page and leave a note.

   Built for Nounouti, 16 Nov 2026. The point of it: he reads the page, taps the
   exact thing he wants changed, types what he wants in plain words, then presses
   one button and pastes the lot back into the chat. Each note carries enough
   around it - the section, the element, the words that were on screen - that the
   change can be found without a single "which bit do you mean?".

   WHEN IT TURNS ON
     - always while the page is served from localhost or opened as a file
     - on the real site ONLY if the address ends in #notes
   So a customer never sees it. If you would rather it were not on the live site
   at all, delete the one <script src=".../review.js"> line from index.html.

   WHAT IT NEVER TOUCHES
     Nothing on the page is modified. It adds its own layer on top and swallows
     the click while note mode is on, so tapping "اطلب" writes a note instead of
     opening the order form. Turn note mode off and the page behaves normally.

   Notes live in this browser only (localStorage), so they survive a reload and a
   restart, and they never reach a server.
   ============================================================================= */
(function () {
  'use strict';

  var host = location.hostname;
  var allowed = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' ||
                location.protocol === 'file:' || /(^|[#&])notes\b/.test(location.hash);
  if (!allowed) return;

  var KEY = 'curio-rk-notes-v1';
  var TKEY = 'curio-rk-textedits-v1';
  var notes = [];
  var on = false;          // note mode: is a click a note, or an ordinary click?
  var editing = null;      // the note currently open in the box
  var fixing = false;      // fix-the-text mode: is the page's copy typeable?
  var textEdits = {};      // stableKey -> { sec, what, before, after, html }

  /* ------------------------------------------------------------------ store -- */
  function load() {
    try { notes = JSON.parse(localStorage.getItem(KEY) || '[]') || []; }
    catch (e) { notes = []; }
  }
  function save() {
    // A private window, or storage the browser has blocked, must not take the
    // tool down with it - the notes simply do not outlive the tab.
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {}
  }

  /* ------------------------------------------------- describing what was hit -- */
  function clean(t) {
    return (t || '').replace(/\s+/g, ' ').trim();
  }

  // Plain names for the parts of the page, so a note says "الهيرو" and not "top".
  // An id that is not in here still works - it falls through to the section's own
  // heading, and then to the raw id - so adding a section needs no change up here.
  var SECTIONS = {
    hdr: 'الهيدر (فوق)',
    top: 'الهيرو — أول شاشة',
    who: 'شكون حنا (روبلة ودلالة)',
    how: 'كيفاش يخدم',
    worlds: 'الـ3 عوالم',
    why: 'علاش ركّبني',
    asgift: 'كادو',
    box: 'واش في العلبة',
    gift: 'ورقات الكادو',
    order: 'الطلب',
    cform: 'استمارة الطلب',
    faq: 'الأسئلة'
  };

  // Which part of the page is this? The nearest section, named the way he would
  // name it out loud.
  function sectionOf(el) {
    var sec = el.closest ? el.closest('section, header, footer, form') : null;
    if (!sec) return { id: '', name: 'الصفحة' };
    if (SECTIONS[sec.id]) return { id: sec.id, name: SECTIONS[sec.id] };
    // No entry: use the first heading that actually has words in it. The hero's
    // own h1 is the logo picture, which is why "the first heading" is not enough.
    var hs = sec.querySelectorAll('h1, h2, .h2, .eyebrow, legend');
    for (var i = 0; i < hs.length; i++) {
      var t = clean(hs[i].textContent);
      if (t) return { id: sec.id || '', name: t.slice(0, 40) };
    }
    return { id: sec.id || '', name: sec.id || sec.tagName.toLowerCase() };
  }

  // The whole line the click landed in. Tapping a highlighted word gives back
  // just that word, which is rarely enough to find the sentence it came from.
  function lineOf(el) {
    var block = el.closest ? el.closest('p, h1, h2, h3, h4, li, button, a, summary, label, td, figcaption') : null;
    if (!block) return '';
    var t = clean(block.textContent);
    return t.length > 140 ? t.slice(0, 140) + '…' : t;
  }

  // Parts that have no words of their own, so a note on them would otherwise read
  // "img" and nothing else. The flying pieces in particular are bare <img alt="">.
  var LABELS = {
    'rk-board': 'اللوحة (الصورة بالأرقام)',
    'rk-boardImg': 'اللوحة (الصورة بالأرقام)',
    'rk-paper': 'ورقة القطع',
    'rk-paperImg': 'ورقة القطع',
    'rk-pieces': 'القطع في الهوا',
    'rk-piece': 'قطعة من القطع',
    'rk-caps': 'الكلام تحت الحركة',
    'rk-skip': 'زر التخطّي',
    'rk-bar': 'شريط التقدّم',
    'rk-still': 'النسخة الساكنة (بلا حركة)',
    'hero-pic': 'صورة الهيرو',
    'ribbon': 'شريط العرض',
    'order-btn': 'زر الطلب'
  };

  // Climb to something worth naming. A click lands on whatever pixel is on top,
  // and that is often an <img> with no alt inside a div that does have a name.
  function meaningful(el) {
    var n = el, steps = 0;
    while (n && n !== document.body && steps < 4) {
      var named = n.id || (n.getAttribute && n.getAttribute('class'));
      var words = clean(n.textContent).length > 0;
      var alt = n.tagName === 'IMG' && clean(n.getAttribute('alt')).length > 0;
      if (named || words || alt) return n;
      n = n.parentElement; steps++;
    }
    return el;
  }

  // Enough to find the element again by hand: tag, id, the first couple of
  // classes. Deliberately not a long CSS path - those break the moment anything
  // above them moves, and a human has to read this too.
  function describe(el) {
    var bits = el.tagName.toLowerCase();
    if (el.id) bits += '#' + el.id;
    var cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3);
    if (cls.length) bits += '.' + cls.join('.');
    var nice = LABELS[el.id];
    if (!nice) {
      var all = (el.getAttribute('class') || '').split(/\s+/);
      for (var i = 0; i < all.length && !nice; i++) nice = LABELS[all[i]];
    }
    return nice ? bits + '  — ' + nice : bits;
  }

  // The words that were on screen at that spot. For a picture there are none, so
  // fall back to the alt text, which is what the picture is.
  function textOf(el) {
    if (el.tagName === 'VIDEO') return 'فيديو';
    if (el.tagName === 'IMG') {
      var a = clean(el.getAttribute('alt'));
      return a ? 'صورة · ' + a.slice(0, 70) : 'صورة (بلا وصف)';
    }
    var t = clean(el.textContent);
    if (!t) {
      // An empty alt is not a description - the flying pieces all carry one,
      // on purpose, so a screen reader does not count them out one by one.
      var img = el.querySelector && el.querySelector('img');
      var ia = img ? clean(img.getAttribute('alt')) : '';
      return ia ? 'صورة · ' + ia.slice(0, 70) : 'صورة (بلا وصف)';
    }
    return t.length > 90 ? t.slice(0, 90) + '…' : t;
  }

  /* ================================================================ fix text ===
     Note 4, 16 Nov: "give me the option to edit text myself, few spelling I need
     to fix. this is not only here but in the whole page."

     So: a second mode that makes every line of copy on the page typeable. He
     fixes the spelling in place, presses the same copy button, and the report
     carries قبل / بعد pairs that can be applied to the file word for word.

     Two modes, never both at once - note mode swallows every click, which would
     make it impossible to put the caret anywhere.
     ============================================================================ */

  // Never typeable: the prices (written by the page's own script, so a hand edit
  // is overwritten on the next repaint and would be a lie in between), the form
  // controls, and this tool's own furniture.
  var NO_EDIT = 'script,style,textarea,input,select,option,[data-price],[data-compare],[data-go],.preview-chip';

  function loadEdits() {
    try { textEdits = JSON.parse(localStorage.getItem(TKEY) || '{}') || {}; }
    catch (e) { textEdits = {}; }
  }
  function saveEdits() {
    try { localStorage.setItem(TKEY, JSON.stringify(textEdits)); } catch (e) {}
  }

  // A name for an element that does NOT change when its words change - otherwise
  // a fix would lose its own key the moment it was typed, and could not survive
  // a reload. Section, then what the element is, then which one of those it is.
  function stableKey(el) {
    var sec = sectionOf(el);
    var d = describe(el).split('  — ')[0];
    var scope = (el.closest && el.closest('section, header, footer, form')) || document.body;
    var twins = [].slice.call(scope.getElementsByTagName(el.tagName))
      .filter(function (x) { return describe(x).split('  — ')[0] === d; });
    return (sec.id || sec.name) + '|' + d + '|' + twins.indexOf(el);
  }

  // Every element that owns words of its own. "Of its own" means a direct text
  // node: a <p> holding a highlighted <span> is one editable line, not two, so
  // the highlight survives being typed around.
  function editableElements() {
    var out = [];
    var all = document.body.querySelectorAll(
      'h1,h2,h3,h4,h5,p,li,span,small,b,strong,em,summary,label,figcaption,td,th,div,a,button');
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (bar.contains(e) || box.contains(e) || layer.contains(e)) continue;
      if (e.closest(NO_EDIT) || e.matches(NO_EDIT)) continue;
      // Only what is actually on screen. The page carries both halves of the A/B
      // offer in the markup and hides one, and there is no point outlining a line
      // he cannot see or click into. NOTE WHEN APPLYING A FIX: the hidden twin
      // often holds the same sentence, so check both arms before calling it done.
      if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue;
      var own = false;
      for (var k = 0; k < e.childNodes.length; k++) {
        var n = e.childNodes[k];
        if (n.nodeType === 3 && n.nodeValue.trim()) { own = true; break; }
      }
      if (!own) continue;
      // Skip anything already inside a line we have taken - no nested boxes.
      var nested = false;
      for (var j = 0; j < out.length; j++) if (out[j].contains(e)) { nested = true; break; }
      if (!nested) out.push(e);
    }
    return out;
  }

  var fixNodes = [];

  function startFixing() {
    fixNodes = editableElements();
    fixNodes.forEach(function (e) {
      e.__rkKey = stableKey(e);
      e.__rkBefore = (textEdits[e.__rkKey] && textEdits[e.__rkKey].before) || clean(e.textContent);
      e.setAttribute('contenteditable', 'true');
      e.setAttribute('spellcheck', 'false');
      e.style.outline = '1.5px dashed rgba(247,179,24,.55)';
      e.style.outlineOffset = '2px';
      e.addEventListener('input', onFixInput);
      // A line that is also a link or a button must not navigate while it is
      // being typed in.
      e.addEventListener('click', swallowWhileFixing, true);
    });
    document.body.setAttribute('data-rk-fixing', '1');
  }

  function stopFixing() {
    fixNodes.forEach(function (e) {
      e.removeAttribute('contenteditable');
      e.removeAttribute('spellcheck');
      e.style.outline = '';
      e.style.outlineOffset = '';
      e.removeEventListener('input', onFixInput);
      e.removeEventListener('click', swallowWhileFixing, true);
    });
    fixNodes = [];
    document.body.removeAttribute('data-rk-fixing');
  }

  function swallowWhileFixing(e) {
    if (fixing) { e.preventDefault(); e.stopPropagation(); }
  }

  function onFixInput(e) {
    var el = e.currentTarget;
    var now = clean(el.textContent);
    if (now === el.__rkBefore) delete textEdits[el.__rkKey];
    else {
      var sec = sectionOf(el);
      textEdits[el.__rkKey] = {
        sec: sec.name,
        what: describe(el),
        before: el.__rkBefore,
        after: now,
        html: el.innerHTML
      };
    }
    saveEdits();
    paintCounts();
  }

  // Put back what he typed last time. Done at boot, whether or not fix mode is
  // on, so a reload shows his own corrected page rather than silently throwing
  // the typing away. Once a fix is applied to the real file the stored "before"
  // stops matching and the entry simply stops being used.
  function restoreEdits() {
    var keys = Object.keys(textEdits);
    if (!keys.length) return 0;
    var hit = 0;
    editableElements().forEach(function (e) {
      var rec = textEdits[stableKey(e)];
      if (rec && clean(e.textContent) === rec.before) { e.innerHTML = rec.html; hit++; }
    });
    return hit;
  }

  /* -------------------------------------------------------------------- UI ---- */
  var layer, bar, countEl, box, ta, boxWhat;
  var paintCounts = function () {};   // replaced by buildUI once the bar exists

  function el(tag, css, parent) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    (parent || document.body).appendChild(n);
    return n;
  }

  var FONT = '"Noto Sans Arabic", system-ui, sans-serif';

  function buildUI() {
    layer = el('div', 'position:absolute;inset:0;z-index:9990;pointer-events:none;');
    layer.id = 'rk-notes-layer';

    // Below the page's own sticky header on purpose: at the very top it sat over the
    // header's "اطلب" button, so with note mode off that button could not be reached.
    bar = el('div',
      'position:fixed;z-index:9999;top:78px;left:8px;display:flex;gap:6px;align-items:center;' +
      'flex-wrap:wrap;max-width:calc(100vw - 16px);' +
      'background:#161310;color:#fbf6ec;border:2px solid #F7B318;border-radius:12px;' +
      'padding:6px 8px;font:700 12px/1.2 ' + FONT + ';box-shadow:0 4px 14px rgba(0,0,0,.4);' +
      'direction:rtl;');

    function btn(label, title, bg, color) {
      var b = el('button', 'font:inherit;border:0;border-radius:8px;padding:5px 9px;cursor:pointer;' +
        'background:' + bg + ';color:' + color + ';white-space:nowrap;', bar);
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      return b;
    }

    var toggle = btn('✎ ملاحظات', 'شعّل/طفي وضع الملاحظات', '#F7B318', '#161310');
    var fixBtn = btn('✐ صلّح النص', 'شعّل الكتابة: صلّح الإملاء مباشرة في الصفحة', '#bfe9f9', '#161310');
    countEl = el('span', 'opacity:.85;text-align:center;white-space:nowrap;', bar);
    var copy = btn('نسخ', 'انسخ كلش — الملاحظات وتبديلات النص', '#5cb335', '#fff');
    var wipe = btn('مسح', 'امسح الملاحظات وتبديلات النص', '#2b2520', '#fbf6ec');

    function paintToggle() {
      toggle.style.background = on ? '#ec2c24' : '#F7B318';
      toggle.style.color = on ? '#fff' : '#161310';
      toggle.textContent = on ? '✎ شعّال — كليكي وين تحب' : '✎ ملاحظات';
      document.documentElement.style.cursor = on ? 'crosshair' : '';
      fixBtn.style.background = fixing ? '#ec2c24' : '#bfe9f9';
      fixBtn.style.color = fixing ? '#fff' : '#161310';
      fixBtn.textContent = fixing ? '✐ شعّال — اكتب في الصفحة' : '✐ صلّح النص';
    }
    paintCounts = function () {
      var t = Object.keys(textEdits).length;
      countEl.textContent = (notes.length ? notes.length + ' ملاحظة' : '') +
        (notes.length && t ? ' · ' : '') + (t ? t + ' تبديل' : '');
    };

    // The two modes cannot run together: note mode eats every click, so the
    // caret could never be put inside a word.
    toggle.onclick = function () {
      on = !on;
      if (on && fixing) { fixing = false; stopFixing(); }
      if (!on) closeBox();
      paintToggle();
    };
    fixBtn.onclick = function () {
      fixing = !fixing;
      if (fixing && on) { on = false; closeBox(); }
      if (fixing) startFixing(); else stopFixing();
      paintToggle();
    };

    copy.onclick = function () { doCopy(copy); };
    wipe.onclick = function () {
      var t = Object.keys(textEdits).length;
      if (!notes.length && !t) return;
      if (!confirm('تمسح ' + notes.length + ' ملاحظة و' + t + ' تبديل نص؟ ما تقدرش تردهم.')) return;
      notes = []; save();
      textEdits = {}; saveEdits();
      if (fixing) { stopFixing(); startFixing(); }
      render();
    };
    paintToggle();

    box = el('div',
      'position:fixed;z-index:10000;display:none;width:min(92vw,340px);background:#fffdf7;' +
      'color:#161310;border:2.5px solid #161310;border-radius:14px;box-shadow:6px 6px 0 rgba(0,0,0,.35);' +
      'padding:10px;font:500 13px/1.45 ' + FONT + ';direction:rtl;');
    boxWhat = el('div', 'font-weight:800;font-size:11.5px;opacity:.65;margin-bottom:6px;' +
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;', box);
    ta = el('textarea',
      'width:100%;min-height:76px;resize:vertical;font:inherit;padding:7px;border:2px solid #e7dcc6;' +
      'border-radius:9px;background:#fff;color:inherit;', box);
    ta.setAttribute('dir', 'auto');
    ta.placeholder = 'واش تحب يتبدّل هنا؟';

    var row = el('div', 'display:flex;gap:6px;margin-top:7px;align-items:center;', box);
    var ok = el('button', 'font:700 13px ' + FONT + ';border:0;border-radius:9px;padding:6px 14px;' +
      'background:#161310;color:#fff;cursor:pointer;', row);
    ok.type = 'button'; ok.textContent = 'حفظ';
    var del = el('button', 'font:700 13px ' + FONT + ';border:0;border-radius:9px;padding:6px 12px;' +
      'background:#f4ece0;color:#b3261e;cursor:pointer;', row);
    del.type = 'button'; del.textContent = 'امسح';
    var hint = el('span', 'margin-inline-start:auto;font-size:11px;opacity:.55;', row);
    hint.textContent = 'Enter حفظ · Esc خروج';

    ok.onclick = commit;
    del.onclick = function () {
      if (editing) { notes = notes.filter(function (n) { return n !== editing; }); save(); }
      closeBox(); render();
    };
    ta.onkeydown = function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); closeBox(); }
    };
    // The box is our own UI: a click inside it must never become a new note.
    box.addEventListener('pointerdown', function (e) { e.stopPropagation(); }, true);
    bar.addEventListener('pointerdown', function (e) { e.stopPropagation(); }, true);
  }

  function openBox(note, clientX, clientY) {
    editing = note;
    boxWhat.textContent = '#' + note.n + ' · ' + note.section + ' · ' + note.what;
    boxWhat.title = note.text;
    ta.value = note.note || '';
    box.style.display = 'block';
    // Keep it on screen whichever corner was tapped.
    var w = Math.min(340, innerWidth * 0.92), h = 190;
    var x = Math.max(8, Math.min(clientX - w / 2, innerWidth - w - 8));
    var y = clientY + 14 + h > innerHeight ? Math.max(8, clientY - h - 14) : clientY + 14;
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    // Three times, on purpose. The click that opened this box had its default
    // prevented - that is what stops the page's own buttons firing - and a
    // prevented mousedown also cancels the browser's normal "focus what you
    // tapped". So the focus has to be asked for, and asked for again after the
    // rest of the click has finished arriving, or the first thing typed is lost.
    ta.focus();
    requestAnimationFrame(function () { ta.focus(); });
    setTimeout(function () { ta.focus(); ta.select(); }, 40);
  }

  function closeBox() { box.style.display = 'none'; editing = null; }

  function commit() {
    if (!editing) return;
    var v = ta.value.trim();
    if (!v) { notes = notes.filter(function (n) { return n !== editing; }); }
    else {
      editing.note = v;
      if (notes.indexOf(editing) < 0) notes.push(editing);
    }
    save(); closeBox(); render();
  }

  /* ------------------------------------------------------------------ pins ---- */
  function render() {
    layer.textContent = '';
    notes.forEach(function (n, i) {
      n.n = i + 1;
      var pin = el('div',
        'position:absolute;left:' + n.x + 'px;top:' + n.y + 'px;transform:translate(-50%,-50%);' +
        'width:24px;height:24px;border-radius:50%;background:#ec2c24;color:#fff;' +
        'font:800 12px/24px ' + FONT + ';text-align:center;cursor:pointer;pointer-events:auto;' +
        'box-shadow:0 0 0 2.5px #fff, 0 2px 7px rgba(0,0,0,.45);', layer);
      pin.textContent = n.n;
      pin.title = (n.note || '').slice(0, 120);
      pin.addEventListener('pointerdown', function (e) {
        e.stopPropagation(); e.preventDefault();
        openBox(n, e.clientX, e.clientY);
      }, true);
    });
    paintCounts();
  }

  /* ------------------------------------------------------------- the click ---- */
  // Capture phase, so the note is taken before the page's own buttons react.
  document.addEventListener('pointerdown', function (e) {
    if (!on || e.button) return;
    if (box.contains(e.target) || bar.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();

    // What is actually under the finger - not the layer we put on top of it.
    var hit = document.elementFromPoint(e.clientX, e.clientY) || document.body;
    if (hit.id === 'rk-notes-layer') hit = document.body;
    hit = meaningful(hit);
    var sec = sectionOf(hit);

    var note = {
      n: notes.length + 1,
      x: Math.round(e.pageX), y: Math.round(e.pageY),
      scrollY: Math.round(window.scrollY),
      section: sec.name,
      what: describe(hit),
      text: textOf(hit),
      line: lineOf(hit),
      note: ''
    };
    openBox(note, e.clientX, e.clientY);
  }, true);

  // Clicks and taps that follow a swallowed pointerdown must die too, or the page
  // still gets them and a note on "اطلب" would also scroll to the order form.
  ['click', 'mousedown', 'mouseup', 'touchstart'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (!on) return;
      if (box.contains(e.target) || bar.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation();
    }, true);
  });

  /* ------------------------------------------------------------------ copy ---- */
  function report() {
    var w = innerWidth, h = innerHeight;
    var kind = w < 700 ? 'تيليفون' : 'كمبيوتر';
    var offer = document.documentElement.getAttribute('data-offer') || '?';
    var L = [];
    L.push('=== ملاحظات على صفحة ركّبني ===');
    L.push('العرض: ' + offer + '   الشاشة: ' + w + '×' + h + ' (' + kind + ')   ' +
           new Date().toLocaleString('fr-DZ'));
    L.push(location.pathname + location.search);
    L.push('');

    // Spelling and wording fixed in place, as قبل / بعد pairs that can be applied
    // to the file word for word. Put first because they are mechanical: they need
    // no thought, only care.
    var tk = Object.keys(textEdits);
    if (tk.length) {
      L.push('=== تبديلات النص (' + tk.length + ') ===');
      tk.forEach(function (k, i) {
        var e = textEdits[k];
        L.push((i + 1) + '. [' + e.sec + ']  ' + e.what);
        L.push('   قبل: ' + e.before);
        L.push('   بعد: ' + e.after);
        L.push('');
      });
      if (notes.length) L.push('=== ملاحظات (' + notes.length + ') ===');
    }

    notes.forEach(function (n) {
      L.push(n.n + '. [' + n.section + ']  ' + n.what);
      L.push('   على الشاشة: ' + n.text);
      // Only when it adds something: a word tapped inside a sentence needs the
      // sentence, a whole paragraph tapped on its own does not need repeating.
      if (n.line && n.line !== n.text) L.push('   السطر كامل: ' + n.line);
      L.push('   الموضع: x=' + n.x + ' y=' + n.y + ' (scroll ' + n.scrollY + ')');
      L.push('   >>> ' + n.note.replace(/\n/g, '\n       '));
      L.push('');
    });
    L.push('(' + notes.length + ' ملاحظة · ' + tk.length + ' تبديل نص)');
    return L.join('\n');
  }

  function doCopy(btn) {
    if (!notes.length && !Object.keys(textEdits).length) {
      flash(btn, 'ما كان والو', '#2b2520'); return;
    }
    var text = report();
    var done = function () { flash(btn, '✓ تنسخ', '#5cb335'); };
    var fail = function () {
      // Clipboard refused (it does, in some browsers, off a trusted click).
      // Show the text so it can still be selected and copied by hand.
      showFallback(text);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fail);
    } else fail();
  }

  function flash(btn, label, bg) {
    var old = btn.textContent, oldBg = btn.style.background;
    btn.textContent = label; btn.style.background = bg;
    setTimeout(function () { btn.textContent = old; btn.style.background = oldBg; }, 1400);
  }

  function showFallback(text) {
    var wrap = el('div', 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.6);' +
      'display:grid;place-items:center;padding:16px;');
    var pane = el('div', 'background:#fffdf7;border:2.5px solid #161310;border-radius:14px;' +
      'padding:12px;width:min(96vw,640px);', wrap);
    var t = el('textarea', 'width:100%;height:50vh;font:500 12px/1.5 ui-monospace,monospace;' +
      'padding:8px;border:2px solid #e7dcc6;border-radius:9px;direction:ltr;text-align:left;', pane);
    t.value = text;
    var c = el('button', 'margin-top:8px;font:700 13px ' + FONT + ';border:0;border-radius:9px;' +
      'padding:7px 16px;background:#161310;color:#fff;cursor:pointer;', pane);
    c.type = 'button'; c.textContent = 'سكّر';
    c.onclick = function () { wrap.remove(); };
    t.focus(); t.select();
  }

  /* ------------------------------------------------------------------ boot ---- */
  function boot() {
    load();
    loadEdits();
    buildUI();
    // His typing goes back on the page before he sees it, so a reload never
    // looks as though the corrections were thrown away.
    var back = restoreEdits();
    render();
    if (back) console.log('[review] ' + back + ' text fix(es) put back.');
    // A console hook, the same idea as window.__rk on the scrolling build: it makes
    // the copied text checkable without having to read the clipboard, and it lets
    // the notes be recovered by hand if the copy button ever fails.
    window.__rkNotes = { report: report, list: function () { return notes; } };
    if (notes.length) {
      console.log('[review] ' + notes.length + ' note(s) restored. Press the green نسخ button to copy them.');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
