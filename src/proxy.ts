import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  let isValidSession = false;

  // 단순히 쿠키 문자가 있는지만 보지 않고, 실제로 유효한 '동작하는' 쿠키인지 암호 해독기로 검사합니다.
  if (sessionToken) {
    try {
      await decrypt(sessionToken);
      isValidSession = true;
    } catch (e) {
      isValidSession = false;
    }
  }

  const path = request.nextUrl.pathname;

  // 1. 대시보드 접근 보호
  if (path.startsWith('/dashboard')) {
    if (!isValidSession) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session'); // 썩은 쿠키면 강제 삭제
      return response;
    }
  }

  // 2. 이미 로그인된 상태에서 로그인/가입창 접근 방지
  if (path === '/login' || path === '/signup') {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. 메인 도메인('/') 라우팅
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
