import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Supabase로 로그인 요청
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        console.log('로그인 성공:', data.user);
        
        try {
          // 관리자 권한 확인
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();

          console.log('프로필 조회 결과:', profile, profileError);
          
          if (profileError) {
            console.error('프로필 조회 오류:', profileError);
            throw profileError;
          }

          if (!profile || profile.is_admin !== true) {
            throw new Error('관리자 권한이 없습니다.');
          }

          console.log('관리자 권한 확인 완료, 대시보드로 이동');
          // 관리자 로그인 성공 후 관리자 대시보드로 이동
          setTimeout(() => {
            setLoading(false);
            router.push('/admin');
          }, 500);
          return; // 중요: 여기서 함수 종료
        } catch (profileError: any) {
          console.error('관리자 권한 확인 오류:', profileError);
          throw profileError;
        }
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          관리자 로그인
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-secondary hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '관리자 로그인'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm">
              관리자 계정이 없으신가요?{' '}
              <Link href="/admin/signup" className="text-primary hover:underline">
                관리자 회원가입
              </Link>
            </p>
          </div>
          
          <div className="text-center mt-4">
            <Link href="/" className="text-gray-600 hover:underline text-sm">
              메인 페이지로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
