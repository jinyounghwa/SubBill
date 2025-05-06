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
 * @returns 성공 여부
 */
export async function incrementServiceViews(serviceId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_service_views', {
      service_id: serviceId
    });

    if (error) {
      console.error('조회수 증가 중 오류가 발생했습니다:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('조회수 증가 중 오류가 발생했습니다:', error);
    return false;
  }
}

/**
 * 사용자의 평가 상태를 가져옵니다.
 * @param serviceId 서비스 ID
 * @returns 사용자의 평가 상태
 */
export async function getUserRating(serviceId: string): Promise<{ liked: boolean | null; disliked: boolean | null; rating: number | null; is_logged_in: boolean }> {
  try {
    const { data, error } = await supabase.rpc('get_user_rating', {
      service_id: serviceId
    });

    if (error) {
      console.error('사용자 평가 상태 확인 중 오류가 발생했습니다:', error);
      return { liked: null, disliked: null, rating: null, is_logged_in: false };
    }
    
    return data;
  } catch (error) {
    console.error('사용자 평가 상태 확인 중 오류가 발생했습니다:', error);
    return { liked: null, disliked: null, rating: null, is_logged_in: false };
  }
}

/**
 * 서비스 좋아요를 토글합니다.
 * @param serviceId 서비스 ID
 * @param value 좋아요 값 (기본값: true)
 * @returns 성공 여부
 */
export async function likeService(serviceId: string, value: boolean = true): Promise<boolean> {
  try {
    // 데이터베이스 함수를 사용하여 좋아요 토글
    const { data, error } = await supabase.rpc('toggle_service_like', {
      service_id: serviceId,
      like_value: value
    });

    if (error) {
      // 로그인 필요 오류 확인
      if (error.message.includes('로그인이 필요합니다')) {
        console.error('좋아요 기능은 로그인이 필요합니다.');
        return false;
      }
      console.error('서비스 좋아요 토글 중 오류가 발생했습니다:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('서비스 좋아요 토글 중 오류가 발생했습니다:', error);
    return false;
  }
}

/**
 * 서비스 싫어요를 토글합니다.
 * @param serviceId 서비스 ID
 * @param value 싫어요 값 (기본값: true)
 * @returns 성공 여부
 */
export async function dislikeService(serviceId: string, value: boolean = true): Promise<boolean> {
  try {
    // 데이터베이스 함수를 사용하여 싫어요 토글
    const { data, error } = await supabase.rpc('toggle_service_dislike', {
      service_id: serviceId,
      dislike_value: value
    });

    if (error) {
      // 로그인 필요 오류 확인
      if (error.message.includes('로그인이 필요합니다')) {
        console.error('싫어요 기능은 로그인이 필요합니다.');
        return false;
      }
      console.error('서비스 싫어요 토글 중 오류가 발생했습니다:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('서비스 싫어요 토글 중 오류가 발생했습니다:', error);
    return false;
  }
}

/**
 * 서비스에 별점을 매깁니다.
 * @param serviceId 서비스 ID
 * @param rating 별점 (0.5 ~ 5.0)
 * @returns 성공 여부
 */
export async function rateService(serviceId: string, rating: number): Promise<boolean> {
  try {
    // 별점 범위 확인
    if (rating < 0.5 || rating > 5.0) {
      console.error('별점은 0.5에서 5.0 사이여야 합니다.');
      return false;
    }
    
    // 데이터베이스 함수를 사용하여 별점 매기기
    const { data, error } = await supabase.rpc('rate_service', {
      service_id: serviceId,
      rating_value: rating
    });

    if (error) {
      // 로그인 필요 오류 확인
      if (error.message.includes('로그인이 필요합니다')) {
        console.error('별점 기능은 로그인이 필요합니다.');
        return false;
      }
      console.error('서비스 별점 매기기 중 오류가 발생했습니다:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('서비스 별점 매기기 중 오류가 발생했습니다:', error);
    return false;
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
