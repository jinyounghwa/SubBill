import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 사용자 타입 정의
interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 제공자 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 세션 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // 사용자 정보 가져오기
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('사용자 정보를 가져오는 중 오류가 발생했습니다:', error);
            setUser(null);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              isAdmin: userData?.is_admin || false
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('세션 확인 중 오류가 발생했습니다:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 인증 상태 변경 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // 사용자 정보 가져오기
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('사용자 정보를 가져오는 중 오류가 발생했습니다:', error);
          setUser(null);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            isAdmin: userData?.is_admin || false
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // 사용자 정보 가져오기
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError) {
          console.error('사용자 정보를 가져오는 중 오류가 발생했습니다:', userError);
          return { error: userError };
        }

        setUser({
          id: data.user.id,
          email: data.user.email || '',
          isAdmin: userData?.is_admin || false
        });
      }

      return { error: null };
    } catch (error) {
      console.error('로그인 중 오류가 발생했습니다:', error);
      return { error };
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
    }
  };

  // 관리자 여부 확인 함수
  const isAdmin = () => {
    return user?.isAdmin || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다');
  }
  return context;
};
