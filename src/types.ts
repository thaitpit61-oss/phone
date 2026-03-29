export interface Phone {
  id: string;
  name: string;
  brand: string;
  price: number;
  status: 'available' | 'sold';
  description: string | null;
  created_at: string;
  updated_at: string;
  images?: PhoneImage[];
}

export interface PhoneImage {
  id: string;
  phone_id: string;
  storage_path: string;
  public_url: string;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}
