import { cookies } from "next/headers";

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebaseIdToken')?.value;

  if (!token) return null;

  try {
    // Bypass admin credential requirement by manually decoding the payload
    const payloadBase64 = token.split('.')[1];
    
    // Convert base64url to base64 for atob
    let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding because atob is strict
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode base64 to string (Edge compatible, without using Buffer)
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decodedToken = JSON.parse(jsonPayload);
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
