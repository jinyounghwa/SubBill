import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// 서비스 데이터 타입 정의
type ServiceData = {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  price: string;
  website: string;
  rating: number;
  thumbnailUrl?: string;
  imageUrl?: string;
  comments: any[];
  // 추가 필드
  commentCount?: number;
  likes?: number;
  dislikes?: number;
};

// 서비스 데이터 (실제 구현 시 API에서 가져옴)
const servicesData: Record<string, ServiceData> = {
  'chatgpt-plus': {
    title: 'ChatGPT Plus',
    category: 'AI',
    subcategory: '생성형 AI',
    rating: 4.8,
    commentCount: 120,
    likes: 350,
    dislikes: 15,
    description: 'OpenAI에서 제공하는 ChatGPT의 프리미엄 구독 서비스입니다. GPT-4 모델 접근, 빠른 응답 속도, 피크 시간대 안정적인 사용 등의 혜택을 제공합니다.',
    features: [
      'GPT-4 모델 접근',
      '빠른 응답 속도',
      '피크 시간대 안정적인 사용',
      'DALL-E 이미지 생성 기능',
      'GPT-4o 모델 접근'
    ],
    price: '$20/월',
    website: 'https://openai.com/chatgpt',
    thumbnailUrl: '/images/services/chatgpt-plus-thumbnail.jpg',
    imageUrl: '/images/services/chatgpt-plus-detail.jpg',
    comments: [
      { user: '사용자1', content: '업무 생산성이 크게 향상되었습니다.', isActive: true, likes: 15, dislikes: 2 },
      { user: '사용자2', content: '코드 작성에 많은 도움이 됩니다.', isActive: true, likes: 12, dislikes: 1 },
      { user: '사용자3', content: '가격 대비 만족스러운 서비스입니다.', isActive: true, likes: 10, dislikes: 0 }
    ]
  },
  'notion-ai': {
    title: 'Notion AI',
    category: '생산성',
    subcategory: '비즈니스 생산성',
    rating: 4.6,
    commentCount: 85,
    likes: 230,
    dislikes: 12,
    description: 'Notion에 통합된 AI 기능으로, 문서 작성, 요약, 편집, 아이디어 브레인스토밍 등을 도와주는 서비스입니다.',
    features: [
      '문서 작성 및 편집 지원',
      '텍스트 요약 기능',
      '아이디어 브레인스토밍',
      '다양한 언어로 번역',
      '문법 및 맞춤법 검사'
    ],
    price: '$10/월 (Notion 구독 별도)',
    website: 'https://www.notion.so/product/ai',
    comments: [
      { user: '사용자1', content: '문서 작성 시간이 크게 단축되었습니다.', isActive: true, likes: 8, dislikes: 1 },
      { user: '사용자2', content: '아이디어 정리에 유용합니다.', isActive: true, likes: 7, dislikes: 0 },
      { user: '사용자3', content: '가격이 조금 비싸지만 가치가 있습니다.', isActive: true, likes: 5, dislikes: 2 }
    ]
  },
  'netflix': {
    title: 'Netflix',
    category: '영상·음성',
    subcategory: '스트리밍 서비스',
    rating: 4.7,
    commentCount: 210,
    likes: 520,
    dislikes: 30,
    description: '전 세계적으로 인기 있는 영화 및 TV 프로그램 스트리밍 서비스로, 다양한 오리지널 콘텐츠를 제공합니다.',
    features: [
      '다양한 오리지널 콘텐츠',
      'HD 및 4K 화질 지원',
      '여러 기기에서 시청 가능',
      '오프라인 다운로드 기능',
      '프로필 공유 기능'
    ],
    price: '9,500원 ~ 17,000원/월',
    website: 'https://www.netflix.com',
    comments: [
      { user: '사용자1', content: '오리지널 콘텐츠의 퀄리티가 매우 좋습니다.', isActive: true, likes: 25, dislikes: 3 },
      { user: '사용자2', content: '가격이 계속 오르는 것이 아쉽습니다.', isActive: true, likes: 20, dislikes: 2 },
      { user: '사용자3', content: '다양한 기기에서 사용할 수 있어 편리합니다.', isActive: true, likes: 18, dislikes: 1 }
    ]
  }
};

export default function ServiceDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [comment, setComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        // 현재 사용자 세션 확인
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
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };
    
    checkUser();
  }, []);
  
  // 슬러그가 없거나 유효하지 않은 경우
  if (!slug || typeof slug !== 'string' || !servicesData[slug as keyof typeof servicesData]) {
    return (
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">서비스를 찾을 수 없습니다</h1>
          <Link href="/" className="text-primary hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
    );
  }
  
  const service = servicesData[slug as keyof typeof servicesData];
  
  // 서비스 데이터 수정을 위한 상태
  const [editData, setEditData] = useState({
    title: service.title,
    category: service.category,
    subcategory: service.subcategory,
    description: service.description,
    features: [...service.features],
    price: service.price,
    website: service.website,
    thumbnailUrl: service.thumbnailUrl || '',
    imageUrl: service.imageUrl || ''
  });
  
  // 이미지 파일 상태 관리
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(service.thumbnailUrl || '');
  const [imagePreview, setImagePreview] = useState<string>(service.imageUrl || '');
  
  // 파일 입력 참조
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // 피처 추가를 위한 상태
  const [newFeature, setNewFeature] = useState('');
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 구현 시 댓글 추가 로직
    console.log('댓글 추가:', comment);
    setComment('');
  };
  
  // 이미지 파일 처리 함수
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      // 업데이트된 상태로 editData 변경
      setEditData(prev => ({
        ...prev,
        thumbnailUrl: previewUrl
      }));
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // 업데이트된 상태로 editData 변경
      setEditData(prev => ({
        ...prev,
        imageUrl: previewUrl
      }));
    }
  };
  
  // 파일 선택 창 열기
  const openThumbnailFileSelector = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.click();
    }
  };
  
  const openImageFileSelector = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };
  
  // 수정 모드 토글
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    // 수정 모드 시작 시 현재 데이터로 초기화
    if (!isEditMode) {
      setEditData({
        title: service.title,
        category: service.category,
        subcategory: service.subcategory,
        description: service.description,
        features: [...service.features],
        price: service.price,
        website: service.website,
        thumbnailUrl: service.thumbnailUrl || '',
        imageUrl: service.imageUrl || ''
      });
      
      // 미리보기 초기화
      setThumbnailPreview(service.thumbnailUrl || '');
      setImagePreview(service.imageUrl || '');
      
      // 파일 상태 초기화
      setThumbnailFile(null);
      setImageFile(null);
    }
  };
  
  // 피처 추가
  const addFeature = () => {
    if (newFeature.trim() !== '') {
      setEditData({
        ...editData,
        features: [...editData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };
  
  // 피처 삭제
  const removeFeature = (index: number) => {
    const updatedFeatures = [...editData.features];
    updatedFeatures.splice(index, 1);
    setEditData({
      ...editData,
      features: updatedFeatures
    });
  };
  
  // 이미지 업로드 함수 (실제 구현 시 Supabase Storage를 사용하여 구현)
  const uploadImage = async (file: File, path: string): Promise<string> => {
    // 실제 구현 시에는 아래 코드를 사용하여 Supabase Storage에 업로드
    /*
    const { data, error } = await supabase.storage
      .from('services')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      throw new Error(`이미지 업로드 오류: ${error.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('services')
      .getPublicUrl(path);
      
    return publicUrl;
    */
    
    // 테스트를 위해 미리보기 URL 반환
    return URL.createObjectURL(file);
  };
  
  // 수정 내용 저장
  const saveChanges = async () => {
    try {
      // 이미지 업로드 처리
      let thumbnailUrl = editData.thumbnailUrl;
      let imageUrl = editData.imageUrl;
      
      if (thumbnailFile) {
        // 실제 구현 시에는 업로드 후 URL 반환
        thumbnailUrl = await uploadImage(thumbnailFile, `services/${slug}/thumbnail-${Date.now()}`);
      }
      
      if (imageFile) {
        // 실제 구현 시에는 업로드 후 URL 반환
        imageUrl = await uploadImage(imageFile, `services/${slug}/image-${Date.now()}`);
      }
      
      const updatedData = {
        ...editData,
        thumbnailUrl,
        imageUrl
      };
      
      // 실제 구현 시 API를 통해 데이터베이스에 저장
      console.log('수정된 데이터 저장:', updatedData);
      
      // 테스트를 위해 클라이언트 상태만 변경
      // 실제 구현 시에는 이 부분을 제거하고 API 호출 후 응답에 따라 처리
      const service = servicesData[slug as keyof typeof servicesData];
      service.title = updatedData.title;
      service.category = updatedData.category;
      service.subcategory = updatedData.subcategory;
      service.description = updatedData.description;
      service.features = [...updatedData.features];
      service.price = updatedData.price;
      service.website = updatedData.website;
      service.thumbnailUrl = updatedData.thumbnailUrl;
      service.imageUrl = updatedData.imageUrl;
      
      setIsEditMode(false);
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };
  
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href={`/category/${service.category.toLowerCase() === 'ai' ? 'ai' : service.category === '생산성' ? 'productivity' : 'media'}`} className="text-primary hover:underline flex items-center mb-4">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {service.category}로 돌아가기
          </Link>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 bg-gray-200 relative">
              {/* 숨겨진 파일 입력 요소 */}
              <input
                type="file"
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              {/* 서비스 이미지 표시 */}
              {(service.imageUrl || imagePreview) && (
                <div className="h-full w-full">
                  <Image
                    src={isEditMode ? imagePreview || service.imageUrl || '/images/placeholder.jpg' : service.imageUrl || '/images/placeholder.jpg'}
                    alt={service.title}
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full"
                  />
                </div>
              )}
              
              {/* 수정 모드에서 이미지 업로드 버튼 */}
              {isEditMode && (
                <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md">
                  <button
                    onClick={openImageFileSelector}
                    className="flex items-center text-sm font-medium text-primary hover:text-blue-700"
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    메인 이미지 변경
                  </button>
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.subcategory}
                    onChange={(e) => setEditData({...editData, subcategory: e.target.value})}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  service.subcategory
                )}
              </div>
              
              {/* 관리자 수정 버튼 */}
              {isAdmin && (
                <div className="absolute top-4 left-4">
                  {isEditMode ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={saveChanges}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        저장
                      </button>
                      <button
                        onClick={toggleEditMode}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={toggleEditMode}
                      className="bg-primary text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      서비스 수정
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      service.title
                    )}
                  </h1>
                  
                  {/* 썸네일 업로드 UI */}
                  {isEditMode && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="relative h-16 w-16 mr-3 border rounded overflow-hidden">
                          {(thumbnailPreview || service.thumbnailUrl) ? (
                            <Image
                              src={thumbnailPreview || service.thumbnailUrl || '/images/placeholder-thumb.jpg'}
                              alt="서비스 썸네일"
                              layout="fill"
                              objectFit="cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={openThumbnailFileSelector}
                          className="text-sm text-primary hover:text-blue-700 font-medium"
                        >
                          썸네일 변경
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className={`h-5 w-5 ${i < Math.floor(service.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">{service.rating}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap text-sm text-gray-500 mb-6">
                <div className="flex items-center mr-6">
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>댓글 {service.comments.length}개</span>
                </div>
                
                <div className="flex items-center mr-6">
                  <svg className="h-5 w-5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>좋아요 {service.likes}개</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span>싫어요 {service.dislikes}개</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-3">서비스 설명</h2>
                {isEditMode ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="border rounded p-2 w-full h-32 mb-6"
                  />
                ) : (
                  <p className="text-gray-700 mb-6">{service.description}</p>
                )}
                
                <h2 className="text-xl font-bold mb-3">주요 기능</h2>
                {isEditMode ? (
                  <div className="mb-6">
                    <ul className="list-disc pl-5 mb-4">
                      {editData.features.map((feature, index) => (
                        <li key={index} className="text-gray-700 mb-2 flex items-center">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const updatedFeatures = [...editData.features];
                              updatedFeatures[index] = e.target.value;
                              setEditData({...editData, features: updatedFeatures});
                            }}
                            className="border rounded px-2 py-1 flex-grow"
                          />
                          <button
                            onClick={() => removeFeature(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="새 기능 추가"
                        className="border rounded px-2 py-1 flex-grow"
                      />
                      <button
                        onClick={addFeature}
                        className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="list-disc pl-5 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 mb-1">{feature}</li>
                    ))}
                  </ul>
                )}
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-gray-100 p-4 rounded-lg mb-6">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold">가격</h3>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editData.price}
                        onChange={(e) => setEditData({...editData, price: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-gray-700">{service.price}</p>
                    )}
                  </div>
                  {isEditMode ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">웹사이트 URL</label>
                      <input
                        type="text"
                        value={editData.website}
                        onChange={(e) => setEditData({...editData, website: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </div>
                  ) : (
                    <a
                      href={service.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      서비스 방문
                    </a>
                  )}
                </div>
              </div>
              
              {isLoggedIn && (
                <div className="flex space-x-4 mb-8">
                  <button className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                    <svg className="h-5 w-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    좋아요
                  </button>
                  
                  <button className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                    <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    싫어요
                  </button>
                </div>
              )}
              
              {/* 댓글 섹션 */}
              <div>
                <h2 className="text-xl font-semibold mb-4">댓글 {service.comments.length}개</h2>
                
                {isLoggedIn ? (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="댓글을 작성해주세요..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                      rows={3}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      댓글 작성
                    </button>
                  </form>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <p className="text-gray-700">댓글을 작성하려면 <Link href="/login" className="text-primary hover:underline">로그인</Link>이 필요합니다.</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {service.comments.filter(c => c.isActive).map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">{comment.user}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      <div className="flex text-sm text-gray-500">
                        <div className="flex items-center mr-4">
                          <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{comment.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          <span>{comment.dislikes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
