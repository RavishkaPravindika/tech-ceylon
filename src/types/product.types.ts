// Product Types for Tech Ceylon

export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'archived';

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  productId: string;
  productCode: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  brand: string;
  featured: boolean;
  status: ProductStatus;
  images: string[];
  specifications: ProductSpecification[];
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
  deleted?: boolean;
}

export interface ProductFormData {
  productCode: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  brand: string;
  featured: boolean;
  status: ProductStatus;
  images: string[];
  specifications: ProductSpecification[];
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  status?: ProductStatus;
}

export type ProductSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'oldest'
  | 'category';
