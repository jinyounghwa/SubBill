export interface Comment {
  id: string;
  service_id: string;
  user_id: string;
  content: string;
  is_active: boolean;
  likes: number;
  dislikes: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}
