export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  is_active: boolean;
  created_at?: string;
  orders_count?: number;
  total_spent?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  variant_name: string;
  variant_value: string;
  price_adjustment: number;
  stock: number;
}

export interface ProductSpecification {
  id: number;
  specification_name: string;
  specification_value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  brand_id?: number | null;
  category_id?: number | null;
  price: number;
  sale_price?: number | null;
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  brand?: Brand | null;
  category?: Category | null;
  images: ProductImage[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  rating: number;
  reviews_count: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  product: Product;
  variant?: ProductVariant | null;
  unit_price: number;
  item_total: number;
}

export interface Cart {
  id: number;
  user_id?: number | null;
  session_id?: string | null;
  items: CartItem[];
  subtotal: number;
  items_count: number;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code?: string | null;
  is_default: boolean;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number | null;
  product_name: string;
  product_image?: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  variant_id?: number | null;
  variant_info?: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  address_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code?: string | null;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes?: string | null;
  coupon_code?: string | null;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export interface Review {
  id: number;
  user_id: number;
  user_name?: string | null;
  product_id: number;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order: number;
  maximum_discount?: number | null;
  expiry_date?: string | null;
  usage_limit: number;
  times_used: number;
  is_active: boolean;
}

export interface DashboardStats {
  stats: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    pending_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    low_stock_products: number;
  };
  sales_chart: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  status_breakdown: Record<string, number>;
  recent_orders: Order[];
}
