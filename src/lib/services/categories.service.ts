// Categories Service for Tech Ceylon

import { v4 as uuidv4 } from 'uuid';
import { dbSet, dbGet, dbGetAll, dbUpdate, dbDelete, serverTimestamp } from '@/lib/firebase/db';
import { Category, CategoryFormData, CategoryStatus } from '@/types/category.types';
import { generateSlug } from '@/lib/utils/slugify';
import { createLog } from './logs.service';

const CATEGORIES_PATH = 'categories';

/**
 * Create a new category
 */
export async function createCategory(
  data: CategoryFormData,
  createdBy: string,
  createdByName: string
): Promise<Category> {
  const categoryId = uuidv4();
  const slug = generateSlug(data.name);
  const now = serverTimestamp();

  const category: Category = {
    categoryId,
    slug,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await dbSet(`${CATEGORIES_PATH}/${categoryId}`, category);

  await createLog({
    userId: createdBy,
    userName: createdByName,
    action: 'admin:add_category',
    entity: 'category',
    entityId: categoryId,
    details: { categoryName: data.name },
  });

  return category;
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<CategoryFormData>,
  updatedBy: string,
  updatedByName: string
): Promise<void> {
  const updates: Partial<Category> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.name) {
    updates.slug = generateSlug(data.name);
  }

  await dbUpdate(`${CATEGORIES_PATH}/${categoryId}`, updates as Record<string, unknown>);

  await createLog({
    userId: updatedBy,
    userName: updatedByName,
    action: 'admin:edit_category',
    entity: 'category',
    entityId: categoryId,
    details: { updatedFields: Object.keys(data) },
  });
}

/**
 * Delete a category
 */
export async function deleteCategory(
  categoryId: string,
  deletedBy: string,
  deletedByName: string
): Promise<void> {
  await dbDelete(`${CATEGORIES_PATH}/${categoryId}`);

  await createLog({
    userId: deletedBy,
    userName: deletedByName,
    action: 'admin:delete_category',
    entity: 'category',
    entityId: categoryId,
  });
}

/**
 * Get a category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  return dbGet<Category>(`${CATEGORIES_PATH}/${categoryId}`);
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  const all = await dbGetAll<Category>(CATEGORIES_PATH);
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get active categories
 */
export async function getActiveCategories(): Promise<Category[]> {
  const all = await getAllCategories();
  return all.filter((c) => c.status === 'active');
}

/**
 * Toggle category status
 */
export async function toggleCategoryStatus(
  categoryId: string,
  status: CategoryStatus,
  updatedBy: string
): Promise<void> {
  await dbUpdate(`${CATEGORIES_PATH}/${categoryId}`, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get a category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug) || null;
}
