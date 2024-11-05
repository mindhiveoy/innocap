/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import credentials from '@/utils/innocap-f5563b67295e.json';
import { IndicatorType } from '@repo/ui/types/indicators';

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

export async function GET() {
  try {
    const doc = await getAuthenticatedDoc();

    // Log all available sheets
    console.log("Available sheets:", Object.keys(doc.sheetsByTitle));

    // Get all required sheets
    const indicatorsSheet = doc.sheetsByTitle['Indicators'];
    const municipalityDataSheet = doc.sheetsByTitle['Municipality Level Data'];
    const markerDataSheet = doc.sheetsByTitle['Marker'];

    // Modify the error check to be more informative
    if (!indicatorsSheet || !municipalityDataSheet) {
      throw new Error('Required sheets not found');
    }

    // Fetch all data in parallel for sheets that exist
    const [indicatorRows, municipalityRows] = await Promise.all([
      indicatorsSheet.getRows(),
      municipalityDataSheet.getRows(),
    ]);

    // Process indicators and municipality data
    const indicators = processIndicatorRows(indicatorRows);
    const municipalityData = processMunicipalityRows(municipalityRows);

    // Initialize empty marker data array
    const markerData = markerDataSheet ? await processMarkerRows(await markerDataSheet.getRows()) : [];

    // Combine all data with their types
    const data = {
      [IndicatorType.MunicipalityLevel]: municipalityData,
      [IndicatorType.Marker]: markerData,
    };

    return NextResponse.json({ indicators, data });
  } catch (error: any) {
    console.error('Detailed error in GET:', {
      message: error.message,
      availableSheets: error.doc?.sheetsByTitle ? Object.keys(error.doc.sheetsByTitle) : 'No sheets available'
    });
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}

function processIndicatorRows(rows: any[]) {
  return rows.map(row => {
    const [
      id,
      indicatorNameEn,
      indicatorNameFi,
      category,
      indicatorType,
      color,
      sourceUrl,
      sourceName,
      showOnMap,
      iconName
    ] = row._rawData;

    return {
      id,
      indicatorNameEn,
      indicatorNameFi,
      category,
      indicatorType,
      color,
      sourceUrl,
      sourceName,
      showOnMap,
      iconName
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
      latitude,
      longitude,
      theme,
      markerIcon,
      phase,
      sourceUrl,
      info
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
      unit,
      location: [parseFloat(latitude), parseFloat(longitude)] as [number, number],
      theme,
      markerIcon,
      phase,
      sourceUrl,
      info
    };
  });
} 