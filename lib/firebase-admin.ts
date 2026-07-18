import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

if (!getApps().length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      projectId: "aicosmic-8ef8b" // Fallback project ID if needed
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminDb = process.env.FIREBASE_SERVICE_ACCOUNT ? getFirestore() : null;
export const adminAuth = process.env.FIREBASE_SERVICE_ACCOUNT ? getAuth() : null;

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
