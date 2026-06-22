// Route constants for Tech Ceylon

export const ROUTES = {
  // Public store
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (slug: string) => `/products/${slug}`,
  CATEGORIES: '/categories',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  ABOUT: '/about',
  CONTACT: '/contact',

  // Admin portal
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCTS_CREATE: '/admin/products/create',
  ADMIN_PRODUCTS_EDIT: (id: string) => `/admin/products/edit/${id}`,
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ADMINS: '/admin/admins',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export const ADMIN_ROUTES_PREFIX = '/admin';
export const PROTECTED_ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/products',
  '/admin/categories',
  '/admin/orders',
  '/admin/admins',
  '/admin/logs',
  '/admin/settings',
];

export const SUPER_ADMIN_ONLY_ROUTES = ['/admin/admins', '/admin/logs', '/admin/settings'];
