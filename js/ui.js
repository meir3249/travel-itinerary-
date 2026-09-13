/**
 * UI & Event Management Module
 */
import { CONFIG } from './config.js';

let activeCategories = new Set();
let allPlacesData = [];
let toastTimeout = null;

/**
 * Initializes UI controls, category drawer, filter checkboxes, and FAB buttons.
 * @param {Array} places - Array of places loaded from places.json
 * @param {Function} onFilterChange - Callback when filter selections change
 * @param {Function} onLocateClick - Callback when FAB locate button is tapped
 */
export function initUI(places = [], onFilterChange, onLocateClick) {
  allPlacesData = places;
  const selectors = CONFIG.DOM_Selectors;

  const filterBtn = document.querySelector(selectors.filterBtn);
  const filterModal = document.querySelector(selectors.filterModal);
  const filterCloseBtn = document.querySelector(selectors.filterCloseBtn);
  const filterOverlay = document.querySelector(selectors.filterOverlay);
  const categoryListContainer = document.querySelector(selectors.categoryList);
  const selectAllBtn = document.querySelector(selectors.selectAllBtn);
  const deselectAllBtn = document.querySelector(selectors.deselectAllBtn);
  const locateBtn = document.querySelector(selectors.locateBtn);

  // Extract unique categories dynamically and count items per category
  const categoryCounts = {};
  places.forEach(p => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  const categories = Object.keys(categoryCounts).sort();
  activeCategories = new Set(categories);

  // Build Category Filter Items in DOM
  if (categoryListContainer) {
    categoryListContainer.innerHTML = categories.map(cat => {
      const style = CONFIG.CategoryStyles[cat] || CONFIG.CategoryStyles['default'];
      const count = categoryCounts[cat];
      const safeId = `cat-check-${encodeURIComponent(cat).replace(/%/g, '_')}`;

      return `
        <label class="category-item" for="${safeId}">
          <input type="checkbox" id="${safeId}" value="${cat}" checked class="category-checkbox" />
          <span class="custom-checkbox" style="--check-color: ${style.hexColor}"></span>
          <span class="category-icon" style="color: ${style.hexColor}">
            <i class="${style.iconClass}"></i>
          </span>
          <span class="category-label">${cat}</span>
          <span class="category-count">${count}</span>
        </label>
      `;
    }).join('');

    // Event binding for real-time checkbox changes
    categoryListContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('category-checkbox')) {
        const cat = e.target.value;
        if (e.target.checked) {
          activeCategories.add(cat);
        } else {
          activeCategories.delete(cat);
        }
        if (onFilterChange) onFilterChange(activeCategories);
      }
    });
  }

  // Hamburger Toggle Drawer
  const openModal = () => {
    if (filterModal) filterModal.classList.add('active');
    if (filterOverlay) filterOverlay.classList.add('active');
  };

  const closeModal = () => {
    if (filterModal) filterModal.classList.remove('active');
    if (filterOverlay) filterOverlay.classList.remove('active');
  };

  if (filterBtn) filterBtn.addEventListener('click', openModal);
  if (filterCloseBtn) filterCloseBtn.addEventListener('click', closeModal);
  if (filterOverlay) filterOverlay.addEventListener('click', closeModal);

  // Select All / Deselect All
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      categories.forEach(cat => activeCategories.add(cat));
      document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = true);
      if (onFilterChange) onFilterChange(activeCategories);
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      activeCategories.clear();
      document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
      if (onFilterChange) onFilterChange(activeCategories);
    });
  }

  // Geolocation FAB Button
  if (locateBtn && onLocateClick) {
    locateBtn.addEventListener('click', onLocateClick);
  }
}

/**
 * Displays a non-intrusive Toast UI message at bottom of screen.
 * @param {string} message - Message text
 * @param {number} durationMs - Display duration in ms
 */
export function showToast(message, durationMs = 4000) {
  const toastEl = document.querySelector(CONFIG.DOM_Selectors.toast);
  if (!toastEl) return;

  toastEl.textContent = message;
  toastEl.classList.add('visible');

  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, durationMs);
}

/**
 * Hides and removes the loader overlay from DOM.
 */
export function hideLoader() {
  const loaderEl = document.querySelector(CONFIG.DOM_Selectors.loader);
  if (!loaderEl) return;

  loaderEl.classList.add('fade-out');
  setTimeout(() => {
    loaderEl.style.display = 'none';
  }, 400);
}
