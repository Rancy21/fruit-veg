export type UserRole = {
  name: string;
};

export type User = {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  disabled?: boolean;
  roles: UserRole[];
};

export type UserCreate = {
  username: string;
  email: string;
  full_name: string;
  password: string;
  phone_number?: string;
  location?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  calories?: number;
  carbs?: number;
  sugar?: number;
  protein?: number;
  fat?: number;
  image_url?: string;
};

export type ProductCreate = {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  calories?: number;
  carbs?: number;
  sugar?: number;
  protein?: number;
  fat?: number;
  image_url?: string;
};

export type OrderItemCreate = {
  order_id: number;
  product_id: string;
  price_at_purchase: string;
  quantity: string;
};

export type OrderResponse = {
  id: number;
  user_name: string;
  total_price: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_name: string;
  quantity: string;
  price_at_purchase: string;
};

export type SearchRequest = {
  query: string;
};

export type SearchResponse = {
  query: string;
  results: Product[];
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};
