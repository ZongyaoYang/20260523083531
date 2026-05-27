<?php

/**
 * POST /handlers/front/listings-filter
 *
 * Returns a list of MLS listings from the public Elasticsearch index.
 * Currently supports `search` (free text) and `size` (page size).
 *
 * Request body (JSON):
 *   { "search": "boulder", "size": 24 }
 *
 * Response:
 *   { "ok": 1, "listings": [...], "total": N }
 */

$search = trim((string)($_POST['search'] ?? ''));
$size   = min(50, max(1, (int)($_POST['size'] ?? 24)));

$must = [
    ['exists' => ['field' => 'gps_lat']],
    ['range'  => ['active' => ['gte' => 1]]],
];

if ($search !== '') {
    $must[] = ['multi_match' => [
        'query'  => $search,
        'fields' => ['address^2', 'city', 'mls', 'search'],
    ]];
}

$mls_ids = array_values(array_filter(
    array_map('intval', (array)($_POST['mls_ids'] ?? [])),
));
if (!empty($mls_ids)) {
    $must[] = ['terms' => ['mls_id' => $mls_ids]];
}

// ─── GOAL 1: extend this handler into a real filter endpoint ─────────
//   In addition to `search` and `size` above, the endpoint should accept:
//
//     beds            int       minimum bedrooms       (ignore if 0/empty)
//     baths           int       minimum bathrooms      (ignore if 0/empty)
//     price_min       int       minimum list price     (ignore if 0/empty)
//     price_max       int       maximum list price     (ignore if 0/empty)
//     property_types  string[]  match any of these property_type values
//     property_status string[]  e.g. "active", "pending", "sold"  → property_status_type
//     area_min        int       minimum square footage (`area` field)
//     area_max        int       maximum square footage
//     year_built_min  int       earliest year built
//     acres_min       float     minimum lot acreage
//     acres_max       float     maximum lot acreage
//     days_on_market_max int    cap on `days_on_market`
//     city            string[]  match any of these cities (use city.keyword)
//     state           string[]  match any of these state codes
//     zip             string[]  match any of these zips
//     flag_rent       bool      true → only rentals, false → only for-sale
//     features        string[]  any of: "waterfront", "pool", "basement",
//                               "basement_finished", "foreclosure", "hoa",
//                               "pets", "fence", "master_main",
//                               "gated_community", "senior_community"
//                               (each maps to its own int flag field; 1 = yes)
//     open_house_only bool      restrict to listings with an upcoming open house
//                               (open_house_start_date >= now)
//     sort            string    one of: "date_desc" (default),
//                               "price_asc", "price_desc",
//                               "area_desc", "days_on_market_asc"
//     page            int       1-indexed page number  (default 1)
//
//   Translate these into the Elasticsearch query / sort / paging shape.
//   The response should include the effective `page` and `size` alongside
//   the existing `listings` and `total` so the frontend can paginate.
//
// ─────────────────────────────────────────────────────────────────────

$beds  = (int)($_POST['beds'] ?? 0);
$baths = (float)($_POST['baths'] ?? 0); //In API response the baths could be 2.5 

// Beds filter
if ($beds > 0) {
    $must[] = ['range' => ['beds' => ['gte' => $beds]]];
}

// Baths filter
if ($baths > 0) {
    $must[] = ['range' => ['baths' => ['gte' => $baths]]];
}

// ─── GOAL 2 (stretch): support a map viewport bounding box ───────────
//   When the user pans the map, the frontend sends viewport bounds to search like this:
//     { "bounds": { "north": 40.1, "south": 39.8, "east": -104.9, "west": -105.3 } }
// ─────────────────────────────────────────────────────────────────────


try {
    $res = (new ElasticClient())->query('listings', [
        'size'  => $size,
        'query' => ['bool' => ['must' => $must]],
        'sort'  => [['date_updated_mls' => 'desc']],
    ]);
} catch (Throwable $e) {
    _ej(['ok' => 0, 'error' => $e->getMessage()]);
}

_ej([
    'ok'       => 1,
    'listings' => array_map(fn($h) => $h['_source'], $res['hits']['hits'] ?? []),
    'total'    => $res['hits']['total']['value'] ?? 0,
]);
