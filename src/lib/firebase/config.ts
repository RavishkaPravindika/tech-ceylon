// Firebase configuration for Tech Ceylon

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern for Next.js)
let app: FirebaseApp;
let auth: Auth;
let db: Database;
let storage: FirebaseStorage;

if (typeof window !== 'undefined') {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
  storage = getStorage(app);
}

// For SSR/SSG contexts, initialize without window check
const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
};

const getFirebaseAuth = (): Auth => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
};

const getFirebaseDB = (): Database => {
  if (!db) {
    db = getDatabase(getFirebaseApp());
  }
  return db;
};

const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
};

export { getFirebaseApp, getFirebaseAuth, getFirebaseDB, getFirebaseStorage };
export { app, auth, db, storage };
