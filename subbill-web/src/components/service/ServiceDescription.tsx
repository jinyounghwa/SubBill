import React from 'react';

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
  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{service.title}</h1>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span className="ml-1 text-lg font-medium">{service.rating ? service.rating.toFixed(1) : '평점 없음'}</span>
          </div>
          
          <button className="flex items-center hover:bg-gray-100 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
            </svg>
            <span className="ml-1 font-medium">{service.likes || 0}</span>
          </button>
          
          <button className="flex items-center hover:bg-gray-100 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"></path>
            </svg>
            <span className="ml-1 font-medium">{service.dislikes || 0}</span>
          </button>
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
    </div>
  );
};

export default ServiceDescription;
