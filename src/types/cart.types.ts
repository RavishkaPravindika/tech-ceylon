// Cart Types for Tech Ceylon

export interface CartItem {
  productId: string;
  name: string;
  productCode: string;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  subtotal: number;
  image?: string;
  slug?: string;
}

export interface Cart {
  items: Record<string, CartItem>;
  updatedAt: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  totalItems: number;
}
