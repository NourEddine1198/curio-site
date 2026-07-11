/* ============================================================
   Curio visual editor  (cms-edit.js)
   ------------------------------------------------------------
   WHAT THIS DOES (plain English):
   This is "edit mode" for the founders. Open a page with #cms at
   the end of the address (example: curiodz.com/roubla#cms), type
   the admin password once, and every editable text and photo
   lights up on the REAL page. Click a text → retype it in place.
   Click a photo → pick a new one from your computer. Hit "احفظ"
   and everything is written to the database — live immediately,
   no re-deploy. Normal visitors never load this file: cms.js only
   fetches it when the address ends with #cms.

   Safety in edit mode:
   - The admin password is required before anything unlocks.
   - Buttons and links on the page are "frozen" so clicking a text
     that lives inside the order button can never place an order.
   - Leaving with unsaved changes shows a warning first.
   ============================================================ */
(function () {
  "use strict";
  if (window.__CURIO_EDITOR__) return; // never run twice
  window.__CURIO_EDITOR__ = true;

  var KEY_STORE = "curio-admin-key"; // same place the admin panel keeps the password

  var state = {
    api: "",
    key: "",
    items: [],       // every editable spot: { key, el, type, group }
    byKey: {},       // key → item (quick lookup)
    originals: {},   // what each spot held before any edits
    pendingImg: {},  // key → uploaded image value not yet saved
    started: false,
    revealed: false,
    saving: false
  };

  var ui = {}; // toolbar / toast / login / badge elements

  // ── Boot: wait for cms.js to finish applying saved content ──
  // Editing before that would let us overwrite fresh database
  // values with the stale text built into the HTML.
  function boot() {
    if (window.CurioCMS && window.CurioCMS.loaded) { init(); return; }
    document.addEventListener("curio:cms-loaded", init, { once: true });
    setTimeout(init, 5000); // safety net if the API never answers
  }

  function init() {
    if (state.started) return;
    if (!window.CurioCMS || typeof window.CurioCMS.items !== "function") return;
    state.started = true;
    state.api = window.CurioCMS.api;
    injectStyles();
    var saved = "";
    try { saved = window.sessionStorage.getItem(KEY_STORE) || ""; } catch (e) {}
    if (saved) {
      checkKey(saved, function (ok) {
        if (ok) enable(saved); else showLogin();
      });
    } else {
      showLogin();
    }
  }

  // ── Password check against the store API ────────────────────
  function checkKey(key, cb) {
    fetch(state.api + "/api/content?admin=1&page=__ping", {
      headers: { "x-admin-key": key },
      cache: "no-store"
    })
      .then(function (r) { cb(r.ok); })
      .catch(function () { cb(false); });
  }

  // ── Login card ───────────────────────────────────────────────
  function showLogin() {
    var wrap = document.createElement("div");
    wrap.id = "cms-login";
    wrap.innerHTML =
      '<div class="card">' +
      '<div class="h">وضع التعديل — Curio</div>' +
      '<div class="s">دخّل كلمة السر تاع الأدمين باش تبدا تعدّل</div>' +
      '<input type="password" id="cms-pass" autocomplete="current-password" placeholder="كلمة السر">' +
      '<div class="err" id="cms-loginerr"></div>' +
      '<button type="button" id="cms-loginbtn">ادخل</button>' +
      '<button type="button" class="ghost" id="cms-loginexit">رجوع للصفحة العادية</button>' +
      "</div>";
    document.body.appendChild(wrap);
    ui.login = wrap;

    var input = wrap.querySelector("#cms-pass");
    var err = wrap.querySelector("#cms-loginerr");
    function attempt() {
      var k = input.value.trim();
      if (!k) return;
      err.textContent = "نتأكدو…";
      checkKey(k, function (ok) {
        if (!ok) { err.textContent = "كلمة السر ماشي صحيحة — عاود جرّب"; return; }
        try { window.sessionStorage.setItem(KEY_STORE, k); } catch (e) {}
        wrap.remove();
        ui.login = null;
        enable(k);
      });
    }
    wrap.querySelector("#cms-loginbtn").addEventListener("click", attempt);
    input.addEventListener("keydown", function (ev) { if (ev.key === "Enter") attempt(); });
    wrap.querySelector("#cms-loginexit").addEventListener("click", leavePage);
    input.focus();
  }

  // ── Switch the page into edit mode ──────────────────────────
  function enable(key) {
    state.key = key;
    state.items = window.CurioCMS.items();
    document.body.classList.add("cms-on");

    state.items.forEach(function (item) {
      state.byKey[item.key] = item;
      item.el.dataset.cmsKey = item.key;
      item.el.classList.add("cms-ed");
      if (item.type === "image") {
        item.el.classList.add("cms-img");
        state.originals[item.key] = item.el.getAttribute("src") || "";
      } else {
        state.originals[item.key] = item.el.innerHTML;
        item.el.setAttribute("contenteditable", "true");
        item.el.setAttribute("spellcheck", "false");
        item.el.addEventListener("input", updateCount);
        // Pasted text comes in as plain words only — no hidden
        // formatting smuggled in from Word/webpages.
        item.el.addEventListener("paste", function (ev) {
          ev.preventDefault();
          var t = (ev.clipboardData || window.clipboardData).getData("text/plain");
          document.execCommand("insertText", false, t);
        });
      }
    });

    buildToolbar();
    buildImageBadge();
    buildFilePicker();
    guardClicks();
    calmAnimations();
    window.addEventListener("beforeunload", warnUnsaved);
    updateCount();
    toast("وضع التعديل خدّام — اضغط على أي كتابة ولا صورة");
  }

  // ── What changed and is not saved yet? ───────────────────────
  function dirtyEntries() {
    var out = [];
    state.items.forEach(function (item) {
      if (item.type === "image") {
        if (state.pendingImg[item.key] != null) {
          out.push({ item: item, value: state.pendingImg[item.key] });
        }
      } else if (item.el.innerHTML !== state.originals[item.key]) {
        out.push({ item: item, value: item.el.innerHTML.trim() });
      }
    });
    return out;
  }

  function updateCount() {
    var entries = dirtyEntries();
    // Green outline on every changed spot, normal on untouched ones
    state.items.forEach(function (item) {
      var dirty = item.type === "image"
        ? state.pendingImg[item.key] != null
        : item.el.innerHTML !== state.originals[item.key];
      item.el.classList.toggle("cms-dirty", dirty);
    });
    if (!ui.count) return;
    var n = entries.length;
    ui.count.textContent = n ? "عندك " + n + " تغييرات ما تسجلوش" : "كلش محفوظ";
    ui.save.disabled = n === 0 || state.saving;
    ui.save.textContent = state.saving ? "راهي تتسجل…" : (n ? "احفظ (" + n + ")" : "احفظ");
  }

  // ── Toolbar (the fixed bar at the bottom) ────────────────────
  function buildToolbar() {
    var bar = document.createElement("div");
    bar.id = "cms-toolbar";
    bar.innerHTML =
      '<span class="ttl">وضع التعديل</span>' +
      '<span class="cnt" id="cms-count"></span>' +
      '<button type="button" id="cms-save">احفظ</button>' +
      '<button type="button" id="cms-reveal">ورّي المخفي</button>' +
      '<button type="button" id="cms-undo">رجّع كلش</button>' +
      '<button type="button" id="cms-exit">خروج</button>';
    document.body.appendChild(bar);
    ui.bar = bar;
    ui.count = bar.querySelector("#cms-count");
    ui.save = bar.querySelector("#cms-save");
    ui.reveal = bar.querySelector("#cms-reveal");
    bar.querySelector("#cms-save").addEventListener("click", save);
    bar.querySelector("#cms-reveal").addEventListener("click", toggleReveal);
    bar.querySelector("#cms-undo").addEventListener("click", undoAll);
    bar.querySelector("#cms-exit").addEventListener("click", exitEditMode);
  }

  // ── "بدّل الصورة" badge that follows the mouse onto photos ──
  function buildImageBadge() {
    var b = document.createElement("div");
    b.id = "cms-imgbadge";
    b.textContent = "بدّل الصورة";
    document.body.appendChild(b);
    ui.badge = b;
    document.addEventListener("mouseover", function (ev) {
      var img = ev.target.closest && ev.target.closest(".cms-img");
      if (img) {
        var r = img.getBoundingClientRect();
        b.style.display = "block";
        b.style.top = (r.top + window.scrollY + 8) + "px";
        b.style.left = (r.left + window.scrollX + 8) + "px";
      } else {
        b.style.display = "none";
      }
    });
  }

  function buildFilePicker() {
    var fi = document.createElement("input");
    fi.type = "file";
    fi.accept = "image/jpeg,image/png,image/webp,image/gif,image/avif";
    fi.id = "cms-file";
    fi.style.display = "none";
    document.body.appendChild(fi);
    ui.file = fi;
    fi.addEventListener("change", function () {
      var f = fi.files && fi.files[0];
      var key = fi.dataset.forKey;
      fi.value = "";
      if (f && key && state.byKey[key]) uploadImage(state.byKey[key], f);
    });
  }

  function openPicker(el) {
    ui.file.dataset.forKey = el.dataset.cmsKey;
    ui.file.click();
  }

  // ── Upload a new photo, show it immediately (still unsaved) ──
  function uploadImage(item, file) {
    if (file.size > 8 * 1024 * 1024) {
      toast("الصورة كبيرة بزاف — لازم أقل من 8MB");
      return;
    }
    toast("الصورة راهي تطلع… اصبر شوية");
    item.el.style.opacity = "0.45";
    var fd = new FormData();
    fd.append("file", file);
    fetch(state.api + "/api/upload", {
      method: "POST",
      headers: { "x-admin-key": state.key },
      body: fd
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        item.el.style.opacity = "";
        if (!res.ok || !res.j || !res.j.url) {
          toast((res.j && res.j.error) || "ما طلعتش الصورة — عاود جرّب");
          return;
        }
        state.pendingImg[item.key] = res.j.url; // saved to DB as "/api/media/…"
        item.el.setAttribute("src", state.api + res.j.url);
        updateCount();
        toast("الصورة تبدلت هنا — اضغط «احفظ» باش تولي لايف");
      })
      .catch(function () {
        item.el.style.opacity = "";
        toast("ما طلعتش الصورة — تأكد من الانترنت وعاود");
      });
  }

  // ── Save every pending change to the database ────────────────
  function save() {
    var entries = dirtyEntries();
    if (!entries.length || state.saving) return;
    state.saving = true;
    updateCount();

    var updates = entries.map(function (e) {
      var u = { key: e.item.key, value: e.value, type: e.item.type };
      if (e.item.type !== "image") {
        // Refresh the friendly label so the backup admin list stays readable
        var text = e.item.el.textContent.replace(/\s+/g, " ").trim();
        u.label = (e.item.group ? e.item.group + " — " : "") +
          (text.length > 42 ? text.slice(0, 42) + "…" : text || "text");
      }
      return u;
    });

    fetch(state.api + "/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": state.key },
      body: JSON.stringify({ updates: updates })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        state.saving = false;
        if (!res.ok || !res.j) {
          toast("ما تسجلش — عاود اضغط «احفظ»");
          updateCount();
          return;
        }
        var failed = (res.j.errors || []).map(function (e) { return e.key; });
        entries.forEach(function (e) {
          if (failed.indexOf(e.item.key) >= 0) return; // stays pending
          if (e.item.type === "image") {
            state.originals[e.item.key] = e.item.el.getAttribute("src") || "";
            delete state.pendingImg[e.item.key];
          } else {
            state.originals[e.item.key] = e.item.el.innerHTML;
          }
        });
        updateCount();
        toast(failed.length
          ? failed.length + " تغييرات ما تسجلوش — عاود اضغط «احفظ»"
          : "تسجّل كلشي — التغييرات راهم لايف ✓");
      })
      .catch(function () {
        state.saving = false;
        updateCount();
        toast("ما تسجلش — تأكد من الانترنت وعاود");
      });
  }

  // ── Put everything back the way it was (unsaved edits only) ──
  function undoAll() {
    state.items.forEach(function (item) {
      if (item.type === "image") {
        if (state.pendingImg[item.key] != null) {
          item.el.setAttribute("src", state.originals[item.key]);
          delete state.pendingImg[item.key];
        }
      } else if (item.el.innerHTML !== state.originals[item.key]) {
        item.el.innerHTML = state.originals[item.key];
      }
    });
    updateCount();
    toast("رجّعنا كلش كيما كان");
  }

  // ── Show the parts a visitor only sees after interacting ─────
  // Works on every page: success box, upsell buttons, testimonial
  // slides (roubla/dlala) and the pack pop-up (home). Each bit is
  // only touched if it exists on the current page.
  function toggleReveal() {
    state.revealed = !state.revealed;
    var on = state.revealed;
    document.body.classList.toggle("cms-reveal", on);
    var cd = document.getElementById("cdone");
    if (cd) cd.style.display = on ? "block" : "";
    var bn = document.getElementById("bundleNote");
    if (bn) bn.style.display = on ? "inline-block" : "";
    var ts = document.querySelector(".tslide");
    if (ts && ts.parentElement) ts.parentElement.style.height = on ? "auto" : "";
    var pm = document.getElementById("packModal");
    if (pm) {
      pm.classList.toggle("open", on);
      pm.setAttribute("aria-hidden", on ? "false" : "true");
    }
    var pd = document.getElementById("packDone");
    if (pd) pd.style.display = on ? "block" : "";
    ui.reveal.textContent = on ? "خبّي المخفي" : "ورّي المخفي";
    if (on) toast("ورّينا الأقسام المخفية — شاشة النجاح والعروض");
  }

  // ── Freeze the page's own buttons/links while editing ────────
  // Runs BEFORE the page's own click handlers, so clicking a text
  // inside the order button can never fire a real order.
  function guardClicks() {
    document.addEventListener("click", function (ev) {
      if (ev.target.closest && ev.target.closest("#cms-toolbar,#cms-login,#cms-toast")) return;
      var ed = ev.target.closest && ev.target.closest(".cms-ed");
      if (ed) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ed.classList.contains("cms-img")) openPicker(ed);
        else if (document.activeElement !== ed) ed.focus();
        return;
      }
      var a = ev.target.closest && ev.target.closest("a");
      if (a) {
        ev.preventDefault();
        ev.stopPropagation();
        toast("الروابط مسكّرين في وضع التعديل");
        return;
      }
      // Page buttons too (order, qty, close-popup…) — a click just
      // beside an editable text must never fire the real action.
      var btn = ev.target.closest && ev.target.closest("button");
      if (btn) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
    // Belt-and-braces: no form on the page can submit in edit mode
    document.addEventListener("submit", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }, true);
  }

  // Stop the hero gallery auto-sliding under the mouse while editing
  function calmAnimations() {
    var g = document.getElementById("gtrack");
    if (g) { try { g.dispatchEvent(new Event("pointerdown")); } catch (e) {} }
  }

  function warnUnsaved(ev) {
    if (!dirtyEntries().length) return;
    ev.preventDefault();
    ev.returnValue = "";
  }

  function exitEditMode() {
    if (dirtyEntries().length &&
        !window.confirm("عندك تغييرات ما تسجلوش. تخرج بلا ما تسجل؟")) return;
    leavePage();
  }

  function leavePage() {
    window.removeEventListener("beforeunload", warnUnsaved);
    // Strip #cms then reload → back to the exact real page
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch (e) { location.hash = ""; }
    location.reload();
  }

  // ── Little status message above the toolbar ──────────────────
  var toastTimer = null;
  function toast(msg) {
    var t = ui.toast;
    if (!t) {
      t = document.createElement("div");
      t.id = "cms-toast";
      document.body.appendChild(t);
      ui.toast = t;
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.style.display = "none"; }, 3200);
  }

  // ── Styles for outlines, toolbar, login, badge ───────────────
  function injectStyles() {
    var css =
      ".cms-ed{outline:2px dashed rgba(216,90,48,.8)!important;outline-offset:2px;border-radius:4px;transition:background .15s}" +
      ".cms-ed:hover{outline-style:solid!important;background:rgba(255,224,138,.35)!important;cursor:text}" +
      ".cms-ed:focus{outline:3px solid #d85a30!important;background:rgba(255,249,230,.95)!important}" +
      ".cms-ed.cms-img,.cms-ed.cms-img:hover{cursor:pointer!important}" +
      ".cms-ed.cms-dirty{outline:2.5px solid #1d9e75!important}" +
      "body.cms-on .mbar{bottom:84px!important}" +
      "body.cms-on .marq .run{animation-play-state:paused!important}" +
      "body.cms-reveal .choice{opacity:1!important;pointer-events:auto!important}" +
      "body.cms-reveal .tslide{position:static!important;opacity:1!important;transform:none!important;pointer-events:auto!important}" +
      "#cms-toolbar{position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:2147483000;background:#161310;color:#fff;border-radius:16px;padding:10px 14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;direction:rtl;font-family:'Noto Sans Arabic','Baloo Bhaijaan 2',system-ui,sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.4);max-width:94vw}" +
      "#cms-toolbar .ttl{font-weight:800;font-size:.85rem;background:#d85a30;padding:4px 12px;border-radius:999px;white-space:nowrap}" +
      "#cms-toolbar .cnt{font-size:.78rem;opacity:.9;white-space:nowrap}" +
      "#cms-toolbar button{border:0;border-radius:10px;padding:8px 13px;font-weight:800;cursor:pointer;font-family:inherit;font-size:.82rem;white-space:nowrap}" +
      "#cms-save{background:#1d9e75;color:#fff}" +
      "#cms-save:disabled{opacity:.45;cursor:default}" +
      "#cms-reveal{background:#ffe08a;color:#161310}" +
      "#cms-undo,#cms-exit{background:#3a352f;color:#fff}" +
      "#cms-imgbadge{position:absolute;display:none;z-index:2147482999;pointer-events:none;background:#161310;color:#fff;border-radius:999px;padding:5px 12px;font-weight:800;font-size:.78rem;direction:rtl;font-family:'Noto Sans Arabic',system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.35)}" +
      "#cms-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:86px;z-index:2147483001;background:#fff;color:#161310;border:2.5px solid #161310;border-radius:12px;padding:9px 16px;font-weight:800;font-size:.85rem;direction:rtl;font-family:'Noto Sans Arabic',system-ui,sans-serif;box-shadow:5px 5px 0 #161310;display:none;max-width:92vw;text-align:center}" +
      "#cms-login{position:fixed;inset:0;z-index:2147483002;background:rgba(22,19,16,.55);display:flex;align-items:center;justify-content:center;direction:rtl;font-family:'Noto Sans Arabic','Baloo Bhaijaan 2',system-ui,sans-serif}" +
      "#cms-login .card{background:#fff8ec;border:3px solid #161310;border-radius:18px;box-shadow:8px 8px 0 #161310;padding:26px 22px;width:min(360px,92vw);text-align:center}" +
      "#cms-login .h{font-weight:800;font-size:1.15rem}" +
      "#cms-login .s{font-size:.85rem;color:#5c5347;margin-top:6px}" +
      "#cms-login input{width:100%;margin-top:14px;padding:11px 12px;border:2.5px solid #161310;border-radius:12px;font-size:1rem;font-family:inherit;background:#fff;box-sizing:border-box;text-align:center}" +
      "#cms-login .err{min-height:20px;font-size:.8rem;color:#a32d2d;font-weight:800;margin-top:8px}" +
      "#cms-login button{width:100%;margin-top:6px;padding:11px;border:0;border-radius:12px;background:#1d9e75;color:#fff;font-weight:800;font-size:.95rem;cursor:pointer;font-family:inherit}" +
      "#cms-login button.ghost{background:transparent;color:#5c5347;font-size:.8rem;padding:8px}";
    var tag = document.createElement("style");
    tag.id = "cms-edit-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  boot();
})();
