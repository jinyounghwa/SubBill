import { FC } from 'react';

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

interface AdminServiceEditorProps {
  service: Service;
  onUpdate: (updatedService: Service) => void;
}

declare const AdminServiceEditor: FC<AdminServiceEditorProps>;

export default AdminServiceEditor;
