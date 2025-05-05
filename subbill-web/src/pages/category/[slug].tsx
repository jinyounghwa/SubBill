import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// 카테고리 정보 타입 정의
interface Service {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  rating: number;
  comments?: any[];
  likes: number;
  dislikes: number;
  thumbnail_url?: string;
  image_url?: string;
  slug: string;
}

interface CategoryInfo {
  title: string;
  description: string;
  subcategories: string[];
  services: Service[];
}

// 카테고리 데이터는 이제 Supabase에서 직접 가져옵니다

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  useEffect(() => {
    // 슬러그가 없는 경우 아직 로딩 중으로 간주
    if (!slug || typeof slug !== 'string') return;
    
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Supabase에서 카테고리 정보 가져오기
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (categoryError || !categoryData) {
          setError('유효하지 않은 카테고리입니다');
          setLoading(false);
          return;
        }
        
        // Supabase에서 해당 카테고리의 서비스 가져오기
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('category', categoryData.title);
        
        if (servicesError) {
          throw new Error(servicesError.message || '서비스 데이터를 가져오는 중 오류가 발생했습니다');
        }
        
        // 서비스 데이터 가공
        const services = servicesData || [];
        
        // 서브카테고리 목록 추출 (카테고리 테이블에서 가져오거나 서비스에서 추출)
        let subcategories: string[] = [];
        
        // 카테고리 테이블에 subcategories 필드가 있는 경우 사용
        if (categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
          subcategories = categoryData.subcategories;
        } else {
          // 없는 경우 서비스에서 추출
          const subcategoriesSet = new Set<string>();
          services.forEach((service: Service) => {
            if (service.subcategory) {
              subcategoriesSet.add(service.subcategory);
            }
          });
          subcategories = Array.from(subcategoriesSet);
        }
        
        setCategoryInfo({
          title: categoryData.title,
          description: categoryData.description,
          subcategories,
          services
        });
      } catch (err) {
        console.error('카테고리 데이터 로딩 오류:', err);
        setError('카테고리 데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [slug]);
  
  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // 에러가 있거나 카테고리 정보가 없는 경우
  if (error || !categoryInfo) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{error || '카테고리를 찾을 수 없습니다'}</h1>
        <Link href="/" className="text-primary hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }
  
  // 서브카테고리 필터링 함수
  const filteredServices = selectedSubcategory
    ? categoryInfo.services.filter(service => service.subcategory === selectedSubcategory)
    : categoryInfo.services;

  // 서브카테고리 선택 핸들러
  const handleSubcategoryClick = (subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory(null); // 이미 선택된 서브카테고리를 다시 클릭하면 필터 해제
    } else {
      setSelectedSubcategory(subcategory);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        {/* 메인페이지로 돌아가는 버튼 */}
        <div className="mb-4">
          <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors inline-flex items-center text-sm">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            메인페이지로 돌아가기
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{categoryInfo.title}</h1>
          <p className="text-gray-600">{categoryInfo.description}</p>
        </div>
        
        {/* 서브카테고리 필터 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">필터</h2>
          <div className="flex flex-wrap gap-2">
            {categoryInfo.subcategories.map((subcategory: string) => (
              <button
                key={subcategory}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedSubcategory === subcategory ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
        
        {/* 서비스 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service: Service, index: number) => (
              <div key={service.id || index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* 썸네일 이미지 */}
                <div className="h-40 bg-gray-200 relative">
                  {service.thumbnail_url && (
                    <img 
                      src={service.thumbnail_url} 
                      alt={service.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
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
                    <span className="text-gray-600 text-sm">{service.rating.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex text-sm text-gray-500 justify-between">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span>{service.comments?.length || 0}</span>
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
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="bg-white px-2 py-1 rounded text-sm font-medium border border-gray-200">
                      {service.subcategory}
                    </div>
                    <Link 
                      href={`/service/${service.slug}`}
                      className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition-colors inline-flex items-center text-sm"
                    >
                      자세히 보기
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">해당 카테고리에 서비스가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
  );
}
