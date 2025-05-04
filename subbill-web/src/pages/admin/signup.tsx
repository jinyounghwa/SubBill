import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AdminSignup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 실제 환경에서는 환경 변수나 데이터베이스에서 관리해야 합니다
  const ADMIN_SECRET_CODE = 'admin1234';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // 관리자 코드 확인
    if (adminCode !== ADMIN_SECRET_CODE) {
      setError('관리자 코드가 올바르지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      console.log('관리자 회원가입 시작');
      
      // Supabase로 회원가입 요청
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_admin: true,
          },
        },
      });

      if (error) {
        console.error('회원가입 오류:', error);
        throw error;
      }

      console.log('회원가입 성공:', data);

      if (data?.user) {
        // 트리거가 자동으로 프로필을 생성할 시간을 주기 위해 약간 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 관리자 권한 설정 - 직접 SQL 실행
        const { error: sqlError } = await supabase.rpc('set_admin_status', { 
          user_id: data.user.id,
          admin_status: true 
        });

        if (sqlError) {
          console.error('RPC 오류:', sqlError);
          
          // 대체 방법으로 프로필 업데이트 시도
          console.log('프로필 업데이트 시도');
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('프로필 업데이트 오류:', profileError);
            throw profileError;
          }
        }

        console.log('관리자 권한 설정 완료');
        setMessage('관리자 계정이 생성되었습니다. 이메일을 확인해주세요.');
        
        // 회원가입 성공 후 관리자 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('회원가입 처리 중 오류:', error);
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          관리자 회원가입
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
              이름
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

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

          <div className="mb-4">
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
              minLength={6}
            />
            <p className="text-gray-500 text-xs mt-1">비밀번호는 최소 6자 이상이어야 합니다.</p>
          </div>

          <div className="mb-6">
            <label htmlFor="adminCode" className="block text-gray-700 text-sm font-bold mb-2">
              관리자 코드
            </label>
            <input
              id="adminCode"
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
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
              {loading ? '처리 중...' : '관리자 계정 생성'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm">
              이미 관리자 계정이 있으신가요?{' '}
              <Link href="/admin/login" className="text-primary hover:underline">
                관리자 로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
