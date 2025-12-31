'use client';

import { useState } from 'react';

export default function Home() {
  // --- 상태 관리 ---
  const [formData, setFormData] = useState({ title: '', summary: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 프롬프트 관련 상태
  const [promptText, setPromptText] = useState('');
  const [isFetchingPrompt, setIsFetchingPrompt] = useState(false);

  // --- 핸들러 ---
  
  // 1. 프롬프트 데이터 가져오기
  const handleFetchPrompt = async () => {
    setIsFetchingPrompt(true);
    setMessage(null);
    try {
      // 백엔드 API 호출
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/prompt-data`);
      const json = await res.json();
      if (json.success === true) {
        setPromptText(json.data); // 받아온 텍스트 세팅
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

  // 2. 클립보드 복사
  const handleCopyPrompt = () => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    setMessage({ text: '📋 프롬프트가 복사되었습니다! AI에게 붙여넣으세요.', type: 'success' });
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

      if (response.ok) {
        setMessage({ text: '✅ 리포트 발행 성공!', type: 'success' });
        setFormData({ title: '', summary: '', content: '' });
      } else {
        setMessage({ text: '❌ 발행 실패', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: '❌ 서버 에러', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Cryptoz Admin</h1>
          <p className="text-gray-600">AI 리포트 생성 및 발행 시스템</p>
        </div>

        {/* 🤖 1. AI 프롬프트 생성기 섹션 (새로 추가됨) */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
              🤖 AI 프롬프트 도우미
            </h2>
            <button
              onClick={handleFetchPrompt}
              disabled={isFetchingPrompt}
              className="text-sm bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition"
            >
              {isFetchingPrompt ? '데이터 수집 중...' : '최신 데이터 가져오기'}
            </button>
          </div>

          <div className="relative">
            <textarea
              readOnly
              value={promptText}
              placeholder="데이터 가져오기 버튼을 누르면 여기에 시황 데이터가 표시됩니다."
              className="w-full h-32 p-3 text-sm bg-white border border-indigo-200 rounded-lg text-gray-600 font-mono resize-none focus:outline-none"
            />
            {promptText && (
              <button
                onClick={handleCopyPrompt}
                className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-indigo-700 shadow-sm transition flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                복사하기
              </button>
            )}
          </div>
          <p className="text-xs text-indigo-400 mt-2">
            💡 위 내용을 복사해서 Gemini에 붙여넣으면 리포트를 작성해줍니다.
          </p>
        </div>

        {/* 📝 2. 리포트 발행 폼 (기존 코드) */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">리포트 발행</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-black"
                placeholder="제목을 입력하세요"
              />
            </div>

            {/* 요약 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
              <input
                type="text"
                name="summary"
                required
                value={formData.summary}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                placeholder="짧은 요약"
              />
            </div>

            {/* 본문 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">본문 (HTML)</label>
              <textarea
                name="content"
                required
                rows={12}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-black"
                placeholder="AI가 작성해준 HTML 코드를 여기에 붙여넣으세요."
              />
            </div>

            {/* 알림 메시지 */}
            {message && (
              <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            {/* 버튼 */}
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
    </main>
  );
}