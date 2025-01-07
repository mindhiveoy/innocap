import { 
  Indicator, 
  MunicipalityLevelData, 
  MarkerData, 
  BarChartData,
  IndicatorType,
  SPECIAL_INDICATORS
} from '@repo/ui/types/indicators';

interface MunicipalityStats {
  count: number;
  totalArea: number;
}

interface NaturaStatsType {
  municipalities: Record<string, MunicipalityStats>;
  totalAreas: number;
  totalAreaHectares: number;
  averageAreaHectares: number;
}

interface OrganicStatsType {
  municipalities: Record<string, MunicipalityStats>;
  totalFields: number;
  totalAreaHectares: number;
  averageFieldSize: number;
}

// Add type assertions when importing
import { 
  naturaStats as naturaStatsImport, 
  organicStats as organicStatsImport 
} from '@repo/ui/components/map/data/natura-stats';

const naturaStats = naturaStatsImport as NaturaStatsType;
const organicStats = organicStatsImport as OrganicStatsType;

interface ProcessedIndicatorData {
  indicator: {
    name: string;
    type: string;
    group: string;
    description?: string;
    unit?: string;
    year?: number;
  };
  summary?: {
    latest: {
      year: number;
      average: number;
      highest: { municipality: string; value: number };
      lowest: { municipality: string; value: number };
    };
    trend?: string; // e.g., "increasing", "decreasing", "stable"
  };
  data: {
    byMunicipality: Record<string, {
      latest?: { value: number; year: number };
      trend?: { 
        values: number[];
        years: number[];
      };
    }>;
  };
}

// Helper to format area nicely
function formatArea(hectares: number): string {
  if (hectares >= 10000) {
    return `${(hectares / 1000).toFixed(1)} thousand hectares`;
  }
  return `${hectares.toFixed(1)} hectares`;
}

// Add type guard
function isNaturaStats(stats: NaturaStatsType | OrganicStatsType): stats is NaturaStatsType {
  return 'totalAreas' in stats;
}

export function processSpecialIndicators(municipalityCode: string) {
  const result: string[] = [];

  // Natura 2000 stats
  const naturaMuniStats = naturaStats.municipalities[municipalityCode];
  if (naturaMuniStats) {
    result.push(
      `This municipality has ${naturaMuniStats.count} Natura 2000 protected areas, ` +
      `covering ${formatArea(naturaMuniStats.totalArea)}.`
    );
  }

  // Organic farming stats
  const organicMuniStats = organicStats.municipalities[municipalityCode];
  if (organicMuniStats) {
    result.push(
      `There are ${organicMuniStats.count} organic fields in this municipality, ` +
      `with a total area of ${formatArea(organicMuniStats.totalArea)}.`
    );
  }

  return result.join(' ');
}

export function processIndicatorData(
  indicator: Indicator | null,
  municipalityData: MunicipalityLevelData[],
  markerData: MarkerData[],
  barChartData: BarChartData[]
): ProcessedIndicatorData | null {
  if (!indicator) return null;

  const baseIndicatorInfo = {
    name: indicator.indicatorNameEn,
    type: indicator.indicatorType,
    group: indicator.group,
  };

  switch (indicator.indicatorType) {
    case IndicatorType.MunicipalityLevel: {
      // Group data by municipality
      const byMunicipality: Record<string, { values: number[]; years: number[] }> = {};
      
      municipalityData
        .filter(d => d.id === indicator.id)
        .forEach(d => {
          if (!byMunicipality[d.municipalityName]) {
            byMunicipality[d.municipalityName] = { values: [], years: [] };
          }
          byMunicipality[d.municipalityName].values.push(d.value);
          byMunicipality[d.municipalityName].years.push(d.year);
        });

      // Process data for each municipality
      const processedData: ProcessedIndicatorData['data']['byMunicipality'] = {};
      let latestYear = 0;
      const latestValues: { municipality: string; value: number }[] = [];

      Object.entries(byMunicipality).forEach(([municipality, data]) => {
        const latestIdx = data.years.indexOf(Math.max(...data.years));
        const latest = {
          value: data.values[latestIdx],
          year: data.years[latestIdx]
        };
        
        latestYear = Math.max(latestYear, latest.year);
        latestValues.push({ municipality, value: latest.value });

        processedData[municipality] = {
          latest,
          trend: {
            values: data.values,
            years: data.years
          }
        };
      });

      // Calculate summary statistics
      const latestYearData = latestValues.filter(d => d.value !== undefined);
      const average = latestYearData.reduce((sum, d) => sum + d.value, 0) / latestYearData.length;
      const highest = latestYearData.reduce((max, d) => d.value > max.value ? d : max);
      const lowest = latestYearData.reduce((min, d) => d.value < min.value ? d : min);

      if (municipalityData.length === 0) return null;

      return {
        indicator: {
          ...baseIndicatorInfo,
          description: municipalityData[0].descriptionEn,
          unit: municipalityData[0].unit,
          year: latestYear,
        },
        summary: {
          latest: {
            year: latestYear,
            average,
            highest,
            lowest,
          },
          trend: calculateTrend(Object.values(byMunicipality).map(d => d.values))
        },
        data: {
          byMunicipality: processedData
        }
      };
    }

    case IndicatorType.Marker: {
      // Special handling for charging stations
      const isChargingStation = indicator.id === 'ELECTRIC_CHARGING';
      
      // Group data by municipality
      const byMunicipality: Record<string, { values: number[]; years: number[]; count?: number }> = {};
      
      markerData
        .filter(d => d.id === indicator.id)
        .forEach(d => {
          if (!byMunicipality[d.municipalityName]) {
            byMunicipality[d.municipalityName] = { 
              values: [], 
              years: [],
              count: 0 
            };
          }
          
          if (isChargingStation) {
            // For charging stations, count the number of locations
            byMunicipality[d.municipalityName].count! += 1;
            byMunicipality[d.municipalityName].values.push(1); // Use 1 for each station
          } else if (typeof d.value === 'number') {
            // Normal case for other markers
            byMunicipality[d.municipalityName].values.push(d.value);
          }
          byMunicipality[d.municipalityName].years.push(d.year || 0);
        });

      const processedData: ProcessedIndicatorData['data']['byMunicipality'] = {};
      let latestYear = 0;
      const latestValues: { municipality: string; value: number }[] = [];

      Object.entries(byMunicipality).forEach(([municipality, data]) => {
        const value = isChargingStation ? data.count! : data.values[data.values.length - 1];
        
        if (value !== undefined) {
          const latest = {
            value,
            year: Math.max(...data.years)
          };
          
          latestYear = Math.max(latestYear, latest.year);
          latestValues.push({ municipality, value });

          processedData[municipality] = {
            latest,
            trend: {
              values: data.values,
              years: data.years
            }
          };
        }
      });

      if (Object.keys(processedData).length === 0) return null;

      const firstMarker = markerData.find(d => d.id === indicator.id);
      if (!firstMarker) return null;

      // Add summary for markers with numerical values
      const summary = latestValues.length > 0 ? {
        latest: {
          year: latestYear,
          average: latestValues.reduce((sum, d) => sum + d.value, 0) / latestValues.length,
          highest: latestValues.reduce((max, d) => d.value > max.value ? d : max),
          lowest: latestValues.reduce((min, d) => d.value < min.value ? d : min)
        },
        trend: calculateTrend(Object.values(byMunicipality).map(d => d.values))
      } : undefined;

      return {
        indicator: {
          ...baseIndicatorInfo,
          description: firstMarker.descriptionEn,
          unit: firstMarker.unit,
          year: latestYear,
        },
        ...(summary && { summary }),
        data: {
          byMunicipality: processedData
        }
      };
    }

    case IndicatorType.BarChart: {
      // Group data by municipality
      const byMunicipality: Record<string, { values: number[][]; years: number[] }> = {};
      
      barChartData
        .filter(d => d.id === indicator.id)
        .forEach(d => {
          if (!byMunicipality[d.municipalityName]) {
            byMunicipality[d.municipalityName] = { values: [], years: [] };
          }
          byMunicipality[d.municipalityName].values.push(d.values);
          byMunicipality[d.municipalityName].years.push(d.year);
        });

      const processedData: ProcessedIndicatorData['data']['byMunicipality'] = {};
      let latestYear = 0;

      Object.entries(byMunicipality).forEach(([municipality, data]) => {
        const latestIdx = data.years.indexOf(Math.max(...data.years));
        const latest = {
          value: data.values[latestIdx][0], // Using first value as representative
          year: data.years[latestIdx]
        };
        
        latestYear = Math.max(latestYear, latest.year);

        processedData[municipality] = {
          latest,
          trend: {
            values: data.values.map(v => v[0]), // Using first value of each year
            years: data.years
          }
        };
      });

      if (Object.keys(processedData).length === 0) return null;

      const firstBarChart = barChartData.find(d => d.id === indicator.id);
      if (!firstBarChart) return null;

      return {
        indicator: {
          ...baseIndicatorInfo,
          description: firstBarChart.descriptionEn,
          unit: firstBarChart.unit,
          year: latestYear,
        },
        data: {
          byMunicipality: processedData
        }
      };
    }

    default:
      return null;
  }
}

function calculateTrend(values: number[][]): string {
  // Simple trend calculation based on average change
  const allValues = values.flat();
  const avgChange = (allValues[allValues.length - 1] - allValues[0]) / (allValues.length - 1);
  if (Math.abs(avgChange) < 0.1) return 'stable';
  return avgChange > 0 ? 'increasing' : 'decreasing';
}

export function processChatData(
  selectedIndicator: Indicator | null,
  selectedMunicipalityData: MunicipalityLevelData[],
  selectedMarkerData: MarkerData[],
  selectedBarChartData: BarChartData[],
  pinnedIndicator: Indicator | null,
  pinnedMunicipalityData: MunicipalityLevelData[],
  pinnedMarkerData: MarkerData[],
  pinnedBarChartData: BarChartData[],
  municipalityCode: string
) {
  // Process special indicators first
  const isNaturaSelected = selectedIndicator?.id === SPECIAL_INDICATORS.NATURA_2000;
  const isNaturaPinned = pinnedIndicator?.id === SPECIAL_INDICATORS.NATURA_2000;
  const isOrganicSelected = selectedIndicator?.id === SPECIAL_INDICATORS.ORGANIC_FARMING;
  const isOrganicPinned = pinnedIndicator?.id === SPECIAL_INDICATORS.ORGANIC_FARMING;

  // Create basic indicator info for special indicators
  const createSpecialIndicatorData = (indicator: Indicator | null, type: 'natura' | 'organic'): ProcessedIndicatorData | null => {
    if (!indicator) return null;

    const stats = type === 'natura' ? naturaStats : organicStats;
    const totalArea = stats.totalAreaHectares;
    const totalCount = isNaturaStats(stats) ? stats.totalAreas : stats.totalFields;

    return {
      indicator: {
        name: indicator.indicatorNameEn,
        type: indicator.indicatorType,
        group: indicator.group,
        description: type === 'natura' 
          ? `Total of ${totalCount} protected areas covering ${totalArea} hectares in the region`
          : `Total of ${totalCount} organic fields covering ${totalArea} hectares in the region`,
        unit: 'hectares'
      },
      summary: {
        latest: {
          year: new Date().getFullYear(),
          average: totalArea / totalCount,
          highest: {
            municipality: Object.entries(stats.municipalities)
              .sort(([,a], [,b]) => b.totalArea - a.totalArea)[0][0],
            value: Object.values(stats.municipalities)
              .sort((a, b) => b.totalArea - a.totalArea)[0].totalArea
          },
          lowest: {
            municipality: Object.entries(stats.municipalities)
              .sort(([,a], [,b]) => a.totalArea - b.totalArea)[0][0],
            value: Object.values(stats.municipalities)
              .sort((a, b) => a.totalArea - b.totalArea)[0].totalArea
          }
        }
      },
      data: {
        byMunicipality: Object.entries(stats.municipalities).reduce((acc, [muni, data]) => ({
          ...acc,
          [muni]: {
            latest: {
              value: data.totalArea,
              year: new Date().getFullYear()
            }
          }
        }), {})
      }
    };
  };

  // Process regular indicators only if they're not special
  const selected = isNaturaSelected 
    ? createSpecialIndicatorData(selectedIndicator, 'natura')
    : isOrganicSelected 
      ? createSpecialIndicatorData(selectedIndicator, 'organic')
      : processIndicatorData(selectedIndicator, selectedMunicipalityData, selectedMarkerData, selectedBarChartData);

  const pinned = isNaturaPinned
    ? createSpecialIndicatorData(pinnedIndicator, 'natura')
    : isOrganicPinned
      ? createSpecialIndicatorData(pinnedIndicator, 'organic')
      : processIndicatorData(pinnedIndicator, pinnedMunicipalityData, pinnedMarkerData, pinnedBarChartData);

  // Generate special stats if needed
  const specialStats = (isNaturaSelected || isNaturaPinned || isOrganicSelected || isOrganicPinned)
    ? processSpecialIndicators(municipalityCode)
    : '';

  return {
    selected,
    pinned,
    specialStats
  };
}