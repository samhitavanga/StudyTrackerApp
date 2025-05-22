import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define which paths are protected (require authentication)
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/log-grades') || 
                           path.startsWith('/settings');
  
  // Define which paths are auth routes (login/register)
  const isAuthRoute = path === '/signin' || path === '/signup';
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If the route is protected and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    // Store the original URL they were trying to access so we can redirect after login
    const url = new URL('/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If they're on an auth route but already logged in, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

// Configure to run middleware only on specific paths
export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. Static files (e.g. /favicon.ico, /images/*)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
