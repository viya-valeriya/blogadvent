import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
export const firebaseReady = requiredKeys.every((k) => Boolean(cfg[k]));

export const appId = import.meta.env.VITE_APP_ID || "blogadvent-v1";

let app = null;
let auth = null;
let db = null;

if (firebaseReady) {
  app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Не падаем: даём приложению жить без Firebase
  console.warn(
    "[Firebase disabled] Missing env vars. Fill .env with Firebase config to enable sync."
  );
}

export { app, auth, db };
