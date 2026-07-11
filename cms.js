/* ============================================================
   Curio mini-CMS loader  (cms.js)
   ------------------------------------------------------------
   WHAT THIS DOES (plain English):
   When a page loads, this script asks the Curio database for the
   latest text and images for that page, and swaps them in. That
   means text/photos can be changed from the admin panel WITHOUT
   re-deploying the site. If the database is unreachable, the page
   simply keeps the text it was built with — so it never breaks.

   HOW KEYS WORK:
   Every editable element gets a stable key like "roubla.ptitle.0"
   built from: page name + a slug of its CSS selector + which
   occurrence it is. The admin panel and this loader compute the
   SAME keys the same way, so edits line up with the right spot.
   ============================================================ */
(function () {
  "use strict";

  // ── Where the database/API lives ───────────────────────────
  // Local dev → the store dev server. Live → the Netlify store.
  var API =
    window.CURIO_API ||
    (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)
      ? "http://localhost:5522"
      : "https://stirring-marigold-3dd8e9.netlify.app");

  // ── Which editable spots exist on each page ─────────────────
  // `text` = editable words (applied as innerHTML so bold/breaks survive).
  // `img`  = editable images (applied to the src).
  // `group` is just the friendly section name shown in the admin.
  var CONFIG = {
    roubla: {
      text: [
        { sel: ".proof", group: "Hero" },
        { sel: ".ptitle", group: "Hero" },
        { sel: ".hero-desc", group: "Hero" },
        { sel: "#order span", group: "Hero" },
        { sel: ".trust span", group: "Hero" },
        { sel: ".specrow .n", group: "Hero specs" },
        { sel: ".specrow .l", group: "Hero specs" },
        { sel: ".ribbon", group: "Gallery" },
        { sel: ".gph span:not(.ic)", group: "Gallery placeholders" },
        { sel: ".gph small", group: "Gallery placeholders" },
        { sel: ".testi .eyebrow", group: "Testimonials" },
        { sel: ".tq", group: "Testimonials" },
        { sel: ".tsrc", group: "Testimonials" },
        { sel: "h2", group: "Section headings" },
        { sel: ".moment h3", group: "Moments" },
        { sel: ".moment p", group: "Moments" },
        { sel: ".hcard h3", group: "How to play" },
        { sel: ".hcard p", group: "How to play" },
        { sel: ".hc-img span:not(.cam):not(.big)", group: "How to play" },
        { sel: ".eyebrow", group: "Eyebrows" },
        { sel: ".inbox h3", group: "What's inside" },
        { sel: ".inlist li", group: "What's inside" },
        { sel: ".csub", group: "Checkout" },
        { sel: ".fl", group: "Checkout labels" },
        { sel: ".seg button", group: "Checkout" },
        { sel: ".ctrust", group: "Checkout" },
        { sel: ".up-badge", group: "Upsell" },
        { sel: ".up-big", group: "Upsell" },
        { sel: ".up-sub", group: "Upsell" },
        { sel: ".up-price", group: "Upsell" },
        { sel: ".choice .big", group: "Upsell" },
        { sel: ".choice .sub", group: "Upsell" },
        { sel: "#confirmText", group: "Checkout" },
        { sel: ".cdone .big", group: "Success" },
        { sel: ".cdone p", group: "Success" },
        { sel: ".bundle-note", group: "Success" },
        { sel: "footer", group: "Footer" },
        { sel: ".mbar .order span:last-of-type", group: "Mobile bar" },
        { sel: ".nav a", group: "Nav" },
        { sel: ".cart", group: "Nav" },
        { sel: ".marq .mq", group: "Trust marquee" }
      ],
      img: [
        { sel: ".logo", group: "Header" },
        { sel: ".gslide img", group: "Gallery" },
        { sel: ".up-visual img", group: "Upsell" }
      ]
    },

    dlala: {
      text: [
        { sel: ".proof", group: "Hero" },
        { sel: ".ptitle", group: "Hero" },
        { sel: ".hero-desc", group: "Hero" },
        { sel: "#order span", group: "Hero" },
        { sel: ".trust span", group: "Hero" },
        { sel: ".specrow .n", group: "Hero specs" },
        { sel: ".specrow .l", group: "Hero specs" },
        { sel: ".ribbon", group: "Gallery" },
        { sel: ".gph span:not(.ic)", group: "Gallery placeholders" },
        { sel: ".gph small", group: "Gallery placeholders" },
        { sel: ".testi .eyebrow", group: "Testimonials" },
        { sel: ".tq", group: "Testimonials" },
        { sel: ".tsrc", group: "Testimonials" },
        { sel: "h2", group: "Section headings" },
        { sel: ".moment h3", group: "Moments" },
        { sel: ".moment p", group: "Moments" },
        { sel: ".hcard h3", group: "How to play" },
        { sel: ".hcard p", group: "How to play" },
        { sel: ".hc-img span:not(.cam):not(.big)", group: "How to play" },
        { sel: ".eyebrow", group: "Eyebrows" },
        { sel: ".inbox h3", group: "What's inside" },
        { sel: ".inlist li", group: "What's inside" },
        { sel: ".wi-hint", group: "What's inside" },
        { sel: ".wi-band", group: "What's inside" },
        { sel: ".csub", group: "Checkout" },
        { sel: ".fl", group: "Checkout labels" },
        { sel: ".seg button", group: "Checkout" },
        { sel: ".ctrust", group: "Checkout" },
        { sel: ".up-badge", group: "Upsell" },
        { sel: ".up-big", group: "Upsell" },
        { sel: ".up-sub", group: "Upsell" },
        { sel: ".up-price", group: "Upsell" },
        { sel: ".choice .big", group: "Upsell" },
        { sel: ".choice .sub", group: "Upsell" },
        { sel: "#confirmText", group: "Checkout" },
        { sel: ".cdone .big", group: "Success" },
        { sel: ".cdone p", group: "Success" },
        { sel: ".bundle-note", group: "Success" },
        { sel: "footer", group: "Footer" },
        { sel: ".mbar .order span:last-of-type", group: "Mobile bar" },
        { sel: ".nav a", group: "Nav" },
        { sel: ".cart", group: "Nav" },
        { sel: "#sc-hl", group: "Stock counter" },
        { sel: "#sc-block .sub", group: "Stock counter" },
        { sel: "#sc-comment", group: "Stock counter" },
        { sel: "#sc-hint", group: "Stock counter" },
        { sel: ".sc-lbl", group: "Stock counter" },
        { sel: ".sc-mini", group: "Stock counter" },
        { sel: ".marq .mq", group: "Trust marquee" }
      ],
      img: [
        { sel: ".logo", group: "Header" },
        { sel: ".gslide img", group: "Gallery" },
        { sel: ".up-visual img", group: "Upsell" }
      ]
    },

    home: {
      text: [
        { sel: ".nav a", group: "Nav" },
        { sel: ".cart", group: "Nav" },
        { sel: ".hero-eyebrow", group: "Hero" },
        { sel: ".hero-h1", group: "Hero" },
        { sel: ".hero-lead", group: "Hero" },
        { sel: ".order span:first-child", group: "Buttons" },
        { sel: ".proof", group: "Hero" },
        { sel: ".trust span", group: "Hero" },
        { sel: ".games .head .eyebrow", group: "Games" },
        { sel: ".games .head .sub", group: "Games" },
        { sel: ".h2", group: "Section headings" },
        { sel: ".gc-ribbon", group: "Game cards" },
        { sel: ".gc-body h3", group: "Game cards" },
        { sel: ".gc-hook", group: "Game cards" },
        { sel: ".gc-specs span", group: "Game cards" },
        { sel: ".gc-cta", group: "Game cards" },
        { sel: ".b-pitch .tag", group: "Bundle" },
        { sel: ".b-title", group: "Bundle" },
        { sel: ".b-benefit", group: "Bundle" },
        { sel: ".save", group: "Bundle" },
        { sel: ".why .eyebrow", group: "Why Curio" },
        { sel: ".why-h", group: "Why Curio" },
        { sel: ".why-lead", group: "Why Curio" },
        { sel: ".pillar h4", group: "Why Curio" },
        { sel: ".pillar p", group: "Why Curio" },
        { sel: ".why-hero-line", group: "Why Curio" },
        { sel: ".why-sig", group: "Why Curio" },
        { sel: ".ftag", group: "Footer" },
        { sel: ".fcol h5", group: "Footer" },
        { sel: ".fcol a", group: "Footer" },
        { sel: ".fhandle", group: "Footer" },
        { sel: ".ftrustcol span", group: "Footer" },
        { sel: ".fbottom span", group: "Footer" },
        { sel: ".mtag", group: "Pack popup" },
        { sel: ".mhead h3", group: "Pack popup" },
        { sel: ".msave", group: "Pack popup" },
        { sel: ".mlabel", group: "Pack popup" },
        { sel: ".mseg button", group: "Pack popup" },
        { sel: ".mtotlbl", group: "Pack popup" },
        { sel: ".mtothint", group: "Pack popup" },
        { sel: ".msubmit span:last-child", group: "Pack popup" },
        { sel: ".mtrust", group: "Pack popup" },
        { sel: ".mdone .big", group: "Pack popup" },
        { sel: ".mdone p", group: "Pack popup" },
        { sel: ".marq .mq", group: "Trust marquee" }
      ],
      img: [
        { sel: ".logo", group: "Header" },
        { sel: ".hero-logo", group: "Hero" },
        { sel: ".gc-img img", group: "Game cards" },
        { sel: ".b-cov img", group: "Bundle" },
        { sel: ".flogo", group: "Footer" }
      ]
    }
  };

  // ── Helpers ─────────────────────────────────────────────────
  function slug(sel) {
    return sel
      .replace(/:not\([^)]*\)/g, "")   // drop :not(...) noise
      .replace(/[#.]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  function currentPage() {
    return (document.body && document.body.dataset.cmsPage) || null;
  }

  // Walk the config in order and produce a list of
  // { key, el, type, group } for every editable element found.
  // A "seen" set stops the same element being claimed twice when
  // selectors overlap (e.g. ".testi .eyebrow" and ".eyebrow").
  function collectElements(page) {
    var cfg = CONFIG[page];
    if (!cfg) return [];
    var out = [];
    var seen = new Set();

    (cfg.text || []).forEach(function (entry) {
      var s = slug(entry.sel);
      var occ = 0;
      document.querySelectorAll(entry.sel).forEach(function (el) {
        if (seen.has(el)) return;
        if (!el.textContent.replace(/\s+/g, "").length) return; // skip empties
        seen.add(el);
        out.push({ key: page + "." + s + "." + occ, el: el, type: "text", group: entry.group });
        occ++;
      });
    });

    (cfg.img || []).forEach(function (entry) {
      var s = slug(entry.sel);
      var occ = 0;
      document.querySelectorAll(entry.sel).forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);
        out.push({ key: page + ".img-" + s + "." + occ, el: el, type: "image", group: entry.group });
        occ++;
      });
    });

    return out;
  }

  // Turn a stored image value into a usable URL.
  // Uploaded images come back as "/api/media/xxx" (relative to the
  // store); prefix them with the API origin so they load from anywhere.
  function resolveImg(val) {
    if (!val) return val;
    if (val.indexOf("/api/") === 0) return API + val;
    // Only allow http(s) / root-relative image URLs (block javascript:, data:, etc.)
    if (/^\s*(javascript|vbscript|data):/i.test(val)) return "";
    return val;
  }

  // Sanitize stored HTML before injecting via innerHTML (defense-in-depth:
  // content writes require the admin key, but this stops a compromised/edited
  // value from running script on the live page). Parses inertly in a
  // <template> (no resource loads / no handler execution), strips dangerous
  // elements + event-handler and javascript:/data: attributes, keeps safe
  // formatting like <b>/<br>/<span>.
  function sanitizeHTML(html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = String(html);
    var root = tpl.content;
    var DANGER = "script,iframe,object,embed,link,meta,style,svg,math,base,form,input,button,textarea,noscript";
    root.querySelectorAll(DANGER).forEach(function (n) { n.remove(); });
    root.querySelectorAll("*").forEach(function (el) {
      for (var i = el.attributes.length - 1; i >= 0; i--) {
        var a = el.attributes[i], name = a.name.toLowerCase(), val = a.value || "";
        if (name.indexOf("on") === 0) { el.removeAttribute(a.name); continue; }
        if ((name === "href" || name === "src" || name === "xlink:href" || name === "formaction" || name === "srcset") &&
            /^\s*(javascript|vbscript|data):/i.test(val)) {
          el.removeAttribute(a.name);
        }
      }
    });
    var out = document.createElement("div");
    out.appendChild(root.cloneNode(true));
    return out.innerHTML;
  }

  // ── Apply saved content over the built-in defaults ──────────
  function apply(map) {
    var page = currentPage();
    if (!page) return;
    collectElements(page).forEach(function (item) {
      if (!(item.key in map)) return;      // nothing saved → keep default
      var val = map[item.key];
      if (val == null) return;
      if (item.type === "image") {
        item.el.setAttribute("src", resolveImg(val));
      } else {
        item.el.innerHTML = sanitizeHTML(val);
      }
    });
  }

  // Tell anyone listening (the visual editor) that the saved
  // content has been applied — editing before this point would
  // overwrite newer database values with the built-in defaults.
  function markLoaded() {
    window.CurioCMS.loaded = true;
    try {
      document.dispatchEvent(new CustomEvent("curio:cms-loaded"));
    } catch (e) { /* very old browser — editor has its own fallback */ }
  }

  function load() {
    var page = currentPage();
    if (!page) return;
    fetch(API + "/api/content?page=" + encodeURIComponent(page), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(apply)
      .catch(function () { /* offline / down → keep built-in text */ })
      .then(markLoaded, markLoaded);
  }

  // ── Public hook for the seeding tool (admin setup) ──────────
  // Returns the manifest of every editable spot with its CURRENT
  // value + a friendly label, so we can seed the database once.
  window.CurioCMS = {
    api: API,
    loaded: false,
    // Live references to every editable element on this page.
    // The visual editor (cms-edit.js) uses this, so the editor and
    // the loader always agree on which element owns which key.
    items: function () {
      return collectElements(currentPage());
    },
    collect: function () {
      var page = currentPage();
      return collectElements(page).map(function (item) {
        var value = item.type === "image"
          ? (item.el.getAttribute("src") || "")
          : item.el.innerHTML.trim();
        var text = item.el.textContent.replace(/\s+/g, " ").trim();
        var label = (item.group ? item.group + " — " : "") +
          (text.length > 42 ? text.slice(0, 42) + "…" : text || item.type);
        return {
          key: item.key,
          value: value,
          type: item.type,
          group: item.group || "",
          label: label,
          page: page
        };
      });
    },
    reload: load
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }

  // ── Edit mode for the founders ──────────────────────────────
  // Add "#cms" to the end of the page address (e.g. /roubla#cms)
  // and the visual editor loads on top of the real page. Normal
  // visitors never have #cms, so they never download the editor.
  // (Not "#edit" — that word wakes the old dormant review script.)
  function maybeLoadEditor() {
    if (location.hash !== "#cms") return;
    if (document.getElementById("curio-cms-editor")) return;
    var tag = document.querySelector('script[src*="cms.js"]');
    var base = tag ? tag.getAttribute("src").replace(/cms\.js.*$/, "") : "";
    var s = document.createElement("script");
    s.id = "curio-cms-editor";
    s.src = base + "cms-edit.js";
    document.head.appendChild(s);
  }
  window.addEventListener("hashchange", maybeLoadEditor);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", maybeLoadEditor);
  } else {
    maybeLoadEditor();
  }
})();
