'use client';

import { useFormStatus } from 'react-dom';
import { loginAction } from '../actions';
import { useActionState } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className={`w-full py-3 px-4 rounded-lg text-white font-bold transition ${pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
        >
            {pending ? '로그인 중...' : '로그인'}
        </button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(loginAction, { message: '' });

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
                    <p className="text-gray-500 text-sm mt-2">관리자 계정으로 접속하세요</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.message && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md text-center">
                            {state.message}
                        </div>
                    )}

                    <SubmitButton />
                </form>
            </div>
        </main>
    );
}