/**
 * Central Configuration Module - Phase 2
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
  }
};
