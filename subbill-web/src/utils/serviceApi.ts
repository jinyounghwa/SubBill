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

/**
 * 슬러그로 서비스 정보를 가져옵니다.
 * @param slug 서비스 슬러그
 * @returns 서비스 정보 또는 null
 */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    console.log('슬러그로 서비스 검색 시도:', slug);
    
    // 먼저 single() 메서드를 사용하지 않고 데이터를 가져옵니다
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug);

    if (error) {
      console.error('서비스 정보를 가져오는 중 오류가 발생했습니다:', error);
      return null;
    }
    
    console.log('검색 결과 행 수:', data?.length);
    
    // 결과가 없으면 로그를 출력하고 null 반환
    if (!data || data.length === 0) {
      console.log('해당 슬러그를 가진 서비스가 없습니다:', slug);
      
      // 데이터베이스에 있는 모든 서비스의 슬러그를 가져와서 로그로 출력합니다
      const { data: allServices } = await supabase
        .from('services')
        .select('slug');
      
      console.log('사용 가능한 슬러그 목록:', allServices?.map(s => s.slug));
      return null;
    }
    
    // 결과가 있으면 첫 번째 항목 반환
    return data[0];
  } catch (error) {
    console.error('서비스 정보를 가져오는 중 예외가 발생했습니다:', error);
    return null;
  }
}

/**
 * 서비스 조회수를 증가시킵니다.
 * @param serviceId 서비스 ID
 */
export async function incrementServiceViews(serviceId: string): Promise<void> {
  try {
    // 조회수 필드가 있다고 가정합니다. 없다면 마이그레이션이 필요합니다.
    const { error } = await supabase.rpc('increment_service_views', {
      service_id: serviceId
    });

    if (error) {
      console.error('조회수 증가 중 오류가 발생했습니다:', error);
    }
  } catch (error) {
    console.error('조회수 증가 중 오류가 발생했습니다:', error);
  }
}

/**
 * 서비스 좋아요를 증가시킵니다.
 * @param serviceId 서비스 ID
 */
export async function likeService(serviceId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('likes')
      .eq('id', serviceId)
      .single();

    if (error) {
      console.error('서비스 좋아요 증가 중 오류가 발생했습니다:', error);
      return;
    }

    const currentLikes = data.likes || 0;
    
    const { error: updateError } = await supabase
      .from('services')
      .update({ likes: currentLikes + 1 })
      .eq('id', serviceId);

    if (updateError) {
      console.error('서비스 좋아요 증가 중 오류가 발생했습니다:', updateError);
    }
  } catch (error) {
    console.error('서비스 좋아요 증가 중 오류가 발생했습니다:', error);
  }
}

/**
 * 서비스 싫어요를 증가시킵니다.
 * @param serviceId 서비스 ID
 */
export async function dislikeService(serviceId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('dislikes')
      .eq('id', serviceId)
      .single();

    if (error) {
      console.error('서비스 싫어요 증가 중 오류가 발생했습니다:', error);
      return;
    }

    const currentDislikes = data.dislikes || 0;
    
    const { error: updateError } = await supabase
      .from('services')
      .update({ dislikes: currentDislikes + 1 })
      .eq('id', serviceId);

    if (updateError) {
      console.error('서비스 싫어요 증가 중 오류가 발생했습니다:', updateError);
    }
  } catch (error) {
    console.error('서비스 싫어요 증가 중 오류가 발생했습니다:', error);
  }
}

/**
 * 서비스 정보를 업데이트합니다.
 * @param serviceId 서비스 ID
 * @param updates 업데이트할 데이터
 * @returns 업데이트된 서비스 정보 또는 오류
 */
export async function updateService(serviceId: string, updates: Partial<Service>): Promise<{ data: Service | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) {
      console.error('서비스 업데이트 중 오류가 발생했습니다:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('서비스 업데이트 중 오류가 발생했습니다:', error);
    return { data: null, error };
  }
}

/**
 * 서비스의 활성화 상태를 변경합니다.
 * @param serviceId 서비스 ID
 * @param isActive 활성화 상태
 * @returns 업데이트된 서비스 정보 또는 오류
 */
export async function toggleServiceActive(serviceId: string, isActive: boolean): Promise<{ data: Service | null; error: any }> {
  return updateService(serviceId, { is_active: isActive });
}
