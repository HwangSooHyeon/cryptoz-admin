'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend-app:8080'; 

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { message: '아이디와 비밀번호를 입력해주세요.' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return { message: '로그인 실패: 아이디나 비밀번호를 확인하세요.' };
    }

    const data = await res.json();
    const token = data.accessToken;
    const cookieStore = await cookies();

    // 주의: HTTPS가 아닌 HTTP 환경(로컬/사설망)에서 테스트 중이라면 secure: false여야 함
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24, // 1일 유지
      path: '/',
    });

  } catch (error) {
    console.error(error);
    return { message: '서버 에러가 발생했습니다.' };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/login');
}