import { useRouter } from 'next/router';
import Link from 'next/link';

// 카테고리 데이터 (실제 구현 시 API에서 가져옴)
const categoryData = {
  'ai': {
    title: 'AI',
    description: '인공지능 관련 구독 서비스',
    subcategories: ['생성형 AI', '코딩보조', '챗봇'],
    services: [
      { title: 'ChatGPT Plus', category: 'AI', subcategory: '생성형 AI', rating: 4.8, comments: 120, likes: 350, dislikes: 15 },
      { title: 'Claude Pro', category: 'AI', subcategory: '생성형 AI', rating: 4.7, comments: 95, likes: 280, dislikes: 18 },
      { title: 'GitHub Copilot', category: 'AI', subcategory: '코딩보조', rating: 4.9, comments: 150, likes: 420, dislikes: 10 },
      { title: 'Intercom Fin', category: 'AI', subcategory: '챗봇', rating: 4.5, comments: 75, likes: 190, dislikes: 12 },
    ]
  },
  'productivity': {
    title: '생산성',
    description: '업무 효율을 높이는 구독 서비스',
    subcategories: ['교육', '데이터분석', '비즈니스 생산성'],
    services: [
      { title: 'Notion AI', category: '생산성', subcategory: '비즈니스 생산성', rating: 4.6, comments: 85, likes: 230, dislikes: 12 },
      { title: 'Google Duet AI', category: '생산성', subcategory: '비즈니스 생산성', rating: 4.5, comments: 70, likes: 180, dislikes: 15 },
      { title: 'Microsoft Copilot', category: '생산성', subcategory: '비즈니스 생산성', rating: 4.7, comments: 90, likes: 240, dislikes: 10 },
      { title: 'Fireflies.ai', category: '생산성', subcategory: '데이터분석', rating: 4.4, comments: 65, likes: 170, dislikes: 14 },
    ]
  },
  'media': {
    title: '영상·음성',
    description: '미디어 콘텐츠 관련 구독 서비스',
    subcategories: ['스트리밍 서비스', '오디오북', '음악'],
    services: [
      { title: 'Netflix', category: '영상·음성', subcategory: '스트리밍 서비스', rating: 4.7, comments: 210, likes: 520, dislikes: 30 },
      { title: 'Disney+', category: '영상·음성', subcategory: '스트리밍 서비스', rating: 4.6, comments: 180, likes: 450, dislikes: 25 },
      { title: 'Spotify', category: '영상·음성', subcategory: '음악', rating: 4.5, comments: 150, likes: 420, dislikes: 25 },
      { title: 'Audible', category: '영상·음성', subcategory: '오디오북', rating: 4.8, comments: 130, likes: 380, dislikes: 15 },
    ]
  }
};

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  // 슬러그가 없거나 유효하지 않은 경우
  if (!slug || typeof slug !== 'string' || !categoryData[slug as keyof typeof categoryData]) {
    return (
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">카테고리를 찾을 수 없습니다</h1>
          <Link href="/" className="text-primary hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
    );
  }
  
  const category = categoryData[slug as keyof typeof categoryData];
  
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category.title}</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>
        
        {/* 서브카테고리 필터 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">필터</h2>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium"
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
        
        {/* 서비스 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {category.services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* 썸네일 이미지 (임시로 색상 블록으로 대체) */}
              <div className="h-40 bg-gray-200 relative">
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-medium">
                  {service.subcategory}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                
                <div className="flex items-center mb-3">
                  {/* 별점 */}
                  <div className="flex text-yellow-400 mr-1">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className={`h-4 w-4 ${i < Math.floor(service.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">{service.rating}</span>
                </div>
                
                <div className="flex text-sm text-gray-500 justify-between">
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
                
                <Link href={`/service/${service.title.toLowerCase().replace(/\s+/g, '-')}`} className="mt-4 inline-block text-primary hover:underline">
                  자세히 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
