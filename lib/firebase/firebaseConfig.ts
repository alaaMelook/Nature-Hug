// Firebase configuration for Nature Hug
// This file initializes Firebase for client-side use

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App (singleton pattern)
let firebaseApp: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
    if (!firebaseApp && getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
    } else if (!firebaseApp) {
        firebaseApp = getApps()[0];
    }
    return firebaseApp;
}

// Get Firebase Messaging instance (only works in browser)
let messagingInstance: Messaging | null = null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
    if (typeof window === "undefined") {
        return null;
    }

    const supported = await isSupported();
    if (!supported) {
        console.warn("Firebase Messaging is not supported in this browser");
        return null;
    }

    if (!messagingInstance) {
        const app = getFirebaseApp();
        messagingInstance = getMessaging(app);
    }

    return messagingInstance;
}

// VAPID Key for Web Push
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
