/**
 * API Data Fetching Module
 * Asynchronously loads places.json data.
 */
export async function fetchPlaces() {
  try {
    const response = await fetch('./data/places.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load places data:', error);
    throw error;
  }
}
