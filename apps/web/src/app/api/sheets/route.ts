/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import credentials from '@/utils/innocap-f5563b67295e.json';
import { SPECIAL_INDICATORS, type Indicator } from '@repo/ui/types/indicators';

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

export async function GET() {
  try {
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
    const [indicatorRows, municipalityRows, barChartRows] = await Promise.all([
      indicatorsSheet.getRows(),
      municipalityDataSheet.getRows(),
      barChartSheet?.getRows() || Promise.resolve([]),
    ]);

    // Process all data
    const sheetIndicators = processIndicatorRows(indicatorRows);

    // Filter out any existing Natura indicators from sheet data
    const filteredIndicators = sheetIndicators.filter(
      indicator => indicator.id !== SPECIAL_INDICATORS.NATURA_2000
    );

    // Combine indicators with Natura always first
    const allIndicators = [naturaIndicator, ...filteredIndicators];

    const municipalityData = processMunicipalityRows(municipalityRows);
    const markerData = markerDataSheet ? await processMarkerRows(await markerDataSheet.getRows()) : [];
    const barChartData = processBarChartRows(barChartRows);

    const response = {
      indicators: allIndicators,
      data: {
        'Municipality Level Data': municipalityData,
        'Marker': markerData,
        'Bar Chart': barChartData
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}

function processBarChartRows(rows: any[]) {
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
  }, {});

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

function processMarkerRows(rows: any[]) {
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
      unit,
      location,
      theme,
      markerIcon,
      phase,
      sourceUrl,
      info
    ] = row._rawData;

    const [latitude, longitude] = location.split(',').map((coord: string) => parseFloat(coord.trim()));

    return {
      id,
      indicatorNameEn,
      descriptionEn,
      descriptionFi,
      municipalityName,
      municipalityCode,
      year: parseInt(year),
      value: parseFloat(value.replace(',', '.')),
      unit,
      location: [latitude, longitude] as [number, number],
      theme,
      markerIcon,
      phase,
      sourceUrl,
      info
    };
  });
} 