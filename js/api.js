/**
 * API Data Fetching Module.
 *
 * Loads places.json with a network-first + offline-fallback strategy:
 *   1. fetch('./data/places.json')  → normalize → write-through to IndexedDB.
 *   2. On failure, read the cached copy from IndexedDB / localStorage.
 *   3. If neither is available, throw so the UI can show its error toast.
 */
import { savePlaces, loadPlaces } from './storage.js';

/**
 * Coerces a raw record to the normalized Place schema.
 * Tolerates stale cached data authored with the old (string) shape.
 * @param {any} raw
 * @returns {import('./config.js').Place}
 */
function normalizePlace(raw) {
  const coords = raw && raw.coordinates ? raw.coordinates : {};
  return {
    id: Number(raw.id),
    title: String(raw.title || ''),
    coordinates: {
      lat: Number(coords.lat) || 0,
      lng: Number(coords.lng) || 0
    },
    rating: Number(raw.rating) || 0,
    notes: String(raw.notes || ''),
    gmapsUrl: String(raw.gmapsUrl || ''),
    categoryId: Number(raw.categoryId) || 1,
    reservationId: Number(raw.reservationId) || 0,
    bookingDate: raw.bookingDate != null ? String(raw.bookingDate) : null
  };
}

/**
 * @param {any} data
 * @returns {import('./config.js').Place[]}
 */
function normalizeAll(data) {
  return Array.isArray(data) ? data.map(normalizePlace) : [];
}

/**
 * Loads places, preferring the network and falling back to offline cache.
 * @returns {Promise<import('./config.js').Place[]>}
 */
export async function fetchPlaces() {
  try {
    const response = await fetch('./data/places.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const places = normalizeAll(data);

    // Write-through to the offline cache (best-effort; never blocks).
    savePlaces(places).catch(() => {});

    return places;
  } catch (networkError) {
    console.warn('[api] Network fetch failed, trying offline cache:', networkError);

    const cached = await loadPlaces();
    if (cached && cached.length > 0) {
      console.log('[api] Serving places from offline cache.');
      return normalizeAll(cached);
    }

    // No network and no cache — surface the error to the app.
    throw networkError;
  }
}
