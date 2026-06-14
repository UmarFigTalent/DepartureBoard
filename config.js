/* ============================================================
   DEPARTURE BOARD — CONFIGURATION
   This is the ONLY file you need to edit to go live.
   ============================================================

   STEP 1 — Get a free Travelpayouts account
   -----------------------------------------
   1. Sign up at https://www.travelpayouts.com  (free, no cost)
   2. Open Profile → For Developers → you'll see:
        • Your API token  (a long string)
        • Your Marker     (your affiliate ID, a number)
   3. Paste both below.

   STEP 2 — Deploy
   ---------------
   Because browsers block direct calls to the Travelpayouts API
   (CORS), live data is fetched through a tiny serverless proxy.
   A ready-to-deploy proxy is in  /api/deals.js  (works on Vercel
   or Netlify with zero config). Set PROXY_URL below to where you
   deployed it, OR leave it as "" to run on built-in demo data so
   you can see the site working immediately.

   That's it. The site fills itself in.
   ============================================================ */

window.DEPARTURE_CONFIG = {

  // --- Your Travelpayouts credentials ---
  marker:    "YOUR_MARKER_HERE",        // affiliate ID (number)
  apiToken:  "YOUR_API_TOKEN_HERE",     // used by the proxy only

  // --- Where your serverless proxy lives ---
  // Leave "" to use demo data. Set to e.g.
  // "https://your-site.vercel.app/api/deals" once deployed.
  proxyUrl: "",

  // --- Home market ---
  defaultOrigin: "LON",                 // IATA city code for London
  currency: "GBP",

  // --- Affiliate link templates ---
  // {marker} is replaced automatically. These open the booking
  // partner with your affiliate ID attached so you earn on bookings.
  links: {
    flight:  "https://tp.media/r?marker={marker}&p=4114&u={deeplink}",
    hotel:   "https://tp.media/r?marker={marker}&p=4115&u={deeplink}",
    package: "https://tp.media/r?marker={marker}&p=4114&u={deeplink}"
  }
};
