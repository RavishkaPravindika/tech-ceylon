'use client';

// Deprecated Firebase Storage helpers
// These are now wrappers around the new upload service which uses ImgBB

import { getFirebaseStorage } from './config';
import { ref } from 'firebase/storage';
import {
  uploadFile as imgbbUploadFile,
  uploadProductImage as imgbbUploadProductImage,
  uploadCategoryImage as imgbbUploadCategoryImage,
  deleteFileByURL as imgbbDeleteFileByURL,
  IUploadProgress
} from '../services/upload.service';

export type UploadProgress = IUploadProgress;

/**
 * Upload a file (Delegates to ImgBB)
 */
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return imgbbUploadFile(file, path, onProgress);
}

/**
 * Upload a product image (Delegates to ImgBB)
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return imgbbUploadProductImage(file, productId, onProgress);
}

/**
 * Upload a category image (Delegates to ImgBB)
 */
export async function uploadCategoryImage(
  file: File,
  categoryId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return imgbbUploadCategoryImage(file, categoryId, onProgress);
}

/**
 * Delete a file (Delegates to ImgBB)
 */
export async function deleteFileByURL(url: string): Promise<void> {
  return imgbbDeleteFileByURL(url);
}

/**
 * Get a storage reference for a given path
 */
export function getStorageRef(path: string) {
  return ref(getFirebaseStorage(), path);
}
