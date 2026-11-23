import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Configuración de Firebase leída de variables de entorno públicas.
 * Nunca se escriben valores reales en el código: ver `.env.local.example`.
 *
 * Next.js sustituye `process.env.NEXT_PUBLIC_*` en tiempo de build, por eso
 * cada variable se referencia de forma literal.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Indica si las variables mínimas para usar Auth y Firestore están definidas. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

/**
 * Inicialización perezosa: Firebase solo se inicializa la primera vez que se
 * pide (siempre desde el navegador, en efectos o manejadores de eventos), de
 * modo que el prerender del build no falla aunque las variables estén vacías.
 * `getApps()` evita reinicializar la app (p. ej. con Fast Refresh).
 */
function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase no está configurado: define las variables NEXT_PUBLIC_FIREBASE_* (ver .env.local.example).",
    );
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/** Instancia de Firebase Auth (solo usar en el navegador). */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** Instancia de Firestore (solo usar en el navegador). */
export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
