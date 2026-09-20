/**
 * Central Configuration Module - Phase 3 (Normalized Schema)
 */

/**
 * @typedef {Object} PlaceCoordinates
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} Place
 * @property {number} id - Unique numeric identifier.
 * @property {string} title
 * @property {PlaceCoordinates} coordinates
 * @property {number} rating
 * @property {string} notes
 * @property {string} gmapsUrl
 * @property {number} categoryId - Numeric category id (see CONFIG.Categories keys).
 * @property {number} reservationId - 1..5, see CONFIG.RESERVATION_UI_MAP.
 * @property {?string} [bookingDate] - ISO string e.g. "2026-09-28T17:00:00" or null.
 */

/**
 * @typedef {Object} FilterState
 * @property {Set<number>} activeCategoryIds - Currently enabled numeric category ids.
 * @property {boolean} bookedOnly - When true, only places with a bookingDate are shown.
 */

export const CONFIG = {
  MapSettings: {
    defaultCenter: [41.9009, 12.4833], // Trevi Fountain
    initialZoom: 16,
    minZoom: 10,
    maxZoom: 18,
    tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },

  HotelSettings: {
    coords: [41.9009, 12.4833],
    title: "המלון שלנו",
    color: "#FFD700",
    icon: "fa-solid fa-star"
  },

  DOM_Selectors: {
    loader: '#loader',
    map: '#map',
    filterBtn: '#filter-btn',
    filterModal: '#filter-modal',
    filterCloseBtn: '#filter-close-btn',
    filterOverlay: '#filter-overlay',
    categoryList: '#category-list',
    selectAllBtn: '#select-all-btn',
    deselectAllBtn: '#deselect-all-btn',
    locateBtn: '#locate-btn',
    toast: '#toast',
    searchInput: '#search-input',
    searchResults: '#search-results',
    clearSearchBtn: '#clear-search-btn'
  },

  Categories: {
    "1": { name: "אתרים והיסטוריה", color: "#FF5252", icon: "fa-solid fa-monument" },
    "2": { name: "אוכל ומסעדות", color: "#FFB142", icon: "fa-solid fa-utensils" },
    "3": { name: "קפה ומתוקים", color: "#8D6E63", icon: "fa-solid fa-mug-hot" },
    "4": { name: "ברים וחיי לילה", color: "#7E57C2", icon: "fa-solid fa-martini-glass" },
    "5": { name: "קניות וספא", color: "#29B6F6", icon: "fa-solid fa-bag-shopping" },
    "6": { name: "פארקים ופנינות", color: "#66BB6A", icon: "fa-solid fa-tree" }
  },

  RESERVATION_UI_MAP: {
    1: "חובה להזמין מראש",
    2: "מומלץ להזמין מראש",
    3: "על בסיס מקום פנוי בלבד",
    4: "זמין בימי ראשון בלבד",
    5: "יש לבדוק ימים ושעות פתיחה"
  },

  /**
   * Walking-speed + scale-bar tuning.
   * 4.8 km/h ≈ 80 m/min ≈ 1.2 min per 100 m.
   */
  Walking: {
    metersPerMinute: 80,           // 4.8 km/h
    maxScaleLineWidthPx: 90        // fixed visual budget for the scale line
  },

  /** "Nice" round distances (meters) the scale bar snaps to. */
  ScaleSteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 10000],

  /** Default filter state used on first launch (before persisted state loads). */
  FilterDefaults: {
    activeCategoryIds: ["1", "2", "3", "4", "5", "6"],
    bookedOnly: false
  },

  /** Keys used for offline persistence (IndexedDB store + localStorage fallback). */
  StorageKeys: {
    DB_NAME: "rome-itinerary-db",
    DB_VERSION: 1,
    STORE_PLACES: "places",
    PLACES_RECORD_ID: "places-cache",
    FILTERS: "rome-itinerary-filters"
  }
};
