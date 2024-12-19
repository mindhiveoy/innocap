import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile, readFile } from 'fs/promises';
import proj4 from 'proj4';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the coordinate systems
proj4.defs('EPSG:3067', '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');

const BOUNDS = {
  minLat: 61.15,
  maxLat: 62.75,
  minLon: 26.16,
  maxLon: 29.70
};

function isValidFeature(feature) {
  if (!feature || typeof feature !== 'object') return false;
  if (feature.type !== 'Feature') return false;
  if (!feature.geometry || !Array.isArray(feature.geometry.coordinates)) return false;
  if (!feature.properties || typeof feature.properties !== 'object') return false;
  return true;
}

function isInSouthernSavo(feature) {
  try {
    const coordinates = feature.geometry.coordinates[0];
    // Check if any point is within bounds
    return coordinates.some(point => {
      const [lng, lat] = proj4('EPSG:3067', 'EPSG:4326', point);
      return lat >= BOUNDS.minLat &&
             lat <= BOUNDS.maxLat &&
             lng >= BOUNDS.minLon &&
             lng <= BOUNDS.maxLon;
    });
  } catch (error) {
    console.error('Error checking coordinates for feature:', feature.properties?.PERUSLOHKOTUNNUS);
    return false;
  }
}

function simplifyCoordinates(coordinates, area) {
  function reducePoints(points) {
    const length = points.length;
    
    // More aggressive point reduction
    let keepEvery = 3;  // Base case more aggressive
    
    if (length > 100) {
      if (area > 10) keepEvery = 40;       // Very large fields can handle more reduction
      else if (area > 5) keepEvery = 15;   // Large fields
      else if (area > 2) keepEvery = 8;    // Medium fields
      else if (area > 1) keepEvery = 6;    // Small-medium fields
      else keepEvery = 4;                  // Small fields, still be careful
    }

    // For very complex shapes, be even more aggressive
    if (length > 500) {
      keepEvery = Math.min(20, keepEvery * 2);
    }

    const simplified = points.filter((_, index) => {
      // Always keep first and last points
      if (index === 0 || index === length - 1) return true;
      
      // Keep points that form significant angles
      if (index > 0 && index < length - 1) {
        const prev = points[index - 1];
        const curr = points[index];
        const next = points[index + 1];
        const angle = Math.abs(
          Math.atan2(next[1] - curr[1], next[0] - curr[0]) -
          Math.atan2(curr[1] - prev[1], curr[0] - prev[0])
        );
        // Only keep very significant angles (less than 120 degrees)
        if (angle > Math.PI / 3) return true;
      }
      return index % keepEvery === 0;
    });

    // If we removed too many points, add some back
    if (simplified.length < 4) {
      return points.filter((_, i) => i % Math.max(2, Math.floor(keepEvery / 2)) === 0);
    }

    return simplified;
  }

  if (Array.isArray(coordinates[0][0][0])) {
    return coordinates.map(polygon =>
      polygon.map(ring => reducePoints(ring))
    );
  }
  return coordinates.map(ring => reducePoints(ring));
}

async function simplifyLuomupellot() {
  try {
    console.log('Reading luomupellot data...');
    const rawData = await readFile('/Users/paivinykanen/Downloads/luomupellot.geojson', 'utf8');
    const data = JSON.parse(rawData);

    if (!data || !Array.isArray(data.features)) {
      throw new Error('Invalid JSON format: missing features array');
    }

    console.log(`Found ${data.features.length} total features`);
    const originalSize = JSON.stringify(data).length;
    console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    const validFeatures = data.features
      .filter(isValidFeature)
      .filter(isInSouthernSavo);

    console.log(`Valid features in Southern Savo: ${validFeatures.length}`);

    // More aggressive sampling based on area
    const sampledFeatures = validFeatures
      .filter(feature => {
        const area = feature.properties?.PINTA_ALA || 0;
        const id = parseInt(feature.properties?.PERUSLOHKOTUNNUS || '0');
        
        if (area > 2) return true;               // Keep all medium-large fields
        if (area > 1) return true;       // Keep all of 1-2ha fields
        return id % 2 === 0;                     // Keep 50% of smallest fields
      })
      .map(feature => {
        // Simplify properties but keep essential data
        const simplifiedProperties = {
          PERUSLOHKOTUNNUS: feature.properties.PERUSLOHKOTUNNUS,
          PINTA_ALA: Number(feature.properties.PINTA_ALA.toFixed(2)),
          VUOSI: feature.properties.VUOSI
        };

        const coordinates = feature.geometry.coordinates;
        const wgs84Coords = coordinates.map(ring =>
          ring.map(point => {
            const [lon, lat] = proj4('EPSG:3067', 'EPSG:4326', point);
            // Round to 6 decimal places for better precision
            return [Number(lon.toFixed(6)), Number(lat.toFixed(6))];
          })
        );
        
        return {
          type: "Feature",
          properties: simplifiedProperties,
          geometry: {
            type: feature.geometry.type,
            coordinates: simplifyCoordinates(wgs84Coords, simplifiedProperties.PINTA_ALA)
          }
        };
      });

    console.log(`Sampled down to ${sampledFeatures.length} features`);

    const finalData = {
      type: "FeatureCollection",
      features: sampledFeatures
    };

    const newSize = JSON.stringify(finalData).length;
    console.log(`\nFinal size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total reduction: ${((1 - newSize / originalSize) * 100).toFixed(1)}%`);

    const fileContent = `import type { FeatureCollection } from 'geojson';

// Coordinates are in WGS84 (EPSG:4326) format
// Data simplified by keeping every 2nd point
// Sampling: 100% of fields >10ha, 50% of 5-10ha, 25% of 2-5ha, 10% of <2ha
// Bounds: ${JSON.stringify(BOUNDS)}
export const luomupellot: FeatureCollection = ${JSON.stringify(finalData)};`;

    const outputPath = join(__dirname, '../packages/ui/src/components/map/data/luomupellot.ts');
    await writeFile(outputPath, fileContent);
    console.log('\nData saved successfully to:', outputPath);

  } catch (error) {
    console.error('Error processing luomupellot data:', error);
    process.exit(1);
  }
}

simplifyLuomupellot(); 