// Admin Types for Tech Ceylon

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface Admin {
  uid: string;
  name: string;
  email: string;
  role: AdminRole;
  addedBy: string;
  createdAt: number;
}

export interface AdminFormData {
  email: string;
  role: AdminRole;
}

export const ADMIN_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: [
    'manage:products',
    'manage:categories',
    'manage:orders',
    'manage:users',
    'manage:admins',
    'manage:settings',
    'view:logs',
    'view:analytics',
    'view:dashboard',
  ],
  ADMIN: [
    'manage:products',
    'manage:categories',
    'manage:orders',
    'view:analytics',
    'view:dashboard',
  ],
};

export const SUPER_ADMIN_EMAIL = 'ravishkapravindika99@gmail.com';
