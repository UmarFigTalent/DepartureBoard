# Departure Board — your travel deals site

A self-updating site that shows flight, hotel and package deals from the
UK and earns you affiliate commission when people book through it.

It already works the moment you open it (on demo data). To make it show
**live prices and pay you**, do the three short steps below.

---

## What you've got

| File | What it does | Touch it? |
|------|--------------|-----------|
| `index.html` | The page | No |
| `styles.css` | The look | No |
| `app.js` | Makes it run | No |
| `demo-data.js` | Sample deals so it works instantly | No |
| **`config.js`** | **Your settings & keys** | **YES — edit this** |
| `api/deals.js` | Fetches live prices safely | No (just deploy it) |

---

## See it right now

Double-click `index.html`. It opens in your browser with demo deals.
That's the finished look. Nothing else needed to preview.

---

## Go live in 3 steps

### 1. Get paid — sign up to Travelpayouts (free)
- Go to **travelpayouts.com** and create a free account.
- It's an affiliate network for Aviasales (flights) and Hotellook
  (hotels). They *want* you to show their deals and pay you per booking.
- In **Profile → For Developers**, copy your **API token** and **Marker**
  (your affiliate ID).

### 2. Put the site online
Easiest free option — **Vercel**:
- Go to **vercel.com**, sign in with GitHub (or drag-and-drop the folder).
- Deploy this folder. You get a live URL like `your-site.vercel.app`.
- In Vercel **Settings → Environment Variables**, add:
  - `TP_TOKEN` = your Travelpayouts token
  - `TP_MARKER` = your marker
- (Netlify works the same way if you prefer.)

### 3. Switch the site to live data
Open **`config.js`** and set:
- `marker` → your marker number
- `proxyUrl` → `"https://your-site.vercel.app/api/deals"`

Save, redeploy. The board now shows real prices and your links earn money.

---

## How you make money
- **Affiliate commission**: every "View deal" link carries your marker.
  When someone books, Travelpayouts pays you. No cost to the traveller.
- **Ads (optional)**: add Google AdSense later for click revenue on top.

## Honest notes
- This shows deals via official affiliate feeds — it does **not** scrape
  Skyscanner/Booking/Expedia. Scraping those breaks their terms and gets
  blocked fast; affiliate feeds are the legal, low-maintenance way and are
  what actually pays you.
- Hotels and packages currently use demo data. Flights go live first via
  the proxy; `api/deals.js` has clearly marked spots to add the Hotellook
  hotel feed when you want to expand.
- Prices can change at the airline/hotel before booking — the footer says
  so, which keeps you straight legally.

That's it. Edit one file, deploy once, and it runs itself.
