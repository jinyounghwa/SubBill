export interface Service {
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
  created_at: string;
  updated_at: string;
  slug: string;
}
