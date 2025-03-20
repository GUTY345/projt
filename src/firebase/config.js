import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDkFpEM_F2ucjEVZFmMJdJ4Ex9jfR1HN4c",
  authDomain: "sparkvibe-new-2025.firebaseapp.com",
  projectId: "sparkvibe-new-2025",
  storageBucket: "sparkvibe-new-2025.firebasestorage.app",
  messagingSenderId: "1076694623803",
  appId: "1:1076694623803:web:921050c933fb4c42cbde1e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Firebase settings
// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
      console.log('The current browser doesn\'t support all of the features required to enable persistence');
    }
});

auth.useDeviceLanguage(); // Set authentication language to device language

// Export Firebase instance
export default app;