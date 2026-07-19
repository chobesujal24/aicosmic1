import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9yfix1dtipa8sXIjQ-DoZF9rtfuaiz2Y",
  authDomain: "aicosmic-8ef8b.firebaseapp.com",
  projectId: "aicosmic-8ef8b",
  storageBucket: "aicosmic-8ef8b.firebasestorage.app",
  messagingSenderId: "374562981776",
  appId: "1:374562981776:web:fb790fd4b6dae5360b9515",
  measurementId: "G-51CH2250SM",
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Only initialize client SDKs on the browser to avoid SSR WebSocket crashes on Vercel
const isClient = typeof window !== "undefined";

export const firebaseAuth = isClient ? getAuth(app) : ({} as any);
export const firebaseDb = getFirestore(app);
export const googleProvider = isClient ? new GoogleAuthProvider() : ({} as any);
export const githubProvider = isClient ? new GithubAuthProvider() : ({} as any);

// Admin emails - only these accounts can see the admin panel
export const ADMIN_EMAILS = [
  "chobesujal24@gmail.com",
  "sujalchobe@gmail.com",
];

export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some(
    (adminEmail) => email.toLowerCase() === adminEmail.toLowerCase()
  );
}
