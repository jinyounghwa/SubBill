import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 카테고리 및 서브카테고리 옵션
const categoryOptions = [
  { 
    value: 'ai', 
    label: 'AI',
    subcategories: [
      { value: 'generative', label: '생성형 AI' },
      { value: 'coding', label: '코딩보조' },
      { value: 'chatbot', label: '챗봇' }
    ]
  },
  { 
    value: 'productivity', 
    label: '생산성',
    subcategories: [
      { value: 'education', label: '교육' },
      { value: 'data-analysis', label: '데이터분석' },
      { value: 'business', label: '비즈니스 생산성' }
    ]
  },
  { 
    value: 'media', 
    label: '영상·음성',
    subcategories: [
      { value: 'streaming', label: '스트리밍 서비스' },
      { value: 'audiobook', label: '오디오북' },
      { value: 'music', label: '음악' }
    ]
  }
];

// 언어 옵션
const languageOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: '영어' },
  { value: 'ja', label: '일본어' }
];

export default function NewContent() {
  const router = useRouter();
  const [activeLanguage, setActiveLanguage] = useState<'ko' | 'en' | 'ja'>('ko');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  
  // 폼 상태
  const [formData, setFormData] = useState({
    ko: {
      title: '',
      description: '',
      features: [''],
    },
    en: {
      title: '',
      description: '',
      features: [''],
    },
    ja: {
      title: '',
      description: '',
      features: [''],
    },
    category: '',
    subcategory: '',
    price: '',
    website: '',
    thumbnailImage: null as File | null,
    detailImage: null as File | null,
  });
  
  // 선택된 카테고리에 따른 서브카테고리 옵션
  const subcategoryOptions = formData.category 
    ? categoryOptions.find(cat => cat.value === formData.category)?.subcategories || []
    : [];
  
  // 입력 필드 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    language?: 'ko' | 'en' | 'ja'
  ) => {
    const { name, value } = e.target;
    
    if (language) {
      setFormData(prev => ({
        ...prev,
        [language]: {
          ...prev[language],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // 기능 항목 추가
  const addFeature = (language: 'ko' | 'en' | 'ja') => {
    setFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        features: [...prev[language].features, '']
      }
    }));
  };
  
  // 기능 항목 변경
  const handleFeatureChange = (
    index: number,
    value: string,
    language: 'ko' | 'en' | 'ja'
  ) => {
    const updatedFeatures = [...formData[language].features];
    updatedFeatures[index] = value;
    
    setFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        features: updatedFeatures
      }
    }));
  };
  
  // 기능 항목 삭제
  const removeFeature = (index: number, language: 'ko' | 'en' | 'ja') => {
    if (formData[language].features.length <= 1) return;
    
    const updatedFeatures = formData[language].features.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        features: updatedFeatures
      }
    }));
  };
  
  // 이미지 파일 변경 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const { name } = e.target;
    const file = e.target.files[0];
    
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 실제 구현 시 API 호출하여 데이터 저장
    console.log('폼 데이터:', formData);
    
    // 성공 시 관리자 대시보드로 이동
    alert('콘텐츠가 성공적으로 추가되었습니다.');
    router.push('/admin');
  };
  
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
  
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-primary hover:underline flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            관리자 대시보드로 돌아가기
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">새 콘텐츠 추가</h1>
          
          <form onSubmit={handleSubmit}>
            {/* 언어 탭 */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                {languageOptions.map(lang => (
                  <button
                    key={lang.value}
                    type="button"
                    className={`py-2 px-4 font-medium ${
                      activeLanguage === lang.value
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveLanguage(lang.value as 'ko' | 'en' | 'ja')}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 언어별 콘텐츠 입력 */}
            <div className="mb-6">
              <div className={activeLanguage === 'ko' ? 'block' : 'hidden'}>
                <div className="mb-4">
                  <label htmlFor="ko-title" className="block text-gray-700 font-medium mb-2">
                    제목 (한국어)
                  </label>
                  <input
                    type="text"
                    id="ko-title"
                    name="title"
                    value={formData.ko.title}
                    onChange={(e) => handleInputChange(e, 'ko')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="ko-description" className="block text-gray-700 font-medium mb-2">
                    설명 (한국어)
                  </label>
                  <textarea
                    id="ko-description"
                    name="description"
                    value={formData.ko.description}
                    onChange={(e) => handleInputChange(e, 'ko')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    주요 기능 (한국어)
                  </label>
                  {formData.ko.features.map((feature, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value, 'ko')}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mr-2"
                        placeholder={`기능 ${index + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index, 'ko')}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeature('ko')}
                    className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    + 기능 추가
                  </button>
                </div>
              </div>
              
              <div className={activeLanguage === 'en' ? 'block' : 'hidden'}>
                <div className="mb-4">
                  <label htmlFor="en-title" className="block text-gray-700 font-medium mb-2">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    id="en-title"
                    name="title"
                    value={formData.en.title}
                    onChange={(e) => handleInputChange(e, 'en')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="en-description" className="block text-gray-700 font-medium mb-2">
                    Description (English)
                  </label>
                  <textarea
                    id="en-description"
                    name="description"
                    value={formData.en.description}
                    onChange={(e) => handleInputChange(e, 'en')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Features (English)
                  </label>
                  {formData.en.features.map((feature, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value, 'en')}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mr-2"
                        placeholder={`Feature ${index + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index, 'en')}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeature('en')}
                    className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
              
              <div className={activeLanguage === 'ja' ? 'block' : 'hidden'}>
                <div className="mb-4">
                  <label htmlFor="ja-title" className="block text-gray-700 font-medium mb-2">
                    タイトル (日本語)
                  </label>
                  <input
                    type="text"
                    id="ja-title"
                    name="title"
                    value={formData.ja.title}
                    onChange={(e) => handleInputChange(e, 'ja')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="ja-description" className="block text-gray-700 font-medium mb-2">
                    説明 (日本語)
                  </label>
                  <textarea
                    id="ja-description"
                    name="description"
                    value={formData.ja.description}
                    onChange={(e) => handleInputChange(e, 'ja')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    主な機能 (日本語)
                  </label>
                  {formData.ja.features.map((feature, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value, 'ja')}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mr-2"
                        placeholder={`機能 ${index + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index, 'ja')}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeature('ja')}
                    className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    + 機能を追加
                  </button>
                </div>
              </div>
            </div>
            
            {/* 공통 정보 */}
            <div className="mb-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">공통 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                    카테고리
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {categoryOptions.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subcategory" className="block text-gray-700 font-medium mb-2">
                    서브카테고리
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={!formData.category}
                  >
                    <option value="">서브카테고리 선택</option>
                    {subcategoryOptions.map(subcategory => (
                      <option key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                    가격 (예: ₩10,000/월, $20/월)
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-gray-700 font-medium mb-2">
                    웹사이트 URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="thumbnailImage" className="block text-gray-700 font-medium mb-2">
                    썸네일 이미지
                  </label>
                  <input
                    type="file"
                    id="thumbnailImage"
                    name="thumbnailImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">권장 크기: 400x300 픽셀</p>
                </div>
                
                <div>
                  <label htmlFor="detailImage" className="block text-gray-700 font-medium mb-2">
                    상세 이미지
                  </label>
                  <input
                    type="file"
                    id="detailImage"
                    name="detailImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">권장 크기: 800x600 픽셀</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link
                href="/admin"
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 mr-4"
              >
                취소
              </Link>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                콘텐츠 추가
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
