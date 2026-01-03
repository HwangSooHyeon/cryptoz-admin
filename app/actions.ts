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

export async function getPromptDataAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/prompt-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
        if (res.status === 401) return { success: false, message: '인증이 필요합니다.' };
        return { success: false, message: '데이터를 가져오는데 실패했습니다.' };
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return { success: false, message: '서버 에러가 발생했습니다.' };
  }
}

export async function createReportAction(prevState: any, formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    // FormData를 객체로 변환
    const data = {
        title: formData.get('title'),
        summary: formData.get('summary'),
        content: formData.get('content'),
    };

    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(data),
        });

        const json = await res.json();
        return json;
    } catch (error) {
        console.error(error);
        return { success: false, message: '서버 에러가 발생했습니다.' };
    }
}

export async function getReportsAction() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/reports`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            cache: 'no-store', // 항상 최신 데이터
        });
        
        const json = await res.json();
        return json;
    } catch (error) {
        console.error(error);
        return { success: false, message: '목록 조회 실패' };
    }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/login');
}