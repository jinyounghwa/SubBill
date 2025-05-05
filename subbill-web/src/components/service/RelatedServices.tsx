import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

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
}

interface RelatedServicesProps {
  currentServiceId: string;
  category: string;
  subcategory: string;
}

const RelatedServices: React.FC<RelatedServicesProps> = ({ 
  currentServiceId, 
  category, 
  subcategory 
}) => {
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedServices();
  }, [currentServiceId, category, subcategory]);

  const fetchRelatedServices = async () => {
    setLoading(true);
    try {
      // 같은 카테고리와 서브카테고리에 속하는 다른 서비스를 가져옵니다
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', category)
        .eq('subcategory', subcategory)
        .neq('id', currentServiceId)
        .limit(4);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setRelatedServices(data);
      } else {
        // 같은 카테고리의 다른 서비스를 가져옵니다
        const { data: categoryData, error: categoryError } = await supabase
          .from('services')
          .select('*')
          .eq('category', category)
          .neq('id', currentServiceId)
          .limit(4);

        if (categoryError) {
          throw categoryError;
        }

        setRelatedServices(categoryData || []);
      }
    } catch (error) {
      console.error('관련 서비스를 불러오는 중 오류가 발생했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">관련 서비스</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedServices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">관련 서비스</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedServices.map((service) => (
          <Link 
            href={`/service/${service.slug}`} 
            key={service.id}
            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
              <div className="relative h-40 w-full">
                {service.thumbnail_url ? (
                  <Image
                    src={service.thumbnail_url}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <span className="text-gray-400">이미지 없음</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 truncate">{service.title}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {service.subcategory}
                  </span>
                </div>
              </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedServices;
