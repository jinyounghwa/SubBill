export interface User {
  id: string;
  email?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string;
    picture?: string;
    provider_id?: string;
    sub?: string;
  };
  aud?: string;
  confirmation_sent_at?: string;
  confirmed_at?: string;
  created_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  phone?: string;
  role?: string;
  updated_at?: string;
}
