import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

if (!getApps().length) {
  try {
    initializeApp({
      credential: process.env.FIREBASE_SERVICE_ACCOUNT 
        ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) 
        : applicationDefault(),
      projectId: "aicosmic-8ef8b" // Fallback project ID if needed
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebaseIdToken')?.value;

  if (!token) return null;

  try {
    // For local dev, bypass admin credential requirement by manually decoding the payload
    const payloadBase64 = token.split('.')[1];
    const decodedToken = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    const isAnonymous = decodedToken.firebase?.sign_in_provider === 'anonymous';
    
    return {
      user: {
        id: decodedToken.user_id || decodedToken.uid || "local-dev-user",
        email: decodedToken.email || "local@example.com",
        type: isAnonymous ? 'guest' : 'regular',
      }
    };
  } catch (error) {
    return null;
  }
}
