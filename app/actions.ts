'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// 백엔드 URL (도커 내부망 통신)
const BACKEND_URL = 'http://backend-app:8080'; 

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { message: '아이디와 비밀번호를 입력해주세요.' };
  }

  try {
    // 1. 백엔드로 로그인 요청
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return { message: '로그인 실패: 아이디나 비밀번호를 확인하세요.' };
    }

    const data = await res.json();
    const token = data.accessToken; // 백엔드 응답 필드명에 맞춰 수정 (예: token, accessToken)
    const cookieStore = await cookies();

    // 2. 쿠키에 토큰 저장 (HttpOnly로 보안 강화)
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1일 유지
      path: '/',
    });

  } catch (error) {
    console.error(error);
    return { message: '서버 에러가 발생했습니다.' };
  }

  // 3. 로그인 성공 시 메인으로 이동
  redirect('/');
}

// 로그아웃 액션
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/login');
}