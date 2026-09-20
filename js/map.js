/**
 * Leaflet Map Controller Module - Phase 3 (Normalized Schema + Booked Filter + Scale)
 */
import { CONFIG } from './config.js';
import { formatBookingDateHebrew } from './date.js';
import { createScaleControl } from './scale.js';

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

  // Dynamic scale bar with walking-time estimate (bottom-right)
  createScaleControl(map);

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
 * Renders location markers dynamically based on the current filter state.
 * Rebuilds markers from the pristine original places array.
 * @param {Array<import('./config.js').Place>|null} places - Places list (stored on first call).
 * @param {import('./config.js').FilterState|null} filterState - Active category ids + bookedOnly flag.
 */
export function renderMarkers(places = null, filterState = null) {
  if (!map || !markersGroup) return;

  // Store pristine copy of places on initial load
  if (places && Array.isArray(places) && places.length > 0) {
    pristinePlacesData = places;
  }

  const placesToRender = pristinePlacesData;
  if (!placesToRender || placesToRender.length === 0) return;

  // Normalize filter inputs
  const activeCategoryIds = filterState && filterState.activeCategoryIds
    ? filterState.activeCategoryIds
    : null;
  const bookedOnly = !!(filterState && filterState.bookedOnly);

  // Completely clear layer & marker dictionary
  markersGroup.clearLayers();
  markerMap.clear();

  placesToRender.forEach(place => {
    if (!place.coordinates || (place.coordinates.lat === 0 && place.coordinates.lng === 0)) {
      return; // Skip invalid 0,0 coordinates
    }

    const catIdNum = Number(place.categoryId) || 1;
    const isBooked = place.bookingDate != null;

    // Category filter (numeric Set; tolerate string entries defensively)
    if (activeCategoryIds) {
      const isCategoryActive = activeCategoryIds.has(catIdNum)
        || activeCategoryIds.has(String(catIdNum));
      if (!isCategoryActive) return;
    }

    // Booked-only filter
    if (bookedOnly && !isBooked) return;

    const lat = place.coordinates.lat;
    const lng = place.coordinates.lng;
    const categoryObj = CONFIG.Categories[String(catIdNum)] || CONFIG.Categories["1"];

    // Custom DivIcon marker (Waze-style premium pin); booked places get a highlight ring
    const customIcon = L.divIcon({
      className: `custom-map-pin${isBooked ? ' is-booked' : ''}`,
      html: `
        <div class="pin-bubble" style="background-color: ${categoryObj.color}">
          <i class="${categoryObj.icon}"></i>
        </div>
        <div class="pin-arrow" style="border-top-color: ${categoryObj.color}"></div>
        ${isBooked ? '<div class="pin-booked-badge"><i class="fa-solid fa-calendar-check"></i></div>' : ''}
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

    // Reservation status label + Hebrew booking date
    const reservationLabel = CONFIG.RESERVATION_UI_MAP[place.reservationId] || '';
    const bookingDateText = formatBookingDateHebrew(place.bookingDate);

    // Generate Rich Popup Content HTML
    const popupContent = `
      <div class="place-popup${isBooked ? ' is-booked' : ''}">
        <div class="popup-header">
          <h3 class="popup-title">${place.title}</h3>
          <span class="popup-rating"><i class="fa-solid fa-star"></i> ${place.rating || 'N/A'}</span>
        </div>

        <div class="popup-badges">
          <span class="popup-badge category-badge" style="background-color: ${categoryObj.color}15; color: ${categoryObj.color}; border: 1px solid ${categoryObj.color}40;">
            <i class="${categoryObj.icon}"></i> ${categoryObj.name}
          </span>
          ${reservationLabel ? `<span class="popup-badge reservation-badge"><i class="fa-regular fa-calendar-check"></i> ${reservationLabel}</span>` : ''}
        </div>

        ${bookingDateText ? `
          <div class="popup-field booked-field">
            <i class="fa-solid fa-calendar-check"></i>
            <span><strong>מועד שהוזמן:</strong> ${bookingDateText}</span>
          </div>
        ` : ''}

        ${place.notes ? `
          <div class="popup-field notes-field">
            <i class="fa-solid fa-circle-info"></i>
            <span>${place.notes}</span>
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
  const item = markerMap.get(Number(placeId));
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
