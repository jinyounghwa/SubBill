import React, { ReactNode } from 'react';

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

interface ServiceFeaturesProps {
  service: Service;
}

const ServiceFeatures: React.FC<ServiceFeaturesProps> = ({ service }) => {
  // features는 JSON 형식으로 저장되어 있다고 가정합니다
  const features = service.features ? 
    (typeof service.features === 'string' ? 
      JSON.parse(service.features) : service.features) : [];

  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-full">
      <h2 className="text-2xl font-bold mb-4">주요 기능</h2>
      
      <ul className="space-y-3">
        {Array.isArray(features) ? (
          features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))
        ) : (
          Object.entries(features).map(([key, value]: [string, any], index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <div>
                <span className="font-medium">{key}: </span>
                <span className="text-gray-700">{String(value)}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ServiceFeatures;
