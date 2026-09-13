/**
 * Leaflet Map Controller Module
 */
import { CONFIG } from './config.js';

let map = null;
let markersGroup = null;
let userMarker = null;

/**
 * Initializes the Leaflet map instance.
 * @param {string} containerId - DOM ID of map container
 */
export function initMap(containerId = 'map') {
  const { defaultCenter, initialZoom, minZoom, maxZoom, tileLayerUrl, tileAttribution } = CONFIG.MapSettings;

  map = L.map(containerId, {
    center: defaultCenter,
    zoom: initialZoom,
    minZoom: minZoom,
    maxZoom: maxZoom,
    zoomControl: false // Custom placement in UI if needed
  });

  // Add standard tile layer (OSM)
  L.tileLayer(tileLayerUrl, {
    attribution: tileAttribution,
    maxZoom: maxZoom
  }).addTo(map);

  // Position zoom control top-right to avoid mobile header collision
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Layer group for dynamic markers
  markersGroup = L.layerGroup().addTo(map);

  return map;
}

/**
 * Renders location markers dynamically based on active category filters.
 * @param {Array} places - Parsed list of places from places.json
 * @param {Set|Array} activeCategories - Set or array of allowed category names
 */
export function renderMarkers(places = [], activeCategories = null) {
  if (!map || !markersGroup) return;

  markersGroup.clearLayers();

  const bounds = [];

  // Filter places dynamically based on active categories
  const filteredPlaces = places.filter(place => {
    if (!place.coordinates || (place.coordinates.lat === 0 && place.coordinates.lng === 0)) {
      return false; // Skip invalid 0,0 coordinates
    }
    if (!activeCategories) return true;
    return activeCategories.has ? activeCategories.has(place.category) : activeCategories.includes(place.category);
  });

  filteredPlaces.forEach(place => {
    const lat = place.coordinates.lat;
    const lng = place.coordinates.lng;
    bounds.push([lat, lng]);

    const style = CONFIG.CategoryStyles[place.category] || CONFIG.CategoryStyles['default'];

    // Custom DivIcon marker (Waze-style pin)
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="pin-bubble" style="background-color: ${style.hexColor}">
          <i class="${style.iconClass}"></i>
        </div>
        <div class="pin-arrow" style="border-top-color: ${style.hexColor}"></div>
      `,
      iconSize: [38, 48],
      iconAnchor: [19, 48],
      popupAnchor: [0, -44]
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    // Generate Popup Content HTML
    const popupContent = `
      <div class="place-popup">
        <div class="popup-header">
          <h3 class="popup-title">${place.title}</h3>
          <span class="popup-rating"><i class="fa-solid fa-star"></i> ${place.rating || 'N/A'}</span>
        </div>
        
        <div class="popup-badges">
          <span class="popup-badge category-badge" style="background-color: ${style.hexColor}15; color: ${style.hexColor}; border: 1px solid ${style.hexColor}40;">
            <i class="${style.iconClass}"></i> ${place.category}
          </span>
          ${place.atmosphere ? `<span class="popup-badge atmosphere-badge"><i class="fa-solid fa-face-smile"></i> ${place.atmosphere}</span>` : ''}
        </div>

        ${place.reservation ? `
          <div class="popup-field reservation-field">
            <i class="fa-regular fa-calendar-check"></i>
            <span><strong>הזמנה:</strong> ${place.reservation}</span>
          </div>
        ` : ''}

        ${place.notes ? `
          <div class="popup-field notes-field">
            <i class="fa-solid fa-circle-info"></i>
            <span>${place.notes}</span>
          </div>
        ` : ''}

        ${place.tags && place.tags.length ? `
          <div class="popup-tags">
            ${place.tags.map(t => `<span class="tag-item">#${t}</span>`).join('')}
          </div>
        ` : ''}

        <a href="${place.gmapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="popup-nav-btn">
          <i class="fa-solid fa-diamond-turn-right"></i> ניווט ב-Google Maps
        </a>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'waze-leaflet-popup'
    });

    markersGroup.addLayer(marker);
  });

  // Dynamic Auto-Fit Bounds
  if (bounds.length > 0) {
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16
    });
  }
}

/**
 * Triggers user geolocation with explicit error handling.
 * @param {Function} onError - Callback when geolocation permission or signal fails
 */
export function locateUser(onError) {
  if (!map) return;

  if (!('geolocation' in navigator)) {
    if (onError) onError('הדפדפן שלך אינו תומך בשירותי מיקום');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (!userMarker) {
        // Create pulsing blue location dot
        const userIcon = L.divIcon({
          className: 'user-location-pin',
          html: `
            <div class="user-pulse"></div>
            <div class="user-dot"></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        userMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        userMarker.setLatLng([latitude, longitude]);
      }

      map.setView([latitude, longitude], 16, { animate: true });
    },
    (error) => {
      console.warn('Geolocation failed:', error);
      let userMsg = 'לא ניתן לאתר את מיקומך';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          userMsg = 'הרשאת המיקום נדחתה. נא לאשר גישה למיקום בהגדרות הדפדפן';
          break;
        case error.POSITION_UNAVAILABLE:
          userMsg = 'מידע המיקום אינו זמין כעת';
          break;
        case error.TIMEOUT:
          userMsg = 'זמן ההמתנה לקבלת המיקום פג';
          break;
      }
      if (onError) onError(userMsg);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}
