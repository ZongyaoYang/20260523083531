# PeakAgent Interview — Listing Search

A working slice of the PeakAgent stack: Next.js + TypeScript on the frontend, PHP on the backend, talking to our public Elasticsearch listings index. No database, no Docker.

## Setup

Prereqs: **PHP 8.1+** and **Node 22+**.

```bash
./start.sh
```

Starts both servers and opens <http://localhost:3000>. Ctrl+C stops both.

## What you'll see

A working listing search — a search input on the top left, listing cards on the left, a Google Map with markers on the right. The filter bar has **two empty dashed slots** where Min Beds and Min Baths should go. That's your work.

## Your goals

### 1. Finish filter, sort, and pagination (<1 hour total, maybe less)

**A. MINI WORK ON FRONTEND** — replace the two placeholder slots in the filter bar with real Min Beds + Min Baths controls (dropdowns, sliders, your call). Wire them through so changing them refetches and updates both the cards and the map markers. You can surface more of the backend filters in the UI if you want, but Min Beds + Min Baths are the only required controls.

**B. MINI WORK ON BACKEND** — extend `_api/handlers/front/listings-filter.php` from a `search`-only endpoint into a real filter endpoint. It should accept:

- `beds`, `baths` — minimums
- `price_min`, `price_max` — price range
- `property_types: string[]` — match any
- `sort` — `"date_desc"` (default), `"price_asc"`, `"price_desc"`
- `page` — 1-indexed, combined with the existing `size`

Return the effective `page` and `size` in the response alongside `listings` and `total`.

You'll touch:
- `_ui/app/page.tsx` — look for the `GOAL 1:` markers
- `_api/handlers/front/listings-filter.php` — same

### 2. Optional Goal — "Search this area" on map drag

When the user pans or zooms the map, refetch listings using the current viewport as a geo bounding-box filter. Auto-refetch on `idle`, or show a "Search this area" button that appears after a pan — your call. Look for the `GOAL 2:` markers.

## Reference

- The Elasticsearch index is at `https://tools.closehack.com/search/listings/_search` — public, no auth.
- To see one full listing document and the available fields, click one of the eye icons.

## Submission

Zip the files and/or take a screen recording talking about what you did.
You decide how far you want to go!

## What we look at

- **Does it work?** Filters change results in both the list and the map, no console errors.
- **Readable Code** Reasonable component structure, hooks, variable names.
- **Clean UX** The two filters and (if attempted) "search this area" feel intentional.
- **Effort** Interest spent on making this good, even restyling the listings or making draw on map polygon (gps_polygon working) would overdeliver.

If you use AI, great. Use AI.
Have fun!