/**
 * Offline persistence layer.
 *
 * Strategy:
 *   - Primary: IndexedDB (durable, survives large itineraries).
 *   - Fallback: localStorage (older browsers / private mode where IDB is blocked).
 *
 * Two kinds of data are persisted:
 *   1. The places array (write-through cache from api.js).
 *   2. Filter state (categories + bookedOnly) so the traveler's last view is restored.
 *
 * All functions are async and never throw; on failure they resolve to a safe
 * default (null / false) so the app keeps working online.
 */
import { CONFIG } from './config.js';

const {
  DB_NAME,
  DB_VERSION,
  STORE_PLACES,
  PLACES_RECORD_ID,
  FILTERS
} = CONFIG.StorageKeys;

/** @returns {boolean} */
function hasIndexedDB() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/** @returns {boolean} */
function hasLocalStorage() {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch {
    return false;
  }
}

/**
 * Opens (and upgrades) the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PLACES)) {
        db.createObjectStore(STORE_PLACES, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Runs a transaction against the places store.
 * @template T
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest} work
 * @returns {Promise<T>}
 */
async function withStore(mode, work) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLACES, mode);
    const store = tx.objectStore(STORE_PLACES);
    const request = work(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/* ------------------------------------------------------------------ */
/* Places cache                                                        */
/* ------------------------------------------------------------------ */

/**
 * Persists the places array (write-through cache).
 * @param {Array<import('./config.js').Place>} places
 * @returns {Promise<boolean>} true on success.
 */
export async function savePlaces(places) {
  if (!Array.isArray(places)) return false;

  if (hasIndexedDB()) {
    try {
      await withStore('readwrite', (store) =>
        store.put({ id: PLACES_RECORD_ID, places, savedAt: Date.now() })
      );
      return true;
    } catch (err) {
      console.warn('[storage] IndexedDB savePlaces failed, falling back:', err);
    }
  }

  if (hasLocalStorage()) {
    try {
      localStorage.setItem(PLACES_RECORD_ID, JSON.stringify(places));
      return true;
    } catch (err) {
      console.warn('[storage] localStorage savePlaces failed:', err);
    }
  }
  return false;
}

/**
 * Loads the cached places array, or null when nothing is cached.
 * @returns {Promise<?Array<import('./config.js').Place>>}
 */
export async function loadPlaces() {
  if (hasIndexedDB()) {
    try {
      const record = await withStore('readonly', (store) =>
        store.get(PLACES_RECORD_ID)
      );
      if (record && Array.isArray(record.places)) return record.places;
    } catch (err) {
      console.warn('[storage] IndexedDB loadPlaces failed, falling back:', err);
    }
  }

  if (hasLocalStorage()) {
    try {
      const raw = localStorage.getItem(PLACES_RECORD_ID);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('[storage] localStorage loadPlaces failed:', err);
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Filter state (small, always localStorage — fast + synchronous-ish) */
/* ------------------------------------------------------------------ */

/**
 * Persists filter state. Stored in localStorage since it is tiny and
 * needs to be available very early during boot.
 * @param {{ activeCategoryIds: Array<number|string>, bookedOnly: boolean }} state
 * @returns {Promise<boolean>}
 */
export async function saveFilterState(state) {
  if (!state || !hasLocalStorage()) return false;
  try {
    const serializable = {
      activeCategoryIds: Array.from(state.activeCategoryIds || []).map(Number),
      bookedOnly: Boolean(state.bookedOnly)
    };
    localStorage.setItem(FILTERS, JSON.stringify(serializable));
    return true;
  } catch (err) {
    console.warn('[storage] saveFilterState failed:', err);
    return false;
  }
}

/**
 * Loads persisted filter state, or null when none exists.
 * @returns {Promise<?{ activeCategoryIds: number[], bookedOnly: boolean }>}
 */
export async function loadFilterState() {
  if (!hasLocalStorage()) return null;
  try {
    const raw = localStorage.getItem(FILTERS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.activeCategoryIds)) return null;
    return {
      activeCategoryIds: parsed.activeCategoryIds.map(Number),
      bookedOnly: Boolean(parsed.bookedOnly)
    };
  } catch (err) {
    console.warn('[storage] loadFilterState failed:', err);
    return null;
  }
}
