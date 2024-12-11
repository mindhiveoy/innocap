import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile, readFile } from 'fs/promises';
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
    // Handle MultiPolygon vs Polygon
    const coordinates = feature.geometry.coordinates;

    // Function to check if a point is within bounds
    const isPointInBounds = ([lon, lat]) =>
      lat >= BOUNDS.minLat &&
      lat <= BOUNDS.maxLat &&
      lon >= BOUNDS.minLon &&
      lon <= BOUNDS.maxLon;

    // For MultiPolygon: check each polygon's points
    if (feature.geometry.type === 'MultiPolygon') {
      return coordinates.some(polygon =>
        polygon.some(ring =>
          ring.some(point => isPointInBounds(point))
        )
      );
    }

    // For Polygon: check all points in all rings
    return coordinates.some(ring =>
      ring.some(point => isPointInBounds(point))
    );
  } catch (error) {
    console.error('Error checking coordinates for feature:', feature.properties?.nimisuomi);
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
    // Read from local file
    const rawData = await readFile('/Users/paivinykanen/Downloads/natura/natura_all.json', 'utf8');
    const data = JSON.parse(rawData);

    if (!data || !Array.isArray(data.features)) {
      throw new Error('Invalid JSON format: missing features array');
    }

    const filteredFeatures = data.features
      .filter(isValidNaturaFeature)
      .filter(isInSouthernSavo);

    console.log(`Found ${filteredFeatures.length} Natura 2000 sites in Southern Savo`);
    console.log('Features:');
    filteredFeatures.forEach(f => console.log(`- ${f.properties.nimisuomi}`));

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

    const outputPath = join(__dirname, '../packages/ui/src/components/map/data/natura-areas.ts');
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