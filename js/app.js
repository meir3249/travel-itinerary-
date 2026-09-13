/**
 * Main Application Orchestrator Module - Phase 2
 */
import { fetchPlaces } from './api.js';
import { initMap, renderMarkers, locateUser, flyToAndOpenMarker } from './map.js';
import { initUI, showToast, hideLoader } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize Leaflet Map
    initMap('map');

    // 2. Fetch Places Data
    const places = await fetchPlaces();

    // 3. Initialize UI & Event Handlers
    initUI(
      places,
      (activeCategoryIds) => {
        // Real-time filter callback
        renderMarkers(places, activeCategoryIds);
      },
      () => {
        // Locate FAB button click callback
        locateUser((errorMsg) => {
          showToast(errorMsg, 4500);
        });
      },
      (placeId) => {
        // Search result item click callback
        flyToAndOpenMarker(placeId);
      }
    );

    // 4. Initial Marker Render
    renderMarkers(places);

  } catch (error) {
    console.error('App initialization error:', error);
    showToast('שגיאה בטעינת נתוני המפות. נא לוודא חיבור לרשת ולרענן.', 6000);
  } finally {
    // 5. Hide Loader Overlay
    hideLoader();
  }

  // 6. Register Service Worker for Offline PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('ServiceWorker registered with scope:', reg.scope))
        .catch(err => console.warn('ServiceWorker registration failed:', err));
    });
  }
});
