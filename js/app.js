/**
 * Main Application Orchestrator Module - Phase 3
 */
import { fetchPlaces } from './api.js';
import { initMap, renderMarkers, locateUser, flyToAndOpenMarker } from './map.js';
import { initUI, showToast, hideLoader, getFilterState } from './ui.js';
import { loadFilterState } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize Leaflet Map (includes dynamic scale control)
    initMap('map');

    // 2. Fetch Places Data (network-first, offline cache fallback) and persisted filters
    const [places, persistedState] = await Promise.all([
      fetchPlaces(),
      loadFilterState()
    ]);

    // 3. Initialize UI & Event Handlers
    initUI(
      places,
      (filterState) => {
        // Real-time filter callback (categories + bookedOnly)
        renderMarkers(places, filterState);
      },
      () => {
        locateUser((errorMsg) => showToast(errorMsg, 4500));
      },
      (placeId) => {
        flyToAndOpenMarker(placeId);
      },
      persistedState
    );

    // 4. Initial Marker Render using the (possibly hydrated) filter state
    renderMarkers(places, getFilterState());

  } catch (error) {
    console.error('App initialization error:', error);
    showToast('שגיאה בטעינת נתוני המפות. נא לוודא חיבור לרשת ולרענן.', 6000);
  } finally {
    hideLoader();
  }

  // 5. Register Service Worker for Offline PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('ServiceWorker registered with scope:', reg.scope))
        .catch(err => console.warn('ServiceWorker registration failed:', err));
    });
  }
});
