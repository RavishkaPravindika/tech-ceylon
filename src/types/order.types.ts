// Order Types for Tech Ceylon

export type OrderStatus =
  | 'pending'
  | 'contacted'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  productCode: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  userId?: string | null;
}

export interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

export interface WhatsAppOrderMessage {
  customerInfo: CustomerInfo;
  items: OrderItem[];
  total: number;
}
