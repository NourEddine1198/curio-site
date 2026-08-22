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

  /* Returns the stored source as plain payload keys, ready to merge into an
   * order body. Empty object when we know nothing, which is a real answer:
   * it means organic, direct, or the WhatsApp blast. */
  window.curioSource = read;
})();
