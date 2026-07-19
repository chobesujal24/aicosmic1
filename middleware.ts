import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseIdToken')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token && isLoginPage) {
    // We intentionally do NOT redirect to '/' here.
    // If the server-side auth() verification fails, it redirects the user to /login.
    // If we redirect them back to / here, it creates an infinite redirect loop that crashes the app.
    // Let the client-side AuthProvider handle the redirect if the user is truly authenticated.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
