import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// 컴포넌트 임포트
import ServiceHeader from '@/components/service/ServiceHeader';
import ServiceDescription from '@/components/service/ServiceDescription';
import ServiceFeatures from '@/components/service/ServiceFeatures';
import ServiceComments from '@/components/service/ServiceComments';
import dynamic from 'next/dynamic';

// 동적 임포트로 AdminServiceEditor 컴포넌트 불러오기
const AdminServiceEditor = dynamic<{
  service: Service;
  onUpdate: (updatedService: Service) => void;
}>(() => import('@/components/admin/AdminServiceEditor'), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-100 rounded-lg animate-pulse">관리자 도구 로딩 중...</div>
});

// 유틸리티 임포트
import { getServiceBySlug, incrementServiceViews, updateService } from '@/utils/serviceApi';
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
  views?: number;
  created_at: string;
  updated_at: string;
  slug: string;
  is_active?: boolean;
}

interface ServicePageProps {
  service: Service;
}

export default function ServiceDetailPage({ service }: { service: Service }) {
  const router = useRouter();
  const [views, setViews] = useState(service.views || 0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentService, setCurrentService] = useState<Service>(service);

  // 관리자 상태 확인
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.session.user.id)
          .single();
        
        setIsAdmin(profile?.is_admin === true);
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
    // 조회수 증가 함수 호출
    const incrementViews = async () => {
      try {
        await incrementServiceViews(service.id);
        setViews(prev => prev + 1);
      } catch (error) {
        console.error('조회수 증가 중 오류가 발생했습니다:', error);
      }
    };

    incrementViews();
  }, [service.id]);
  
  // 서비스 업데이트 핸들러
  const handleServiceUpdate = (updatedService: Service) => {
    setCurrentService(updatedService);
  };

  // 페이지가 새로고침되거나 처음 로드될 때 조회수 증가
  useEffect(() => {
    if (service?.id) {
      incrementServiceViews(service.id);
    }
  }, [service?.id]);

  // 서비스 데이터가 없는 경우 로딩 상태 표시
  if (router.isFallback || !service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // 서비스 데이터가 없는 경우 404 페이지 표시
  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">서비스를 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-8">요청하신 서비스가 존재하지 않거나 삭제되었습니다.</p>
        <button 
          onClick={() => router.push('/')} 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${currentService.title} | SubBill`}</title>
        <meta name="description" content={currentService.description.slice(0, 160)} />
        <meta property="og:title" content={`${currentService.title} | SubBill`} />
        <meta property="og:description" content={currentService.description.slice(0, 160)} />
        {currentService.image_url && <meta property="og:image" content={currentService.image_url} />}
      </Head>

      <div className="container mx-auto px-4 py-8">
        {isAdmin && (
          <AdminServiceEditor service={currentService} onUpdate={handleServiceUpdate} />
        )}
        
        {(!isAdmin || (isAdmin && currentService.is_active !== false)) && (
          <>
            <ServiceHeader service={currentService} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <ServiceDescription service={currentService} />
              </div>
              <div>
                <ServiceFeatures service={currentService} />
              </div>
            </div>
            
            <ServiceComments serviceId={currentService.id} />
          </>
        )}
        
        {isAdmin && currentService.is_active === false && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mt-4">
            <p className="font-bold">비활성화된 서비스</p>
            <p>이 서비스는 현재 비활성화되어 있어 일반 사용자에게는 보이지 않습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = async ({ params }: { params: { slug: string } }) => {
  const slug = params?.slug as string;
  
  console.log('요청된 슬러그:', slug);
  
  if (!slug) {
    console.log('슬러그가 없습니다.');
    return {
      notFound: true
    };
  }
  
  const service = await getServiceBySlug(slug);
  
  console.log('가져온 서비스 데이터:', service ? '있음' : '없음');
  
  if (!service) {
    console.log('서비스 데이터가 없습니다.');
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      service
    }
  };
};