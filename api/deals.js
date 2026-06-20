/* ============================================================
   DEPARTURE BOARD — serverless proxy  (Path: /api/deals)
   Flights (Aviasales) + Hotels (Hotellook) + Packages.
   ============================================================ */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");

  const TOKEN  = process.env.TP_TOKEN;
  const MARKER = process.env.TP_MARKER || "";
  const origin = (req.query.origin || "LON").toUpperCase();
  const currency = (req.query.currency || "GBP").toLowerCase();
  const maxPrice = req.query.max ? parseInt(req.query.max, 10) : null;

  if (!TOKEN) {
    return res.status(200).json({ error: "no_token", flights: [], hotels: [], packages: [] });
  }

  const CITY = {
    BCN:"Barcelona", MAD:"Madrid", PMI:"Palma", ALC:"Alicante", AGP:"Malaga",
    LIS:"Lisbon", FAO:"Faro", OPO:"Porto", CDG:"Paris", NCE:"Nice",
    FCO:"Rome", MXP:"Milan", VCE:"Venice", NAP:"Naples", ATH:"Athens",
    AMS:"Amsterdam", BER:"Berlin", MUC:"Munich", PRG:"Prague", VIE:"Vienna",
    BUD:"Budapest", KRK:"Krakow", WAW:"Warsaw", WRO:"Wroclaw", DUB:"Dublin",
    EDI:"Edinburgh", GLA:"Glasgow", CPH:"Copenhagen", RAK:"Marrakesh",
    IST:"Istanbul", FRA:"Frankfurt", GRO:"Girona", REU:"Reus", PMF:"Parma",
    TFS:"Tenerife", LPA:"Gran Canaria", FUE:"Fuerteventura", ACE:"Lanzarote",
    DXB:"Dubai", JFK:"New York", BKK:"Bangkok", SSH:"Sharm El Sheikh"
  };
  const cityName = (iata) => CITY[iata] || iata;
  const cityImage = (iata) =>
    "https://source.unsplash.com/400x300/?" +
    encodeURIComponent((cityName(iata)) + ",travel,city");

  function prettyMonth(d) {
    if (!d) return "";
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const p = String(d).split("-");
    return (m[parseInt(p[1],10)-1] || "") + " " + p[0];
  }

  function flightLink(dest, departDate) {
    const params =
      "origin_iata=" + encodeURIComponent(origin) +
      "&destination_iata=" + encodeURIComponent(dest) +
      (departDate ? "&depart_date=" + encodeURIComponent(departDate) : "") +
      "&adults=1&trip_class=0&locale=en&one_way=true" +
      (MARKER ? "&marker=" + encodeURIComponent(MARKER) : "");
    return "https://search.aviasales.com/flights/?" + params;
  }
  function hotelLink(city) {
    const params =
      "destination=" + encodeURIComponent(city) +
      "&locale=en&currency=" + encodeURIComponent(currency) +
      (MARKER ? "&marker=" + encodeURIComponent(MARKER) : "");
    return "https://search.hotellook.com/?" + params;
  }

  async function getFlights() {
    const url =
      "https://api.travelpayouts.com/v2/prices/latest?origin=" + encodeURIComponent(origin) +
      "&currency=" + encodeURIComponent(currency) +
      "&period_type=year&page=1&limit=40&one_way=false&sorting=price&token=" + encodeURIComponent(TOKEN);
    const r = await fetch(url);
    const j = await r.json();
    return Array.isArray(j.data) ? j.data : [];
  }
  async function getHotels(cityCode) {
    const loc = cityName(cityCode);
    const url =
      "https://engine.hotellook.com/api/v2/cache/latest.json?location=" + encodeURIComponent(loc) +
      "&currency=" + encodeURIComponent(currency) + "&limit=4&token=" + encodeURIComponent(TOKEN);
    try {
      const r = await fetch(url);
      const j = await r.json();
      return Array.isArray(j) ? j : (Array.isArray(j.results) ? j.results : []);
    } catch (e) { return []; }
  }

  try {
    let rows = await getFlights();
    if (maxPrice) rows = rows.filter(r => Math.round(r.value) <= maxPrice);

    const vals = rows.map(r => r.value).filter(Boolean);
    const avg = vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : 0;

    const flights = rows.slice(0, 12).map((row) => {
      const price = Math.round(row.value);
      const save = avg && price < avg ? Math.round((1 - price/avg) * 100) : 0;
      return {
        route: origin + " \u2192 " + cityName(row.destination),
        meta: prettyMonth(row.depart_date) + " \u00B7 " +
              (row.number_of_changes ? row.number_of_changes + " stop" : "direct"),
        price, priceNote: "from",
        save: save >= 8 ? save : 0,
        typical: save >= 8 ? Math.round(avg) : 0,
        image: cityImage(row.destination),
        deeplink: flightLink(row.destination, row.depart_date)
      };
    });

    const topDests = rows.slice(0, 4).map(r => r.destination);
    const hotelArrays = await Promise.all(topDests.map(getHotels));
    const hotels = [];
    hotelArrays.forEach((arr, i) => {
      const dest = topDests[i];
      (arr || []).slice(0, 2).forEach(h => {
        const ppn = Math.round(h.priceAvg || h.priceFrom || h.price || 0);
        if (!ppn) return;
        hotels.push({
          route: cityName(dest) + (h.hotelName ? " \u00B7 " + h.hotelName : ""),
          meta: (h.stars ? h.stars + "\u2605" : "Hotel") + (h.priceAvg ? " \u00B7 avg/night" : ""),
          price: ppn, priceNote: "/ night",
          image: cityImage(dest),
          deeplink: hotelLink(cityName(dest))
        });
      });
    });

    const packages = [];
    rows.slice(0, 6).forEach((row) => {
      const dest = row.destination;
      const hForDest = hotelArrays[topDests.indexOf(dest)] || [];
      const cheapest = hForDest
        .map(h => Math.round(h.priceFrom || h.priceAvg || h.price || 0))
        .filter(Boolean).sort((a,b)=>a-b)[0];
      if (cheapest) {
        packages.push({
          route: cityName(dest) + " \u00B7 3 nights",
          meta: "Flight + hotel \u00B7 " + prettyMonth(row.depart_date),
          price: Math.round(row.value) + cheapest * 3,
          priceNote: "pp est.",
          image: cityImage(dest),
          deeplink: flightLink(dest, row.depart_date)
        });
      }
    });

    return res.status(200).json({ origin, flights, hotels, packages });
  } catch (e) {
    return res.status(200).json({ error: String(e), flights: [], hotels: [], packages: [] });
  }
}
