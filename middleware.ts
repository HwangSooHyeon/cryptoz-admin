import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. 쿠키에서 토큰 꺼내기
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Processing ${pathname}`);
  console.log(`[Middleware] Cookies:`, request.cookies.getAll().map(c => `${c.name}=${c.value}`));

  // --- 로그인 보호 로직 ---
  // 토큰이 없고, 로그인 페이지가 아닌 경우
  if (!token && pathname !== '/login') {
    // API 요청인 경우: 401 반환
    if (pathname.startsWith('/api/')) {
      console.log(`[Middleware] Unauthorized API access: ${pathname}`);
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    // 일반 페이지: 로그인 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 이미 로그인된 상태에서 로그인 페이지 접근 시 메인으로 이동
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. API 요청인 경우, 헤더에 토큰 주입하기
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
      console.log(`[Middleware] Injected Authorization header for ${pathname}`);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // api, _next 등 모든 경로를 포함하되 정적 파일만 제외
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};