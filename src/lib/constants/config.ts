// App-wide constants for Tech Ceylon

export const APP_NAME = 'Tech Ceylon';
export const APP_DESCRIPTION =
  'Premium tech products catalog with WhatsApp ordering. Browse the latest electronics, accessories, and gadgets.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94771234567';
export const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || '+94 77 123 4567';
export const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'ravishkapravindika99@gmail.com';

export const CURRENCY = 'Rs.';
export const CURRENCY_CODE = 'LKR';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  ADMIN_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;

export const IMAGE_PLACEHOLDER = '/images/placeholder.png';
export const OG_IMAGE = '/og-image.jpg';

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'contacted', label: 'Contacted', color: 'blue' },
  { value: 'processing', label: 'Processing', color: 'purple' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const PRODUCT_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'draft', label: 'Draft', color: 'yellow' },
  { value: 'out_of_stock', label: 'Out of Stock', color: 'red' },
  { value: 'archived', label: 'Archived', color: 'gray' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A → Z' },
  { value: 'name_desc', label: 'Name Z → A' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'category', label: 'Category' },
] as const;

export const LOW_STOCK_THRESHOLD = 5;
