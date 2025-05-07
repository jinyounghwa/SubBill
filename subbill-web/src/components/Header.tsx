import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

type Language = 'ko' | 'en' | 'ja';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLanguage] = useState<Language>('ko');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  
  const languageLabels: Record<Language, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語'
  };
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
    // 실제 구현 시 언어 변경 로직 추가
  };
  
  // 언어 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 사용자 인증 상태 확인
  useEffect(() => {
    // 현재 사용자 세션 확인
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        setIsLoggedIn(true);
        
        // 관리자 권한 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.is_admin) {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    
    checkUser();
    
    // 사용자 인증 상태 변경 감지
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsLoggedIn(true);
        
        // 관리자 권한 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.is_admin) {
          setIsAdmin(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // 로그아웃 처리
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          SubBill
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* 언어 선택 메뉴 - 히든 처리 */}
          <div className="relative hidden" ref={languageMenuRef}>
            <button 
              className="flex items-center space-x-1 text-gray-700 hover:text-primary"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <span>{languageLabels[language]}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {Object.entries(languageLabels).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code as Language)}
                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                      language === code ? 'bg-gray-100' : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin/content/new" className="text-white bg-primary px-3 py-1 rounded-md hover:bg-blue-600 flex items-center justify-center">
                  콘텐츠 추가
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="text-gray-700 hover:text-primary flex items-center"
              >
                로그아웃
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="text-gray-700 hover:text-primary flex items-center">
                로그인
              </Link>
              <Link href="/signup" className="text-white bg-primary px-3 py-1 rounded-md hover:bg-blue-600 flex items-center justify-center h-8">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
