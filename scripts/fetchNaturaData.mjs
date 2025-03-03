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

function simplifyPolygon(coordinates, tolerance = 0.001) {
  function perpendicularDistance(point, lineStart, lineEnd) {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const area = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
    const bottom = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    return area / bottom;
  }

  function simplifyLine(points, tolerance) {
    if (points.length <= 2) return points;

    let maxDistance = 0;
    let maxIndex = 0;
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > tolerance) {
      const firstHalf = simplifyLine(points.slice(0, maxIndex + 1), tolerance);
      const secondHalf = simplifyLine(points.slice(maxIndex), tolerance);
      return firstHalf.slice(0, -1).concat(secondHalf);
    }

    return [firstPoint, lastPoint];
  }

  // For polygons, ensure the first and last points are identical
  function simplifyRing(ring, tolerance) {
    const simplified = simplifyLine(ring.slice(0, -1), tolerance);
    return [...simplified, simplified[0]]; // Close the ring
  }

  // Handle MultiPolygon vs Polygon
  if (Array.isArray(coordinates[0][0][0])) {
    // MultiPolygon
    return coordinates.map(polygon => {
      return polygon.map(ring => simplifyRing(ring, tolerance));
    });
  } else {
    // Polygon
    return coordinates.map(ring => simplifyRing(ring, tolerance));
  }
}

async function fetchNaturaData() {
  try {
    // replace this with the local file path where the whole finlands natura data json is stored if modification is needed
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

    const simplifiedFeatures = filteredFeatures.map(feature => {
      const originalPoints = JSON.stringify(feature.geometry.coordinates).length;
      const simplified = simplifyPolygon(feature.geometry.coordinates, 0.002); // Adjust tolerance as needed
      const simplifiedPoints = JSON.stringify(simplified).length;

      console.log(`${feature.properties.nimisuomi}:`);
      console.log(`  Points reduced by ${((1 - simplifiedPoints / originalPoints) * 100).toFixed(1)}%`);

      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: simplified
        }
      };
    });

    const finalData = {
      type: "FeatureCollection",
      features: simplifiedFeatures
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
    simplifiedFeatures.forEach(feature => {
      console.log(`- ${feature.properties.KOHDENIMI || feature.properties.TUNNUS}`);
    });

  } catch (error) {
    console.error('Error fetching Natura 2000 data:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

fetchNaturaData();