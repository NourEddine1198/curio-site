/* Curio — where did this visitor come from?
 *
 * Reads the utm_* tags Meta puts on the URL and keeps them for the whole
 * visit, so an order still credits the right ad even when the customer lands
 * on /roubla/, wanders to /dlala/, reloads twice and orders twenty minutes
 * later. Without this the tags only exist on the first page and are gone by
 * the time anyone reaches a checkout form.
 *
 * FIRST TOUCH WINS: whatever brought them into this session is what gets the
 * credit. A later untagged page view must not wipe it — that was the whole
 * failure mode we are fixing.
 *
 * Load this BEFORE any checkout code, on every page an ad can land on.
 */
(function () {
  var KEY = 'curio_src';
  var FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

  function read() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function capture() {
    try {
      // Already tagged this session — leave it alone.
      var existing = read();
      if (existing.utm_source || existing.referrer) return;

      var params = new URLSearchParams(window.location.search);
      var src = {};

      FIELDS.forEach(function (f) {
        var v = params.get(f);
        // Cap length here too. The server re-validates, but there is no reason
        // to carry a 4 KB junk string around in storage.
        if (v) src[f] = String(v).slice(0, 120);
      });

      // No tags? Fall back to the referrer, which is how we tell an Instagram
      // bio click apart from someone typing the address in. Same-site
      // referrers are not a source — they are just navigation.
      if (!src.utm_source) {
        var ref = document.referrer || '';
        if (ref && ref.indexOf(window.location.host) === -1) {
          src.referrer = ref.slice(0, 300);
        }
      }

      if (Object.keys(src).length) {
        sessionStorage.setItem(KEY, JSON.stringify(src));
      }
    } catch (e) {
      /* private mode, storage disabled, ancient browser — never break checkout */
    }
  }

  capture();

  /* The two cookies Meta's own pixel drops on curiodz.com:
   *   _fbc — which ad this person clicked (only exists if they came from one)
   *   _fbp — an id for this browser (exists for everyone the pixel has seen)
   * The store API is on a different domain, so these are never sent with the
   * order automatically. We read them at checkout and post them, which is what
   * lets the server-side Purchase event be matched back to a real person.
   *
   * Read LIVE rather than cached: _fbc is written by the pixel a moment after
   * the page loads, so a value captured too early would be missed. */
  function cookie(name) {
    try {
      var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return m ? decodeURIComponent(m[2]).slice(0, 255) : null;
    } catch (e) {
      return null;
    }
  }

  /* Returns the stored source as plain payload keys, ready to merge into an
   * order body. Empty object when we know nothing, which is a real answer:
   * it means organic, direct, or the WhatsApp blast. */
  window.curioSource = function () {
    var out = read();
    var fbc = cookie('_fbc');
    var fbp = cookie('_fbp');
    if (fbc) out.fbc = fbc;
    if (fbp) out.fbp = fbp;
    return out;
  };
})();
