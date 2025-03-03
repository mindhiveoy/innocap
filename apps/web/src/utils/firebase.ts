import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAyxlnu6wKAjzrqDNEhRQ3e3st2okPM6us",
  authDomain: "innocap-d56a0.firebaseapp.com",
  projectId: "innocap-d56a0",
  storageBucket: "innocap-d56a0.firebasestorage.app",
  messagingSenderId: "678821301815",
  appId: "1:678821301815:web:470f9b2094d6f3198bb9b2"
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Collection references
export const COLLECTIONS = {
  INDICATORS: 'indicators',
  MUNICIPALITY_DATA: 'municipalityLevelData',
  MARKER_DATA: 'markerData',
  BAR_CHART_DATA: 'barChartData',
  METADATA: 'metadata',
  FEATURES: 'features'
} as const;