/* ============================================================
   DEPARTURE BOARD — app logic
   - Renders a live clock
   - Loads flight / hotel / package deals from your proxy
   - Falls back to demo data so the site works out of the box
   - Wires affiliate links from config.js
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.DEPARTURE_CONFIG || {};

  /* ---------- live clock (departure-board feel) ---------- */
  function tick() {
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    var el = document.getElementById("clock");
    if (el) el.textContent = hh + ":" + mm;
  }
  tick();
  setInterval(tick, 1000 * 20);

  /* ---------- affiliate link builder ---------- */
  function affiliateLink(type, deeplink) {
    var tmpl = (CFG.links && CFG.links[type]) || "{deeplink}";
    return tmpl
      .replace("{marker}", encodeURIComponent(CFG.marker || ""))
      .replace("{deeplink}", encodeURIComponent(deeplink || "#"));
  }

  function money(n) {
    var sym = CFG.currency === "GBP" ? "\u00A3" : "";
    return sym + Number(n).toLocaleString("en-GB");
  }

  /* ---------- card rendering ---------- */
  function dealCard(d, type) {
    var link = affiliateLink(type, d.deeplink || d.url || "#");
    // savings badge — the trust signal the best deal sites lead with
    var badge = d.save
      ? '<span class="deal__save">' + Math.round(d.save) + "% below usual</span>"
      : (d.tag ? '<span class="deal__save deal__save--tag">' + esc(d.tag) + "</span>" : "");
    var typical = d.typical
      ? ' <s class="deal__was">' + money(d.typical) + "</s>"
      : "";
    return (
      '<article class="deal">' +
      badge +
      '<h3 class="deal__route">' + esc(d.route) + "</h3>" +
      '<p class="deal__meta">' + esc(d.meta || "") + "</p>" +
      '<p class="deal__price">' + money(d.price) + typical +
      " <small>" + esc(d.priceNote || (type === "hotel" ? "/ night" : "return")) + "</small></p>" +
      '<a class="deal__cta" href="' + link + '" target="_blank" rel="sponsored noopener">View deal &rarr;</a>' +
      "</article>"
    );
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function skeletons(n) {
    var s = "";
    for (var i = 0; i < n; i++) {
      s += '<article class="deal deal--skeleton">' +
        '<div class="sk sk--route"></div>' +
        '<div class="sk sk--meta"></div>' +
        '<div class="sk sk--price"></div></article>';
    }
    return s;
  }

  function render(type, deals) {
    var grid = document.getElementById(type + "-grid");
    var status = document.getElementById(type + "-status");
    if (!grid) return;
    if (!deals || !deals.length) {
      grid.innerHTML = '<div class="empty">No deals on the board right now — check back soon.</div>';
      if (status) status.textContent = "0 deals";
      return;
    }
    grid.innerHTML = deals.map(function (d) { return dealCard(d, type.replace(/s$/, "")); }).join("");
    if (status) status.textContent = deals.length + " deals \u00B7 updated " +
      new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  /* ---------- data loading ---------- */
  function loadLive() {
    var origin = CFG.defaultOrigin || "LON";
    var url = CFG.proxyUrl + "?origin=" + encodeURIComponent(origin) +
              "&currency=" + encodeURIComponent(CFG.currency || "GBP");
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error("proxy " + r.status); return r.json(); });
  }

  function boot() {
    ["flights", "hotels", "packages"].forEach(function (t) {
      var g = document.getElementById(t + "-grid");
      if (g) g.innerHTML = skeletons(6);
    });

    var useLive = CFG.proxyUrl && CFG.proxyUrl.length > 0;
    var source = useLive
      ? loadLive().catch(function (e) {
          console.warn("Live fetch failed, using demo data:", e.message);
          return window.DEMO_DEALS;
        })
      : Promise.resolve(window.DEMO_DEALS);

    source.then(function (data) {
      data = data || window.DEMO_DEALS;
      render("flights", data.flights);
      render("hotels", data.hotels);
      render("packages", data.packages);
    });
  }

  /* ---------- explore-everywhere chips ---------- */
  function runSearch(dest) {
    dest = (dest || "").trim().toLowerCase();
    if (!dest) { boot(); return; }
    ["flights", "hotels", "packages"].forEach(function (t) {
      var all = (window.DEMO_DEALS[t] || []);
      var filtered = all.filter(function (d) {
        return (d.route + " " + (d.meta || "")).toLowerCase().indexOf(dest) > -1;
      });
      render(t, filtered.length ? filtered : all);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) {
    c.addEventListener("click", function () {
      document.getElementById("dest").value = c.textContent.replace(/^[^A-Za-z]+/, "");
      runSearch(c.getAttribute("data-dest"));
      document.getElementById("flights").scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- email capture ---------- */
  var alertForm = document.getElementById("alertForm");
  if (alertForm) {
    alertForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("alertEmail").value;
      // Hook this to Mailchimp / Beehiiv / ConvertKit when ready.
      // For now we confirm locally so the flow is visible.
      alertForm.innerHTML = '<p class="alert-bar__done">✓ You\'re on the list — first deals land soon.</p>';
      console.log("Signup captured:", email);
    });
  }

  /* ---------- search (filters current view client-side) ---------- */
  var btn = document.getElementById("searchBtn");
  if (btn) {
    btn.addEventListener("click", function () {
      runSearch(document.getElementById("dest").value);
    });
  }

  boot();
})();
