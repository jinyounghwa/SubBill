import React, { useState, useEffect } from 'react';
import { likeService, dislikeService, getUserRating, rateService } from '@/utils/serviceApi';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

// 인라인 타입 정의
interface Service {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  features: any;
  price: string;
  website: string;
  rating: number;
  thumbnail_url: string;
  image_url: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  slug: string;
  is_active?: boolean;
}

interface ServiceDescriptionProps {
  service: Service;
}

const ServiceDescription: React.FC<ServiceDescriptionProps> = ({ service }) => {
  const router = useRouter();
  const [likes, setLikes] = useState(service.likes || 0);
  const [dislikes, setDislikes] = useState(service.dislikes || 0);
  const [rating, setRating] = useState(service.rating || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isDislikeLoading, setIsDislikeLoading] = useState(false);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRating, setUserRating] = useState<{
    liked: boolean | null;
    disliked: boolean | null;
    rating: number | null;
    is_logged_in: boolean;
  }>({ liked: null, disliked: null, rating: null, is_logged_in: false });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  
  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      // 사용자 평가 상태 가져오기
      const userRatingData = await getUserRating(service.id);
      setUserRating(userRatingData);
    };
    
    checkAuthStatus();
    
    // 인증 상태 변경 감지
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
        const userRatingData = await getUserRating(service.id);
        setUserRating(userRatingData);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUserRating({ liked: null, disliked: null, rating: null, is_logged_in: false });
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [service.id]);
  
  // 좋아요 처리 함수
  const handleLike = async () => {
    if (isLikeLoading || !isLoggedIn) {
      if (!isLoggedIn) {
        alert('좋아요 기능은 로그인이 필요합니다.');
        router.push('/login');
      }
      return;
    }
    
    setIsLikeLoading(true);
    const success = await likeService(service.id, !userRating.liked);
    
    if (success) {
      // 상태 업데이트
      const newUserRating = { ...userRating, liked: !userRating.liked, disliked: false };
      setUserRating(newUserRating);
      
      // 좋아요/싫어요 수 업데이트
      if (newUserRating.liked) {
        setLikes(prev => prev + 1);
        if (userRating.disliked) {
          setDislikes(prev => Math.max(prev - 1, 0));
        }
      } else {
        setLikes(prev => Math.max(prev - 1, 0));
      }
    }
    
    setIsLikeLoading(false);
  };
  
  // 싫어요 처리 함수
  const handleDislike = async () => {
    if (isDislikeLoading || !isLoggedIn) {
      if (!isLoggedIn) {
        alert('싫어요 기능은 로그인이 필요합니다.');
        router.push('/login');
      }
      return;
    }
    
    setIsDislikeLoading(true);
    const success = await dislikeService(service.id, !userRating.disliked);
    
    if (success) {
      // 상태 업데이트
      const newUserRating = { ...userRating, disliked: !userRating.disliked, liked: false };
      setUserRating(newUserRating);
      
      // 좋아요/싫어요 수 업데이트
      if (newUserRating.disliked) {
        setDislikes(prev => prev + 1);
        if (userRating.liked) {
          setLikes(prev => Math.max(prev - 1, 0));
        }
      } else {
        setDislikes(prev => Math.max(prev - 1, 0));
      }
    }
    
    setIsDislikeLoading(false);
  };
  
  // 별점 모달 열기
  const handleRatingClick = () => {
    if (!isLoggedIn) {
      alert('별점 기능은 로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    setSelectedRating(userRating.rating || 0);
    setShowRatingModal(true);
  };
  
  // 별점 제출
  const handleSubmitRating = async () => {
    if (isRatingLoading || !isLoggedIn || selectedRating < 0.5) {
      return;
    }
    
    try {
      setIsRatingLoading(true);
      
      // Supabase MCP를 직접 사용하여 별점 저장
      const { data, error } = await supabase.rpc('rate_service', {
        service_id: service.id,
        rating_value: selectedRating
      });
      
      if (error) {
        console.error('별점 저장 중 오류가 발생했습니다:', error);
        alert('별점 저장 중 오류가 발생했습니다.');
        return;
      }
      
      // 사용자 별점 업데이트
      setUserRating({ ...userRating, rating: selectedRating });
      
      // 서비스 데이터 다시 가져오기
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('rating')
        .eq('id', service.id)
        .single();
      
      if (serviceError) {
        console.error('서비스 데이터 조회 중 오류가 발생했습니다:', serviceError);
      } else if (serviceData) {
        setRating(serviceData.rating);
      }
      
      // 모달 닫기 (성공 여부와 관계없이 닫기)
      setShowRatingModal(false);
    } catch (err) {
      console.error('별점 처리 중 예외가 발생했습니다:', err);
      alert('별점 처리 중 오류가 발생했습니다.');
    } finally {
      setIsRatingLoading(false);
    }
  };
  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">{service.title}</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex items-center space-x-1 text-sm ${userRating.liked ? 'text-green-500' : 'text-gray-600 hover:text-green-500'} transition-colors`}
              title={isLoggedIn ? '좋아요' : '로그인이 필요합니다'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill={userRating.liked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span>{likes}</span>
            </button>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleDislike}
              disabled={isDislikeLoading}
              className={`flex items-center space-x-1 text-sm ${userRating.disliked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'} transition-colors`}
              title={isLoggedIn ? '싫어요' : '로그인이 필요합니다'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill={userRating.disliked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
              <span>{dislikes}</span>
            </button>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleRatingClick}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-yellow-500 transition-colors"
              title={isLoggedIn ? '별점 주기' : '로그인이 필요합니다'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span>{rating ? rating.toFixed(1) : '0.0'}</span>
              {userRating.rating && (
                <span className="text-xs text-gray-500 ml-1">(내 별점: {userRating.rating.toFixed(1)})</span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center mb-3">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{service.category}</span>
        {service.subcategory && (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded">{service.subcategory}</span>
        )}
      </div>
      
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
        {service.price && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">가격</h3>
            <p className="text-blue-800 font-medium">{service.price}</p>
          </div>
        )}
        
        {service.website && (
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">웹사이트</h3>
            <a 
              href={service.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-800 font-medium hover:underline"
            >
              {new URL(service.website).hostname}
            </a>
          </div>
        )}
      </div>
      
      {/* 별점 모달 */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{service.title} 별점 주기</h3>
              <button 
                onClick={() => setShowRatingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center mb-6">
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`mx-1 focus:outline-none ${star % 1 === 0 ? '' : 'transform -translate-x-3'}`}
                >
                  <svg 
                    className={`w-8 h-8 ${selectedRating >= star ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {star % 1 === 0 ? (
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    ) : (
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    )}
                  </svg>
                </button>
              ))}
            </div>
            
            <div className="text-center mb-4">
              <p className="text-lg font-bold">{selectedRating.toFixed(1)}</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={isRatingLoading || selectedRating < 0.5}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRatingLoading ? '처리 중...' : '평가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDescription;
