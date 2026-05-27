"use client";

/**
 * PeakAgent Interview — Listing Search.
 *
 * This is a fully working listing search:
 *   - Filter bar at the top (search input + two empty filter slots)
 *   - Listing cards on the left
 *   - Google Map with markers on the right
 *
 * Your job is to:
 *   1. Replace the two "ADD YOUR FILTER HERE" boxes with real Min Beds /
 *      Min Baths controls and wire them through to the API request.
 *   2. (Stretch) Make the map "search this area" when the user pans/zooms.
 *
 * Look for the GOAL 1 / GOAL 2 markers in this file and in
 * _api/handlers/front/listings-filter.php. The README has the details.
 */

import { useEffect, useRef, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { fetcher } from "@/lib/fetcher";
import type { Listing, ListingsFilterResponse } from "@/lib/types";

const MAP_DEFAULT_CENTER = { lat: 39.7392, lng: -104.9903 }; // Denver
const MAP_DEFAULT_ZOOM = 10;
const MAX_NUMBER_OF_BEDS = 5;
const MAX_NUMBER_OF_BATHS = 5;

//Implement the beds options based on the max number
const bedOptions = Array.from({ length: MAX_NUMBER_OF_BEDS }, (_, i) => i + 1);

//Implement the beds options based on the max number
const bathOptions = Array.from(
  { length: MAX_NUMBER_OF_BATHS },
  (_, i) => i + 1,
);

export default function Page() {
  // ─── Filter state ────────────────────────────────────────────
  const [search, setSearch] = useState("");
  // GOAL 1: track filters somehow, starting with beds_min and baths_min, and send that to /handlers/front/listings-filter
  const [bedsMin, setBedsMin] = useState("");
  const [bathsMin, setBathMin] = useState("");

  // ─── Data ────────────────────────────────────────────────────
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Debounced fetch on filter change ────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetcher.post<ListingsFilterResponse>(
          "/handlers/front/listings-filter",
          {
            search,
            size: 24,
            mls_ids: [526],
            // GOAL 1: include filters (beds + baths) here
            beds: bedsMin ? Number(bedsMin) : undefined,
            baths: bathsMin ? Number(bathsMin) : undefined,
            // GOAL 2: include gps-based filtering to the map edges when the user has dragged/panned the map.
          },
        );
        if (!data.ok) throw new Error(data.error ?? "Request failed");
        setListings(data.listings);
        setTotal(data.total);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [
    search,
    /* GOAL 1: add beds, baths to this dependency array */
    bedsMin,
    bathsMin,
  ]);

  // ─── Map ─────────────────────────────────────────────────────
  const { isLoaded: mapLoaded, loadError: mapError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  });
  const mapRef = useRef<google.maps.Map | null>(null);

  // GOAL 2: capture the map ref here so an `onIdle` handler can read
  // map.getBounds() and feed { north, south, east, west } into the next request.
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    // ... update filters to map bounds
  };

  return (
    <div style={styles.page}>
      {/* ── Filter bar ─────────────────────────────────────── */}
      <header style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search address, city, MLS#…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        {/* ─── GOAL 1: replace these two boxes with real controls ─── */}
        <div>
          <select
            value={bedsMin}
            onChange={(e) => setBedsMin(e.target.value)}
            style={styles.select}
          >
            <option value="">Min Beds</option>

            {bedOptions.map((n) => (
              <option key={n} value={n}>
                {n}+ Beds
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={bathsMin}
            onChange={(e) => setBathMin(e.target.value)}
            style={styles.select}
          >
            <option value="">Min Baths</option>

            {bathOptions.map(n => (
              <option key={n} value={n}>{n}+ Baths</option>
            ))}
          </select>
        </div>
        {/* ────────────────────────────────────────────────────────── */}

        <span style={styles.totalCount}>
          {loading ? "Loading…" : `${total.toLocaleString()} listings`}
        </span>
      </header>

      {error && <div style={styles.error}>Error: {error}</div>}

      {/* ── Split layout: cards on left, map on right ─────── */}
      <div style={styles.split}>
        <div style={styles.cards}>
          {listings.length === 0 && !loading && (
            <div style={styles.empty}>No listings match.</div>
          )}
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>

        <div style={styles.mapPane}>
          {mapError && <div style={styles.error}>Map failed to load.</div>}
          {mapLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={MAP_DEFAULT_CENTER}
              zoom={MAP_DEFAULT_ZOOM}
              onLoad={onMapLoad}
              // GOAL 2: add an `onIdle` handler here that reads the current
              // bounds via mapRef.current?.getBounds() and triggers a refetch.
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {listings.map((l) =>
                l.gps_lat != null && l.gps_lng != null ? (
                  <MarkerF
                    key={l.id}
                    position={{ lat: l.gps_lat, lng: l.gps_lng }}
                  />
                ) : null,
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Listing card ──────────────────────────────────────────────
function ListingCard({ listing }: { listing: Listing }) {
  const [rawOpen, setRawOpen] = useState(false);
  const price = listing.cost ? `$${listing.cost.toLocaleString()}` : "—";
  const beds = listing.beds ?? "—";
  const baths = listing.baths ?? "—";
  const sqft = listing.area ? `${listing.area.toLocaleString()} sqft` : null;

  return (
    <article style={styles.card}>
      {listing.media_photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.media_photo_url}
          alt=""
          style={styles.cardPhoto}
          loading="lazy"
        />
      ) : (
        <div style={{ ...styles.cardPhoto, background: "#e5e5ea" }} />
      )}
      <div style={styles.cardBody}>
        <div style={styles.cardPriceRow}>
          <div style={styles.cardPrice}>{price}</div>
          <button
            type="button"
            onClick={() => setRawOpen(true)}
            style={styles.eyeButton}
            aria-label="View raw listing data"
            title="View raw listing data"
          >
            👁
          </button>
        </div>
        <div style={styles.cardMeta}>
          {beds} bd · {baths} ba{sqft ? ` · ${sqft}` : ""}
        </div>
        <div style={styles.cardAddr}>
          {listing.address}
          {listing.city ? `, ${listing.city}` : ""}
          {listing.state ? `, ${listing.state}` : ""}
        </div>
      </div>
      {rawOpen && (
        <RawListingModal listing={listing} onClose={() => setRawOpen(false)} />
      )}
    </article>
  );
}

// ─── Raw listing modal ─────────────────────────────────────────
function RawListingModal({
  listing,
  onClose,
}: {
  listing: Listing;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>
            {listing.address ?? `Listing ${listing.id}`}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={styles.modalClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <pre style={styles.modalPre}>{JSON.stringify(listing, null, 2)}</pre>
      </div>
    </div>
  );
}

// ─── Styles (inline for simplicity — feel free to refactor) ────
const styles: Record<string, React.CSSProperties> = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f7f7f8",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: "#fff",
    borderBottom: "1px solid #e5e5ea",
    flexShrink: 0,
  },
  searchInput: {
    flex: "0 0 280px",
    padding: "8px 12px",
    fontSize: 14,
    border: "1px solid #d1d1d6",
    borderRadius: 6,
    outline: "none",
  },
  filterSlot: {
    flex: "0 0 200px",
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #c7a8ff",
    borderRadius: 6,
    background: "#faf5ff",
  },
  slotLabel: {
    fontSize: 12,
    color: "#7c3aed",
    fontWeight: 500,
  },
  totalCount: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#666",
  },
  error: {
    padding: 12,
    background: "#fee",
    color: "#a00",
    fontSize: 14,
    borderBottom: "1px solid #fcc",
  },
  split: {
    flex: 1,
    display: "flex",
    minHeight: 0,
  },
  cards: {
    width: "40%",
    minWidth: 380,
    maxWidth: 560,
    overflowY: "auto",
    padding: 12,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    alignContent: "start",
  },
  empty: {
    gridColumn: "1 / -1",
    padding: 32,
    textAlign: "center",
    color: "#999",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e5ea",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
  },
  cardPhoto: {
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    display: "block",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardBody: {
    padding: 10,
  },
  cardPriceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 600,
  },
  eyeButton: {
    border: "1px solid #d1d1d6",
    background: "#fff",
    borderRadius: 6,
    width: 28,
    height: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    lineHeight: 1,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 24,
  },
  modal: {
    background: "#fff",
    borderRadius: 8,
    width: "min(720px, 100%)",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e5ea",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  modalClose: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
    color: "#666",
    padding: 4,
    lineHeight: 1,
  },
  modalPre: {
    margin: 0,
    padding: 16,
    overflow: "auto",
    fontSize: 12,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    background: "#fafafa",
    flex: 1,
  },
  cardMeta: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
  },
  cardAddr: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  mapPane: {
    flex: 1,
    minWidth: 0,
  },
  select: {
    height: 36,
    padding: "0 12px",
    border: "1px solid #d1d1d6",
    borderRadius: 6,
    background: "#fff",
    fontSize: 14,
  },
};
