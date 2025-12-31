'use client';

import { useState, useEffect } from 'react';
import { logoutAction } from './actions';

// 리포트 데이터 타입 정의
interface Report {
  id: number;
  title: string;
  summary: string;
  publishedAt: string; // 백엔드에서 주는 날짜 필드명 확인 필요 (보통 createdAt or createdDate)
}

export default function Home() {
  // --- 탭 상태 관리 (write | list) ---
  const [activeTab, setActiveTab] = useState<'write' | 'list'>('write');

  // --- 상태 관리 ---
  const [formData, setFormData] = useState({ title: '', summary: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 메시지 상태 (스낵바용)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 프롬프트 관련 상태
  const [promptText, setPromptText] = useState('');
  const [isFetchingPrompt, setIsFetchingPrompt] = useState(false);

  // --- 리포트 목록 상태 ---
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // --- 핸들러 ---

  // 1. 프롬프트 데이터 가져오기
  const handleFetchPrompt = async () => {
    setIsFetchingPrompt(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/prompt-data`);
      const json = await res.json();
      if (json.success === true) {
        setPromptText(json.data); // 받아온 텍스트 세팅
        return;
      }
      if (json.success === false) {
        setMessage({ text: '데이터를 가져오는데 실패했습니다.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: 'API 호출 중 에러가 발생했습니다.', type: 'error' });
    } finally {
      setIsFetchingPrompt(false);
    }
  };

  // ✅ 클립보드 복사 함수 (HTTP에서도 동작하도록 수정됨)
  const copyToClipboard = async (text: string) => {
    try {
      // 1. 최신 방식 (HTTPS or Localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setMessage({ text: '📋 프롬프트 복사 완료! (API)', type: 'success' });
      } else {
        // 2. 옛날 방식 (HTTP - fallback)
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // 화면 밖으로 보내서 안 보이게 처리
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setMessage({ text: '📋 프롬프트 복사 완료! (HTTP)', type: 'success' });
        } else {
          throw new Error("복사 실패");
        }
      }
    } catch (err) {
      console.error('복사 에러:', err);
      setMessage({ text: '❌ 복사에 실패했습니다.', type: 'error' });
    }
  };

  const handleCopyPrompt = () => {
    if (!promptText) return;
    copyToClipboard(promptText);
  };

  // 3. 폼 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. 리포트 발행 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await response.json();

      if (json.success === true) {
        setMessage({ text: '✅ 리포트 발행 성공!', type: 'success' });
        setFormData({ title: '', summary: '', content: '' });
        return;
      }
      if (json.success === false) {
        setMessage({ text: '❌ 발행 실패', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '❌ 서버 에러', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 리포트 목록 가져오기 (GET)
  const fetchReports = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/v1/reports'); // GET 요청
      const json = await res.json();
      // 백엔드 응답 구조에 따라 수정 필요 (보통 json.data에 리스트가 있음)
      if (json.data) {
        setReports(json.data);
      } else if (Array.isArray(json)) {
        setReports(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingList(false);
    }
  };

  // 탭이 'list'로 바뀔 때마다 데이터 갱신
  useEffect(() => {
    if (activeTab === 'list') {
      fetchReports();
    }
  }, [activeTab]);

  // ✅ 스낵바 자동 닫기 타이머 (3초 후 사라짐)
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000); // 3000ms = 3초
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      {/* ✅ Snackbar (화면 상단 고정 메시지 창) */}
      {message && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-5 duration-300 ${message.type === 'success'
          ? 'bg-indigo-900 text-white border border-indigo-700'
          : 'bg-red-600 text-white border border-red-800'
          }`}>
          <span className="text-lg">{message.type === 'success' ? '✅' : '🚨'}</span>
          <span className="font-medium text-sm sm:text-base">{message.text}</span>
          {/* 닫기 버튼 */}
          <button onClick={() => setMessage(null)} className="ml-4 text-white/70 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">

        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Cryptoz Admin</h1>
          <p className="text-gray-600">AI 리포트 생성 및 관리 시스템</p>

          {/* 로그아웃 버튼 */}
          <form action={logoutAction} className="absolute right-0 top-0">
            <button className="text-sm text-red-500 underline hover:text-red-700">
              로그아웃
            </button>
          </form>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('write')}
            className={`flex-1 py-4 text-center text-sm font-medium ${activeTab === 'write'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            ✏️ 리포트 작성
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-4 text-center text-sm font-medium ${activeTab === 'list'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            📋 리포트 목록 확인
          </button>
        </div>

        {/* 탭 1: 리포트 작성 화면 */}
        {activeTab === 'write' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 프롬프트 영역 */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-indigo-900">🤖 AI 프롬프트 도우미</h2>
                <button
                  onClick={handleFetchPrompt}
                  disabled={isFetchingPrompt}
                  className="text-sm bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition"
                >
                  {isFetchingPrompt ? '로딩 중...' : '최신 데이터 가져오기'}
                </button>
              </div>

              {/* 텍스트 에디터 */}
              <textarea
                readOnly
                value={promptText}
                placeholder="데이터 가져오기 버튼을 누르면 내용이 표시됩니다."
                className="w-full h-24 p-3 text-sm bg-white border border-indigo-200 rounded-lg text-gray-600 font-mono resize-none focus:outline-none"
              />

              {/* ✅ 복사 버튼 (텍스트 영역 아래로 이동 & 비활성화 로직 적용) */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleCopyPrompt}
                  disabled={!promptText} // 데이터 없으면 비활성화
                  className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${promptText
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {/* 아이콘 추가 */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  프롬프트 복사
                </button>
              </div>
            </div>

            {/* 작성 폼 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">리포트 발행</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                    placeholder="제목 입력"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
                  <input
                    type="text"
                    name="summary"
                    required
                    value={formData.summary}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">본문 (HTML)</label>
                  <textarea
                    name="content"
                    required
                    rows={10}
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-black"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white transition ${isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {isLoading ? '발행 중...' : '리포트 발행하기'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 탭 2: 리포트 목록 화면 (New!) */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">등록된 리포트 목록</h2>
              <button onClick={fetchReports} className="text-sm text-indigo-600 hover:text-indigo-800">
                🔄 새로고침
              </button>
            </div>

            {isLoadingList ? (
              <div className="p-10 text-center text-gray-500">로딩 중...</div>
            ) : reports.length === 0 ? (
              <div className="p-10 text-center text-gray-500">등록된 리포트가 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">제목</th>
                      <th className="px-6 py-3">요약</th>
                      <th className="px-6 py-3">등록일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-500 text-sm">#{report.id}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{report.title}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm truncate max-w-xs">{report.summary}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {report.publishedAt || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}