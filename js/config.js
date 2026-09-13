/**
 * Central Configuration Module
 * Exporting CONFIG constant for application-wide access.
 */
export const CONFIG = {
  MapSettings: {
    defaultCenter: [41.9028, 12.4964], // Rome center
    initialZoom: 13,
    minZoom: 10,
    maxZoom: 18,
    tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
    toast: '#toast'
  },

  CategoryStyles: {
    'היסטוריה': { hexColor: '#E63946', iconClass: 'fa-solid fa-landmark' },
    'תצפית': { hexColor: '#F4A261', iconClass: 'fa-solid fa-binoculars' },
    'פארק': { hexColor: '#2A9D8F', iconClass: 'fa-solid fa-tree' },
    'פנינה נסתרת': { hexColor: '#9C27B0', iconClass: 'fa-solid fa-gem' },
    'שיטוט': { hexColor: '#457B9D', iconClass: 'fa-solid fa-person-walking' },
    'אירוע קיץ': { hexColor: '#FF9800', iconClass: 'fa-solid fa-sun' },
    'אטרקציה/קניות': { hexColor: '#E76F51', iconClass: 'fa-solid fa-bag-shopping' },
    'קניות': { hexColor: '#E76F51', iconClass: 'fa-solid fa-store' },
    'שוק פשפשים': { hexColor: '#8D6E63', iconClass: 'fa-solid fa-shop' },
    'שוק פתוח': { hexColor: '#4CAF50', iconClass: 'fa-solid fa-basket-shopping' },
    'קניונים': { hexColor: '#3F51B5', iconClass: 'fa-solid fa-building-columns' },
    'ספא': { hexColor: '#00BCD4', iconClass: 'fa-solid fa-spa' },
    'רופטופ/מסעדה': { hexColor: '#D81B60', iconClass: 'fa-solid fa-utensils' },
    'יין ומסעדה': { hexColor: '#8E24AA', iconClass: 'fa-solid fa-wine-glass' },
    'מסעדת ישיבה': { hexColor: '#D32F2F', iconClass: 'fa-solid fa-utensils' },
    'מסעדת ערב': { hexColor: '#C2185B', iconClass: 'fa-solid fa-plate-wheat' },
    'פיצה רחוב': { hexColor: '#FF5722', iconClass: 'fa-solid fa-pizza-slice' },
    'כריכים': { hexColor: '#F57C00', iconClass: 'fa-solid fa-bread-slice' },
    'מעדנייה': { hexColor: '#795548', iconClass: 'fa-solid fa-cheese' },
    "פוקאצ'ה": { hexColor: '#FF9800', iconClass: 'fa-solid fa-bread-slice' },
    'פיצריה מהירה': { hexColor: '#FF5722', iconClass: 'fa-solid fa-pizza-slice' },
    'פיצה נאפוליטנית': { hexColor: '#E64A19', iconClass: 'fa-solid fa-pizza-slice' },
    'פיצה אל טאליו': { hexColor: '#F4511E', iconClass: 'fa-solid fa-pizza-slice' },
    'פסטה רחוב': { hexColor: '#FBC02D', iconClass: 'fa-solid fa-bowl-food' },
    'סופלי ומטוגנים': { hexColor: '#FFA000', iconClass: 'fa-solid fa-drumstick-bite' },
    'אוכל רחוב': { hexColor: '#FB8C00', iconClass: 'fa-solid fa-burger' },
    'מאפייה/קינוחים': { hexColor: '#EC407A', iconClass: 'fa-solid fa-cookie' },
    "קפה/בראנץ'": { hexColor: '#6D4C41', iconClass: 'fa-solid fa-mug-saucer' },
    'קינוחים (טירמיסו)': { hexColor: '#AD1457', iconClass: 'fa-solid fa-cake-candles' },
    "ג'לאטו/שוקולד": { hexColor: '#00ACC1', iconClass: 'fa-solid fa-ice-cream' },
    "ג'לאטו": { hexColor: '#00BCD4', iconClass: 'fa-solid fa-ice-cream' },
    'קפה גל שלישי': { hexColor: '#4E342E', iconClass: 'fa-solid fa-mug-hot' },
    'קונדיטוריה': { hexColor: '#D81B60', iconClass: 'fa-solid fa-cake-candles' },
    'פטיסרי צרפתי': { hexColor: '#AB47BC', iconClass: 'fa-solid fa-cookie-bite' },
    'קפה ומאפייה': { hexColor: '#5D4037', iconClass: 'fa-solid fa-mug-saucer' },
    "בראנץ'": { hexColor: '#FFB300', iconClass: 'fa-solid fa-egg' },
    'קפה וקינוחים': { hexColor: '#C2185B', iconClass: 'fa-solid fa-mug-saucer' },
    'בית קפה': { hexColor: '#4E342E', iconClass: 'fa-solid fa-mug-saucer' },
    'קוקטייל בר': { hexColor: '#7B1FA2', iconClass: 'fa-solid fa-martini-glass-citrus' },
    'בר מיקסולוגיה': { hexColor: '#512DA8', iconClass: 'fa-solid fa-martini-glass' },
    "לאונג' קיץ": { hexColor: '#1976D2', iconClass: 'fa-solid fa-umbrella-beach' },
    'בר ומוזיקה': { hexColor: '#303F9F', iconClass: 'fa-solid fa-music' },
    'בר רופטופ': { hexColor: '#7B1FA2', iconClass: 'fa-solid fa-glass-water' },
    'בר בוטני': { hexColor: '#388E3C', iconClass: 'fa-solid fa-seedling' },
    'בר יין/טבעי': { hexColor: '#6A1B9A', iconClass: 'fa-solid fa-wine-bottle' },
    'פאב מקומי': { hexColor: '#F57C00', iconClass: 'fa-solid fa-beer-mug-empty' },
    'סושי בר': { hexColor: '#0097A7', iconClass: 'fa-solid fa-fish' },
    'default': { hexColor: '#E63946', iconClass: 'fa-solid fa-location-dot' }
  }
};
