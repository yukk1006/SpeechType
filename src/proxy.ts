import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  let isValidSession = false;

  // Validate the session token by decrypting it, not just checking its existence
  if (sessionToken) {
    try {
      await decrypt(sessionToken);
      isValidSession = true;
    } catch (e) {
      isValidSession = false;
    }
  }

  const path = request.nextUrl.pathname;

  // 1. Protect dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!isValidSession) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session'); // Delete invalid/expired session cookie
      return response;
    }
  }

  // 2. Redirect already-authenticated users away from login/signup
  if (path === '/login' || path === '/signup') {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Root path routing
  if (path === '/') {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const response = NextResponse.next();
  if (sessionToken && !isValidSession) {
    response.cookies.delete('session');
  }
  return response;
}

export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*'],
};
