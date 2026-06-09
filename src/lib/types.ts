export type ProductStatus = "active" | "draft" | "archived";
export type OrderStatus = "pendente" | "pago" | "enviado" | "entregue" | "cancelado";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  category_slug?: string;
  category_name?: string;
  description: string;
  price_cents: number;
  stock: number;
  images: string[];
  featured: boolean;
  best_seller: boolean;
  status: ProductStatus;
  created_at?: string;
  updated_at?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CheckoutLine = {
  product_id: string;
  quantity: number;
};
