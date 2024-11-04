import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import credentials from '@/utils/innocap-f5563b67295e.json';

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
    const indicatorsSheet = doc.sheetsByTitle['Indicators'];
    const dataSheet = doc.sheetsByTitle['Municipality Level Data'];

    if (!indicatorsSheet || !dataSheet) {
      console.error('Sheets not found. Available sheets:', Object.keys(doc.sheetsByTitle));
      throw new Error('Required sheets not found');
    }

    const [indicatorRows, dataRows] = await Promise.all([
      indicatorsSheet.getRows(),
      dataSheet.getRows(),
    ]);

    const indicators = indicatorRows.map(row => {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] = (row as any)._rawData as string[];

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

    const data = dataRows.map(row => {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] = (row as any)._rawData as string[];

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

    return NextResponse.json({ indicators, data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Detailed error in GET:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch data',
        details: error.message
      },
      { status: 500 }
    );
  }
} 