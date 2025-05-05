import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

// 인라인 타입 정의
interface Comment {
  id: string;
  service_id: string;
  user_id: string;
  content: string;
  is_active: boolean;
  likes: number;
  dislikes: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

interface User {
  id: string;
  email?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string;
    picture?: string;
    provider_id?: string;
    sub?: string;
  };
}

interface ServiceCommentsProps {
  serviceId: string;
}

const ServiceComments: React.FC<ServiceCommentsProps> = ({ serviceId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchComments();
    checkUser();
  }, [serviceId]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      setUser(data.session.user);
      
      // 관리자 권한 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.session.user.id)
        .single();
      
      setIsAdmin(profile?.is_admin === true);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      // 관리자는 모든 댓글을 볼 수 있고, 일반 사용자는 활성화된 댓글만 볼 수 있음
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });
      
      if (!isAdmin) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        setComments(data);
      }
    } catch (error) {
      console.error('댓글을 불러오는 중 오류가 발생했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            service_id: serviceId,
            user_id: user.id,
            content: newComment.trim(),
            is_active: true
          }
        ]);

      if (error) {
        throw error;
      }

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('댓글 작성 중 오류가 발생했습니다:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }
    
    try {
      const foundComment = comments.find(c => c.id === commentId);
      if (!foundComment) return;
      
      const { error } = await supabase
        .from('comments')
        .update({ likes: (foundComment.likes || 0) + 1 })
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      fetchComments();
    } catch (error) {
      console.error('좋아요 처리 중 오류가 발생했습니다:', error);
    }
  };
  
  // 댓글 비활성화/활성화 토글 함수
  const toggleCommentActive = async (commentId: string, currentActive: boolean) => {
    if (!isAdmin) {
      alert('관리자만 댓글을 비활성화/활성화할 수 있습니다.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_active: !currentActive })
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      fetchComments();
    } catch (error) {
      console.error('댓글 상태 변경 중 오류가 발생했습니다:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">댓글 {comments.length}개</h2>
      
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="mb-4">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="댓글을 작성해주세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          댓글 작성
        </button>
      </form>
      
      {loading ? (
        <div className="text-center py-4">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {comment.profiles && comment.profiles.avatar_url ? (
                        <img 
                          src={comment.profiles.avatar_url} 
                          alt={(comment.profiles && comment.profiles.username) || '사용자'} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-800">{(comment.profiles && comment.profiles.username) || '익명 사용자'}</h4>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => comment.id && toggleCommentActive(comment.id, comment.is_active)}
                          className={`text-xs px-2 py-1 rounded ${comment.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                        >
                          {comment.is_active ? '비활성화' : '활성화'}
                        </button>
                      )}
                    </div>
                    
                    {comment.is_active ? (
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                    ) : (
                      <p className="text-gray-500 italic mb-2 bg-gray-50 p-2 rounded">
                        비활성화된 댓글입니다.
                        {isAdmin && (
                          <span className="text-xs text-gray-400 ml-2">(원본: {comment.content})</span>
                        )}
                      </p>
                    )}
                    
                    {comment.is_active && (
                      <div className="flex items-center text-sm">
                        <button 
                          onClick={() => comment.id && handleLikeComment(comment.id)}
                          className="flex items-center text-gray-500 hover:text-blue-600"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                          </svg>
                          <span>{comment.likes || 0}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceComments;
