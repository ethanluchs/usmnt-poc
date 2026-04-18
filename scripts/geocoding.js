// Geocoding helper using OpenStreetMap Nominatim API
// Provides city-level coordinates for club locations

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'USMNT-POC-Player-Data-Generator/1.0';

// Rate limiting: Nominatim requires max 1 request per second
const RATE_LIMIT_MS = 1000;
let lastRequestTime = 0;

/**
 * Sleep function to respect rate limits
 * @param {number} ms - Milliseconds to sleep
 */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Geocode a city and country to get coordinates
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Promise<{lat: number, lng: number}|null>} - Coordinates or null if not found
 */
async function geocodeCity(city, country) {
  // Respect rate limit
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - timeSinceLastRequest);
  }
  
  try {
    const query = `${city}, ${country}`;
    const url = new URL(`${NOMINATIM_BASE_URL}/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });
    
    lastRequestTime = Date.now();
    
    if (!response.ok) {
      console.error(`Geocoding failed for "${query}": ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`No results found for "${query}"`);
      return null;
    }
    
    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  } catch (error) {
    console.error(`Error geocoding "${city}, ${country}":`, error.message);
    return null;
  }
}

/**
 * Batch geocode multiple locations
 * @param {Array<{city: string, country: string}>} locations - Array of locations to geocode
 * @returns {Promise<Map<string, {lat: number, lng: number}>>} - Map of location keys to coordinates
 */
async function batchGeocode(locations) {
  const results = new Map();
  
  for (const location of locations) {
    const key = `${location.city}, ${location.country}`;
    console.log(`Geocoding: ${key}...`);
    
    const coords = await geocodeCity(location.city, location.country);
    if (coords) {
      results.set(key, coords);
    }
  }
  
  return results;
}

module.exports = {
  geocodeCity,
  batchGeocode,
};
