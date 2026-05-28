/**
 * Subset of the fields the Elasticsearch listings index returns.
 * See https://tools.closehack.com/search/listings/_search for the full shape.
 *
 * Add fields here as you find you need them — these are the ones you'll
 * almost certainly want for cards + map markers.
 */
export interface Listing {
  id: number
  address: string | null
  city: string | null
  state: string | null
  zip: string | null

  cost: number | null
  beds: number | null
  baths: number | null
  area: number | null     // square feet
  acres: number | null
  year_built: number | null

  gps_lat: number | null
  gps_lng: number | null

  media_photo_url: string | null
  media_photo_url_large: string | null

  property_type: string | null
  property_status: string | null

  mls: string | null
  mls_agent: string | null
  mls_office: string | null

  date_updated_mls: string | null
}

export interface ListingsFilterResponse {
  ok: 0 | 1
  listings: Listing[]
  total: number
  error?: string
}

export interface MapBound {
  north: number
  south: number
  east: number
  west: number
}
