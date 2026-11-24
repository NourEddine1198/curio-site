/* Curio — let the customer choose the actual stop-desk office.
 *
 * THE PROBLEM
 * Until now the stop-desk dropdown offered COMMUNES. That works while one
 * commune holds one office, which is true almost everywhere — but ZR Express
 * has three offices inside Oran commune, three inside Constantine and two
 * inside Sidi Bel-Abbes. "Oran" does not say which of the three, so the
 * parcel either guessed (wrong side of the city, wasted trip, a return to
 * pay for) or had to fall back to the other courier.
 *
 * WHAT THIS DOES
 * When the wilaya is served by a courier that gives us a real office list,
 * the same dropdown lists the OFFICES instead, and the order carries three
 * things that move together: the office's name, its commune, and the
 * courier's own id for it. The id is what the parcel is addressed by, so
 * nothing is matched by name any more.
 *
 * WHY IT IS GATED TO ZR
 * Today every wilaya is still on Ecotrack, and that path works and pays the
 * bills. Sending Ecotrack a station name where we have only ever sent a
 * commune is a change we have not watched a single real parcel survive. So
 * this file deliberately does nothing on an Ecotrack wilaya — the dropdown
 * stays exactly as it is today — and turns itself on, wilaya by wilaya, as
 * each one moves to ZR. Drop the carrier check below to enable it for both.
 *
 * IT MUST NEVER COST US AN ORDER
 * Every path falls back to the old commune list: no office list in the
 * reply, an empty one, a courier we do not recognise, or this file failing
 * to load at all. The checkout keeps working in all four cases.
 *
 * NOT DEFERRED in the pages — same reason as assets/coupon-memory.js: the
 * checkout that calls it is inline and runs while the document is still
 * parsing, which is before any deferred script exists.
 */
(function () {
  'use strict';

  // The couriers whose office list we trust enough to show. See the header.
  var LIVE = { zrexpress: true };

  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // "Bir Touta" and "Birtouta" are the same town. Spelling, spacing and
  // accents differ between the office list and the commune list, so names are
  // only ever compared through this.
  function loose(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      // Articles are written in or out at random between the two lists —
      // "Ain El Beida" the office sits in "Ain Beida" the commune.
      .replace(/\b(el|al|les|la|le)\b/g, '')
      .replace(/[^a-z0-9]+/g, '');
  }

  function officesOf(wilaya) {
    if (!wilaya || !LIVE[wilaya.carrier]) return [];
    var list = wilaya.offices;
    if (!list || !list.length) return [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (o && o.name) out.push(o);
    }
    return out;
  }

  // What goes in the <option value>. The courier's id when there is one, so
  // two offices can never collide; the name otherwise.
  function keyOf(office) {
    return (office.hubId && String(office.hubId)) || String(office.name);
  }

  // What the customer reads. The Arabic name when the courier gives us one,
  // and the commune after it ONLY when the wilaya's offices are spread across
  // more than one. Oran's three counters all sit inside Oran commune, so
  // "مكتب كاناستال — Oran" on every line says nothing and mixes two scripts
  // in a right-to-left list. Where the offices really are in different towns,
  // the commune is the most useful thing on the line.
  function labelsFor(offices) {
    // The store sends the finished line, so this page and the agent console
    // cannot end up saying different things about the same counter. See
    // store/src/lib/carrier/office-label.ts. Everything below is only the
    // fallback for an older /api/delivery that has not got the field yet.
    var ready = true, served = [];
    for (var k = 0; k < offices.length; k++) {
      if (!offices[k].label) { ready = false; break; }
      served.push(offices[k].label);
    }
    if (ready) return served;

    var communes = {};
    for (var i = 0; i < offices.length; i++) {
      communes[String(offices[i].commune || '')] = true;
    }
    var spread = Object.keys(communes).length > 1;
    var out = [];
    for (var j = 0; j < offices.length; j++) {
      var o = offices[j];
      var shown = o.nameAr || o.name;
      // Compared against the LATIN name, loosely: the Arabic label and the
      // commune are written in different scripts, so «مكتب بئرتوتة» and
      // "Bir Touta" never look equal even though they are the same place.
      // The office's own Latin name is what tells us — and it is spelt
      // "Birtouta" against a commune of "Bir Touta", so a plain comparison
      // misses it and the customer gets the same town twice in two scripts.
      var adds =
        spread &&
        o.commune &&
        String(o.commune) !== String(shown) &&
        loose(o.commune) !== loose(o.name);
      if (adds) shown += ' — ' + o.commune;
      out.push(shown);
    }
    return out;
  }

  /**
   * Fill `select` with this wilaya's offices.
   * Returns true when it did, false when the page should keep using its own
   * commune list exactly as before.
   *
   * `placeholder` is passed in by the page so the wording stays the page's
   * own — this file never invents customer-facing text.
   */
  function fill(select, wilaya, placeholder) {
    if (!select) return false;
    var offices = officesOf(wilaya);
    if (!offices.length) return false;

    var labels = labelsFor(offices);
    var rows = [];
    for (var i = 0; i < offices.length; i++) {
      rows.push({ key: keyOf(offices[i]), label: labels[i] });
    }
    rows.sort(function (a, b) { return a.label.localeCompare(b.label, 'ar'); });

    select.innerHTML = '';
    var ph = document.createElement('option');
    ph.value = '';
    ph.textContent = placeholder || '';
    select.appendChild(ph);

    for (var r = 0; r < rows.length; r++) {
      var opt = document.createElement('option');
      opt.value = rows[r].key;
      opt.textContent = rows[r].label;
      select.appendChild(opt);
    }
    select.disabled = false;
    return true;
  }

  /**
   * Read back what was chosen, as the three fields the order needs.
   * Returns null when nothing is chosen yet.
   *
   * On a wilaya where fill() declined, this returns the commune on its own —
   * byte for byte what the pages sent before this file existed.
   */
  function read(select, wilaya) {
    if (!select || !select.value) return null;
    var offices = officesOf(wilaya);

    if (!offices.length) {
      return { officeName: null, officeCommune: select.value, officeHubId: null };
    }

    for (var i = 0; i < offices.length; i++) {
      if (keyOf(offices[i]) === select.value) {
        var o = offices[i];
        return {
          officeName: o.name || null,
          // The store refuses a stop-desk order with no commune, so never
          // hand it an empty one — fall back to the office's own name.
          officeCommune: o.commune || o.name,
          officeHubId: UUID.test(String(o.hubId || '')) ? String(o.hubId) : null
        };
      }
    }

    // The list changed under the customer between picking and pressing
    // order. Send the dead value on as the commune rather than inventing a
    // live office: the store recognises it as stale and answers with the
    // "the offices changed, pick again" message, which is the one thing
    // that actually helps them. Silently picking a neighbour would not.
    return { officeName: null, officeCommune: select.value, officeHubId: null };
  }

  /**
   * The courier's name as it is written on the door of the office, or null
   * where we have nothing better than the page's own default.
   *
   * The four checkouts label the field «مكتب ستوب ديسك (Anderson)» — Anderson
   * being the name on Ecotrack's desks. Left alone, a customer in a wilaya we
   * had moved to ZR would be sent looking for an Anderson counter that is not
   * there, holding a ticket for a company whose name they had never been
   * told. The office name alone is not enough: it is the sign above the shop
   * that they will be searching for.
   */
  function courier(wilaya) {
    if (!wilaya) return null;
    return wilaya.carrier === 'zrexpress' ? 'ZR Express' : null;
  }

  window.curioOffices = { fill: fill, read: read, courier: courier };
})();
