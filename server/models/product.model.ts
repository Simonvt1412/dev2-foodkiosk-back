export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  is_available: boolean;
  image_url?: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
  type?: 'portion' | 'pasta' | 'sauce' | 'extra';
}