import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. 쿠키에서 토큰 꺼내기 (서버라서 HttpOnly 쿠키도 읽을 수 있음!)
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // --- 기존 로그인 보호 로직 ---
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  // -------------------------

  // ✅ 2. API 요청인 경우, 헤더에 토큰 주입하기
  // (클라이언트가 보낸 요청을 가로채서 헤더를 붙인 뒤 백엔드로 넘겨줍니다)
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    // 수정된 헤더를 포함해서 다음 단계(Rewrite -> 백엔드)로 진행
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};