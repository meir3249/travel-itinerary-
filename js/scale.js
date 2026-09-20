/**
 * Dynamic Map Scale Control (bottom-right).
 *
 * Reads the map's current resolution and renders a scale bar showing a
 * "nice" round distance plus the estimated walking time for that distance.
 *
 * The pure helpers (pickScaleStep, walkingMinutes, formatScaleLabel) are
 * exported separately so they can be unit-tested without Leaflet or the DOM.
 */
import { CONFIG } from './config.js';

/**
 * Estimated walking time in minutes for a given distance.
 * @param {number} meters
 * @returns {number} minutes (not rounded).
 */
export function walkingMinutes(meters) {
  const perMin = CONFIG.Walking.metersPerMinute || 80;
  return meters / perMin;
}

/**
 * Picks the largest "nice" round distance (from CONFIG.ScaleSteps) whose
 * on-screen length does not exceed maxWidthPx.
 * @param {number} metersPerPixel
 * @param {number} maxWidthPx
 * @returns {{ meters: number, widthPx: number }}
 */
export function pickScaleStep(metersPerPixel, maxWidthPx) {
  const steps = CONFIG.ScaleSteps;
  const maxMeters = metersPerPixel * maxWidthPx;

  let chosen = steps[0];
  for (const step of steps) {
    if (step <= maxMeters) {
      chosen = step;
    } else {
      break;
    }
  }
  const widthPx = chosen / metersPerPixel;
  return { meters: chosen, widthPx };
}

/**
 * Formats the scale label in Hebrew.
 * Examples: "100 מ׳ (~1.2 דק׳ הליכה)", "1 ק״מ (~12 דק׳ הליכה)".
 * @param {number} meters
 * @returns {string}
 */
export function formatScaleLabel(meters) {
  const minutes = walkingMinutes(meters);
  const minutesText = minutes < 10
    ? minutes.toFixed(1)
    : String(Math.round(minutes));

  let distanceText;
  if (meters >= 1000) {
    const km = meters / 1000;
    distanceText = `${Number.isInteger(km) ? km : km.toFixed(1)} ק״מ`;
  } else {
    distanceText = `${meters} מ׳`;
  }

  return `${distanceText} (~${minutesText} דק׳ הליכה)`;
}

/**
 * Computes meters-per-pixel at the map center using Leaflet's projection.
 * @param {L.Map} map
 * @returns {number}
 */
function metersPerPixelAtCenter(map) {
  const centerPoint = map.latLngToContainerPoint(map.getCenter());
  const rightPoint = L.point(centerPoint.x + 1, centerPoint.y);
  const centerLatLng = map.containerPointToLatLng(centerPoint);
  const rightLatLng = map.containerPointToLatLng(rightPoint);
  return centerLatLng.distanceTo(rightLatLng); // meters for 1px
}

/**
 * Creates and adds the dynamic scale control to the map.
 * Updates are throttled via requestAnimationFrame and bound to
 * zoom/move end events for smooth, low-cost refreshes.
 * @param {L.Map} map
 * @returns {L.Control}
 */
export function createScaleControl(map) {
  const maxWidthPx = CONFIG.Walking.maxScaleLineWidthPx || 90;

  const ScaleControl = L.Control.extend({
    options: { position: 'bottomright' },

    onAdd() {
      const container = L.DomUtil.create('div', 'map-scale-control');
      container.innerHTML = `
        <div class="map-scale-label"></div>
        <div class="map-scale-line"></div>
      `;
      // Don't let interactions with the widget pan/zoom the map.
      L.DomEvent.disableClickPropagation(container);
      this._label = container.querySelector('.map-scale-label');
      this._line = container.querySelector('.map-scale-line');
      return container;
    },

    update() {
      if (!this._label || !this._line) return;
      const mpp = metersPerPixelAtCenter(map);
      if (!Number.isFinite(mpp) || mpp <= 0) return;

      const { meters, widthPx } = pickScaleStep(mpp, maxWidthPx);
      this._line.style.width = `${Math.round(widthPx)}px`;
      this._label.textContent = formatScaleLabel(meters);
    }
  });

  const control = new ScaleControl();
  control.addTo(map);

  // rAF-throttled updater.
  let rafId = null;
  const scheduleUpdate = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      control.update();
    });
  };

  map.on('zoomend', scheduleUpdate);
  map.on('moveend', scheduleUpdate);
  map.on('move', scheduleUpdate); // smooth updates during drag, throttled by rAF

  // Initial render.
  control.update();

  return control;
}
