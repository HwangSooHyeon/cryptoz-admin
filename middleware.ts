import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 쿠키에서 토큰 가져오기
  const token = request.cookies.get('admin_token')?.value;

  // 현재 경로
  const { pathname } = request.nextUrl;

  // 1. 로그인이 안 됐는데 메인 페이지('/') 등 보호된 경로로 가려할 때
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. 이미 로그인했는데 로그인 페이지로 가려할 때
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에 미들웨어 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};