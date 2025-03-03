import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile } from 'fs/promises';
import { naturaAreas } from './natura-areas.ts';
import { luomupellot } from './luomupellot.ts';
import { municipalityCenters } from './municipality-centers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// run in root with
// node --loader ts-node/esm packages/ui/src/components/map/data/calculate-stats.mjs

// Helper function to calculate distance between two points
function calculateDistance(point1, point2) {
  if (!point1[0] || !point1[1] || !point2[0] || !point2[1]) return Infinity;
  
  // point1 is [lon, lat] from features
  // point2 is [lat, lon] from municipality centers
  const [lon1, lat1] = point1;
  const [lat2, lon2] = point2;
  
  return Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));
}

// Nearest municipality
function findNearestMunicipality(coordinates) {
  if (!coordinates || !coordinates[0]) return "Region";
  
  const referencePoint = coordinates[0];
  let nearestMunicipality = "Region";
  let shortestDistance = Infinity;

  Object.entries(municipalityCenters).forEach(([municipality, center]) => {
    const distance = calculateDistance(referencePoint, center);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestMunicipality = municipality;
    }
  });

  return nearestMunicipality;
}

// Municipality name mapping
const MUNICIPALITY_NAMES = {
  '046': 'Enonkoski',
  '090': 'Heinävesi',
  '097': 'Hirvensalmi',
  '171': 'Joroinen',
  '178': 'Juva',
  '213': 'Kangasniemi',
  '491': 'Mikkeli',
  '507': 'Mäntyharju',
  '588': 'Pertunmaa',
  '593': 'Pieksämäki',
  '623': 'Puumala',
  '681': 'Rantasalmi',
  '740': 'Savonlinna',
  '768': 'Sulkava'
};

// Natura 2000 statistics
function calculateNaturaStats() {
  const municipalities = {};
  let totalArea = 0;
  const siteTypes = new Set();
  const habitatTypes = new Set();

  naturaAreas.features.forEach((feature) => {
    if (!feature.properties || !feature.geometry?.coordinates?.[0]) return;
    
    const area = feature.properties.area_m2 / 10000;
    totalArea += area;
    
    // Extract additional data if available
    if (feature.properties.siteType) siteTypes.add(feature.properties.siteType);
    if (feature.properties.habitatTypes) {
      feature.properties.habitatTypes.forEach(h => habitatTypes.add(h));
    }

    const municipalityCode = findNearestMunicipality(feature.geometry.coordinates[0]);
    const municipalityName = MUNICIPALITY_NAMES[municipalityCode] || municipalityCode;
    
    if (!municipalities[municipalityName]) {
      municipalities[municipalityName] = { count: 0, totalArea: 0 };
    }
    municipalities[municipalityName].count++;
    municipalities[municipalityName].totalArea += area;
  });

  return {
    totalAreas: naturaAreas.features.length,
    totalAreaHectares: Number(totalArea.toFixed(2)),
    averageAreaHectares: Number((totalArea / naturaAreas.features.length).toFixed(2)),
    municipalities,
    siteTypes: Array.from(siteTypes),
    habitatTypes: Array.from(habitatTypes)
  };
}

// Organic Farming statistics
function calculateOrganicStats() {
  const municipalities = {};
  let totalArea = 0;
  const yearlyStats = {};

  luomupellot.features.forEach((feature) => {
    if (!feature.properties || !feature.geometry?.coordinates?.[0]) return;
    
    const area = feature.properties.PINTA_ALA;
    const year = feature.properties.VUOSI;
    totalArea += area;

    // Track yearly statistics
    if (year) {
      if (!yearlyStats[year]) {
        yearlyStats[year] = { count: 0, totalArea: 0 };
      }
      yearlyStats[year].count++;
      yearlyStats[year].totalArea += area;
    }

    const municipalityCode = findNearestMunicipality(feature.geometry.coordinates[0]);
    const municipalityName = MUNICIPALITY_NAMES[municipalityCode] || municipalityCode;
    
    if (!municipalities[municipalityName]) {
      municipalities[municipalityName] = { count: 0, totalArea: 0 };
    }
    municipalities[municipalityName].count++;
    municipalities[municipalityName].totalArea += area;
  });

  return {
    totalFields: luomupellot.features.length,
    totalAreaHectares: Number(totalArea.toFixed(2)),
    averageFieldSize: Number((totalArea / luomupellot.features.length).toFixed(2)),
    municipalities,
    yearlyTrends: yearlyStats
  };
}

// Generate and save stats
const stats = {
  naturaStats: calculateNaturaStats(),
  organicStats: calculateOrganicStats()
};

const outputPath = join(__dirname, 'natura-stats.ts');
const fileContent = `
// Auto-generated statistics from GeoJSON data
export const naturaStats = ${JSON.stringify(stats.naturaStats, null, 2)};

export const organicStats = ${JSON.stringify(stats.organicStats, null, 2)};
`;

writeFile(outputPath, fileContent); 