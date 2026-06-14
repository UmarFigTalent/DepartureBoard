/* ============================================================
   DEMO DATA
   Used automatically until you set proxyUrl in config.js.
   "save" = % below the typical price for that route (the trust
   signal the best deal sites all use). "typical" = usual price.
   ============================================================ */
window.DEMO_DEALS = {
  flights: [
    { route: "London \u2192 Barcelona", meta: "easyJet \u00B7 direct \u00B7 Oct", price: 38, typical: 62, save: 39, deeplink: "https://www.aviasales.com" },
    { route: "Manchester \u2192 Faro", meta: "Ryanair \u00B7 direct \u00B7 Sep", price: 41, typical: 58, save: 29, deeplink: "https://www.aviasales.com" },
    { route: "London \u2192 Marrakesh", meta: "Wizz \u00B7 direct \u00B7 Nov", price: 47, typical: 79, save: 41, deeplink: "https://www.aviasales.com" },
    { route: "Edinburgh \u2192 Krakow", meta: "Ryanair \u00B7 direct \u00B7 Oct", price: 29, typical: 52, save: 44, deeplink: "https://www.aviasales.com" },
    { route: "London \u2192 Rome", meta: "ITA \u00B7 direct \u00B7 Sep", price: 54, typical: 71, save: 24, deeplink: "https://www.aviasales.com" },
    { route: "Bristol \u2192 Alicante", meta: "easyJet \u00B7 direct \u00B7 Oct", price: 44, typical: 60, save: 27, deeplink: "https://www.aviasales.com" }
  ],
  hotels: [
    { route: "Barcelona \u00B7 Eixample", meta: "4\u2605 \u00B7 8.9/10 \u00B7 2 nights", price: 71, typical: 99, save: 28, priceNote: "/ night", deeplink: "https://search.hotellook.com" },
    { route: "Lisbon \u00B7 Alfama", meta: "Boutique \u00B7 9.1/10", price: 84, typical: 112, save: 25, priceNote: "/ night", deeplink: "https://search.hotellook.com" },
    { route: "Marrakesh \u00B7 Medina riad", meta: "Riad \u00B7 9.3/10", price: 58, typical: 90, save: 36, priceNote: "/ night", deeplink: "https://search.hotellook.com" },
    { route: "Rome \u00B7 Trastevere", meta: "3\u2605 \u00B7 8.6/10", price: 66, typical: 88, save: 25, priceNote: "/ night", deeplink: "https://search.hotellook.com" },
    { route: "Krakow \u00B7 Old Town", meta: "4\u2605 \u00B7 9.0/10", price: 42, typical: 64, save: 34, priceNote: "/ night", deeplink: "https://search.hotellook.com" },
    { route: "Faro \u00B7 Marina", meta: "3\u2605 \u00B7 8.4/10", price: 49, typical: 67, save: 27, priceNote: "/ night", deeplink: "https://search.hotellook.com" }
  ],
  packages: [
    { route: "Algarve \u00B7 7 nights", meta: "Flights + 4\u2605 + transfers", price: 389, typical: 540, save: 28, priceNote: "pp", deeplink: "https://www.aviasales.com" },
    { route: "Costa del Sol \u00B7 7 nights", meta: "Flights + 4\u2605 all-inc", price: 449, typical: 615, save: 27, priceNote: "pp", deeplink: "https://www.aviasales.com" },
    { route: "Marrakesh \u00B7 4 nights", meta: "Flights + riad + breakfast", price: 312, typical: 470, save: 34, priceNote: "pp", deeplink: "https://www.aviasales.com" },
    { route: "Crete \u00B7 7 nights", meta: "Flights + 5\u2605 + transfers", price: 528, typical: 690, save: 23, priceNote: "pp", deeplink: "https://www.aviasales.com" },
    { route: "Tenerife \u00B7 7 nights", meta: "Flights + 4\u2605 half-board", price: 412, typical: 560, save: 26, priceNote: "pp", deeplink: "https://www.aviasales.com" },
    { route: "Lisbon \u00B7 3 nights", meta: "Flights + boutique hotel", price: 268, typical: 360, save: 26, priceNote: "pp", deeplink: "https://www.aviasales.com" }
  ]
};
