import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAyxlnu6wKAjzrqDNEhRQ3e3st2okPM6us",
  authDomain: "innocap-d56a0.firebaseapp.com",
  projectId: "innocap-d56a0",
  storageBucket: "innocap-d56a0.firebasestorage.app",
  messagingSenderId: "678821301815",
  appId: "1:678821301815:web:470f9b2094d6f3198bb9b2"
};

// Keep the app initialization for future Google Sheets integration
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);