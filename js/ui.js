/**
 * UI & Event Management Module - Phase 2 Bug Fixes (Robust Category ID Type Support)
 */
import { CONFIG } from './config.js';

let activeCategoryIds = new Set();
let allPlacesData = [];
let toastTimeout = null;

/**
 * Initializes UI controls, numeric category drawer, search input, FAB buttons.
 * @param {Array} places - Array of places loaded from places.json
 * @param {Function} onFilterChange - Callback when filter selections change
 * @param {Function} onLocateClick - Callback when FAB locate button is tapped
 * @param {Function} onSearchResultSelect - Callback when a search result item is clicked (placeId)
 */
export function initUI(places = [], onFilterChange, onLocateClick, onSearchResultSelect) {
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

  const searchInput = document.querySelector(selectors.searchInput);
  const searchResultsDropdown = document.querySelector(selectors.searchResults);
  const clearSearchBtn = document.querySelector(selectors.clearSearchBtn);

  // Count items per numeric categoryId ("1"-"6")
  const categoryCounts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 };
  places.forEach(p => {
    const catId = String(p.categoryId || "1");
    if (categoryCounts[catId] !== undefined) {
      categoryCounts[catId]++;
    }
  });

  const categoryIds = Object.keys(CONFIG.Categories); // ["1", "2", "3", "4", "5", "6"]
  activeCategoryIds = new Set(categoryIds);

  // Build Category Filter Items in DOM
  if (categoryListContainer) {
    categoryListContainer.innerHTML = categoryIds.map(catId => {
      const catObj = CONFIG.Categories[catId];
      const count = categoryCounts[catId] || 0;
      const safeId = `cat-check-${catId}`;

      return `
        <label class="category-item" for="${safeId}">
          <input type="checkbox" id="${safeId}" value="${catId}" checked class="category-checkbox" />
          <span class="custom-checkbox" style="--check-color: ${catObj.color}"></span>
          <span class="category-icon" style="color: ${catObj.color}">
            <i class="${catObj.icon}"></i>
          </span>
          <span class="category-label">${catObj.name}</span>
          <span class="category-count">${count}</span>
        </label>
      `;
    }).join('');

    // Event binding for real-time checkbox changes
    categoryListContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('category-checkbox')) {
        const catId = e.target.value;
        if (e.target.checked) {
          activeCategoryIds.add(catId);
        } else {
          activeCategoryIds.delete(catId);
        }
        if (onFilterChange) onFilterChange(activeCategoryIds);
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
      categoryIds.forEach(catId => activeCategoryIds.add(catId));
      document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = true);
      if (onFilterChange) onFilterChange(activeCategoryIds);
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      activeCategoryIds.clear();
      document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
      if (onFilterChange) onFilterChange(activeCategoryIds);
    });
  }

  // Geolocation FAB Button
  if (locateBtn && onLocateClick) {
    locateBtn.addEventListener('click', onLocateClick);
  }

  // Live Search Functionality
  if (searchInput && searchResultsDropdown) {
    const handleSearchInput = () => {
      const query = searchInput.value.trim().toLowerCase();

      if (clearSearchBtn) {
        clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';
      }

      if (query.length === 0) {
        searchResultsDropdown.classList.remove('active');
        searchResultsDropdown.innerHTML = '';
        return;
      }

      // Filter places: MUST be active in current category filters first, then match query
      const matches = allPlacesData.filter(place => {
        const catIdStr = String(place.categoryId || "1");
        const catIdNum = Number(place.categoryId) || 1;

        const isCategoryActive = activeCategoryIds.has
          ? (activeCategoryIds.has(catIdStr) || activeCategoryIds.has(catIdNum))
          : (activeCategoryIds.includes(catIdStr) || activeCategoryIds.includes(catIdNum));

        if (!isCategoryActive) return false;

        const titleMatch = (place.title || '').toLowerCase().includes(query);
        const notesMatch = (place.notes || '').toLowerCase().includes(query);
        const categoryMatch = (CONFIG.Categories[place.category].name || '').toLowerCase().includes(query);
        return titleMatch || notesMatch || categoryMatch;
      }).slice(0, 10);

      if (matches.length === 0) {
        searchResultsDropdown.innerHTML = `<div class="search-no-results">לא נמצאו תוצאות עבור "${query}"</div>`;
      } else {
        searchResultsDropdown.innerHTML = matches.map(place => {
          const catIdStr = String(place.categoryId || '1');
          const catObj = CONFIG.Categories[catIdStr] || CONFIG.Categories['1'];
          return `
            <div class="search-result-item" data-place-id="${place.id}">
              <div class="search-item-header">
                <span class="search-item-title">${place.title}</span>
                <span class="search-item-badge" style="color: ${catObj.color}; background-color: ${catObj.color}15;">
                  <i class="${catObj.icon}"></i> ${catObj.name}
                </span>
              </div>
              ${place.notes ? `<div class="search-item-snippet">${place.notes}</div>` : ''}
            </div>
          `;
        }).join('');
      }

      searchResultsDropdown.classList.add('active');
    };

    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchInput);

    // Search Result Click Handling
    searchResultsDropdown.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.search-result-item');
      if (itemEl) {
        const placeId = itemEl.dataset.placeId;
        searchResultsDropdown.classList.remove('active');
        if (onSearchResultSelect) {
          onSearchResultSelect(placeId);
        }
      }
    });

    // Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        searchResultsDropdown.classList.remove('active');
        searchResultsDropdown.innerHTML = '';
      });
    }

    // Close Dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('#search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        searchResultsDropdown.classList.remove('active');
      }
    });
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
