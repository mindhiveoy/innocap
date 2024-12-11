import { collection, doc, setDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';

export async function initializeFirebaseCollections() {
  try {
    // Initialize each collection with an empty document
    for (const collectionName of Object.values(COLLECTIONS)) {
      const collectionRef = collection(db, collectionName);
      await setDoc(doc(collectionRef, 'latest'), { data: [] });
    }
    console.log('Firebase collections initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase collections:', error);
    throw error;
  }
} 