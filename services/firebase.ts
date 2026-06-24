import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  Auth,
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

export const FIREBASE_CONFIGURED =
  !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY.trim() !== "";

let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (FIREBASE_CONFIGURED) {
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  let app: FirebaseApp;
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  _auth =
    Platform.OS === "web"
      ? getAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });

  _db = getFirestore(app);
}

export const auth = _auth;
export const db = _db;
