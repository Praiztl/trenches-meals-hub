export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  fixed_price: number;
  image_url: string;
  is_available: boolean;
  items?: { menu_item: MenuItem; quantity: number }[];
}

export interface CartItem {
  id: string;
  type: 'ITEM' | 'COMBO';
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  ref_id: string;
  name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}
