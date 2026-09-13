/**
 * Leaflet Map Controller Module - Phase 2 Bug Fixes (Robust Category ID Type Support)
 */
import { CONFIG } from './config.js';

let map = null;
let markersGroup = null;
let hotelMarker = null;
let userMarker = null;
let pristinePlacesData = []; // Pristine unmodified copy of all places
const markerMap = new Map(); // Maps place.id -> { marker, coords, place }

/**
 * Initializes the Leaflet map instance centered on Trevi Fountain at zoom 16.
 * @param {string} containerId - DOM ID of map container
 */
export function initMap(containerId = 'map') {
  const { defaultCenter, initialZoom, minZoom, maxZoom, tileLayerUrl, tileAttribution } = CONFIG.MapSettings;

  map = L.map(containerId, {
    center: defaultCenter,
    zoom: initialZoom,
    minZoom: minZoom,
    maxZoom: maxZoom,
    zoomControl: false
  });

  // Add OSM tile layer
  L.tileLayer(tileLayerUrl, {
    attribution: tileAttribution,
    maxZoom: maxZoom
  }).addTo(map);

  // Position zoom control top-right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Layer group for dynamic itinerary markers
  markersGroup = L.layerGroup().addTo(map);

  // Render Gold Glowing Hotel Marker
  renderHotelMarker();

  return map;
}

/**
 * Renders the hardcoded Hotel Star Marker at Trevi Fountain.
 */
function renderHotelMarker() {
  if (!map) return;

  const { coords, title, color, icon } = CONFIG.HotelSettings;

  const hotelIcon = L.divIcon({
    className: 'hotel-marker-pin',
    html: `
      <div class="hotel-pulse"></div>
      <div class="hotel-bubble" style="background-color: ${color}">
        <i class="${icon}"></i>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22]
  });

  hotelMarker = L.marker(coords, { icon: hotelIcon, zIndexOffset: 2000 }).addTo(map);

  const hotelPopup = `
    <div class="hotel-popup">
      <div class="hotel-header">
        <i class="${icon}" style="color: ${color}"></i>
        <strong>${title}</strong>
      </div>
      <p>מיקום מרכזי ליד מזרקת טרווי (Trevi Fountain)</p>
    </div>
  `;

  hotelMarker.bindPopup(hotelPopup, { className: 'waze-leaflet-popup' });
}

/**
 * Renders location markers dynamically based on numeric categoryId filters ("1"-"6").
 * Rebuilds markers from pristine original places array with robust String/Number matching.
 * @param {Array} places - Parsed list of places from places.json (stored on initial call)
 * @param {Set|Array} activeCategoryIds - Set or array of allowed numeric category IDs ("1"-"6")
 */
export function renderMarkers(places = null, activeCategoryIds = null) {
  if (!map || !markersGroup) return;

  // Store pristine copy of places on initial load
  if (places && Array.isArray(places) && places.length > 0) {
    pristinePlacesData = places;
  }

  const placesToRender = pristinePlacesData;
  if (!placesToRender || placesToRender.length === 0) return;

  // Completely clear layer & marker dictionary
  markersGroup.clearLayers();
  markerMap.clear();

  placesToRender.forEach(place => {
    if (!place.coordinates || (place.coordinates.lat === 0 && place.coordinates.lng === 0)) {
      return; // Skip invalid 0,0 coordinates
    }

    const catIdStr = String(place.categoryId || "1");
    const catIdNum = Number(place.categoryId) || 1;

    // Filter check: render only if catIdStr or catIdNum is active
    if (activeCategoryIds) {
      const isCategoryActive = activeCategoryIds.has
        ? (activeCategoryIds.has(catIdStr) || activeCategoryIds.has(catIdNum))
        : (activeCategoryIds.includes(catIdStr) || activeCategoryIds.includes(catIdNum));
      if (!isCategoryActive) return;
    }

    const lat = place.coordinates.lat;
    const lng = place.coordinates.lng;
    const categoryObj = CONFIG.Categories[catIdStr] || CONFIG.Categories["1"];

    // Custom DivIcon marker (Waze-style premium pin)
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="pin-bubble" style="background-color: ${categoryObj.color}">
          <i class="${categoryObj.icon}"></i>
        </div>
        <div class="pin-arrow" style="border-top-color: ${categoryObj.color}"></div>
      `,
      iconSize: [38, 48],
      iconAnchor: [19, 48],
      popupAnchor: [0, -44]
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    // Clean Google Maps URL using Regex
    let cleanGmapsUrl = place.gmapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const urlMatch = cleanGmapsUrl.match(/https?:\/\/[^\s\)\"]+/);
    if (urlMatch) {
      cleanGmapsUrl = urlMatch[0];
    }

    // Generate Rich Popup Content HTML
    const popupContent = `
      <div class="place-popup">
        <div class="popup-header">
          <h3 class="popup-title">${place.title}</h3>
          <span class="popup-rating"><i class="fa-solid fa-star"></i> ${place.rating || 'N/A'}</span>
        </div>
        
        <div class="popup-badges">
          <span class="popup-badge category-badge" style="background-color: ${categoryObj.color}15; color: ${categoryObj.color}; border: 1px solid ${categoryObj.color}40;">
            <i class="${categoryObj.icon}"></i> ${categoryObj.name}
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

        <a href="${cleanGmapsUrl}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="gmaps-nav-btn">
          <i class="fa-solid fa-diamond-turn-right"></i> ניווט ב-Google Maps
        </a>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'waze-leaflet-popup'
    });

    markersGroup.addLayer(marker);

    // Save to map dictionary for search navigation
    markerMap.set(place.id, {
      marker: marker,
      coords: [lat, lng],
      place: place
    });
  });
}

/**
 * Flies to a location smoothly at target zoom 18 using dynamic pixel projection
 * shifting the view Y-axis by -160 pixels to leave room for the popup.
 * @param {string} placeId - ID of place to focus
 */
export function flyToAndOpenMarker(placeId) {
  const item = markerMap.get(placeId);
  if (item && map) {
    const targetZoom = 18;
    const originalLatLng = L.latLng(item.coords[0], item.coords[1]);

    // Convert LatLng to container pixels at the target zoom level
    const targetPoint = map.project(originalLatLng, targetZoom);

    // Subtract 160 pixels from the Y-axis to shift the map view UP
    targetPoint.y -= 160;

    // Convert the adjusted pixel coordinates back to LatLng
    const offsetLatLng = map.unproject(targetPoint, targetZoom);

    map.flyTo(offsetLatLng, targetZoom, { animate: true, duration: 1.2 });

    setTimeout(() => {
      item.marker.openPopup();
    }, 800);
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
        const userIcon = L.divIcon({
          className: 'user-location-pin',
          html: `
            <div class="user-pulse"></div>
            <div class="user-dot"></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        userMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1500 }).addTo(map);
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
