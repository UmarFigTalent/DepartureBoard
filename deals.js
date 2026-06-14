/* ============================================================
   DEPARTURE BOARD — serverless proxy
   Path: /api/deals   (works on Vercel out of the box; Netlify too)

   Why this exists: browsers can't call the Travelpayouts API
   directly (CORS + your token must stay secret). This tiny
   function calls the API server-side and returns clean JSON
   the website can render.

   SETUP
   -----
   1. Deploy this whole folder to Vercel (vercel.com) or Netlify.
   2. In the host dashboard add two Environment Variables:
        TP_TOKEN   = your Travelpayouts API token
        TP_MARKER  = your Travelpayouts marker (affiliate id)
   3. Set proxyUrl in config.js to:
        https://YOUR-DEPLOYMENT.vercel.app/api/deals
   Done — the board now shows live prices.

   Uses the free "cheapest tickets" + "popular destinations"
   data endpoints. Hotel/package endpoints can be added the same
   way; demo data covers them until you do.
   ============================================================ */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");

  const TOKEN  = process.env.TP_TOKEN;
  const MARKER = process.env.TP_MARKER || "";
  const origin = (req.query.origin || "LON").toUpperCase();
  const currency = (req.query.currency || "GBP").toLowerCase();

  if (!TOKEN) {
    return res.status(200).json({ error: "no_token", flights: [], hotels: [], packages: [] });
  }

  try {
    // Cheapest tickets from origin — Travelpayouts Data API
    const url =
      "https://api.travelpayouts.com/v2/prices/latest" +
      "?origin=" + encodeURIComponent(origin) +
      "&currency=" + encodeURIComponent(currency) +
      "&period_type=year&page=1&limit=30&one_way=false&sorting=price" +
      "&token=" + encodeURIComponent(TOKEN);

    const r = await fetch(url);
    const json = await r.json();
    const rows = Array.isArray(json.data) ? json.data : [];

    const flights = rows.slice(0, 12).map((row) => ({
      route: origin + " \u2192 " + row.destination,
      meta: (row.depart_date || "").slice(0, 7) + " \u00B7 " +
            (row.number_of_changes ? row.number_of_changes + " stop" : "direct"),
      price: Math.round(row.value),
      priceNote: "return",
      deeplink: "https://www.aviasales.com/search/" + origin + row.destination +
                (MARKER ? "?marker=" + MARKER : "")
    }));

    return res.status(200).json({
      flights,
      hotels: [],     // add Hotellook endpoint here when ready
      packages: []    // packages can reuse flight+hotel combos
    });
  } catch (e) {
    return res.status(200).json({ error: String(e), flights: [], hotels: [], packages: [] });
  }
}
