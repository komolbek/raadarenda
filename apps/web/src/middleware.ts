import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected routes that require authentication.
 * The middleware checks for an auth token in cookies.
 * Client-side AuthGuard provides a secondary check via localStorage/zustand.
 */
const PROTECTED_ROUTES = [
  '/checkout',
  '/profile',
  '/favorites',
  '/orders',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for auth token in cookie (set by client after login)
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/profile/:path*',
    '/favorites/:path*',
    '/orders/:path*',
  ],
};
