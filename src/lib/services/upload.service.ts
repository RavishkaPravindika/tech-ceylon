// Upload Service for ImgBB

export interface IUploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export function uploadFile(
  file: File,
  path: string, // kept for backward compatibility
  onProgress?: (progress: IUploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      return reject(new Error('ImgBB API key is missing'));
    }

    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.imgbb.com/1/upload?key=${apiKey}`);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress({
            progress: (event.loaded / event.total) * 100,
            bytesTransferred: event.loaded,
            totalBytes: event.total,
          });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data.url);
        } catch (error) {
          reject(new Error('Failed to parse ImgBB response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Upload failed due to a network error'));
    };

    xhr.send(formData);
  });
}

export async function uploadProductImage(
  file: File,
  productId: string,
  onProgress?: (progress: IUploadProgress) => void
): Promise<string> {
  return uploadFile(file, '', onProgress);
}

export async function uploadCategoryImage(
  file: File,
  categoryId: string,
  onProgress?: (progress: IUploadProgress) => void
): Promise<string> {
  return uploadFile(file, '', onProgress);
}

export async function deleteFileByURL(url: string): Promise<void> {
  // ImgBB API does not support deletion via the simple upload API.
  // We'll log a warning and silently succeed to prevent breaking the UI flow.
  console.warn('File deletion is not supported with ImgBB simple API.', url);
  return Promise.resolve();
}
