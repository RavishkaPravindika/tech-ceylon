'use client';

// Firebase Storage helpers for Tech Ceylon

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { getFirebaseStorage } from './config';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Upload a product image and return the download URL
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `products/${productId}/${Date.now()}.${ext}`;
  return uploadFile(file, path, onProgress);
}

/**
 * Upload a category image and return the download URL
 */
export async function uploadCategoryImage(
  file: File,
  categoryId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `categories/${categoryId}/${Date.now()}.${ext}`;
  return uploadFile(file, path, onProgress);
}

/**
 * Delete a file from Firebase Storage by URL
 */
export async function deleteFileByURL(url: string): Promise<void> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}

/**
 * Get a storage reference for a given path
 */
export function getStorageRef(path: string) {
  return ref(getFirebaseStorage(), path);
}
