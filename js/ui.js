/**
 * UI & Event Management Module - Phase 3
 * Normalized numeric schema, Booked-Places tab, offline-persisted filter state.
 */
import { CONFIG } from './config.js';
import { formatBookingDateHebrew } from './date.js';
import { saveFilterState } from './storage.js';

/** @type {import('./config.js').FilterState} */
const filterState = {
  activeCategoryIds: new Set([1, 2, 3, 4, 5, 6]),
  bookedOnly: false
};

let allPlacesData = [];
let toastTimeout = null;
let notifyFilterChange = null;

/**
 * Returns a shallow copy of the live filter state (Set is shared by reference
 * intentionally so map.js reads current selections).
 * @returns {import('./config.js').FilterState}
 */
export function getFilterState() {
  return filterState;
}

/** Persists current filter state (best-effort, async). */
function persist() {
  saveFilterState(filterState).catch(() => {});
}

/** Fires the filter-change callback and persists. */
function emitFilterChange() {
  if (notifyFilterChange) notifyFilterChange(filterState);
  persist();
}

/**
 * Composed visibility predicate used by search (mirrors map.js).
 * @param {import('./config.js').Place} place
 * @returns {boolean}
 */
function isPlaceVisible(place) {
  const catId = Number(place.categoryId) || 1;
  const categoryActive = filterState.activeCategoryIds.has(catId);
  if (!categoryActive) return false;
  if (filterState.bookedOnly && place.bookingDate == null) return false;
  return true;
}

/**
 * Initializes UI controls, category drawer, booked tab, search input, FAB buttons.
 * @param {Array<import('./config.js').Place>} places
 * @param {Function} onFilterChange - Callback(filterState) when selections change.
 * @param {Function} onLocateClick - Callback when FAB locate button is tapped.
 * @param {Function} onSearchResultSelect - Callback(placeId) when a search result is clicked.
 * @param {?import('./config.js').FilterState} [persistedState] - Optional hydrated state.
 */
export function initUI(places = [], onFilterChange, onLocateClick, onSearchResultSelect, persistedState = null) {
  allPlacesData = places;
  notifyFilterChange = onFilterChange;
  const selectors = CONFIG.DOM_Selectors;

  const categoryIds = Object.keys(CONFIG.Categories).map(Number); // [1..6]

  // Hydrate persisted state if valid, else default to all categories on.
  if (persistedState && Array.isArray(persistedState.activeCategoryIds)) {
    filterState.activeCategoryIds = new Set(
      persistedState.activeCategoryIds.map(Number).filter(id => categoryIds.includes(id))
    );
    filterState.bookedOnly = Boolean(persistedState.bookedOnly);
  } else {
    filterState.activeCategoryIds = new Set(categoryIds);
    filterState.bookedOnly = false;
  }

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

  // Count items per numeric categoryId
  const categoryCounts = {};
  categoryIds.forEach(id => { categoryCounts[id] = 0; });
  let bookedCount = 0;
  places.forEach(p => {
    const catId = Number(p.categoryId) || 1;
    if (categoryCounts[catId] !== undefined) categoryCounts[catId]++;
    if (p.bookingDate != null) bookedCount++;
  });

  // Build Category Filter Items in DOM
  if (categoryListContainer) {
    categoryListContainer.innerHTML = categoryIds.map(catId => {
      const catObj = CONFIG.Categories[String(catId)];
      const count = categoryCounts[catId] || 0;
      const safeId = `cat-check-${catId}`;
      const checked = filterState.activeCategoryIds.has(catId) ? 'checked' : '';

      return `
        <label class="category-item" for="${safeId}">
          <input type="checkbox" id="${safeId}" value="${catId}" ${checked} class="category-checkbox" />
          <span class="custom-checkbox" style="--check-color: ${catObj.color}"></span>
          <span class="category-icon" style="color: ${catObj.color}">
            <i class="${catObj.icon}"></i>
          </span>
          <span class="category-label">${catObj.name}</span>
          <span class="category-count">${count}</span>
        </label>
      `;
    }).join('');

    categoryListContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('category-checkbox')) {
        const catId = Number(e.target.value);
        if (e.target.checked) {
          filterState.activeCategoryIds.add(catId);
        } else {
          filterState.activeCategoryIds.delete(catId);
        }
        emitFilterChange();
      }
    });
  }

  // Booked-Places quick-filter tabs (segmented control)
  const bookedTabs = document.querySelectorAll('.booked-tab');
  const syncBookedTabs = () => {
    bookedTabs.forEach(tab => {
      const isBookedTab = tab.dataset.filter === 'booked';
      const isActive = (isBookedTab && filterState.bookedOnly) || (!isBookedTab && !filterState.bookedOnly);
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    });
  };
  if (bookedTabs.length) {
    // Populate booked count badge if present
    const bookedCountEl = document.querySelector('#booked-count');
    if (bookedCountEl) bookedCountEl.textContent = String(bookedCount);

    bookedTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterState.bookedOnly = tab.dataset.filter === 'booked';
        syncBookedTabs();
        emitFilterChange();
      });
    });
    syncBookedTabs();
  }

  // Sync category checkboxes to hydrated state (in case markup default differs)
  document.querySelectorAll('.category-checkbox').forEach(cb => {
    cb.checked = filterState.activeCategoryIds.has(Number(cb.value));
  });

  // Drawer open/close
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
      categoryIds.forEach(catId => filterState.activeCategoryIds.add(catId));
      document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = true);
      emitFilterChange();
    });
  }
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      filterState.activeCategoryIds.clear();
      document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
      emitFilterChange();
    });
  }

  // Geolocation FAB
  if (locateBtn && onLocateClick) {
    locateBtn.addEventListener('click', onLocateClick);
  }

  // Live Search
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

      const matches = allPlacesData.filter(place => {
        if (!isPlaceVisible(place)) return false;
        const catId = Number(place.categoryId) || 1;
        const catObj = CONFIG.Categories[String(catId)] || CONFIG.Categories['1'];
        const titleMatch = (place.title || '').toLowerCase().includes(query);
        const notesMatch = (place.notes || '').toLowerCase().includes(query);
        const categoryMatch = (catObj.name || '').toLowerCase().includes(query);
        return titleMatch || notesMatch || categoryMatch;
      }).slice(0, 10);

      if (matches.length === 0) {
        searchResultsDropdown.innerHTML = `<div class="search-no-results">לא נמצאו תוצאות עבור "${query}"</div>`;
      } else {
        searchResultsDropdown.innerHTML = matches.map(place => {
          const catId = Number(place.categoryId) || 1;
          const catObj = CONFIG.Categories[String(catId)] || CONFIG.Categories['1'];
          const bookingText = formatBookingDateHebrew(place.bookingDate);
          return `
            <div class="search-result-item${place.bookingDate != null ? ' is-booked' : ''}" data-place-id="${place.id}">
              <div class="search-item-header">
                <span class="search-item-title">${place.title}</span>
                <span class="search-item-badge" style="color: ${catObj.color}; background-color: ${catObj.color}15;">
                  <i class="${catObj.icon}"></i> ${catObj.name}
                </span>
              </div>
              ${bookingText ? `<div class="search-item-booked"><i class="fa-solid fa-calendar-check"></i> ${bookingText}</div>` : ''}
              ${place.notes ? `<div class="search-item-snippet">${place.notes}</div>` : ''}
            </div>
          `;
        }).join('');
      }

      searchResultsDropdown.classList.add('active');
    };

    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchInput);

    searchResultsDropdown.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.search-result-item');
      if (itemEl) {
        const placeId = itemEl.dataset.placeId;
        searchResultsDropdown.classList.remove('active');
        if (onSearchResultSelect) onSearchResultSelect(placeId);
      }
    });

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        searchResultsDropdown.classList.remove('active');
        searchResultsDropdown.innerHTML = '';
      });
    }

    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('#search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        searchResultsDropdown.classList.remove('active');
      }
    });
  }

  // Persist the (possibly hydrated) initial state.
  persist();
}

/**
 * Displays a non-intrusive Toast UI message.
 * @param {string} message
 * @param {number} durationMs
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

/** Hides and removes the loader overlay. */
export function hideLoader() {
  const loaderEl = document.querySelector(CONFIG.DOM_Selectors.loader);
  if (!loaderEl) return;

  loaderEl.classList.add('fade-out');
  setTimeout(() => {
    loaderEl.style.display = 'none';
  }, 400);
}
