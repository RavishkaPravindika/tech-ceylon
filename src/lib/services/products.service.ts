// Products Service for Tech Ceylon

import { v4 as uuidv4 } from 'uuid';
import { dbSet, dbGet, dbGetAll, dbUpdate, dbDelete, dbQueryByChild, serverTimestamp } from '@/lib/firebase/db';
import { Product, ProductFormData, ProductFilters, ProductStatus } from '@/types/product.types';
import { generateSlug } from '@/lib/utils/slugify';
import { createLog } from './logs.service';

const PRODUCTS_PATH = 'products';

/**
 * Create a new product
 */
export async function createProduct(
  data: ProductFormData,
  createdBy: string,
  createdByName: string
): Promise<Product> {
  const productId = uuidv4();
  const slug = generateSlug(data.name);
  const now = serverTimestamp();

  const product: Product = {
    productId,
    slug,
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy,
    updatedBy: createdBy,
    deleted: false,
  };

  await dbSet(`${PRODUCTS_PATH}/${productId}`, product);

  await createLog({
    userId: createdBy,
    userName: createdByName,
    action: 'admin:add_product',
    entity: 'product',
    entityId: productId,
    details: { productName: data.name, productCode: data.productCode },
  });

  return product;
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  data: Partial<ProductFormData>,
  updatedBy: string,
  updatedByName: string
): Promise<void> {
  const now = serverTimestamp();
  const updates: Partial<Product> = {
    ...data,
    updatedAt: now,
    updatedBy,
  };

  if (data.name) {
    updates.slug = generateSlug(data.name);
  }

  await dbUpdate(`${PRODUCTS_PATH}/${productId}`, updates as Record<string, unknown>);

  await createLog({
    userId: updatedBy,
    userName: updatedByName,
    action: 'admin:edit_product',
    entity: 'product',
    entityId: productId,
    details: { updatedFields: Object.keys(data) },
  });
}

/**
 * Soft delete a product (sets deleted: true)
 */
export async function deleteProduct(
  productId: string,
  deletedBy: string,
  deletedByName: string
): Promise<void> {
  await dbUpdate(`${PRODUCTS_PATH}/${productId}`, {
    deleted: true,
    status: 'archived' as ProductStatus,
    updatedAt: serverTimestamp(),
    updatedBy: deletedBy,
  });

  await createLog({
    userId: deletedBy,
    userName: deletedByName,
    action: 'admin:delete_product',
    entity: 'product',
    entityId: productId,
  });
}

/**
 * Hard delete a product (permanent)
 */
export async function hardDeleteProduct(productId: string): Promise<void> {
  await dbDelete(`${PRODUCTS_PATH}/${productId}`);
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  return dbGet<Product>(`${PRODUCTS_PATH}/${productId}`);
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await dbQueryByChild<Product>(PRODUCTS_PATH, 'slug', slug);
  return products.find((p) => !p.deleted) || null;
}

/**
 * Get all non-deleted products
 */
export async function getAllProducts(): Promise<Product[]> {
  const all = await dbGetAll<Product>(PRODUCTS_PATH);
  return all.filter((p) => !p.deleted);
}

/**
 * Get active products for the public store
 */
export async function getActiveProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.status === 'active');
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const active = await getActiveProducts();
  return active.filter((p) => p.featured).slice(0, limit);
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const active = await getActiveProducts();
  return active.filter((p) => p.categoryId === categoryId);
}

/**
 * Filter and sort products
 */
export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilters,
  sort = 'newest'
): Product[] {
  let result = [...products];

  // Apply filters
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  if (filters.categoryId) {
    result = result.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.brand) {
    result = result.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((p) => (p.discountPrice ?? p.price) >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => (p.discountPrice ?? p.price) <= filters.maxPrice!);
  }

  if (filters.inStock) {
    result = result.filter((p) => p.stockQuantity > 0);
  }

  if (filters.featured !== undefined) {
    result = result.filter((p) => p.featured === filters.featured);
  }

  if (filters.status) {
    result = result.filter((p) => p.status === filters.status);
  }

  // Apply sort
  switch (sort) {
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price_asc':
      result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      break;
    case 'price_desc':
      result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      break;
    case 'oldest':
      result.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'category':
      result.sort((a, b) => a.categoryId.localeCompare(b.categoryId));
      break;
    case 'newest':
    default:
      result.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return result;
}

/**
 * Update product status
 */
export async function updateProductStatus(
  productId: string,
  status: ProductStatus,
  updatedBy: string
): Promise<void> {
  await dbUpdate(`${PRODUCTS_PATH}/${productId}`, {
    status,
    updatedAt: serverTimestamp(),
    updatedBy,
  });
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(threshold = 5): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.stockQuantity <= threshold && p.status === 'active');
}
