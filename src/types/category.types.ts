// Category Types for Tech Ceylon

export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: CategoryStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
  image: string;
  status: CategoryStatus;
}
