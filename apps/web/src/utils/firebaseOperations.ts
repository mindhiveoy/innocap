import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import type {
  Indicator,
  MunicipalityLevelData,
  MarkerData,
  BarChartData
} from '@repo/ui/types/indicators';

interface FirebaseData {
  indicators: Indicator[];
  municipalityLevelData: MunicipalityLevelData[];
  markerData: MarkerData[];
  barChartData: BarChartData[];
  metadata: {
    lastUpdated: number;
  };
}

export async function updateFirebaseData(data: Omit<FirebaseData, 'metadata'>) {
  try {
    // Validate data structure
    if (!data.indicators || !Array.isArray(data.indicators)) {
      throw new Error('Invalid indicators data structure');
    }
    if (!data.municipalityLevelData || !Array.isArray(data.municipalityLevelData)) {
      throw new Error('Invalid municipalityLevelData data structure');
    }
    if (!data.markerData || !Array.isArray(data.markerData)) {
      throw new Error('Invalid markerData data structure');
    }
    if (!data.barChartData || !Array.isArray(data.barChartData)) {
      throw new Error('Invalid barChartData data structure');
    }

    const batch = writeBatch(db);
    const timestamp = Date.now();

    // Write indicators
    const indicatorsRef = doc(collection(db, COLLECTIONS.INDICATORS), 'latest');
    batch.set(indicatorsRef, { data: data.indicators });

    // Write municipality data
    const municipalityRef = doc(collection(db, COLLECTIONS.MUNICIPALITY_DATA), 'latest');
    batch.set(municipalityRef, { data: data.municipalityLevelData });

    // Write marker data
    const markerRef = doc(collection(db, COLLECTIONS.MARKER_DATA), 'latest');
    batch.set(markerRef, { data: data.markerData });

    // Write bar chart data
    const barChartRef = doc(collection(db, COLLECTIONS.BAR_CHART_DATA), 'latest');
    batch.set(barChartRef, { data: data.barChartData });

    // Write metadata
    const metadataRef = doc(collection(db, COLLECTIONS.METADATA), 'lastUpdate');
    batch.set(metadataRef, { timestamp });

    // Commit the batch
    await batch.commit();
    console.log('Firebase data updated successfully:', new Date(timestamp).toISOString());
  } catch (error) {
    console.error('Error in updateFirebaseData:', error);
    throw error;
  }
}

export async function fetchFirebaseData(): Promise<Omit<FirebaseData, 'metadata'>> {
  const result: Partial<FirebaseData> = {};

  // Fetch data from each collection
  for (const collectionName of Object.values(COLLECTIONS)) {
    if (collectionName === COLLECTIONS.METADATA) continue;

    const latestDoc = await getDocs(collection(db, collectionName));
    const docData = latestDoc.docs[0]?.data();

    // Map collection name to result key
    const key = Object.keys(COLLECTIONS).find(
      k => COLLECTIONS[k as keyof typeof COLLECTIONS] === collectionName
    )?.toLowerCase();

    if (key && docData && 'data' in docData) {
      result[key as keyof Omit<FirebaseData, 'metadata'>] = docData.data;
    }
  }

  return result as Omit<FirebaseData, 'metadata'>;
} 