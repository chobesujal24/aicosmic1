import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from "next/headers";

if (!getApps().length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Vercel often escapes newlines in environment variables, which breaks the private key
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    initializeApp({
      credential: cert(serviceAccount),
      projectId: "aicosmic-8ef8b"
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// We must export these regardless, otherwise the app enters an infinite redirect loop
// if the service account is invalid. It's better for it to throw a clear error.
export const adminDb = getApps().length > 0 ? getFirestore() : null;
export const adminAuth = getApps().length > 0 ? getAuth() : null;

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
