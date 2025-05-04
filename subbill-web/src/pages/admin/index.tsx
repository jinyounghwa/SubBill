import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 관리자 대시보드 페이지
export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Supabase를 통한 관리자 권한 확인
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // 현재 사용자 세션 확인
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // 로그인되지 않은 경우 관리자 로그인 페이지로 이동
          router.push('/admin/login');
          return;
        }
        
        setUser(session.user);
        
        // 관리자 권한 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.is_admin) {
          setIsAdmin(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [router]);
  
  // 로딩 중 표시
  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <p>로딩 중...</p>
        </div>
    );
  }
  
  // 관리자가 아닌 경우 접근 제한
  if (!isAdmin) {
    return (
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">접근 권한이 없습니다</h1>
          <p className="mb-4">이 페이지는 관리자만 접근할 수 있습니다.</p>
          <Link href="/" className="text-primary hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
    );
  }
  
  // 관리자 대시보드
  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">콘텐츠 관리</h2>
            <p className="text-gray-600 mb-4">구독 서비스 콘텐츠를 추가, 수정, 삭제합니다.</p>
            <Link href="/admin/content/new" className="text-primary hover:underline flex items-center">
              새 콘텐츠 추가
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">댓글 관리</h2>
            <p className="text-gray-600 mb-4">사용자 댓글을 관리하고 비활성화할 수 있습니다.</p>
            <Link href="/admin/comments" className="text-primary hover:underline flex items-center">
              댓글 관리하기
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">사용자 관리</h2>
            <p className="text-gray-600 mb-4">사용자 계정을 관리하고 권한을 설정합니다.</p>
            <Link href="/admin/users" className="text-primary hover:underline flex items-center">
              사용자 관리하기
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">최근 활동</h2>
          <div className="space-y-4">
            {[
              { type: '콘텐츠 추가', title: 'GitHub Copilot', user: '관리자1', date: '2025-05-03' },
              { type: '댓글 비활성화', title: 'Netflix', user: '관리자2', date: '2025-05-02' },
              { type: '콘텐츠 수정', title: 'ChatGPT Plus', user: '관리자1', date: '2025-05-01' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="font-medium">{activity.type}:</span> {activity.title}
                  <p className="text-sm text-gray-500">작업자: {activity.user}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
