import React from 'react';
import Image from 'next/image';

// 인라인 타입 정의
interface Service {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  features: any; // JSON 형식으로 저장된 기능 목록
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

interface ServiceHeaderProps {
  service: Service;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({ service }) => {
  console.log('ServiceHeader - 이미지 URL:', service.image_url);
  console.log('ServiceHeader - 썸네일 URL:', service.thumbnail_url);
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="flex flex-col items-start gap-6">
        <div className="w-full relative">
          {service.image_url ? (
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image 
                src={service.image_url} 
                alt={service.title} 
                fill
                className="rounded-lg object-cover"
                unoptimized={true}
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지로 대체
                  console.error('이미지 로드 실패:', service.image_url);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // 무한 루프 방지
                  target.src = '/images/default-service.jpg'; // 기본 이미지 경로
                }}
              />
            </div>
          ) : (
            <div className="bg-gray-200 w-full h-96 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">이미지 없음</span>
            </div>
          )}
        </div>
        
        <div className="w-full hidden">
          <div className="flex flex-col items-start justify-center h-full">
            <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {service.category}
              </div>
              {service.subcategory && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {service.subcategory}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHeader;
