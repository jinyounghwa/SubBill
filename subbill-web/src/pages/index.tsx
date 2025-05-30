import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// 서비스 타입 정의
type Service = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  rating: number;
  comments: number;
  likes: number;
  dislikes: number;
  type?: string;
  slug: string; // slug 필드 추가
};

export default function Home() {
  // 서비스 상태 관리
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 검색 기능
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      // API 호출 시도
      // const response = await fetch(`https://jinyounghwa-subbill.functions.supabase.co/search-services?query=${encodeURIComponent(query)}`);
      // if (!response.ok) {
      //   throw new Error('검색 중 오류가 발생했습니다');
      // }
      // const data = await response.json();
      
      // API 호출 오류로 인해 임시 검색 기능 구현
      console.log('검색어:', query);
      const filteredServices = popularServices.filter(service => 
        service.title.toLowerCase().includes(query.toLowerCase()) ||
        service.category.toLowerCase().includes(query.toLowerCase()) ||
        service.subcategory.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredServices);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
    }
  }, [popularServices]);
  
  // 검색어 변경 시 검색 실행
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);
  
  // Supabase에서 인기 서비스 데이터 가져오기
  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적
    
    const fetchPopularServices = async () => {
      try {
        setLoading(true);
        
        // 새로 만든 SQL 함수를 사용하여 인기 서비스 가져오기
        const { data, error } = await supabase
          .rpc('get_popular_services', { limit_count: 12 });
        
        if (error) {
          throw new Error('서비스 데이터를 가져오는데 실패했습니다: ' + error.message);
        }
        
        // 컴포넌트가 마운트된 상태인 경우에만 상태 업데이트
        if (data && isMounted) {
          // 데이터 형식 변환
          const formattedServices: Service[] = data.map((service: any) => ({
            id: service.id,
            title: service.title,
            category: service.category,
            subcategory: service.subcategory,
            imageUrl: service.thumbnail_url || 'https://via.placeholder.com/300x200',
            rating: service.rating,
            comments: 0, // 댓글 수는 별도로 가져와야 할 수 있음
            likes: service.likes,
            dislikes: service.dislikes,
            slug: service.slug
          }));
          
          setPopularServices(formattedServices);
          
          // 성공적으로 가져온 데이터를 캐시에 저장
          try {
            localStorage.setItem('cachedPopularServices', JSON.stringify(formattedServices));
          } catch (cacheError) {
            console.error('캐시 저장 오류:', cacheError);
          }
        }
      } catch (error) {
        console.error('인기 서비스 로딩 오류:', error);
        
        // 에러 발생 시 캐시된 데이터 사용 시도 (localStorage)
        try {
          const cachedServices = localStorage.getItem('cachedPopularServices');
          if (cachedServices && isMounted) {
            setPopularServices(JSON.parse(cachedServices));
          } else if (isMounted) {
            // 캐시된 데이터도 없는 경우 임시 데이터 사용
            setPopularServices([
              { id: '1', title: 'ChatGPT Plus', category: 'AI', subcategory: '생성형 AI', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.8, comments: 120, likes: 350, dislikes: 15, slug: 'chatgpt-plus' },
              { id: '2', title: 'Notion AI', category: '생산성', subcategory: '비즈니스 생산성', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.6, comments: 85, likes: 230, dislikes: 12, slug: 'notion-ai' },
              { id: '3', title: 'Netflix', category: '영상·음성', subcategory: '비디오', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.7, comments: 210, likes: 520, dislikes: 30, slug: 'netflix' },
              { id: '4', title: 'Spotify', category: '영상·음성', subcategory: '음악', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.5, comments: 150, likes: 420, dislikes: 25, slug: 'spotify' },
              { id: '5', title: 'GitHub Copilot', category: 'AI', subcategory: '코딩보조', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.9, comments: 180, likes: 480, dislikes: 10, slug: 'github-copilot' },
              { id: '6', title: 'Adobe Creative Cloud', category: '디자인', subcategory: '그래픽 디자인', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.4, comments: 95, likes: 280, dislikes: 40, slug: 'adobe-creative-cloud' },
              { id: '7', title: 'Microsoft 365', category: '생산성', subcategory: '오피스 제품군', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.3, comments: 130, likes: 310, dislikes: 45, slug: 'microsoft-365' },
              { id: '8', title: 'Amazon Prime', category: '쇼핑', subcategory: '쇼핑 구독', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.2, comments: 160, likes: 380, dislikes: 55, slug: 'amazon-prime' },
              { id: '9', title: 'Disney+', category: '영상·음성', subcategory: '스트리밍 서비스', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.6, comments: 140, likes: 400, dislikes: 20, slug: 'disney-plus' },
              { id: '10', title: 'Slack', category: '생산성', subcategory: '팀 커뮤니케이션', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.5, comments: 110, likes: 290, dislikes: 35, slug: 'slack' },
              { id: '11', title: 'Canva Pro', category: '디자인', subcategory: '온라인 디자인', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.7, comments: 100, likes: 320, dislikes: 18, slug: 'canva-pro' },
              { id: '12', title: 'Grammarly', category: '생산성', subcategory: '문법 및 맞춤법 검사', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.4, comments: 90, likes: 260, dislikes: 22, slug: 'grammarly' }
            ]);
          }
        } catch (cacheError) {
          console.error('캐시된 데이터 로드 실패:', cacheError);
          
          if (isMounted) {
            // 캐시 오류 발생 시 임시 데이터 사용
            setPopularServices([
              { id: '1', title: 'ChatGPT Plus', category: 'AI', subcategory: '생성형 AI', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.8, comments: 120, likes: 350, dislikes: 15, slug: 'chatgpt-plus' },
              { id: '2', title: 'Notion AI', category: '생산성', subcategory: '비즈니스 생산성', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.6, comments: 85, likes: 230, dislikes: 12, slug: 'notion-ai' },
              { id: '3', title: 'Netflix', category: '영상·음성', subcategory: '비디오', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.7, comments: 210, likes: 520, dislikes: 30, slug: 'netflix' },
              { id: '4', title: 'Spotify', category: '영상·음성', subcategory: '음악', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.5, comments: 150, likes: 420, dislikes: 25, slug: 'spotify' },
              { id: '5', title: 'GitHub Copilot', category: 'AI', subcategory: '코딩보조', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.9, comments: 180, likes: 480, dislikes: 10, slug: 'github-copilot' },
              { id: '6', title: 'Adobe Creative Cloud', category: '디자인', subcategory: '그래픽 디자인', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.4, comments: 95, likes: 280, dislikes: 40, slug: 'adobe-creative-cloud' },
              { id: '7', title: 'Microsoft 365', category: '생산성', subcategory: '오피스 제품군', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.3, comments: 130, likes: 310, dislikes: 45, slug: 'microsoft-365' },
              { id: '8', title: 'Amazon Prime', category: '쇼핑', subcategory: '쇼핑 구독', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.2, comments: 160, likes: 380, dislikes: 55, slug: 'amazon-prime' },
              { id: '9', title: 'Disney+', category: '영상·음성', subcategory: '스트리밍 서비스', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.6, comments: 140, likes: 400, dislikes: 20, slug: 'disney-plus' },
              { id: '10', title: 'Slack', category: '생산성', subcategory: '팀 커뮤니케이션', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.5, comments: 110, likes: 290, dislikes: 35, slug: 'slack' },
              { id: '11', title: 'Canva Pro', category: '디자인', subcategory: '온라인 디자인', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.7, comments: 100, likes: 320, dislikes: 18, slug: 'canva-pro' },
              { id: '12', title: 'Grammarly', category: '생산성', subcategory: '문법 및 맞춤법 검사', imageUrl: 'https://via.placeholder.com/300x200', rating: 4.4, comments: 90, likes: 260, dislikes: 22, slug: 'grammarly' }
            ]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchPopularServices();
    
    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 md:py-12">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 dark:text-white">구독 서비스 검색 플랫폼 SubBill</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">다양한 구독 서비스를 한눈에 비교하고 확인하세요</p>
          
          {/* 검색 바 */}
          <div className="max-w-3xl mx-auto mb-6 px-4">
            <div className="relative flex items-center w-full">
              <Input
                type="text"
                className="w-full p-4 pr-12"
                placeholder="구독 서비스 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                variant="ghost" 
                className="absolute right-0 h-full px-3"
                onClick={() => handleSearch(searchQuery)}
              >
                <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
              {searchQuery && (
                <button
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => setSearchQuery('')}
                >
                  <svg
                    className="h-5 w-5 dark:text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
      </div>
      </section>
      
      {/* 카테고리 섹션 */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">카테고리</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-40">
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-primary dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold dark:text-white">AI</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">생성형 AI, 코딩보조, 챗봇 등 인공지능 관련 구독 서비스</p>
              <div className="text-right mt-auto">
                <Link href="/category/ai" className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark transition-colors inline-flex items-center text-xs">
                  자세히 보기
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-40">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold dark:text-white">생산성</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">교육, 데이터분석, 비즈니스 생산성 등 업무 효율을 높이는 서비스</p>
              <div className="text-right mt-auto">
                <Link href="/category/productivity" className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors inline-flex items-center text-xs">
                  자세히 보기
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-40">
              <div className="flex items-center mb-2">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold dark:text-white">영상·음성</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">스트리밍 서비스, 오디오북 등 미디어 콘텐츠 관련 서비스</p>
              <div className="text-right mt-auto">
                <Link href="/category/media" className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors inline-flex items-center text-xs">
                  자세히 보기
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
        
        {/* 검색 결과 또는 인기 구독 서비스 */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-3 dark:text-white">
              {isSearching && searchQuery ? `'${searchQuery}' 검색 결과` : '인기 구독 서비스'}
            </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary"></div>
            </div>
          ) : isSearching && searchQuery ? (
            searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* 검색 결과 카드 */}
                {searchResults.map((service) => (
                  <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                    {/* 썸네일 이미지 */}
                    <div className="h-40 bg-gray-200 relative" style={{backgroundImage: `url(${service.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 dark:text-white">{service.title}</h3>
                      
                      <div className="flex items-center mb-3">
                        {/* 별점 */}
                        <div className="flex text-yellow-400 mr-1">
                          {Array(5).fill(0).map((_, i) => (
                            <svg key={i} className={`h-4 w-4 ${i < Math.floor(service.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{service.rating.toFixed(1)}</span>
                      </div>
                      
                      <div className="flex text-sm text-gray-500 dark:text-gray-400 justify-between">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span>{service.comments}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{service.likes}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          <span>{service.dislikes}</span>
                        </div>
                      </div>
                      
                      {/* 자세히 보기 링크 추가 */}
                      <div className="mt-3 text-right">
                        <Link 
                          href={`/service/${service.id}`} 
                          className="text-primary hover:underline font-medium inline-flex items-center"
                        >
                          자세히 보기
                          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">검색 결과가 없습니다</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">다른 검색어로 다시 시도해보세요.</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* 인기 서비스 카드 */}
              {popularServices.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative pb-[56.25%] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={service.imageUrl} 
                      alt={service.title} 
                      className="absolute h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 m-2 rounded">
                      {service.category}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-0">
                    <div className="flex items-center">
                      {/* 별점 */}
                      <div className="flex text-yellow-400 mr-1">
                        {Array(5).fill(0).map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < Math.floor(service.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm">{service.rating.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex text-sm text-muted-foreground justify-between">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span>{service.comments}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{service.likes}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span>{service.dislikes}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end">
                    <Button 
                      asChild
                      size="sm"
                      className="gap-1"
                    >
                      <Link href={`/service/${service.slug}`}>
                        자세히 보기
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
