/* ============================================================
   DEPARTURE BOARD — app logic
   Live clock · loads deals from proxy · real search/filter ·
   multi-airport · destination images · email capture.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.DEPARTURE_CONFIG || {};
  var LAST = null; // last loaded dataset, for client-side filtering

  /* ---------- live clock ---------- */
  function tick() {
    var d = new Date();
    var el = document.getElementById("clock");
    if (el) el.textContent = String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
  }
  tick(); setInterval(tick, 20000);

  function money(n) {
    var sym = CFG.currency === "GBP" ? "\u00A3" : "";
    return sym + Number(n).toLocaleString("en-GB");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  /* ---------- card rendering (now with image) ---------- */
  function dealCard(d, type) {
    var link = d.deeplink || d.url || "#";
    var badge = d.save
      ? '<span class="deal__save">' + Math.round(d.save) + "% below usual</span>"
      : (d.tag ? '<span class="deal__save deal__save--tag">' + esc(d.tag) + "</span>" : "");
    var typical = d.typical ? ' <s class="deal__was">' + money(d.typical) + "</s>" : "";
    var img = d.image
      ? '<div class="deal__img" style="background-image:url(\'' + esc(d.image) + '\')"></div>'
      : "";
    return (
      '<article class="deal">' + img +
      '<div class="deal__body">' + badge +
      '<h3 class="deal__route">' + esc(d.route) + "</h3>" +
      '<p class="deal__meta">' + esc(d.meta || "") + "</p>" +
      '<p class="deal__price">' + money(d.price) + typical +
      " <small>" + esc(d.priceNote || (type === "hotel" ? "/ night" : "from")) + "</small></p>" +
      '<a class="deal__cta" href="' + link + '" target="_blank" rel="sponsored noopener">View deal &rarr;</a>' +
      "</div></article>"
    );
  }

  function skeletons(n) {
    var s = "";
    for (var i=0;i<n;i++) s += '<article class="deal deal--skeleton"><div class="sk sk--img"></div><div class="deal__body"><div class="sk sk--route"></div><div class="sk sk--meta"></div><div class="sk sk--price"></div></div></article>';
    return s;
  }

  function render(type, deals) {
    var grid = document.getElementById(type + "-grid");
    var status = document.getElementById(type + "-status");
    if (!grid) return;
    if (!deals || !deals.length) {
      grid.innerHTML = '<div class="empty">No deals match right now — try a different filter or airport.</div>';
      if (status) status.textContent = "0 deals";
      return;
    }
    grid.innerHTML = deals.map(function (d) { return dealCard(d, type.replace(/s$/, "")); }).join("");
    if (status) status.textContent = deals.length + " deals \u00B7 updated " +
      new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
  }

  /* ---------- data loading from proxy ---------- */
  function loadLive(origin, maxPrice) {
    var url = CFG.proxyUrl + "?origin=" + encodeURIComponent(origin || CFG.defaultOrigin || "LON") +
              "&currency=" + encodeURIComponent(CFG.currency || "GBP");
    if (maxPrice) url += "&max=" + encodeURIComponent(maxPrice);
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("proxy " + r.status); return r.json(); });
  }

  function paint(data) {
    LAST = data || window.DEMO_DEALS || { flights:[], hotels:[], packages:[] };
    render("flights", LAST.flights);
    render("hotels", LAST.hotels);
    render("packages", LAST.packages);
  }

  function boot(origin, maxPrice) {
    ["flights","hotels","packages"].forEach(function (t) {
      var g = document.getElementById(t + "-grid"); if (g) g.innerHTML = skeletons(4);
    });
    var useLive = CFG.proxyUrl && CFG.proxyUrl.length > 0;
    var src = useLive
      ? loadLive(origin, maxPrice).catch(function (e) { console.warn("Live fetch failed:", e.message); return window.DEMO_DEALS; })
      : Promise.resolve(window.DEMO_DEALS);
    src.then(paint);
  }

  /* ---------- filters (chips) ---------- */
  function applyFilter(f) {
    if (!LAST) return;
    function filt(arr, fn) { return (arr||[]).filter(fn); }
    if (f === "all")      { paint(LAST); return; }
    if (f === "under30")  { render("flights", filt(LAST.flights, function(d){return d.price<=30;}));
                            render("hotels", LAST.hotels); render("packages", LAST.packages);
                            document.getElementById("flights").scrollIntoView({behavior:"smooth"}); return; }
    if (f === "under50")  { render("flights", filt(LAST.flights, function(d){return d.price<=50;}));
                            render("hotels", LAST.hotels); render("packages", LAST.packages);
                            document.getElementById("flights").scrollIntoView({behavior:"smooth"}); return; }
    if (f === "direct")   { render("flights", filt(LAST.flights, function(d){return /direct/i.test(d.meta||"");}));
                            render("hotels", LAST.hotels); render("packages", LAST.packages);
                            document.getElementById("flights").scrollIntoView({behavior:"smooth"}); return; }
    if (f === "packages") { document.getElementById("packages").scrollIntoView({behavior:"smooth"}); return; }
  }

  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) {
    c.addEventListener("click", function () { applyFilter(c.getAttribute("data-filter")); });
  });

  /* ---------- main search (origin + dest text + max price) ---------- */
  var btn = document.getElementById("searchBtn");
  if (btn) btn.addEventListener("click", function () {
    var origin = (document.getElementById("origin") || {}).value || "LON";
    var maxPrice = (document.getElementById("maxprice") || {}).value || "";
    var dest = ((document.getElementById("dest") || {}).value || "").trim().toLowerCase();
    boot(origin, maxPrice);
    // after reload, apply dest text filter once data is in
    if (dest) {
      var tries = 0, iv = setInterval(function () {
        if (LAST || tries > 20) {
          clearInterval(iv);
          if (LAST) {
            function m(arr){return (arr||[]).filter(function(d){return (d.route+" "+(d.meta||"")).toLowerCase().indexOf(dest)>-1;});}
            render("flights", m(LAST.flights)); render("hotels", m(LAST.hotels)); render("packages", m(LAST.packages));
            document.getElementById("flights").scrollIntoView({behavior:"smooth"});
          }
        }
        tries++;
      }, 150);
    }
  });

  // Re-load instantly when airport changes
  var originSel = document.getElementById("origin");
  if (originSel) originSel.addEventListener("change", function () {
    boot(originSel.value, (document.getElementById("maxprice")||{}).value || "");
  });

  /* ---------- email capture (Beehiiv-ready) ---------- */
  var alertForm = document.getElementById("alertForm");
  if (alertForm) {
    alertForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (document.getElementById("alertEmail")||{}).value;
      // If a Beehiiv (or other) form URL is set in config, post to it.
      if (CFG.newsletterUrl) {
        fetch(CFG.newsletterUrl, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email })
        }).catch(function(){});
      }
      alertForm.innerHTML = '<p class="alert-bar__done">\u2713 You\'re on the list \u2014 first deals land soon.</p>';
      console.log("Signup:", email);
    });
  }

  boot();
})();
