import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. 쿠키에서 토큰 꺼내기
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // --- [수정된 부분] 로그인 보호 로직 ---
  if (!token && pathname !== '/login') {
    // ✅ API 요청인 경우: 리다이렉트 하지 말고 401 JSON 에러를 반환
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // ✅ 일반 페이지 요청인 경우: 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // ---------------------------------

  // 이미 로그인된 상태에서 로그인 페이지 접근 시 메인으로 이동
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. API 요청인 경우, 헤더에 토큰 주입하기
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
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