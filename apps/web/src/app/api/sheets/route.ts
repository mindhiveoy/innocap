/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import credentials from '@/utils/innocap-f5563b67295e.json';
import { SPECIAL_INDICATORS, type Indicator, type BarChartData, type MarkerData } from '@repo/ui/types/indicators';
import { updateFirebaseData } from '@/utils/firebaseOperations';

const SPREADSHEET_ID = '1gWZkBQ0LV9-u59B_BUTt0FuWSBo2FTW_-WZTMEhn-Jg';

const serviceAccountAuth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getAuthenticatedDoc() {
  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('Error in getAuthenticatedDoc:', error);
    throw error;
  }
}

const naturaIndicator: Indicator = {
  id: SPECIAL_INDICATORS.NATURA_2000,
  category: 'Green',
  group: 'Protected Areas',
  groupFI: 'Suojelualueet',
  indicatorNameEn: 'Natura 2000 areas',
  indicatorNameFi: 'Natura 2000 -suojelualueet',
  indicatorType: 'Natura',
  indicatorTypeIcon: 'Terrain',
  iconName: 'Forest',
  color: '#155415',
  sourceEn: 'Finnish Environment Institute (SYKE)',
  sourceFi: 'Suomen ympäristökeskus (SYKE)',
  sourceUrl: 'https://paikkatiedot.ymparisto.fi',
  showOnMap: 'true'
} as const;

// Shared function to fetch and process data
async function fetchAndProcessData() {
  const doc = await getAuthenticatedDoc();

  // Get all required sheets
  const indicatorsSheet = doc.sheetsByTitle['Indicators'];
  const municipalityDataSheet = doc.sheetsByTitle['Municipality Level Data'];
  const markerDataSheet = doc.sheetsByTitle['Marker'];
  const barChartSheet = doc.sheetsByTitle['Bar Chart'];

  if (!indicatorsSheet || !municipalityDataSheet) {
    throw new Error('Required sheets not found');
  }

  // Fetch all data in parallel
  const [indicatorRows, municipalityRows, markerRows, barChartRows] = await Promise.all([
    indicatorsSheet.getRows(),
    municipalityDataSheet.getRows(),
    markerDataSheet?.getRows() || Promise.resolve([]),
    barChartSheet?.getRows() || Promise.resolve([]),
  ]);

  // Process all data
  const sheetIndicators = processIndicatorRows(indicatorRows);
  const filteredIndicators = sheetIndicators.filter(
    indicator => indicator.id !== SPECIAL_INDICATORS.NATURA_2000
  );
  const allIndicators = [naturaIndicator, ...filteredIndicators];

  const municipalityData = processMunicipalityRows(municipalityRows);
  const markerData = markerRows.length > 0 ? processMarkerRows(markerRows) : [];
  const barChartData = processBarChartRows(barChartRows);

  return {
    indicators: allIndicators,
    municipalityLevelData: municipalityData,
    markerData: markerData,
    barChartData: barChartData
  };
}

// Regular GET endpoint for UI
export async function GET() {
  try {
    const data = await fetchAndProcessData();

    // Return in the format expected by the UI
    return NextResponse.json({
      indicators: data.indicators,
      data: {
        'Municipality Level Data': data.municipalityLevelData,
        'Marker': data.markerData,
        'Bar Chart': data.barChartData
      }
    });
  } catch (error: any) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint for cron job
export async function POST() {
  try {
    const startTime = new Date().toISOString();
    console.log('Starting scheduled data update:', startTime);

    const data = await fetchAndProcessData();

    // Log some stats before update
    console.log('Data to be updated:', {
      indicators: data.indicators.length,
      municipalityData: data.municipalityLevelData.length,
      markerData: data.markerData.length,
      barChartData: data.barChartData.length
    });

    await updateFirebaseData(data);

    console.log('Scheduled data update completed:', new Date().toISOString());
    return NextResponse.json({
      status: 200,
      message: 'Data update completed successfully',
      startTime,
      endTime: new Date().toISOString(),
      dataCounts: {
        indicators: data.indicators.length,
        municipalityData: data.municipalityLevelData.length,
        markerData: data.markerData.length,
        barChartData: data.barChartData.length
      }
    });
  } catch (error) {
    console.error('Scheduled update failed:', error);
    return NextResponse.json(
      {
        status: 500,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function processBarChartRows(rows: any[]): BarChartData[] {
  // Group data by municipality and indicator
  const groupedData = rows.reduce((acc, row) => {
    const [
      id,
      indicatorNameEn,
      descriptionEn,
      descriptionFi,
      label,
      labelFi,
      municipalityName,
      municipalityCode,
      year,
      value,
      unit
    ] = row._rawData;

    const key = `${id}-${municipalityCode}-${year}`;

    if (!acc[key]) {
      acc[key] = {
        id,
        indicatorNameEn,
        descriptionEn,
        descriptionFi,
        municipalityName,
        municipalityCode,
        year: parseInt(year),
        unit,
        labels: [],
        labelsFi: [],
        values: [],
      };
    }

    acc[key].labels.push(label);
    acc[key].labelsFi.push(labelFi);
    acc[key].values.push(parseFloat(value.replace(',', '.')));

    return acc;
  }, {} as Record<string, BarChartData>);

  return Object.values(groupedData);
}

function processIndicatorRows(rows: any[]) {
  return rows.map(row => {
    const [
      id,
      indicatorNameEn,
      indicatorNameFi,
      category,
      indicatorType,
      indicatorTypeIcon,
      color,
      sourceEn,
      sourceFi,
      showOnMap,
      iconName,
      group,
      groupFI
    ] = row._rawData;

    return {
      id,
      indicatorNameEn,
      indicatorNameFi,
      category,
      indicatorType,
      indicatorTypeIcon,
      color,
      sourceEn,
      sourceFi,
      showOnMap,
      iconName,
      group,
      groupFI
    };
  });
}

function processMunicipalityRows(rows: any[]) {
  return rows.map(row => {
    const [
      id,
      indicatorNameEn,
      descriptionEn,
      descriptionFi,
      municipalityName,
      municipalityCode,
      year,
      value,
      unit
    ] = row._rawData;

    return {
      id,
      indicatorNameEn,
      descriptionEn,
      descriptionFi,
      municipalityName,
      municipalityCode,
      year: parseInt(year),
      value: parseFloat(value.replace(',', '.')),
      unit
    };
  });
}

function processMarkerRows(rows: any[]): MarkerData[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  return rows
    .map(row => {
      if (!row?._rawData) return undefined;

      const [
        id,
        indicatorNameEn,
        descriptionEn,
        descriptionFi,
        municipalityName,
        municipalityCode,
        year,
        value,
        unit,
        location,
        theme,
        markerIcon,
        phase,
        sourceUrl,
        info
      ] = row._rawData;

      // Handle case where location is empty or invalid
      let coordinates: [number, number] = [0, 0];
      if (location && typeof location === 'string') {
        const [latitude, longitude] = location.split(',').map((coord: string) => parseFloat(coord.trim()));
        if (!isNaN(latitude) && !isNaN(longitude)) {
          coordinates = [latitude, longitude];
        }
      }

      return {
        id,
        indicatorNameEn,
        descriptionEn,
        descriptionFi,
        municipalityName,
        municipalityCode,
        year: parseInt(year) || 0,
        value: parseFloat(value?.replace(',', '.')) || 0,
        unit,
        location: coordinates,
        theme: theme || '',
        markerIcon: markerIcon || '',
        phase: phase || '',
        sourceUrl: sourceUrl || '',
        info: info || ''
      } as MarkerData;
    })
    .filter((marker): marker is MarkerData => marker !== undefined);
} 