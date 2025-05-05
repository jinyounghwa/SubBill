import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { updateService, toggleServiceActive } from '@/utils/serviceApi';

// 서비스 타입 정의
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
  views?: number;
  created_at: string;
  updated_at: string;
  slug: string;
  is_active?: boolean;
}

interface AdminServiceEditorProps {
  service: Service;
  onUpdate: (updatedService: Service) => void;
}

const AdminServiceEditor: React.FC<AdminServiceEditorProps> = ({ service, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 이미지 업로드 상태
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // 서비스 데이터 상태
  const [title, setTitle] = useState(service.title);
  const [category, setCategory] = useState(service.category);
  const [subcategory, setSubcategory] = useState(service.subcategory);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState(service.price);
  const [website, setWebsite] = useState(service.website);
  const [features, setFeatures] = useState(
    typeof service.features === 'string' 
      ? service.features 
      : Array.isArray(service.features) 
        ? JSON.stringify(service.features) 
        : '[]'
  );
  const [isActive, setIsActive] = useState(service.is_active !== false); // 기본값은 활성화

  // 이미지 파일 선택 핸들러
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
      // 파일 이름 생성 (특수문자 제거)
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${Date.now()}_${cleanFileName}`;
      const filePath = `${path}/${fileName}`;
      
      console.log(`업로드 시도: ${filePath}`);
      
      // 파일 업로드
      const { data, error } = await supabase.storage
        .from('service-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('업로드 오류:', error);
        throw new Error(`이미지 업로드 중 오류가 발생했습니다: ${error.message}`);
      }
      
      console.log('업로드 성공:', data);

      // 업로드된 이미지의 공개 URL 반환
      const { data: publicURL } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);
      
      console.log('공개 URL:', publicURL);
      
      // 전체 URL 반환 (Supabase Storage 도메인 포함)
      const fullUrl = publicURL.publicUrl;
      console.log('전체 URL:', fullUrl);
      
      // URL이 유효한지 확인
      if (!fullUrl || !fullUrl.startsWith('http')) {
        throw new Error('유효하지 않은 이미지 URL이 생성되었습니다');
      }
      
      return fullUrl;
    } catch (error) {
      console.error('이미지 업로드 예외 발생:', error);
      throw new Error(`이미지 업로드 중 예외가 발생했습니다: ${error}`);
    }
  };

  // 서비스 업데이트 핸들러
  const handleUpdateService = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // features가 유효한 JSON인지 확인
      let parsedFeatures;
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        throw new Error('주요 기능은 유효한 JSON 형식이어야 합니다.');
      }

      let updates: Partial<Service> = {
        title,
        category,
        subcategory,
        description,
        price,
        website,
        features: parsedFeatures,
        is_active: isActive
      };

      // 썸네일 이미지 업로드
      if (thumbnailFile) {
        console.log('썸네일 이미지 업로드 시작');
        try {
          const thumbnailUrl = await uploadImage(thumbnailFile, 'thumbnails');
          console.log('썸네일 업로드 완료:', thumbnailUrl);
          updates.thumbnail_url = thumbnailUrl;
        } catch (err: any) {
          console.error('썸네일 업로드 오류:', err);
          throw new Error(`썸네일 업로드 중 오류: ${err.message || String(err)}`);
        }
      }

      // 메인 이미지 업로드
      if (imageFile) {
        console.log('메인 이미지 업로드 시작');
        try {
          const imageUrl = await uploadImage(imageFile, 'images');
          console.log('메인 이미지 업로드 완료:', imageUrl);
          updates.image_url = imageUrl;
        } catch (err: any) {
          console.error('메인 이미지 업로드 오류:', err);
          throw new Error(`메인 이미지 업로드 중 오류: ${err.message || String(err)}`);
        }
      }

      console.log('서비스 업데이트 데이터:', updates);

      // 서비스 정보 업데이트
      const { data, error } = await updateService(service.id, updates);

      if (error) {
        console.error('서비스 업데이트 오류:', error);
        throw new Error(`서비스 업데이트 중 오류가 발생했습니다: ${error.message}`);
      }

      if (data) {
        console.log('업데이트된 서비스 데이터:', data);
        
        // 새로고침을 트리거하기 위해 새로운 서비스 객체를 생성
        const updatedService = {
          ...service,
          ...updates,
          thumbnail_url: updates.thumbnail_url || service.thumbnail_url,
          image_url: updates.image_url || service.image_url
        };
        
        setSuccess('서비스가 성공적으로 업데이트되었습니다.');
        onUpdate(updatedService);
        setIsEditing(false);
        
        // 브라우저 캐시 방지를 위해 URL에 타임스탬프 추가
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setThumbnailPreview(null);
        setImagePreview(null);
        setThumbnailFile(null);
        setImageFile(null);
        
        // 새로고침 유도
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      console.error('서비스 업데이트 예외:', err);
      setError(err.message || '서비스 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 서비스 활성화/비활성화 토글 핸들러
  const handleToggleActive = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newActiveState = !isActive;
      const { data, error } = await toggleServiceActive(service.id, newActiveState);

      if (error) {
        throw new Error(`서비스 상태 변경 중 오류가 발생했습니다: ${error.message}`);
      }

      if (data) {
        setIsActive(newActiveState);
        setSuccess(`서비스가 ${newActiveState ? '활성화' : '비활성화'}되었습니다.`);
        onUpdate(data);
      }
    } catch (err: any) {
      setError(err.message || '서비스 상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setIsEditing(false);
    setTitle(service.title);
    setCategory(service.category);
    setSubcategory(service.subcategory);
    setDescription(service.description);
    setPrice(service.price);
    setWebsite(service.website);
    setFeatures(
      typeof service.features === 'string' 
        ? service.features 
        : Array.isArray(service.features) 
          ? JSON.stringify(service.features) 
          : '[]'
    );
    setIsActive(service.is_active !== false);
    setThumbnailFile(null);
    setImageFile(null);
    setThumbnailPreview(null);
    setImagePreview(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">관리자 도구</h2>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                편집
              </button>
              <button
                onClick={handleToggleActive}
                className={`px-4 py-2 ${
                  isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-md transition-colors`}
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : isActive ? '비활성화' : '활성화'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUpdateService}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                취소
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              서비스 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                카테고리
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                서브카테고리
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              서비스 설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              가격
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              웹사이트
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              주요 기능 (JSON 형식의 배열)
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={5}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm"
              placeholder='["기능1", "기능2", "기능3"]'
            />
            <p className="text-xs text-gray-500 mt-1">JSON 배열 형식으로 입력해주세요. 예: ["기능1", "기능2", "기능3"]</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              썸네일 이미지
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 border rounded overflow-hidden">
                {(thumbnailPreview || service.thumbnail_url) && (
                  <Image
                    src={thumbnailPreview || service.thumbnail_url}
                    alt="썸네일 미리보기"
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지로 대체
                      console.error('썸네일 로드 실패:', thumbnailPreview || service.thumbnail_url);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // 무한 루프 방지
                      target.src = '/images/default-service.jpg';
                    }}
                  />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              메인 이미지
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 border rounded overflow-hidden">
                {(imagePreview || service.image_url) && (
                  <Image
                    src={imagePreview || service.image_url}
                    alt="메인 이미지 미리보기"
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지로 대체
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // 무한 루프 방지
                      target.src = '/images/default-service.jpg';
                    }}
                  />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-700">
          <p>
            <span className="font-semibold">상태:</span>{' '}
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isActive ? '활성화' : '비활성화'}
            </span>
          </p>
          <p className="mt-2">
            <span className="font-semibold">마지막 업데이트:</span>{' '}
            {new Date(service.updated_at).toLocaleString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminServiceEditor;
