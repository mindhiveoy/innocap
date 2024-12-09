import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Southern Savo region bounds
const BOUNDS = {
  minLat: 61.15,
  maxLat: 62.75,
  minLon: 26.16,
  maxLon: 29.70
};

/**
 * Validates that a feature object matches the expected Natura 2000 format
 * @param {unknown} feature - The feature to validate
 * @returns {boolean} True if the feature is valid
 */
function isValidNaturaFeature(feature) {
  if (!feature || typeof feature !== 'object') return false;

  if (feature.type !== 'Feature') return false;
  if (!feature.geometry || !Array.isArray(feature.geometry.coordinates)) return false;
  if (!feature.properties || typeof feature.properties !== 'object') return false;

  return true;
}

/**
 * Checks if a feature is within Southern Savo bounds
 * @param {object} feature - The feature to check
 * @returns {boolean} True if the feature is in Southern Savo
 */
function isInSouthernSavo(feature) {
  try {
    // Get the first coordinate point for checking
    // This is simplified - ideally we'd check if any part of the polygon intersects
    const coords = feature.geometry.coordinates[0][0];
    const [lon, lat] = coords;

    return lat >= BOUNDS.minLat &&
      lat <= BOUNDS.maxLat &&
      lon >= BOUNDS.minLon &&
      lon <= BOUNDS.maxLon;
  } catch (error) {
    console.error('Error checking coordinates for feature:', feature.properties?.TUNNUS);
    return false;
  }
}

/**
 * Fetches a URL with retry logic
 * @param {string} url - The URL to fetch
 * @param {number} [retries=3] - Number of retry attempts
 * @returns {Promise<Response>} The fetch response
 */
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;

      console.warn(`Attempt ${i + 1}/${retries} failed with status ${response.status}`);
      if (i === retries - 1) throw new Error(`Failed after ${retries} attempts`);

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Attempt ${i + 1}/${retries} failed:`, error);
    }
  }
  throw new Error('Unreachable');
}

async function fetchNaturaData() {
  try {
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.3.0',
      request: 'GetFeatureInfo',
      layers: 'PS.ProtectedSitesSpecialAreaOfConservation',
      query_layers: 'PS.ProtectedSitesSpecialAreaOfConservation',
      info_format: 'application/json',
      feature_count: '1000',
      i: '50',
      j: '50',
      width: '101',
      height: '101',
      bbox: `${BOUNDS.minLon},${BOUNDS.minLat},${BOUNDS.maxLon},${BOUNDS.maxLat}`,
      crs: 'EPSG:4326'
    });

    const url = `https://paikkatiedot.ymparisto.fi/geoserver/inspire_ps/wms?${params}`;
    console.log('Fetching Natura 2000 sites from:', url);

    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!data || !Array.isArray(data.features)) {
      throw new Error('Invalid response format: missing features array');
    }

    // Filter and validate features
    const filteredFeatures = data.features
      .filter(isValidNaturaFeature)
      .filter(isInSouthernSavo);

    console.log(`Found ${filteredFeatures.length} Natura 2000 sites in Southern Savo`);

    const finalData = {
      type: "FeatureCollection",
      features: filteredFeatures
    };

    // Save the data
    const fileContent = `import type { FeatureCollection } from 'geojson';

// Coordinates are in WGS84 (EPSG:4326) format
// Data fetched from SYKE WMS service for Southern Savo region
// Bounds: ${JSON.stringify(BOUNDS)}
export const naturaAreas = ${JSON.stringify(finalData, null, 2)};`;

    const outputPath = join(__dirname, '../UI Library/src/components/map/data/natura-areas.ts');
    await writeFile(outputPath, fileContent);

    console.log('Natura 2000 data saved successfully to:', outputPath);
    console.log('\nFeatures in Southern Savo:');
    filteredFeatures.forEach(feature => {
      console.log(`- ${feature.properties.KOHDENIMI || feature.properties.TUNNUS}`);
    });

  } catch (error) {
    console.error('Error fetching Natura 2000 data:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

fetchNaturaData();