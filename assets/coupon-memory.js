/* Curio — who sent this buyer? (the discount-code memory)
 *
 * A follower taps an influencer's story link, lands on /roubla/?code=SARA200,
 * likes the game, closes the phone — and orders two days later. Until this
 * file existed the code lived in sessionStorage only, so that second visit
 * arrived naked: no discount for the customer, no commission for her, and an
 * influencer staring at sales she is sure she caused but cannot prove.
 *
 * So: a code that ARRIVES IN A LINK starts a 7-day window. Inside it, her code
 * comes back by itself on any later visit, exactly as if the link had been
 * tapped again. That is the normal affiliate deal everywhere else, and it is
 * the number she will judge us by.
 *
 * A code the customer TYPES is remembered for the visit only — no window. They
 * already know the code; they can type it again. Keeping the long memory for
 * links alone keeps the promise narrow: we pay for a click we can see.
 *
 * Deliberately NOT deferred in the pages: the checkout code that calls this is
 * inline and runs while the document is still parsing, which is BEFORE any
 * deferred script. A deferred version of this file would simply not exist yet
 * at the moment it is needed. It is a few hundred bytes — loading it straight
 * costs nothing worth measuring.
 */
(function () {
  var SKEY = 'curio-code';       // this visit (the key the pages already used)
  var LKEY = 'curio-code-seen';  // the click window: {"c":"SARA200","t":1690000000000}
  var DAYS = 7;
  var MAXAGE = DAYS * 24 * 60 * 60 * 1000;

  function clean(code) {
    return String(code || '').trim().toUpperCase().slice(0, 30);
  }

  function readWindow() {
    try {
      var raw = localStorage.getItem(LKEY);
      if (!raw) return '';
      var o = JSON.parse(raw);
      if (!o || !o.c || !o.t) return '';
      if (Date.now() - o.t > MAXAGE) {
        localStorage.removeItem(LKEY);
        return '';
      }
      return clean(o.c);
    } catch (e) {
      return '';
    }
  }

  function openWindow(code) {
    try {
      localStorage.setItem(LKEY, JSON.stringify({ c: clean(code), t: Date.now() }));
    } catch (e) {
      /* private mode / storage full — the visit still works, just no memory */
    }
  }

  var api = {
    /* Code confirmed good by the store. Always hold it for this visit; only
     * refresh the 7-day clock if this same code came from a link, so typing
     * a code by hand never silently extends somebody's commission window. */
    remember: function (code) {
      var c = clean(code);
      if (!c) return;
      try { sessionStorage.setItem(SKEY, c); } catch (e) {}
      if (readWindow() === c) openWindow(c);
    },

    /* The customer cleared the field, or the code turned out to be invalid.
     * Forget it everywhere — a bad code must not keep coming back. */
    forget: function () {
      try { sessionStorage.removeItem(SKEY); } catch (e) {}
      try { localStorage.removeItem(LKEY); } catch (e) {}
    },

    /* What code should this page start with? Nearest touch wins: the link
     * they just tapped, then this visit, then the remembered click. */
    recall: function () {
      var q = '';
      try {
        q = clean(new URLSearchParams(location.search).get('code'));
      } catch (e) {}
      if (q) return q;
      try {
        var sess = clean(sessionStorage.getItem(SKEY));
        if (sess) return sess;
      } catch (e) {}
      return readWindow();
    }
  };

  /* A code in the address bar IS the click. Start the window here rather than
   * after validation, so it is recorded even if the visitor never reaches a
   * checkout — and if the code turns out to be junk, the checkout's forget()
   * wipes it again on the first page that tries to use it. */
  try {
    var arriving = clean(new URLSearchParams(location.search).get('code'));
    if (arriving) {
      try { sessionStorage.setItem(SKEY, arriving); } catch (e) {}
      openWindow(arriving);
    }
  } catch (e) {}

  window.curioCoupon = api;
})();
